const jwt = require("jsonwebtoken");

// const verifyToken = async (req, res, next) => {
//   try {
//     // console.log("DITME CHAY DI ");
//     let token = req.header("Authorization");
//     console.log("Token: ", token);

//     if (!token) {
//       return res.status(403).send("Access Denied");
//     }

//     if (token.startsWith("Bearer ")) {
//       token = token.slice(7, token.length).trimLeft();
//     }

//     const verified = jwt.verify(token, process.env.JWT_SECRET);
//     if (verified) {
//       console.log("verified");
//     } else {
//       console.log("not verified");
//     }
//     req.user = verified;
//     next();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// module.exports = verifyToken;
const verifyToken = async (req, res, next) => {
  try { 
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    console.error("Token verification error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
};
module.exports = verifyToken;
