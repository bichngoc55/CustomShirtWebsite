const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoute.js");
const billRoutes = require("./routes/billRoute.js");
const userRoutes = require("./routes/userRoute.js");
const shirtRoutes = require("./routes/shirtRoute.js");
//config
dotenv.config();
//express app
const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
//use
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
// app.use(
//   cors({
//     origin: "http://localhost:3005",
//   })
// );
app.use(cors());
app.use(morgan("common"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("dev"));
// app.use(express.static("public"));
app.use(cookieParser());

app.use(cors());
//express
app.use("/auth", authRoutes);
app.use("/bill", billRoutes);
app.use("/user", userRoutes);
app.use("/shirt", shirtRoutes);
//connect to mongodb

mongoose
  .connect(process.env.URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error: ", error.message);
  });
//listener
app.listen(process.env.PORT, () => {
  console.log("Server is running on port ", process.env.PORT);
});
