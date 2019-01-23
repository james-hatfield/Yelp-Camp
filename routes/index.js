var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Campground = require('../models/campground');

router.get('/', function(req, res){
    res.render('landing');
});


//Authentication Routes
//Show Route
router.get('/register', function(req, res){
   res.render('register'); 
});
//CREATE Route
router.post('/register', function(req, res){
    var newUser = new User({
            username: req.body.username, 
            firstName: req.body.firstName, 
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
        });
    if(req.body.adminCode === "secretcode123"){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            req.flash('error', err.message);
            console.log(err);
            res.redirect('register');
        }else{
            req.flash('success', 'Welcome to YelpCamp ' + user.username + '!');
            passport.authenticate("local")(req, res, function(){
            res.redirect('/campgrounds');
            });
        }
    });
});

//show login route
router.get('/login', function(req, res){
    res.render('login');
});

//handles login logic
router.post('/login', passport.authenticate('local', 
        {successRedirect: '/campgrounds',
         failureRedirect: '/login',
         successFlash: 'You Successfully Logged In! Welcome',
         failureFlash: 'Failed to login'
        
        }),function(req, res){
});

//shows logoutRoute
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You Successfully Logged Out!');
    res.redirect('/campgrounds');
});

//User Profile
router.get('/users/:id', function(req, res){
    User.findById(req.params.id).populate('comments').exec(function(err, foundUser){
       if(err){
           console.log(err);
           req.flash("error", "Something went wrong.");
      return res.redirect("/");
       } else{
            res.render("users/show", {user: foundUser});
       }
    });
});

module.exports = router;