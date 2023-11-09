const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csurf = require("csurf");
const flash = require("connect-flash");

const errorController = require("./controllers/error");
const User = require("./models/user");

const MongoDB_URI = ""; //mongodb database url

const app = express();
const store = new MongoDBStore({
  uri: MongoDB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "14A3CKDcpR",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csurf());
app.use(flash());

app.use(async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id);
    req.user = user;
  } catch {}
  next();
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.user;
  res.locals.csurfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

(async () => {
  try {
    await mongoose.connect(MongoDB_URI);
    app.listen(3000);
  } catch (err) {
    console.log(err);
  }
})();
