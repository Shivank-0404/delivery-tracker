const mailer = require('../config/mailer');
const twilioClient = require('../config/twilio');
const { Notification } = require('../models');

async function sendNotifications({ order, customer, status, notes }) {
  if (!customer) return { emailSent: false, smsSent: false };

  const message = `Order update: Your order #${order.id} is now ${status}.${notes ? ` Update: ${notes}` : ''}`;
  let emailSent = false;
  let smsSent = false;

  // 1. Send Email Notification
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'Delivery Tracker <no-reply@deliverytracker.com>',
      to: customer.email,
      subject: `Order #${order.id.slice(0, 8)} Status Update: ${status}`,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px;">
          <h2 style="color: #4f8ef7;">Delivery Update</h2>
          <p>Hello <strong>${customer.name}</strong>,</p>
          <p>The status of your order <strong>#${order.id}</strong> has changed to: <span style="font-weight: bold; color: #ff9800;">${status}</span>.</p>
          ${notes ? `<p><strong>Update notes:</strong> ${notes}</p>` : ''}
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      `
    };

    if (process.env.SMTP_USER) {
      await mailer.sendMail(mailOptions);
      emailSent = true;
      await Notification.create({
        order_id: order.id,
        user_id: customer.id,
        channel: 'email',
        message: message,
        status: 'sent'
      });
    } else {
      console.warn('SMTP credentials not configured. Email skipped.');
      await Notification.create({
        order_id: order.id,
        user_id: customer.id,
        channel: 'email',
        message: message,
        status: 'skipped'
      });
    }
  } catch (err) {
    console.error('Failed to send email:', err);
    await Notification.create({
      order_id: order.id,
      user_id: customer.id,
      channel: 'email',
      message: message,
      status: 'failed'
    });
  }

  // 2. Send SMS Notification (Twilio)
  try {
    if (twilioClient && customer.phone) {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: customer.phone
      });
      smsSent = true;
      await Notification.create({
        order_id: order.id,
        user_id: customer.id,
        channel: 'sms',
        message: message,
        status: 'sent'
      });
    } else {
      console.warn('Twilio not configured or customer has no phone number. SMS skipped.');
      await Notification.create({
        order_id: order.id,
        user_id: customer.id,
        channel: 'sms',
        message: message,
        status: 'skipped'
      });
    }
  } catch (err) {
    console.error('Failed to send SMS:', err);
    await Notification.create({
      order_id: order.id,
      user_id: customer.id,
      channel: 'sms',
      message: message,
      status: 'failed'
    });
  }

  return { emailSent, smsSent };
}

module.exports = { sendNotifications };
