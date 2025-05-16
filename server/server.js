const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const AuthRoute = require("./Routes/AuthRoute");
const SnippetRoute = require("./Routes/SnippetRoute");
const CollectionRoute = require("./Routes/CollectionRoute");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["POST", "GET", "PUT", "DELETE"],
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/v1/auth", AuthRoute);
app.use("/api/v1/snippet", SnippetRoute);
app.use("/api/v1/collection", CollectionRoute);

const startServer = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/dm2"
    );
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
};

startServer();
