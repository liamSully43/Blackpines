/////////////////////////////////////////////////////////////////////////////////////////
//                                       Modules                                       //
/////////////////////////////////////////////////////////////////////////////////////////

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { check } = require("express-validator");

const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const TwitterStrategy = require("passport-twitter").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const Twit = require("twit");
const cryptr = require("cryptr");
const fetch = require("node-fetch");
const OAuth = require("oauth");

// custom files

const blackPines = require("./blackpinesAuthentication");
const twitterAuth = require("./twitterAuthentication");
const linkedinAuth = require("./linkedinAuthentication");
const facebookAuth = require("./facebookAuthentication");
const platformSearch = require("./platformSearch");

const app = express();

app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'dist/Blackpines')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(flash());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false},
}));

app.use(passport.initialize());
app.use(passport.session());

/////////////////////////////////////////////////////////////////////////////////////////
//                                    Database                                         //
/////////////////////////////////////////////////////////////////////////////////////////

mongoose.connect(process.env.API_KEY, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const newCustomerSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    twitterCredentials: Object,
    twitterProfile: Object,
    linkedinCredentials: Object,
    linkedinProfile: Object,
    facebookCredentials: Object,
    facebookProfile: Object,
});

newCustomerSchema.plugin(passportLocalMongoose);

const Customer = new mongoose.model("Customer", newCustomerSchema);

/////////////////////////////////////////////////////////////////////////////////////////
//                               Authenticate Strategies                               //
/////////////////////////////////////////////////////////////////////////////////////////

passport.use(Customer.createStrategy());

const host = (process.env.PORT) ? "https://blackpines.herokuapp.com" : "http://localhost:3000";

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: `${host}/twitter/callback`,
},  function(token, tokenSecret, profile, callback) {
        profile.token = token;
        profile.tokenSecret = tokenSecret;
        return callback(null, profile);
}));

passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: `${host}/linkedin/callback`,
    scope: ["r_organization_social", "r_1st_connections_size", "r_emailaddress", "rw_organization_admin", "r_basicprofile", "w_member_social", "w_organization_social"],
},  function(accessToken, refreshToken, profile, callback) {
        console.log(accessToken);
        console.log(refreshToken);
        profile.token = accessToken;
        profile.tokenSecret = refreshToken;
        return callback(null, profile);
}));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${host}/facebook/callback`,
},  function(accessToken, refreshToken, profile, callback) {
        profile.token = accessToken;
        profile.tokenSecret = refreshToken;
        return callback(null, profile);
}));

passport.serializeUser(function(user, callback) {
    callback(null, user);
})

passport.deserializeUser(function(obj, callback) {
    callback(null, obj);
})

/////////////////////////////////////////////////////////////////////////////////////////
//                                  Web Routing                                        //
/////////////////////////////////////////////////////////////////////////////////////////

function checkAuthentication(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    else {
        res.redirect("/entry");
    }
}

app.all("/*", (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
})

/////////////////////////////////////////////////////////////////////////////////////////
//                    Connecting & Disconnecting from platforms                        //
/////////////////////////////////////////////////////////////////////////////////////////

////////////// twitter
// connect

app.get("/twitter", checkAuthentication, passport.authorize("twitter"));

app.get("/twitter/callback", checkAuthentication, passport.authorize("twitter"), function(req, res) {
    twitterAuth.callback(req, res, Customer);
    res.redirect("/my-account");
});

// disconnect

app.get("/api/twitter/account/disconnect", function(req, res) {
    function cb (accountConnected) {
        res.send(accountConnected)
    }
    twitterAuth.disconnect(req, res, Customer, cb);
})

////////////// linkedin
// connect

app.get("/linkedin", checkAuthentication, passport.authorize("linkedin"));

app.get("/linkedin/callback", checkAuthentication, passport.authorize("linkedin"), function(req, res) {
    linkedinAuth.callback(req, res, Customer);
    res.redirect("/my-account");
});

app.get("/linkedin/token", (req, res) => {
    console.log(req);
    res.send(req);
})

// disconnect

app.get("/api/linkedin/account/disconnect", function(req, res) {
    function cb (accountConnected) {
        res.send(accountConnected)
    }
    linkedinAuth.disconnect(req, Customer, cb);
})

////////////// facebook
// connect

app.get("/facebook", checkAuthentication, passport.authorize("facebook"));

app.get("/facebook/callback", checkAuthentication, passport.authorize("facebook"), function(req, res) {
    facebookAuth.callback(req, res, Customer);
    res.redirect("/my-account");
});

// disconnect

app.get("/api/facebook/account/disconnect", function(req, res) {
    function cb (accountConnected) {
        res.send(accountConnected)
    }
    facebookAuth.disconnect(req, Customer, cb);
})

/////////////////////////////////////////////////////////////////////////////////////////
//                                      Web Routes                                     //
/////////////////////////////////////////////////////////////////////////////////////////

/////////////// Main/Info Page

app.get("/", (req, res) => {
    res.render(`${__dirname}/index.html`);
})

/////////////// Login/Register & new-post redirect

app.get("/entry", (req, res) => {
    if(req.isAuthenticated()) {
        res.redirect("/my-feed");
    }
    else {
        res.sendFile(path.join(__dirname + '/dist/Blackpines/index.html'), req.flash("password"));
    }
})

app.post("/my-feed", (req, res) => res.redirect("/my-feed"));

app.post("/my-account", (req, res) => res.redirect("/my-account"));

app.post("/new-post", (req, res) => res.redirect("/new-post"));

/////////////// Logout

app.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/my-feed");
})

/////////////// passes node routing over to angular routing

app.get("/my-feed", checkAuthentication, (req, res) => {
    res.sendFile(path.join(__dirname + '/dist/Blackpines/index.html'));
})

app.get("/new-post", checkAuthentication, (req, res) => {
    res.sendFile(path.join(__dirname + '/dist/Blackpines/index.html'));
})

app.get("/search", checkAuthentication, (req, res) => {
    res.sendFile(path.join(__dirname + '/dist/Blackpines/index.html'));
})

app.get("/my-account", checkAuthentication, (req, res) => {
    res.sendFile(path.join(__dirname + '/dist/Blackpines/index.html'));
})

/////////////// Login Function

app.post("/login", [
    check("username").isEmail().normalizeEmail().stripLow().trim().escape(),
    check("password").stripLow().trim().escape()
], function(req, res, next) {
    blackPines.login(req, res, next, Customer);
});

/////////////// Register Function

app.post("/register", [
    check("firstName").stripLow().trim().escape(),
    check("lastName").stripLow().trim().escape(),
    check("username").isEmail().normalizeEmail().stripLow().trim().escape(),
    check("password").isLength({ min: 8 }).stripLow().trim().escape(),
], function(req, res) {
    blackPines.register(req, res, Customer);
})

/////////////////////////////////////////////////////////////////////////////////////////
//                              Posting to Platforms                                   //
/////////////////////////////////////////////////////////////////////////////////////////

app.post("/newpost", [
    check("post").stripLow().trim().escape(),
    check("linkedin-post").stripLow().trim().escape(),
    check("facebook-post").stripLow().trim().escape(),
], (req, res) => {
    let twitter = req.body.twitter;
    let linkedin = req.body.linkedin;
    let facebook = req.body.facebook;
    let messages = [];
    function callback (message, platform) {
        messages.push(message);
        if(platform === "twitter") twitter = false;
        if(platform === "linkedin") linkedin = false;
        if(platform === "facebook") facebook = false;
        if(!twitter && !linkedin && !facebook) res.send(messages);
    }
    if(req.body.twitter) twitterAuth.newTweet(req, callback);
    if(req.body.linkedin) linkedinAuth.newPost(req, callback);
    if(req.body.facebook) facebookAuth.newPost(req, callback);
})

/////////////////////////////////////////////////////////////////////////////////////////
//                                   API Requests                                      //
/////////////////////////////////////////////////////////////////////////////////////////

/////////////// returns logged in user's account details to the front-end

app.get("/api/user", (req, res) => {
    res.send(req.user);
});

/////////////// returns user's twitter home timeline

app.get("/api/myfeed", (req, res) => {
    function cb(feed) {
        if(typeof feed === "string") { // checks if the returned value is an error message
            const result = {
                success: false,
                message: feed,
            }
            return res.send(result);
        }
        for(let post of feed) {
            let time = post.created_at.substr(4, 12);
            post.created_at = time;
        }
        res.send(feed)
    }
    twitterAuth.getFeed(req, cb);
})

/////////////// returns user's twitter posts

app.get("/api/myposts", (req, res) => {
    function callback(posts) {
        if(!posts) { // checks if the returned value is an error message
            const result = {
                success: false,
                message: "Unable to fetch your twitter statuses, please try again later",
            }
            return res.send(result);
        }
        for(let post of posts) {
            let time = post.created_at.substr(4, 12);
            post.created_at = time;
        }
        res.send(posts);
    }
    twitterAuth.getPosts(req, callback);
})

app.post("/api/changePassword", [
    check("oldPassword").stripLow().trim().escape(),
    check("newPassword").isLength({ min: 8 }).stripLow().trim().escape(),
], (req, res) => {
    const cb = result => {
        res.send(result);
    }
    blackPines.changePassword(req, Customer, cb);
})

app.post("/api/search", [
    check("searchTerm").stripLow().trim().escape(),
], (req, res) => {
    const searchTerm = req.body.searchTerm // the user's searched term
    const type = req.body.type; // if the user is searching for posts or users

    let failSafeCalled = false; // used to prevent the complete function from returning data if the failsafe is called after a timeout 

    // what will be returned to the client side
    let response = {
        results: "",
        success: false,
    };
    
    // is a search query returns succesfully with data - this will be called
    function callbackSuccess(results) {
        response.results = results;
        response.success = true;
        // when a platform search request returns it will set the respective platform value to false in order to call the function back to the client side
        //      this is called in both the success callback & the failed callback as both will return a value to the client side
        complete();
    }

    // is a search query fails - this will be called
    function callbackFailed() {
        response.message = "Something went wrong, please try again later";
        response.success = false;
        complete();
    }

    if(type === "Posts") {
        platformSearch.searchPosts(req, searchTerm, callbackSuccess, callbackFailed);
    }
    else {
        platformSearch.searchUsers(req, searchTerm, callbackSuccess, callbackFailed);
    }

    // request takes too long
    const failsafe = setTimeout(() => {
        failSafeCalled = true;
        const end = {
            success: false,
            message: "Request timed out, please try searching again later",
        }
        return res.send(end);
    }, 20000); 

    // returns result(s) back to client side
    const complete = () => {
        if(!failSafeCalled) {
            clearTimeout(failsafe);
            return res.send(response);
        }
    };
})

/////////////// Platform API calls

/////////////// api structure: /api/platform/item/actionOrItems

app.post("/api/twitter/tweet/like", (req, res) => {
    const cb = val => res.send(val);
    twitterAuth.like(req, cb)
})

app.post("/api/twitter/tweet/retweet", (req, res) => {
    const cb = val => res.send(val);
    twitterAuth.retweet(req, cb);
})

app.post("/api/twitter/tweet/reply", (req, res) => {
    const cb = val => res.send(val);
    twitterAuth.reply(req, cb);
})

app.post("/api/twitter/tweet/delete", (req, res) => {
    const cb = val => res.send(val);
    twitterAuth.deleteTweet(req, cb);
})

/////////////// get tweets 

app.post("/api/twitter/tweet/get", (req, res) => {
    const postId = req.body.postId;
    function cb (val) {
        res.send(val);
    }
    twitterAuth.getTweet(postId, cb);
})

app.get("/api/twitter/account/get", (req, res) => {
    const cb = val => res.send(val);
    twitterAuth.getUser(req, cb);
})

app.post("/api/twitter/account/follow", (req, res) => {
    const cb = val => res.send(val);
    twitterAuth.follow(req, cb);
})

app.post("/api/twitter/account/unfollow", (req, res) => {
    const cb = val => res.send(val);
    twitterAuth.unfollow(req, cb);
})

app.get("/api/twitter/account/tweets", (req, res) => {
    const cb = val => res.send(val);
    twitterAuth.getUsersTweets(req, cb);
})

app.get("/api/twitter/account/followers", (req, res) => {
    const cb = val => res.send(val);
    twitterAuth.getUsersFollowers(req, cb);
})

app.get("/api/twitter/account/following", (req, res) => {
    const cb = val => res.send(val);
    twitterAuth.getUsersFollowing(req, cb);
})

app.get("/api/linkedin", (req, res) => {
    const cb = val => {
        console.log(val);
        res.send(val);
    }
    linkedinAuth.getFeed(req, cb)
})

/////////////////////////////////////////////////////////////////////////////////////////
//                                      404                                            //
/////////////////////////////////////////////////////////////////////////////////////////

app.all("*", (req, res) => {
    res.sendFile(path.join(__dirname + '/dist/Blackpines/index.html'));
})

/////////////////////////////////////////////////////////////////////////////////////////
//                              Serving the application                                //
/////////////////////////////////////////////////////////////////////////////////////////

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Server running on port ${port}`));