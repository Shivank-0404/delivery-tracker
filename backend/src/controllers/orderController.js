const { Order, User, TrackingHistory, Zone, Notification } = require('../models');
const { detectZone } = require('../services/zoneDetector');
const { calculateCharge: calcChargeService } = require('../services/rateEngine');
const { assignAgent: autoAssignAgent } = require('../services/assignmentService');
const { sendNotifications } = require('../services/notificationService');

// Calculates charge without placing order
async function calculateCharge(req, res) {
  try {
    const { pickupAddress, dropAddress, length, breadth, height, actualWeight, orderType, paymentType } = req.body;

    if (!pickupAddress || !dropAddress || !length || !breadth || !height || !actualWeight || !orderType || !paymentType) {
      return res.status(400).json({ error: 'All fields are required for price calculation.' });
    }

    const pickupZoneId = await detectZone(pickupAddress);
    const dropZoneId = await detectZone(dropAddress);

    if (!pickupZoneId) {
      return res.status(400).json({ error: `Could not detect pickup zone for address: "${pickupAddress}".` });
    }
    if (!dropZoneId) {
      return res.status(400).json({ error: `Could not detect drop zone for address: "${dropAddress}".` });
    }

    const charges = await calcChargeService({
      pickupZoneId,
      dropZoneId,
      length,
      breadth,
      height,
      actualWeight,
      orderType,
      paymentType
    });

    res.json({
      pickupZoneId,
      dropZoneId,
      ...charges
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Places order
async function createOrder(req, res) {
  try {
    const {
      pickupAddress,
      dropAddress,
      length,
      breadth,
      height,
      actualWeight,
      orderType,
      paymentType,
      customerId, // Only parsed if admin is creating on behalf of customer
      scheduledDate
    } = req.body;

    const actualCustomerId = (req.user.role === 'admin' && customerId) ? customerId : req.user.id;

    if (!pickupAddress || !dropAddress || !length || !breadth || !height || !actualWeight || !orderType || !paymentType) {
      return res.status(400).json({ error: 'Missing required order fields.' });
    }

    const pickupZoneId = await detectZone(pickupAddress);
    const dropZoneId = await detectZone(dropAddress);

    if (!pickupZoneId) {
      return res.status(400).json({ error: `Pickup address does not match any registered zone.` });
    }
    if (!dropZoneId) {
      return res.status(400).json({ error: `Drop address does not match any registered zone.` });
    }

    const charges = await calcChargeService({
      pickupZoneId,
      dropZoneId,
      length,
      breadth,
      height,
      actualWeight,
      orderType,
      paymentType
    });

    const order = await Order.create({
      customer_id: actualCustomerId,
      pickup_address: pickupAddress,
      drop_address: dropAddress,
      pickup_zone_id: pickupZoneId,
      drop_zone_id: dropZoneId,
      length,
      breadth,
      height,
      actual_weight: actualWeight,
      volumetric_weight: charges.volumetricWeight,
      billed_weight: charges.billedWeight,
      order_type: orderType,
      payment_type: paymentType,
      delivery_charge: charges.deliveryCharge,
      cod_surcharge: charges.codSurcharge,
      total_charge: charges.totalCharge,
      status: 'Pending',
      scheduled_date: scheduledDate || new Date().toISOString().slice(0, 10),
      created_by_admin: req.user.role === 'admin'
    });

    // Write tracking history
    await TrackingHistory.create({
      order_id: order.id,
      status: 'Pending',
      notes: 'Order placed successfully.',
      actor_id: req.user.id,
      actor_role: req.user.role
    });

    // Send Notification
    const customer = await User.findByPk(actualCustomerId);
    await sendNotifications({
      order,
      customer,
      status: 'Pending',
      notes: 'Order placed successfully.'
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Lists orders based on roles
async function listOrders(req, res) {
  try {
    const { status, order_type, payment_type, agent_id, pickup_zone_id, drop_zone_id } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (order_type) filter.order_type = order_type;
    if (payment_type) filter.payment_type = payment_type;
    if (agent_id) filter.agent_id = agent_id;
    if (pickup_zone_id) filter.pickup_zone_id = pickup_zone_id;
    if (drop_zone_id) filter.drop_zone_id = drop_zone_id;

    if (req.user.role === 'customer') {
      filter.customer_id = req.user.id;
    } else if (req.user.role === 'agent') {
      filter.agent_id = req.user.id;
    }

    const orders = await Order.findAll({
      where: filter,
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Zone, as: 'pickupZone', attributes: ['name'] },
        { model: Zone, as: 'dropZone', attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get order details
async function getOrder(req, res) {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Zone, as: 'pickupZone', attributes: ['name'] },
        { model: Zone, as: 'dropZone', attributes: ['name'] },
        { model: TrackingHistory, as: 'trackingHistory' }
      ],
      order: [[{ model: TrackingHistory, as: 'trackingHistory' }, 'createdAt', 'ASC']]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Role boundary checks
    if (req.user.role === 'customer' && order.customer_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    if (req.user.role === 'agent' && order.agent_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Assigns agent manually
async function assignAgent(req, res) {
  try {
    const { agent_id } = req.body;
    if (!agent_id) {
      return res.status(400).json({ error: 'Agent ID is required.' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const agent = await User.findOne({ where: { id: agent_id, role: 'agent' } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found.' });
    }
    if (!agent.is_available) {
      return res.status(400).json({ error: 'Selected agent is currently busy.' });
    }

    // Release current agent if already assigned
    if (order.agent_id) {
      const oldAgent = await User.findByPk(order.agent_id);
      if (oldAgent) {
        await oldAgent.update({ is_available: true });
      }
    }

    // Assign new agent
    await order.update({
      agent_id: agent.id,
      status: 'Assigned'
    });

    await agent.update({ is_available: false });

    // History and notification
    await TrackingHistory.create({
      order_id: order.id,
      status: 'Assigned',
      notes: `Agent ${agent.name} has been manually assigned.`,
      actor_id: req.user.id,
      actor_role: req.user.role
    });

    const customer = await User.findByPk(order.customer_id);
    await sendNotifications({
      order,
      customer,
      status: 'Assigned',
      notes: `Agent ${agent.name} is on the way.`
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Auto assigns agent
async function autoAssign(req, res) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Look up customer coordinates for proximity checking
    const customer = await User.findByPk(order.customer_id);
    const pickupLat = customer ? customer.lat : null;
    const pickupLng = customer ? customer.lng : null;

    const agent = await autoAssignAgent({
      pickupZoneId: order.pickup_zone_id,
      pickupLat,
      pickupLng
    });

    // Release current agent if assigned
    if (order.agent_id) {
      const oldAgent = await User.findByPk(order.agent_id);
      if (oldAgent) {
        await oldAgent.update({ is_available: true });
      }
    }

    await order.update({
      agent_id: agent.id,
      status: 'Assigned'
    });

    await agent.update({ is_available: false });

    await TrackingHistory.create({
      order_id: order.id,
      status: 'Assigned',
      notes: `Agent ${agent.name} auto-assigned.`,
      actor_id: req.user.id,
      actor_role: req.user.role
    });

    await sendNotifications({
      order,
      customer,
      status: 'Assigned',
      notes: `Agent ${agent.name} is auto-assigned to collect your package.`
    });

    res.json({ message: `Agent ${agent.name} auto-assigned.`, order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Update order status (picked up, in transit, out for delivery, delivered, failed)
async function updateStatus(req, res) {
  try {
    const { status, notes } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const validStatuses = ['Assigned', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    // Update status
    await order.update({ status });

    // Handle agent release
    if (status === 'Delivered' || status === 'Failed') {
      if (order.agent_id) {
        const agent = await User.findByPk(order.agent_id);
        if (agent) {
          await agent.update({ is_available: true });
        }
      }
    }

    // Append to immutable tracking history
await TrackingHistory.create({
  order_id: order.id,
  status,
  notes: notes || `Order status updated to ${status}.`,
  actor_id: req.user.id,
  actor_role: req.user.role
});

    // Notify customer
    const customer = await User.findByPk(order.customer_id);
    await sendNotifications({
      order,
      customer,
      status,
      notes
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Reschedule order flow (failed orders)
async function rescheduleOrder(req, res) {
  try {
    const { rescheduled_date } = req.body;
    if (!rescheduled_date) {
      return res.status(400).json({ error: 'Rescheduled date is required.' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.status !== 'Failed') {
      return res.status(400).json({ error: 'Only failed deliveries can be rescheduled.' });
    }

    // Free up old agent if not already done
    if (order.agent_id) {
      const oldAgent = await User.findByPk(order.agent_id);
      if (oldAgent) {
        await oldAgent.update({ is_available: true });
      }
    }

    // Reset status to Pending, set date
    await order.update({
      status: 'Pending',
      rescheduled_date,
      agent_id: null
    });

    // Log history
    await TrackingHistory.create({
      order_id: order.id,
      status: 'Pending',
      notes: `Order rescheduled for ${rescheduled_date}. Re-assignment triggered.`,
      actor_id: req.user.id,
      actor_role: req.user.role
    });

    // Notify
    const customer = await User.findByPk(order.customer_id);
    await sendNotifications({
      order,
      customer,
      status: 'Pending',
      notes: `Your delivery has been rescheduled for ${rescheduled_date}.`
    });

    // Auto trigger reassignment
    try {
      const pickupLat = customer ? customer.lat : null;
      const pickupLng = customer ? customer.lng : null;

      const agent = await autoAssignAgent({
        pickupZoneId: order.pickup_zone_id,
        pickupLat,
        pickupLng
      });

      await order.update({
        agent_id: agent.id,
        status: 'Assigned'
      });

      await agent.update({ is_available: false });

      await TrackingHistory.create({
        order_id: order.id,
        status: 'Assigned',
        notes: `Agent ${agent.name} auto-assigned for rescheduled delivery.`,
        actor_id: req.user.id,
        actor_role: 'system'
      });

      await sendNotifications({
        order,
        customer,
        status: 'Assigned',
        notes: `Agent ${agent.name} has been assigned for your rescheduled delivery.`
      });
    } catch (assignError) {
      console.warn('Auto assignment failed during rescheduling (no agents available):', assignError.message);
      // Leave order as Pending so admin can assign manually
    }

    res.json({ message: 'Order rescheduled and re-assigned.', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Get order tracking history
async function getTracking(req, res) {
  try {
    const history = await TrackingHistory.findAll({
      where: { order_id: req.params.id },
      order: [['createdAt', 'ASC']]
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  calculateCharge,
  createOrder,
  listOrders,
  getOrder,
  assignAgent,
  autoAssign,
  updateStatus,
  rescheduleOrder,
  getTracking
};
