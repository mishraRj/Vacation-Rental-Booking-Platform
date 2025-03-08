const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");  // Custom error handling class
const { listingSchema, reviewSchema } = require('./schema.js');  // Import listing schema for validation

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        console.log("Redirect URL Saved in Session:", req.session.redirectUrl); // ✅ Debug
        req.flash("error", "You must be logged in to perform this action");
        return res.redirect("/login");
    }
    next();
};


module.exports.saveRedirectUrl = (req, res, next) => {
    // Ensure session variable is stored correctly
    if (!req.session.redirectUrl) {
        req.session.redirectUrl = "/listings";  // ✅ Set a safe default
    }

    res.locals.redirectUrl = req.session.redirectUrl;

    next();
};



module.exports.isOwner = async(req, res, next) => {
    let {id} = req.params;  // Get the listing ID from the URL parameters
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to perform this action!")
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    console.log("Request body:", req.body); // Log the structure of req.body
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Middleware to validate Reviews data
module.exports.validateReview = (req, res, next) => {
    console.log("Received body:", req.body); // Debugging log
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errMsg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    }
    next();
};

module.exports.isReviewAuthor = async(req, res, next) => {
    let {id, reviewId} = req.params;  // Get the listing ID from the URL parameters
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to perform this action!")
        return res.redirect(`/listings/${id}`);
    }
    next();
}