var express = require('express');
var router = express.Router({mergeParams: true});
var Campground = require('../models/campground');
var middleware = require('../middleware');
var isLoggedIn = middleware.isLoggedIn;
var isOwner = middleware.isCampgroundOwner;
var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}
var geocoder = NodeGeocoder(options);

//index route
router.get('/', function(req, res){
        //Get all campgrounds from db
        Campground.find({}, function(err, dbCampgrounds){
           if(err){
               console.log(err);
           } else{
               res.render('campgrounds/index', {camps: dbCampgrounds});
           }
        });
});
//RESTful route: Create -- creates a new campground and redirects to index
router.post('/', isLoggedIn, function(req, res){
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function(err, data){
       if(err || !data.length){
           console.log(err);
           req.flash('error', 'Invalid address');
           return res.redirect('back');
       } 
       var lat = data[0].latitude;
       var lng = data[0].longitude;
       var location = data[0].formattedAddress;
       var newCampground = {name: req.body.campName, image: req.body.campImage, description: req.body.campDescription, author: author, location: location, lat: lat, lng: lng};
       
       Campground.create(newCampground, function(err, returnedCampground){
           if(err){
               console.log(err);
           } else{
               console.log("New Campground");
               //redirects to campgrounds page with new campground
               res.redirect('/campgrounds');
           }
        });
    });
});

//RESTful route: New -- directs user to campground creation form
router.get("/new", isLoggedIn, function(req, res){
   res.render("campgrounds/new");
});

//RESTful route: Show-- shows the specific campground by id
router.get("/:id", function(req, res){
    
    Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
       if(err){
           console.log(err);
       } else{
            res.render("campgrounds/show", {campground: foundCampground});
       }
    });
});

//Edit Campground Route
router.get('/:id/edit', isOwner, function(req, res){
    Campground.findById(req.params.id, function(err, foundCamp){
        if(err){
            console.log('error in edit route')
        } else{
             res.render('campgrounds/edit', {campground: foundCamp});
        }        
    });
});

//Update Campground Route
router.put('/:id', isOwner, function(req, res){
     geocoder.geocode(req.body.location, function(err, data){
       if(err || !data.length){
           console.log(err);
           req.flash('error', 'Invalid address');
           return res.redirect('back');
       } 
       req.body.campground.lat = data[0].latitude;
       req.body.campground.lng = data[0].longitude;
       req.body.campground.location = data[0].formattedAddress;
     Campground.findOneAndUpdate({_id: req.params.id}, req.body.campground, function(err, updatedCampground){
         if(err){
             console.log('error in campgrounds update route');
             res.redirect('/campgrounds')
         } else{
             res.redirect('/campgrounds/' + req.params.id);
         }
     });
     });
});

//Destroy Route
router.delete('/:id', isOwner, function(req, res){
   Campground.findOneAndRemove({_id: req.params.id}, function(err){
       if(err){
           console.log('err in destroy route');
           res.redirect('/campgrounds');
       } else {
           res.redirect('/campgrounds');
       }
   })
});

module.exports = router;