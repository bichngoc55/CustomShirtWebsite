const User = require("../models/User.js");

const checkIsCustomer = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (!user || user.role == "customer") {
      return res.status(403).json({
        error: "Forbidden: You dont have permission to access this resource",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = checkIsCustomer;
