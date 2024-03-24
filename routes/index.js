var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
// const multer = require

/* middileware for restrict path for loggedin users */
function isLoggedin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('login');
};


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


/* User signup page. */
router.post('/signup', function (req, res) {
  const data = new userModel({
    fullname: req.body.fullname,
    username: req.body.username,
    email: req.body.email,
  });
  userModel.register(data, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect('/profile');
      });
    });
});

router.get('/signup', function (req, res) {
  res.render('signup');
});

/* User login page */
router.post('/login', passport.authenticate("local", {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true,
}), function (req, res) {

});

router.get('/login', function (req, res) {
  console.log(req.flash("error"));
  res.render('login');
});

/* User profile page */
router.get('/profile', isLoggedin, async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate('post');
  res.render('profile', { user });
});

/* All blog page */
router.get('/blog', function (req, res) {
  res.render('blog');
});

module.exports = router;
