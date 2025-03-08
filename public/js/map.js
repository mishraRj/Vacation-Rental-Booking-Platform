document.addEventListener("DOMContentLoaded", async function () {
    const API_KEY = window.Api_Key;  // ✅ Ab API key window object se aa rahi hai
    const address = window.listingLocation;  // ✅ Address from EJS

    // **Geocoding API Call**
    const response = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${API_KEY}`);
    const data = await response.json();

    if (data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        console.log(`Coordinates for ${address}: Latitude=${latitude}, Longitude=${longitude}`);

        // ✅ **Initialize Map With Correct Coordinates**
        var map = L.map('map').setView([latitude, longitude], 12);
        
        L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${API_KEY}`, {  // ✅ FIXED HERE
            attribution: '&copy; MapTiler & OpenStreetMap contributors'
        }).addTo(map);

        // ✅ **Add Marker**
        L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(`<b>${address}</b>`)
            .openPopup();
    } else {
        console.error("❌ No results found for address:", address);
    }
});

async function getCoordinates(address) {
    const API_KEY = window.Api_Key; 
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features.length > 0) {
            const [longitude, latitude] = data.features[0].center;
            console.log(`Coordinates for ${address}:`, latitude, longitude);
            return { latitude, longitude };
        } else {
            console.error("No results found for address:", address);
            return null;
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
}
