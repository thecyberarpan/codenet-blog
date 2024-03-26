var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
const multer = require('multer');
const upload = require('./multer');

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

/* Upload blogpost */
router.post('/createpost', isLoggedin, upload.single('image'), async function (req, res) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create(
    {
      user: user._id,
      title: req.body.title,
      content: req.body.content,
      image: req.file.filename,
    }
  );
  user.post.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.get('/createpost', isLoggedin, function (req, res) {
  res.render("createpost");
});

/* All blog page */
router.get('/blog', async function (req, res) {
  const postData = await postModel.find({});
  res.render('blog', { postData });
})

/* Single blog page */
router.get('/blog/:postId', async function (req, res) {
  const postId = req.params.postId;
  // const post = await postModel.findById(postId);
  const post = await postModel.findById(req.params.postId);
  res.render('blog-single', { post });
});

module.exports = router;
