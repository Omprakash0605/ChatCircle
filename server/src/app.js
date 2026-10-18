import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js"
import cookieParser from "cookie-parser";


const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());


app.use("/api/v1/auth", authRoutes);


export default app;