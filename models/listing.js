const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Reviews = require("./review.js");

const listingSchema = new Schema ({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        url: String,
        filename: String
    },
    category: {
    type: [String],
    enum: [
        'trending',
        'rooms',
        'mountains',
        'castle',
        'swimming pool',
        'beach',
        'camp',
        'farm',
        'arctic',
        'tree house',
        'boat'
    ],
    required: true,
    validate: [array => array.length > 0, 'At least one category is required']
}
,
    price: Number,
    location: String,
    country: String,
    geometry: {          // ✅ Store coordinates in GeoJSON format
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],  // [longitude, latitude]
            required: true
        }
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});

listingSchema.post("findOneAndDelete", async(listing) => {
    if(listing){
        await Reviews.deleteMany({_id: {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;