require("dotenv").config();
const cryptr = require("cryptr");
const encrypt = new cryptr(process.env.ENCRYPTION_SECRET_KEY);
const Twit = require("twit");
const OAuth = require("oauth");
const fetch = require("node-fetch");

function searchUsers (req, query, done, fail) {
    const access_token = encrypt.decrypt(req.user.twitterCredentials.token);
    const access_token_secret = encrypt.decrypt(req.user.twitterCredentials.tokenSecret);
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
        `https://api.twitter.com/1.1/users/search.json?q=${query}&count=100`,
        access_token,
        access_token_secret,
        function(err, data) {
            if(err) {
                console.log(err)
                return fail();
            }
            else {
                const users = Function(`"use strict";return ${data}`)();
                return done(users);
            }
        }
    )
}

function searchPosts (req, query, done, fail) {
    fetch(`https://api.twitter.com/1.1/search/tweets.json?q=${query}&result_type=popular&count=100&tweet_mode=extended`, {
        method: "get",
        headers:  {
            'Content-Type': 'application/json',
            "authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        }
    }).then(res => res.json()).then(posts => done(posts))
    .catch((err) => {
        console.log(err);
        fail();
    })
}

module.exports = {
    searchUsers,
    searchPosts,
}