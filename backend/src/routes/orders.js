const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/auth');
const roleGuard = require('../middlewares/roleGuard');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order Management APIs
 */

router.use(auth);

/**
 * @swagger
 * /api/orders/calculate-charge:
 *   post:
 *     summary: Calculate delivery charges before placing an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickupAddress
 *               - dropAddress
 *               - length
 *               - breadth
 *               - height
 *               - actualWeight
 *               - orderType
 *               - paymentType
 *     responses:
 *       200:
 *         description: Charge calculated successfully
 */
router.post(
  '/calculate-charge',
  roleGuard('customer', 'admin'),
  orderController.calculateCharge
);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/', orderController.listOrders);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post(
  '/',
  roleGuard('customer', 'admin'),
  orderController.createOrder
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order details
 */
router.get('/:id', orderController.getOrder);

/**
 * @swagger
 * /api/orders/{id}/tracking:
 *   get:
 *     summary: Get tracking history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Tracking history
 */
router.get('/:id/tracking', orderController.getTracking);

/**
 * @swagger
 * /api/orders/{id}/assign:
 *   put:
 *     summary: Assign delivery agent manually
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Agent assigned successfully
 */
router.put(
  '/:id/assign',
  roleGuard('admin'),
  orderController.assignAgent
);

/**
 * @swagger
 * /api/orders/{id}/auto-assign:
 *   post:
 *     summary: Auto assign nearest available agent
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Agent auto assigned
 */
router.post(
  '/:id/auto-assign',
  roleGuard('admin'),
  orderController.autoAssign
);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   post:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.post(
  '/:id/status',
  roleGuard('agent', 'admin'),
  orderController.updateStatus
);

/**
 * @swagger
 * /api/orders/{id}/reschedule:
 *   post:
 *     summary: Reschedule a failed order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order rescheduled successfully
 */
router.post(
  '/:id/reschedule',
  roleGuard('customer'),
  orderController.rescheduleOrder
);

module.exports = router;