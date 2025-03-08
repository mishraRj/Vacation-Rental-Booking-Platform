const Listing = require("../models/listing.js");  // Import Listing model
const axios = require("axios");

module.exports.index = async (req, res, next) => {
    let filter = {}; // Default: fetch all listings
    if (req.query.category) {
        filter.category = req.query.category; // Filter by category if provided
    }

    if (req.query.search) {
        filter.title = { $regex: req.query.search, $options: "i" }; // Case-insensitive search
    }
    //$regex → MongoDB operator for pattern matching.
    //$options: "i" → Makes the search case-insensitive.

    const allListings = await Listing.find(filter);

    if (allListings.length === 0) {
        req.flash("error", "No posts found for your search!");
        return res.redirect("/listings");
    }

    res.render("listings/index.ejs", { allListings });
};


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");  // Display the form to add a new listing
}

module.exports.showListing = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({
            path: 'reviews',
            populate:{
                path:"author"
            }
        }).populate('owner'); // Populate reviews
    if (!listing) {
        req.flash("error", "Requested listing don't exist");
        res.redirect("/listings")
    }   
    res.render("listings/show.ejs", { listing });
}

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };

    // ✅ Ensure category is always an array
    if (!Array.isArray(req.body.listing.category)) {
        req.body.listing.category = [req.body.listing.category]; // Convert single selection to array
    }
    newListing.category = req.body.listing.category; // Save the updated category array

    // ✅ Get coordinates from MapTiler
    const API_KEY = process.env.MAPTILER_API_KEY; // Store API key in .env
    const geoURL = `https://api.maptiler.com/geocoding/${encodeURIComponent(newListing.location)}.json?key=${API_KEY}`;
    
    try {
        const response = await axios.get(geoURL);
        const data = response.data;
        if (data.features.length > 0) {
            const [longitude, latitude] = data.features[0].center;
            newListing.geometry = { type: "Point", coordinates: [longitude, latitude] };  // ✅ Store in DB
        } else {
            console.log("❌ No coordinates found for:", newListing.location);
            newListing.geometry = { type: "Point", coordinates: [0, 0] }; // Default
        }
    } catch (error) {
        console.error("Geocoding failed:", error);
        newListing.geometry = { type: "Point", coordinates: [0, 0] }; // Default coordinates
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};


module.exports.editListing = async (req, res, next) => {
    let {id} = req.params;  // Get the listing ID from the URL parameters
    const listing = await Listing.findById(id);  // Fetch the listing to edit by its ID
    
    if (!listing) {
        req.flash("error", "Requested listing don't exist");
        res.redirect("/listings")
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")
    res.render("listings/edit.ejs", { listing, originalImageUrl });  // Render the edit form with the current listing data
}

module.exports.updateListing = async (req, res, next) => {
    let {id} = req.params;  // Get the listing ID from the URL parameters
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });  // Update the listing data in the database
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    
    req.flash("success", "Listing Updated Successfully!");
    res.redirect(`/listings/${id}`);  // Redirect to the updated listing's page
}

module.exports.deleteListing = async (req, res, next) => {
    let {id} = req.params;  // Get the listing ID from the URL parameters
    let deletedItem = await Listing.findByIdAndDelete(id);  // Delete the listing from the database
    console.log(deletedItem);  // Log the deleted listing (for debugging)
    req.flash("success", "Listing Deleted Successfully!");
    res.redirect(`/listings`);  // Redirect to the listings index page after deletion
}