const User = require("../models/user.js");  // Import user model

module.exports.signUpForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signUpUser = async(req, res, next) => {
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        let registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to wanderlust!");
            res.redirect("/listings");
        })
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}

module.exports.loginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.loginUser = async (req, res) => {
    console.log("Final Redirect URL:", req.session.redirectUrl); // ✅ Debugging line

    req.flash("success", "Welcome back to Wanderlust!");
    const redirectUrl = req.session.redirectUrl || "/listings";

    delete req.session.redirectUrl; // ✅ Ensure session is cleared properly

    res.redirect(redirectUrl);
};


module.exports.logoutUser = (req, res, next) =>{
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "logged out successfully");
        res.redirect("/listings")
    })
}