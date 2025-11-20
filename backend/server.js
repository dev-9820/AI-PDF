import express from "express";
import cors from "cors";
import checkRouter from "./routes/check.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/check", checkRouter);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running on port 5000");
});