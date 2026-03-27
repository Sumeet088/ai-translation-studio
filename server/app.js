const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const fileRoutes = require("./routes/fileRoutes");
const qualityRoutes = require("./routes/qualityRoutes");
const tmRoutes = require("./routes/tmRoutes");
const translateRoutes = require("./routes/translateRoutes");

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/api/files", fileRoutes);
app.use("/api/quality", qualityRoutes);
app.use("/api/tm", tmRoutes);
app.use("/api/translate", translateRoutes);


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});