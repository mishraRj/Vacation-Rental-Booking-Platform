const express = require("express");
const router = express.Router();
const User = require("../models/user.js");  // Import user model
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middlewares.js");
const userController = require("../controllers/users.js");

router
    .route("/signup")
    .get(userController.signUpForm)
    .post(wrapAsync(userController.signUpUser));

router
    .route("/login")
    .get(userController.loginForm)
    .post(  
        saveRedirectUrl,
        passport.authenticate('local', { 
            failureRedirect: '/login', 
            failureFlash: true
        }), 
        userController.loginUser
    );

router.get("/logout", 
    userController.logoutUser)

module.exports = router;