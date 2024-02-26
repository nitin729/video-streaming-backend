import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//Configuring CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
// Accepting json and setting its limit

app.use(express.json({ limit: "16kb" }));

//configuring url encoding
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//For stroing public assets
app.use(express.static("public"));

//Configuring cookie parser for performing crud operation on cookies.

app.use(cookieParser());

export default app;
