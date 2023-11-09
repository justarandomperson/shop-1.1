const crypto = require('crypto')

const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')

const User = require('../models/user')
const mongoose = require('mongoose')

const getError = (req) => {
  const message = req.flash('error')
  if (message.length>0) {
    return message[0]
  } else {
    return []
  }
}

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth:{
    user: "justarandomlucas@gmail.com",
    pass: "lplkfijtoszifxaq"
  }
})


exports.getLogin = (req,res,next) => {
  const error = getError(req)
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    error: error
  })
}

exports.postLogin = async (req,res,next) => {
try {
  const username = req.body.username
  const password = req.body.password
  const user = await User.findOne({username: username})
  if (!user || !await bcrypt.compare(password, user.password)) {
    req.flash('error', 'Invaild username or password.')
    return res.redirect('/login')
  }

  req.session.user = user

  await req.session.save()
  res.redirect('/')
  }
catch(err) {
  res.redirect('/login')
  console.log(err)
}
}

exports.postLogout = async (req,res,next) => {
  await req.session.destroy()
  res.redirect('/')
}

exports.getSignup = (req,res,next) => {
  const error = getError(req)
  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    error: error
  })
}

exports.postSignup = async (req,res,next) => {
  const username = req.body.username
  const email = req.body.email
  const password = req.body.password
  const password2 = req.body.password2

  if (await User.findOne({email: email}) ) {
    req.flash('error', 'Email is already in use.')
    return res.redirect('signup')
   }
   const hashedPassword = await bcrypt.hash(password, 12)
   const user = new User({username: username, email: email, password: hashedPassword, cart: {items: []}})
   await user.save()

   const mailOptions = {
    from: 'justarandomlucas@gmail.com',
    to: email,
    subject: 'shop',
    text: 'thanks for using my very cool website'
  }
  transporter.sendMail(mailOptions, err => {
    if (err) {
      console.log(err)
    }
  })

   res.redirect('/login')
}

exports.getReset = (req,res,next) => {
  const error = getError(req)
  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    path: '/reset',
    error: error
  })
}

exports.postReset = (req,res,next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {console.log(err); return res.redirect('reset')}
    const token = buffer.toString('hex')
    const user = await User.findOne({email: req.body.email})
    if (!user) { req.flash('error', "No account with that email found."); return res.redirect('/reset')}
    user.resetToken = token
    user.resetTokenExpiration = Date.now() + 3600000
    await user.save()
    res.redirect('/')
    const mailOptions = {
      from: 'justarandomlucas@gmail.com',
      to: user.email,
      subject: 'Password Reset',
      html: ` <p>You've requested a password reset.</p>
      <p>Click the following link to create a new password. It will be valid for only 1 hour.</p>
      <a href="http://localhost:3000/reset/${token}">Reset Password</a>
      `
    }
    transporter.sendMail(mailOptions, (err) => {console.log(err)}) 
  })
}

exports.getNewPassword =  async (req,res,next) => {
  const error = getError(req)
  const token = req.params.token
  const user = await User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
  res.render('auth/new-password', {
    pageTitle: 'New Password',
    path: '/new-password',
    error: error,
    token: token,
    userId: user._id.toString()
  })
}

exports.postNewPassword = async(req,res,next) => {
  try {
    const newPassword = req.body.password
    const userId = new mongoose.Types.ObjectId(req.body.userId)
    const token = req.body.token
    const user = await User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}, _id: userId})
    if (!user) {
      return res.redirect('/')
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedPassword
    user.resetToken = undefined
    user.resetTokenExpiration = undefined
    await user.save()
    res.redirect('/login')
  } catch(err) {
    console.log(err)
    res.redirect('/')
  }
}