var express = require('express');
var router = express.Router({mergeParams: true});
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var User = require('../models/user');
var middleware = require('../middleware');
var isLoggedIn = middleware.isLoggedIn;
var isOwner = middleware.isCommentOwner;

//===========================
//      COMMENT ROUTES
//===========================
router.get("/new", isLoggedIn,function(req, res){
   
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
       } else{
           res.render("comments/new", {campground: campground}); 
       }
   })
});

//CREATE ROUTE
router.post("/", isLoggedIn, function(req, res){
   //look up campground using Id
   Campground.findById(req.params.id, function(err, foundCampground){
       if(err){
           req.flash('error', err.message);
           console.log(err);
           res.redirect('/campgrounds');
       } else{
           Comment.create(req.body.comment, function(err, comment){
               if(err){
                   console.log(err);
               }else {
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   comment.save();
                   console.log(comment);
                    //link comment to campground
                   foundCampground.comments.push(comment);
                     //create new comments
                   foundCampground.save();
                   User.findById(req.user._id, function(err, foundUser) {
                       if(err){
                           console.log(err);
                       }else{
                           foundUser.comments.push(comment);
                           foundUser.save();
                       }
                   });
                   req.flash('success', 'Successfully added comment');
                   res.redirect('/campgrounds/' + foundCampground._id);
                   
               }
           });
       }
   });
});

//COMMENT EDIT ROUTE
router.get('/:comment_id/edit', isOwner, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
       if(err){
           console.log('error in comment edit route');
       }else {
            res.render('comments/edit', {campground_id: req.params.id, comment: foundComment});
       }
   });    
  
});

//COMMENT UPDATE ROUTE
router.put('/:comment_id', isOwner, function(req, res){
  Comment.findOneAndUpdate({_id: req.params.comment_id}, req.body.comment, function(err, updatedComment){
      if(err){
          console.log('error in comment update route');
          res.redirect('/campgrounds/' + req.params.id);
      } else{
          res.redirect('/campgrounds/' + req.params.id);
      }
  });
});

//Destroy Route
router.delete('/:comment_id',isOwner, function(req, res){
    Comment.findOneAndRemove({_id: req.params.comment_id}, function(err){
        if(err){
            console.log('Error in comment destroy route');
            res.redirect('/campgrounds');
        }else{
            req.flash('success', 'Comment Deleted');
            res.redirect('/campgrounds/' + req.params.id);
        }
    })
});

module.exports = router;