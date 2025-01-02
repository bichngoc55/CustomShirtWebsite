// dotenv.config();
const nodemailer = require("nodemailer");

require("dotenv").config();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error("Email credentials are missing in environment variables");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP connection successful");
  }
});
const emailTemplates = {
  created: (orderDetails) => ({
    subject: "Order Confirmation",
    text: `Dear ${orderDetails.userInfo.name},

  Thank you for your order! Your order #${
    orderDetails._id
  } is being processed by admin.

  Order Details:
  - Total Amount: ${orderDetails.total}VND
  - Delivery Date: ${new Date(orderDetails.deliveryDate).toLocaleDateString()}
  - Shipping Method: ${orderDetails.shippingMethod}
  - Payment Method: ${orderDetails.paymentDetails.method}

  We will notify you once your order is confirmed.

  Best regards,
  DOMDOM`,
  }),

  confirmed: (orderDetails) => ({
    subject: "Order Confirmed",
    text: `Dear ${orderDetails.userInfo.name},

  Your order #${
    orderDetails._id
  } has been confirmed and is being prepared for shipment.

  Order Details:
  - Total Amount: $${orderDetails.total}
  - Delivery Date: ${new Date(orderDetails.deliveryDate).toLocaleDateString()}
  - Shipping Method: ${orderDetails.shippingMethod}

  We'll update you when your order is out for delivery.

  Best regards,
  DOMDOM`,
  }),

  cancelled: (orderDetails) => ({
    subject: "Order Cancellation",
    text: `Dear ${orderDetails.userInfo.name},

  Your order #${orderDetails._id} has been cancelled.

  If you did not request this cancellation or have any questions, please contact our support team.

  Best regards,
  DOMDOM`,
  }),

  delivered: (orderDetails) => ({
    subject: "Order Delivered",
    text: `Dear ${orderDetails.userInfo.name},

  Your order #${orderDetails._id} has been delivered.

  We hope you enjoy your purchase! If you have any questions or concerns, please don't hesitate to contact us.

  Best regards,
  DOMDOM`,
  }),
  refused: (orderDetails) => ({
    subject: "Order Refused",
    text: `Dear ${orderDetails.userInfo.name},

  We regret to inform you that your order #${
    orderDetails._id
  } could not be processed.

  Order Details:
  - Total Amount: ${orderDetails.total}VND
  - Delivery Date: ${new Date(orderDetails.deliveryDate).toLocaleDateString()}
  - Shipping Method: ${orderDetails.shippingMethod}

  Unfortunately, we were unable to confirm and process your order within the expected timeframe.

  If you have any questions or would like to place a new order, please contact our customer support.

  We apologize for any inconvenience.

  Best regards,
  DOMDOM`,
  }),
};
const emailTemplatesResetPassword = {
  resetRequest: (resetLink) => ({
    subject: "Reset Your Password",
    text: `Dear User,

You requested to reset your password. Please click on the link below to reset it:

${resetLink}

If you did not request this, please ignore this email.

Best regards,
DOMDOM`,
  }),

  resetSuccess: () => ({
    subject: "Password Successfully Reset",
    text: `Dear User,

Your password has been successfully reset. You can now log in with your new password.

If you did not perform this action, please contact support immediately.

Best regards,
DOMDOM`,
  }),
};

module.exports = {
  transporter,
  emailTemplates,
  emailTemplatesResetPassword,
};
