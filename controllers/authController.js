const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const validator = require("validator");
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
    console.log(username, email, password);
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

module.exports = { register, login };
