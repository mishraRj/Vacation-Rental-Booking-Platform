const Reviews = require("../models/review.js");  // Import Listing model
const Listing = require("../models/listing.js");  // Import Listing model

module.exports.createReview = async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Reviews(req.body.review);
    newReview.author = req.user._id;
    await newReview.save();

    // Add the review ID to the listing's reviews array
    listing.reviews.push(newReview._id);

    await listing.save(); // Saved listing again because when we make change in existing doc then we need to save it again.
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
}

module.exports.deleteReview = async(req, res) => {
    let { id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Reviews.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}