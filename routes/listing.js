const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");  // Helper to wrap async routes
const { isLoggedIn, isOwner, validateListing } = require("../middlewares.js")
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn, 
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing));

// New Route - Render form to create a new listing
router.get("/new", 
    isLoggedIn, 
    listingController.renderNewForm);

router
.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn, 
        isOwner, 
        upload.single('listing[image]'),
        validateListing, 
        wrapAsync(listingController.updateListing))
    .delete( 
            isLoggedIn, 
            isOwner, 
            wrapAsync(listingController.deleteListing));

// Edit Route - Render form to edit an existing listing
router.get("/:id/edit", 
    isLoggedIn, 
    isOwner,
    wrapAsync(listingController.editListing));

module.exports = router;