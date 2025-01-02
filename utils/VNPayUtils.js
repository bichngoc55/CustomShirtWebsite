const crypto = require("crypto");
const Orders = require("../models/Order.js");
const moment = require("moment");
const querystring = require("qs");

class VNPayUtils {
  constructor() {
    this.tmnCode = process.env.vnp_TmnCode;
    this.secretKey = process.env.vnp_HashSecret;
    this.vnpUrl = process.env.vnp_Url;
    this.returnUrl = "http://localhost:3000/payment-result";
    this.createPaymentUrl = this.createPaymentUrl.bind(this);
    this.handleIPN = this.handleIPN.bind(this);
    this.handleReturn = this.handleReturn.bind(this);
    this.updatePaymentStatus = this.updatePaymentStatus.bind(this);
  }

  sortObject(obj) {
    const sorted = {};
    const str = [];
    let key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
  }

  async createPaymentUrl(req, res) {
    try {
      const date = new Date();
      const createDate = moment(date).format("YYYYMMDDHHmmss");

      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

      const { total, orderInfo, orderId } = req.body;
      console.log("orderId: " + orderId);
      if (!total || isNaN(total)) {
        console.log("Invalid amount");
        return res.status(400).json({ code: "01", message: "Invalid amount" });
      }

      // Update order with payment initiation
      await Orders.findByIdAndUpdate(orderId, {
        "paymentDetails.orderId": orderId,
        "paymentDetails.status": "pending",
        "paymentDetails.method": "Digital",
      });

      let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: this.tmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: "other",
        vnp_Amount: total * 100,
        vnp_ReturnUrl: this.returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };
      console.log("vnp_Params", vnp_Params["vnp_TxnRef"]);
      vnp_Params = this.sortObject(vnp_Params);

      const signData = Object.keys(vnp_Params)
        .map((key) => `${key}=${vnp_Params[key]}`)
        .join("&");
      const hmac = crypto.createHmac("sha512", this.secretKey);
      const signed = hmac.update(signData).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;

      const paymentUrl = `${this.vnpUrl}?${querystring.stringify(vnp_Params, {
        encode: false,
      })}`;
      console.log("Generated URL:", paymentUrl);

      res.json({ code: "00", paymentUrl });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ code: "99", message: "Internal server error" });
    }
  }

  async handleIPN(req, res) {
    try {
      console.log("1. IPN Called with query params:", req.query);

      let vnp_Params = req.query;

      const secureHash = vnp_Params["vnp_SecureHash"];
      const orderId = vnp_Params["vnp_TxnRef"];
      const rspCode = vnp_Params["vnp_ResponseCode"];
      const amount = parseInt(vnp_Params["vnp_Amount"]);
      console.log("2. Extracted values:", {
        secureHash,
        orderId,
        rspCode,
        amount,
      });
      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = this.sortObject(vnp_Params);

      const signData = Object.keys(vnp_Params)
        .map((key) => `${key}=${vnp_Params[key]}`)
        .join("&");

      const hmac = crypto.createHmac("sha512", this.secretKey);
      const signed = hmac.update(signData).digest("hex");
      console.log("4. Generated hash:", signed);
      console.log("5. Received hash:", secureHash);

      if (secureHash !== signed) {
        console.log("6. Hash comparison failed!");
        console.log("Generated:", signed);
        console.log("Received:", secureHash);
      }

      if (secureHash === signed) {
        const order = await Orders.findById(orderId);

        if (!order) {
          return res
            .status(200)
            .json({ RspCode: "01", Message: "Order not found" });
        }

        if (amount !== order.total * 100) {
          return res
            .status(200)
            .json({ RspCode: "04", Message: "Amount invalid" });
        }

        if (order.paymentDetails.status === "pending") {
          if (rspCode === "00") {
            await Orders.findByIdAndUpdate(order._id, {
              "paymentDetails.status": "completed",
              "paymentDetails.paidAt": new Date(),
              orderStatus: "confirmed",
            });
            console.log("Secure Hash: 3");
          } else {
            await Orders.findByIdAndUpdate(order._id, {
              "paymentDetails.status": "failed",
              orderStatus: "refused",
            });
            console.log("Secure Hash: 4");
          }
          return res.status(200).json({ RspCode: "00", Message: "Success" });
        }

        return res.status(200).json({
          RspCode: "02",
          Message: "Order already processed",
        });
      }

      res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
    } catch (error) {
      console.error("IPN Error:", error);
      res.status(500).json({ RspCode: "99", Message: "Internal server error" });
    }
  }
  // Add this method to your VNPayUtils class
  async updatePaymentStatus(req, res) {
    try {
      let vnp_Params = req.body;
      //   const secureHash = vnp_Params["vnp_SecureHash"];
      const orderId = vnp_Params["vnp_TxnRef"];
      const responseCode = vnp_Params["vnp_ResponseCode"];
      //   const amount = parseInt(vnp_Params["vnp_Amount"]);

      //   delete vnp_Params["vnp_SecureHash"];
      //   delete vnp_Params["vnp_SecureHashType"];

      //   vnp_Params = this.sortObject(vnp_Params);
      //   const signData = Object.keys(vnp_Params)
      //     .map((key) => `${key}=${vnp_Params[key]}`)
      //     .join("&");

      //   const hmac = crypto.createHmac("sha512", this.secretKey);
      //   const signed = hmac.update(signData).digest("hex");

      //   if (secureHash === signed) {
      const order = await Orders.findById(orderId);

      if (!order) {
        return res.json({ success: false, message: "Order not found" });
      }

      // if (amount !== order.total * 100) {
      //   return res.json({ success: false, message: "Amount invalid" });
      // }

      if (order.paymentDetails.status === "pending") {
        if (responseCode === "00") {
          await Orders.findByIdAndUpdate(order._id, {
            "paymentDetails.status": "completed",
            "paymentDetails.paidAt": new Date(),
            // orderStatus: "confirmed",
          });
        } else {
          await Orders.findByIdAndUpdate(order._id, {
            "paymentDetails.status": "failed",
            // orderStatus: "refused",
          });
        }
        return res.json({ success: true, message: "Order already processed" });
      }

      //   }

      res.json({ success: false, message: "Invalid signature" });
    } catch (error) {
      console.error("Update payment status error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async handleReturn(req, res) {
    try {
      let vnp_Params = req.query;
      const secureHash = vnp_Params["vnp_SecureHash"];
      console.log("Secure Hash: " + secureHash);

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = this.sortObject(vnp_Params);

      const signData = Object.keys(vnp_Params)
        .map((key) => `${key}=${vnp_Params[key]}`)
        .join("&");

      const hmac = crypto.createHmac("sha512", this.secretKey);
      const signed = hmac.update(signData).digest("hex");

      if (secureHash === signed) {
        // Redirect to frontend with params
        const responseCode = vnp_Params["vnp_ResponseCode"];
        const orderId = vnp_Params["vnp_TxnRef"];

        const order = await Orders.findById(orderId);
        if (order.paymentDetails.status === "pending") {
          if (responseCode === "00") {
            await Orders.findByIdAndUpdate(order._id, {
              "paymentDetails.status": "completed",
              "paymentDetails.paidAt": new Date(),
              orderStatus: "confirmed",
            });
          } else {
            await Orders.findByIdAndUpdate(order._id, {
              "paymentDetails.status": "failed",
              orderStatus: "refused",
            });
          }
        }

        const redirectUrl = `http://localhost:3000/payment-result?responseCode=${responseCode}&orderId=${orderId}`;
        console.log("Redirecting to frontend:", redirectUrl);
        return res.redirect(redirectUrl);
      }

      // Redirect with error
      res.redirect(
        `http://localhost:3000/payment-result?responseCode=97&orderId=${vnp_Params["vnp_TxnRef"]}`
      );
    } catch (error) {
      console.error("Return Error:", error);
      res.redirect(
        `http://localhost:3000/payment-result?responseCode=99&orderId=${req.query["vnp_TxnRef"]}`
      );
    }
  }
}

module.exports = new VNPayUtils();
