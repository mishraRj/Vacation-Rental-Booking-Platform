const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");  // Helper to wrap async routes
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middlewares.js");
const reviewController = require("../controllers/reviews.js");

// Reviews
// Reviews Post Route
router.post("/", 
    validateReview, 
    isLoggedIn, 
    wrapAsync(reviewController.createReview));


// Delete Review Route
router.delete("/:reviewId", 
    isLoggedIn, 
    isReviewAuthor, 
    wrapAsync(reviewController.deleteReview));

module.exports = router;