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

// const validateVoucherStatus = async (voucher) => {
//   const currentDate = new Date();
//   if (
//     voucher.status !== "active" ||
//     currentDate < new Date(voucher.startDate) ||
//     currentDate > new Date(voucher.endDate)
//   ) {
//     throw new Error("Voucher is not valid at this time");
//   }
// };
const validateVoucherStatus = async (voucher, userId) => {
  const currentDate = new Date();

  if (voucher.status === "expired") {
    throw new Error("This voucher has expired");
  }

  if (voucher.status === "used" && voucher.isOneTime) {
    throw new Error("This voucher has already been used");
  }

  if (currentDate < voucher.startDate) {
    throw new Error("This voucher is not yet active");
  }

  if (currentDate > voucher.endDate) {
    throw new Error("This voucher has expired");
  }

  if (voucher.isOneTime && (await voucher.hasBeenUsedBy(userId))) {
    throw new Error("You have already used this voucher");
  }

  return true;
};

module.exports = {
  validateVoucherDates,
  validateUniqueVoucherCode,
  validateVoucherStatus,
};
