const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const branchRoutes = require("./routes/branchRoutes");

connectDB();

const app = express();
const PORT = process.env.PORT || 1163;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("EQueue backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/branches", branchRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
