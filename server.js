const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");


dotenv.config();
connectDB();

app.use(express.json());


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("server is running on port ${PORT}`"));