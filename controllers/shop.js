const Product = require("../models/product")
const Order = require('../models/order')

exports.getIndex = async (req,res,next) => {
  const products = await Product.find()
  res.render('shop/index', {
    prods: products,
    pageTitle: 'Shop',
    path: '/'
  });
}

exports.getProducts = async (req, res, next) => {
  const products = await Product.find()
  res.render('shop/productList', {
    prods: products,
    pageTitle: 'All Products',
    path: '/products'
  });
}

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId)
    res.render("shop/productDetail", {
      product: product,
      pageTitle: product.title,
      path: '/products'
    })
  } catch (err) {
    console.log(err)
  }
}

exports.getCart = async (req,res,next) => {
    const user = await req.user.populate('cart.items.productId')
    res.render('shop/cart', {
      pageTitle: 'Your Cart',
      path: '/cart',
      products: user.cart.items
  })
}

exports.postCart = async (req,res,next) => {
  const prodId = req.body.productId;
  try {
    const product = await Product.findById(prodId)
    await req.user.addToCart(product)
  } catch (err) {
    console.log(err)
  }
  res.redirect('/cart')
}

exports.postCartDeleteProduct = async (req,res,next) => {
  const prodId = req.body.productId;
  try {
    await req.user.removeFromCart(prodId)
  } catch (err) {
    console.log(err)
  }
  res.redirect('/cart');
}


exports.getOrders = async (req,res,next) => {
  try {
    const orders = await Order.find({'user.userId': req.user._id})
    res.render('shop/orders', {
      path: '/orders',
      pageTitle: 'Orders',
      orders: orders
    })
  } catch (err) {
    console.log(err)
  }
}

exports.postOrder = async (req,res,next) => {
  const user = await req.user.populate('cart.items.productId')
  const products = user.cart.items.map(i => {
    return {product: {...i.productId._doc} ,quantity: i.quantity}
  })
  const order = new Order({
    products: products,
    user: {
      username: req.user.username,
      userId: req.user
      }
    })
    try {
      await order.save()
      await req.user.clearCart()
    } catch (err) {
      console.log(err)
    }
    res.redirect('/orders')
}

exports.getCheckout = (req,res,next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: 'checkout'
  })
}
