const User = require("../models/User");
const jwt = require("jsonwebtoken");
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };
  if (err.message === "Invalid Email") {
    errors.email = "That email is not registered";
  }
  if (err.message === "Incorrect Password") {
    errors.password = "That password is incorrect";
  }
  if (err.code === 11000) {
    errors.email = "That email is already registered";
    return errors;
  }
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "secret", {
    expiresIn: maxAge,
  });
};
module.exports.homePage = (req, res) => {
  res.render("homepage.ejs");
};

module.exports.prodDet = (req, res) => {
  res.render("prodDet.ejs");
};
module.exports.prodCategory = (req, res) => {
  res.render("prodCategory.ejs");
};
module.exports.userCart = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "secret", async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        console.log(decodedToken);
        const user = await User.findById(decodedToken.id);
        res.locals.user = user;
        res.render("cart.ejs", user);
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};
module.exports.cartForm = (req, res) => {
  res.render("cartForm.ejs");
};
module.exports.signup_get = (req, res) => {
  res.render("signup");
};
module.exports.login_get = (req, res) => {
  res.render("login");
};
module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
module.exports.add_to_cart = async (req, res, next) => {
  let body = req.body;
  let product = {
    productId: body.id,
    title: body.title,
    quantity: body.quantity,
    price: body.price,
    image: body.image,
  };
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "secret", async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        console.log(decodedToken);
        const user = await User.findById(decodedToken.id);
        res.locals.user = user;
        let count = 0;
        user.cart.forEach((element) => {
          if (element.productId == product.productId) {
            count++;
          }
        });
        if (!count) {
          await user.updateOne({ $push: { cart: product } }).then(() => {
            res.redirect("/");
          });
        } else {
          res.redirect("/");
        }
      }

      next();
    });
  } else {
    res.locals.user = null;
    next();
  }
};
module.exports.remove_from_cart = async (req, res, next) => {
  let body = req.body;
  let product = {
    productId: body.id,
    title: body.title,
    quantity: body.quantity,
    price: body.price,
    image: body.image,
  };
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "secret", async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        console.log(decodedToken);
        const user = await User.findById(decodedToken.id);
        res.locals.user = user;
        await user.updateOne({ $pull: { cart: product } }).then(() => {
          res.redirect("/");
        });
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};
module.exports.checkout = async (req, res, next) => {
  let body = req.body;
  let product = {
    productId: body.id,
    title: body.title,
    quantity: body.quantity,
    price: body.price,
    image: body.image,
  };
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, "secret", async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        console.log(decodedToken);
        const user = await User.findById(decodedToken.id);
        res.locals.user = user;
        await user.update({ $set: { cart: [] } }, { multi: true }).then(() => {
          res.render("checkout.ejs");
        });
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};
