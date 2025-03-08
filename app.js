if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

// Import required dependencies
const express = require("express");  // Express framework for routing
const app = express();  // Initialize Express application
const mongoose = require("mongoose");  // Mongoose for MongoDB interaction
const path = require("path");  // Path module for managing file paths
const methodOverride = require("method-override");  // Allows overriding of HTTP methods (PUT, DELETE)
const ejsMate = require("ejs-mate");  // EJS engine with extended functionality
const ExpressError = require("./utils/ExpressError.js");  // Custom error handling class
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
// const cookieParser = require('cookie-parser');


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// // Set the MongoDB connection URL
// let MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust";  // Local MongoDB database

let dbUrl = process.env.ATLASDB_URL;

// Function to connect to MongoDB
main()
    .then(() => {
        console.log("connected to DB");  // Log successful DB connection
    })
    .catch((err) => {
        console.log(err);  // Log any error if connection fails
    })

// Asynchronous function to connect to MongoDB
async function main () {
    await mongoose.connect(dbUrl);  // Connect to MongoDB
}

// Set up view engine and directory paths
app.set("view engine", "ejs");  // Use EJS templating engine for views
app.set("views", path.join(__dirname, "views"));  // Set views directory path
app.use(express.urlencoded({extended: true}));  // Parse incoming URL-encoded data
app.use(methodOverride("_method"));  // Support PUT and DELETE HTTP methods via query parameters
app.engine("ejs", ejsMate);  // Use ejsMate for EJS template rendering
app.use(express.static(path.join(__dirname, "/public")));  // Serve static files from 'public' directory
// app.use(cookieParser("secretCode"));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600,  // keeps the user login after refresh for 24 hr 
});

store.on("error", () => {
    console.log('error on mongo session store', err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET, 
    resave: false, 
    saveUninitialized: false, // ✅ Change this
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" // ✅ Ensures secure cookies in production
    }
};


app.use(session(sessionOptions));
app.use(flash()); // Always use flash() before routes' app.use.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); // pbkdf2 hashing algo use in passport

app.use((req, res, next) => {
    res.locals.success = req.flash("success"); // use to store variables locally if we are trying to access any template
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.currentUrl = req.path;
    res.locals.maptilerApiKey = process.env.MAPTILER_API_KEY;
    next();
});

app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use("/", userRouter);

// Catch-all route for undefined paths (404 error)
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));  // Throw a 404 error for unmatched routes
});

// Global error handling middleware
app.use((err, req, res, next) => {
    let { statusCode  = 500, message  = "Something went wrong :("} = err;  // Set default error values
    res.status(statusCode).render("error.ejs", {message});  // Render an error page with the error message
});

app.use((req, res, next) => {
    const allowedPaths = ["/login", "/signup", "/listings"];
    
    if (!req.user && !allowedPaths.includes(req.path)) {
        if (req.path !== "/login") {
            req.session.redirectUrl = req.originalUrl; // ✅ Save intended URL
        }
        return res.redirect("/login");
    }
    next();
});


// Start the server and listen on port 8080
app.listen(8080, () => {
    console.log("server is listening to port 8080");  // Log server startup message
});
