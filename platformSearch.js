// done - pass through the platform name & posts and/or users
// fail - pass through the platform name & error message

require("dotenv").config();
const cryptr = require("cryptr");
const encrypt = new cryptr(process.env.ENCRYPTION_SECRET_KEY);
const Twit = require("twit");
const OAuth = require("oauth");

function twitter (req, query, type, done, fail) {
    const access_token = encrypt.decrypt(req.user.twitterCredentials.token);
    const access_token_secret = encrypt.decrypt(req.user.twitterCredentials.tokenSecret);
    switch (type) {
// ================================================================= get posts ==========================================================================
        case "post":
            // defines Twit npm packages used to interact with Twitter
            let T = new Twit({
                consumer_key: process.env.TWITTER_CONSUMER_KEY,
                consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
                access_token,
                access_token_secret,
                timeout_ms: 60*1000,
                strictSSL: false,
            })
            // gets posts relating to the user's search query
            T.get('search/tweets', { q: query, count: 50 }, function(err, data, response) {
                if(err) {
                    console.log(err)
                    const message = "Something went wrong, please try again later"
                    return fail("twitter", message)
                }
                else {
                    return done("twitter", data);
                }
            })
            break;
// ================================================================= get users ==========================================================================
        case "user":
            const oauth = new OAuth.OAuth(
                "https://api.twitter.com/oauth/request_token",
                "https://api.twitter.com/oauth/access_token",
                process.env.TWITTER_CONSUMER_KEY,
                process.env.TWITTER_CONSUMER_SECRET,
                '1.0A',
                null,
                'HMAC-SHA1'
            );
            oauth.get(
                `https://api.twitter.com/1.1/users/search.json?q=${query}&count=50`,
                access_token,
                access_token_secret,
                function(err, data) {
                    if(err) {
                        console.log(err)
                        const message = "Something went wrong, please try again later"
                        return fail("twitter", message);
                    }
                    else {
                        const users = Function(`"use strict";return ${data}`)();
                        return done("twitter", users);
                    }
                }
            )
            break;
// =============================================================== error handling ========================================================================
        default:
            const message = "Something went wrong, please try again later"
            fail("twitter", message);
            break;
    }
}

function linkedin(req, query, type, done, fail) {

}

function facebook(req, query, type, done, fail) {

}

module.exports = {
    twitter,
    linkedin,
    facebook,
}