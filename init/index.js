const mongoose = require("mongoose");
const axios = require("axios");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

let MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust";
const API_KEY = "ERTw6tHYWj9vGS9Q76Xy"; // ✅ MapTiler API Key

// ✅ MongoDB Connect
async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to DB");
}
main().catch(err => console.log("❌ MongoDB Connection Error:", err));

// ✅ Function to Fetch Coordinates from MapTiler API
const getCoordinates = async (address) => {
    try {
        console.log(`🌍 Fetching coordinates for: ${address}`);
        const response = await axios.get(`https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${API_KEY}`);
        const data = response.data;

        if (data.features.length > 0) {
            const [longitude, latitude] = data.features[0].center;
            console.log(`✅ Found Coordinates for ${address}: [${longitude}, ${latitude}]`);
            return { type: "Point", coordinates: [longitude, latitude] };
        } else {
            console.log(`❌ No coordinates found for: ${address}`);
            return { type: "Point", coordinates: [0, 0] }; // ✅ Default to (0,0) if not found
        }
    } catch (error) {
        console.error(`❌ Error fetching coordinates for ${address}:`, error);
        return { type: "Point", coordinates: [0, 0] }; // ✅ Default to (0,0) in case of API failure
    }
};

// ✅ Function to Initialize DB
const initDB = async () => {
    await Listing.deleteMany({});
    console.log("🗑 Deleted old listings...");

    let listingsWithCoordinates = [];
    
    // ✅ Fetch coordinates for each listing
    for (let listing of initData.data) {
        const geoData = await getCoordinates(listing.location);
        listingsWithCoordinates.push({ 
            ...listing, 
            owner: "67c5503cbddc28c8cbbde2d3", 
            geometry: geoData  // ✅ Adding geometry field
        });
    }

    await Listing.insertMany(listingsWithCoordinates);
    console.log("✅ Data initialized with coordinates!");
};

// ✅ Run the Database Initialization
initDB();
