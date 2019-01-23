require('dotenv').config();
var express = require('express');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override')
var flash = require('connect-flash');
var app = express();

var Campground = require('./models/campground');
var User       = require('./models/user');
var Comment    = require('./models/comment');
var passport   = require('passport');
var LocalStrategy = require('passport-local');

var commentRoutes = require('./routes/comments');
var indexRoutes = require('./routes/index');
var campgroundRoutes = require('./routes/campgrounds');

mongoose.connect("mongodb://localhost/yelpCamp_v11", { useNewUrlParser: true });
app.use(bodyparser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));

//Flash config
app.use(flash());

//Passport Configuration
app.use(require("express-session")({
    secret: "Rocky is still the best",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash('error');
   res.locals.success = req.flash('success');
   next();
});

//Route Configuration
app.use(indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log('Yelp Camp operational!!!!')
});