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
// const emailTemplates = {
//   created: (orderDetails) => ({
//     subject: "Order Confirmation",
//     html: `
//       <div style="font-family: 'Montserrat', sans-serif; line-height: 1.6; padding: 20px; background-color: #f9f9f9;">
//         <h2 style="color: #333;">Dear ${orderDetails.userInfo.name},</h2>
//         <p>Thank you for your order! Your order #${
//           orderDetails._id
//         } is being processed by our admin.</p>
//         <h3 style="color: #007BFF;">Order Details:</h3>
//         <ul>
//           <li><strong>Total Amount:</strong> ${orderDetails.total} VND</li>
//           <li><strong>Delivery Date:</strong> ${new Date(
//             orderDetails.deliveryDate
//           ).toLocaleDateString()}</li>
//           <li><strong>Shipping Method:</strong> ${
//             orderDetails.shippingMethod
//           }</li>
//           <li><strong>Payment Method:</strong> ${
//             orderDetails.paymentDetails.method
//           }</li>
//         </ul>
//         <p>We will notify you once your order is confirmed.</p>
//         <p style="font-weight: bold;">Best regards,<br>DOMDOM</p>
//       </div>
//     `,
//   }),

//   confirmed: (orderDetails) => ({
//     subject: "Order Confirmed",
//     html: `
//       <div style="font-family: 'Montserrat', sans-serif; line-height: 1.6; padding: 20px; background-color: #f9f9f9;">
//         <h2 style="color: #333;">Dear ${orderDetails.userInfo.name},</h2>
//         <p>Your order #${
//           orderDetails._id
//         } has been confirmed and is being prepared for shipment.</p>
//         <h3 style="color: #007BFF;">Order Details:</h3>
//         <ul>
//           <li><strong>Total Amount:</strong> $${orderDetails.total}</li>
//           <li><strong>Delivery Date:</strong> ${new Date(
//             orderDetails.deliveryDate
//           ).toLocaleDateString()}</li>
//           <li><strong>Shipping Method:</strong> ${
//             orderDetails.shippingMethod
//           }</li>
//         </ul>
//         <p>We'll update you when your order is out for delivery.</p>
//         <p style="font-weight: bold;">Best regards,<br>DOMDOM</p>
//       </div>
//     `,
//   }),

//   cancelled: (orderDetails) => ({
//     subject: "Order Cancellation",
//     html: `
//       <div style="font-family: 'Montserrat', sans-serif; line-height: 1.6; padding: 20px; background-color: #f9f9f9;">
//         <h2 style="color: #333;">Dear ${orderDetails.userInfo.name},</h2>
//         <p>Your order #${orderDetails._id} has been cancelled.</p>
//         <p>If you did not request this cancellation or have any questions, please contact our support team.</p>
//         <p style="font-weight: bold;">Best regards,<br>DOMDOM</p>
//       </div>
//     `,
//   }),

//   delivered: (orderDetails) => ({
//     subject: "Order Delivered",
//     html: `
//       <div style="font-family: 'Montserrat', sans-serif; line-height: 1.6; padding: 20px; background-color: #f9f9f9;">
//         <h2 style="color: #333;">Dear ${orderDetails.userInfo.name},</h2>
//         <p>Your order #${orderDetails._id} has been delivered.</p>
//         <p>We hope you enjoy your purchase! If you have any questions or concerns, please don't hesitate to contact us.</p>
//         <p style="font-weight: bold;">Best regards,<br>DOMDOM</p>
//       </div>
//     `,
//   }),

//   refused: (orderDetails) => ({
//     subject: "Order Refused",
//     html: `
//       <div style="font-family: 'Montserrat', sans-serif; line-height: 1.6; padding: 20px; background-color: #f9f9f9;">
//         <h2 style="color: #333;">Dear ${orderDetails.userInfo.name},</h2>
//         <p>We regret to inform you that your order #${
//           orderDetails._id
//         } could not be processed.</p>
//         <h3 style="color: #007BFF;">Order Details:</h3>
//         <ul>
//           <li><strong>Total Amount:</strong> ${orderDetails.total} VND</li>
//           <li><strong>Delivery Date:</strong> ${new Date(
//             orderDetails.deliveryDate
//           ).toLocaleDateString()}</li>
//           <li><strong>Shipping Method:</strong> ${
//             orderDetails.shippingMethod
//           }</li>
//         </ul>
//         <p>Unfortunately, we were unable to confirm and process your order within the expected timeframe.</p>
//         <p>If you have any questions or would like to place a new order, please contact our customer support.</p>
//         <p>We apologize for any inconvenience.</p>
//         <p style="font-weight: bold;">Best regards,<br>DOMDOM</p>
//       </div>
//     `,
//   }),
// };

module.exports = {
  transporter,
  emailTemplates,
};
