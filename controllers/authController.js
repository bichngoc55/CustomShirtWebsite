const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const validator = require("validator");
const {
  emailTemplatesResetPassword,
  transporter,
} = require("../utils/email.js");

const hashOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
  saltLength: 16,
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // console.log(username, email, password);
    const isValidEmail = validator.isEmail(email);
    if (!isValidEmail) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters" });
    }
    const hashedPassword = await argon2.hash(password, hashOptions);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.status === "down") {
      return res
        .status(403)
        .json({ message: "Account is suspended. Please contact support." });
    }
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "90m",
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH, {
      expiresIn: "365d",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });
    delete user.password;
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const emailTemplate = emailTemplatesResetPassword.resetRequest(resetLink);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailTemplate.subject,
      text: emailTemplate.text,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log("Password reset", newPassword);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const hashedPassword = await argon2.hash(newPassword, hashOptions);

    // const hashedPassword = await argon2.hash(newPassword);
    user.password = hashedPassword;
    await user.save();

    // const emailTemplate = emailTemplatesResetPassword.resetSuccess();
    // const mailOptions = {
    //   from: process.env.EMAIL_USER,
    //   to: user.email,
    //   subject: emailTemplate.subject,
    //   text: emailTemplate.text,
    // };

    // await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, resetPassword, requestPasswordReset };
