const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const { checkUser } = require("./middleware/authMiddleware");
const app = express();
app.use(express.static("public"));
app.use(express.static("images"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.get("*", checkUser);
const dbURI =
  "mongodb+srv://shanay:sscme98laya@cluster0.hz7kqu2.mongodb.net/e-commerce";
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => app.listen(process.env.PORT))
  .catch((err) => console.log(err));
app.use(authRoutes);
