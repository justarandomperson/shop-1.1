const mongodb = require("mongodb");
const Product = require("../models/product");

const getError = (req) => {
  const message = req.flash("error");
  if (message.length > 0) {
    return message[0];
  } else {
    return [];
  }
};

exports.getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id }).populate(
      "userId",
      "username"
    );
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getAddProduct = (req, res, next) => {
  const error = getError(req);
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    error: error,
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.session.user,
  });
  if (title.length > 15) {
    req.flash("error", "Title can't go over 15 characters.");
    return res.redirect("./add-product");
  }
  try {
    await product.save();
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
};

exports.getEditProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const product = await Product.findById(prodId);
  const error = getError(req);
  if (!product) {
    return res.redirect("/");
  }
  res.render("admin/edit-product", {
    pageTitle: "Edit Product",
    path: "/admin/edit-product",
    editing: true,
    product: product,
    error: error,
  });
};

exports.postEditProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;
  if (updatedTitle.length > 15) {
    req.flash("error", "Title can't go over 15 characters.");
    return res.redirect("./edit-product/" + prodId);
  }
  try {
    const product = await Product.findById(prodId);
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    product.title = updatedTitle;
    product.imageUrl = updatedImageUrl;
    product.price = updatedPrice;
    product.description = updatedDescription;
    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    await Product.deleteOne({ _id: prodId, userId: req.user._id });
  } catch (err) {
    console.log(err);
  }
  res.redirect("/admin/products");
};
