//All Middleware Goes Here
var middlewareObj = {};
var Comment = require('../models/comment');
var Campground = require('../models/campground');

middlewareObj.isCampgroundOwner = function(req, res, next){
      if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCamp){
            if(err){
                console.log('Error in edit route');
                req.flash('error', err.message);
                res.redirect('back');
            } else{
                if(foundCamp.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash("error", "You do not have permission to do that");
                    res.redirect('back');
                }
            }
        });
    } else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect('/login');
    }
};

middlewareObj.isCommentOwner = function(req, res, next){
     if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash('error', err.message);
                console.log('Error in edit route');
                res.redirect('back');
            } else{
                if(foundComment.author.id.equals(req.user._id) ||  req.user.isAdmin){
                    next();
                }else{
                    req.flash("error", "You do not have permission to do that");
                    res.redirect('back');
                }
            }
        });
    } else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect('/login');
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error", "You need to be logged in to do that");
        res.redirect('/login');
    }
}


module.exports = middlewareObj;