const Voucher = require("../models/Voucher");

const validateVoucherDates = async (startDate, endDate) => {
  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error("End date must be after start date");
  }
};

const validateUniqueVoucherCode = async (code, id = null) => {
  const existingVoucher = await Voucher.findOne({
    code,
    _id: { $ne: id },
  });
  if (existingVoucher) {
    throw new Error("Voucher code already exists");
  }
};

const validateVoucherStatus = async (voucher) => {
  const currentDate = new Date();
  if (
    voucher.status !== "active" ||
    currentDate < new Date(voucher.startDate) ||
    currentDate > new Date(voucher.endDate)
  ) {
    throw new Error("Voucher is not valid at this time");
  }
};

module.exports = {
  validateVoucherDates,
  validateUniqueVoucherCode,
  validateVoucherStatus,
};
