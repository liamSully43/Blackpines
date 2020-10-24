require("dotenv").config();
const cryptr = require("cryptr");
const OAuth = require("oauth");
const fetch = require("node-fetch");
const Twit = require("twit");

const encrypt = new cryptr(process.env.ENCRYPTION_SECRET_KEY);

/////////////////////////////////////////////////////////////////////////////////////////
//                             Twitter API Callback                                    //
/////////////////////////////////////////////////////////////////////////////////////////

function callback(req, res, Customer) {
    const token = encrypt.encrypt(req.account.token);
    const tokenSecret = encrypt.encrypt(req.account.tokenSecret);
    req.user.twitterCredentials = {
        token,
        tokenSecret,
        twitterID: req.account.id,
    };
    req.user.twitterProfile = req.account._json;
    Customer.updateOne(
        {_id: req.user._id},
        {twitterCredentials: {
            token,
            tokenSecret,
            twitterID: req.account.id,
        }, twitterProfile: req.account._json},
        {multi: false},
        function(err) {if(err) console.log(err)}
    )
}

/////////////////////////////////////////////////////////////////////////////////////////
//                              Disconnect From Twitter                                //
/////////////////////////////////////////////////////////////////////////////////////////

function disconnect(req, res, Customer, done) {
    req.user.twitterCredentials = null;
    req.user.twitterProfile = null;
    Customer.updateOne(
        {_id: req.user._id},
        {twitterCredentials: null, twitterProfile: null},
        {multi: false},
        function(err) {
            if(err) {
                console.log(err)
                done(true);
            }
            else {
                done(false);
            }
        }
    )
}

/////////////////////////////////////////////////////////////////////////////////////////
//                              Update Twitter Account                                 //
/////////////////////////////////////////////////////////////////////////////////////////

function update(req, res) {
    // update user's twitter account
    console.log("Twitter profile updated");
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                 Get Twitter Feed                                    //
/////////////////////////////////////////////////////////////////////////////////////////

const getFeed = (req, done) => {
    const token = encrypt.decrypt(req.user.twitterCredentials.token);
    const tokenSecret = encrypt.decrypt(req.user.twitterCredentials.tokenSecret);
    const oauth = new OAuth.OAuth(
        "https://api.twitter.com/oauth/request_token",
        "https://api.twitter.com/oauth/access_token",
        process.env.TWITTER_CONSUMER_KEY,
        process.env.TWITTER_CONSUMER_SECRET,
        '1.0A',
        null,
        'HMAC-SHA1'
    );
    let response = oauth.get(
        "https://api.twitter.com/1.1/statuses/home_timeline.json?count=50",
        token,
        tokenSecret,
        function(err, data) {
            if(err) {
                console.log(err);
                done("Unable to fetch your twitter home timeline, please try again later");
            }
            else {
                const feed = Function(`"use strict";return ${data}`)();
                done(feed);
            }
        }
    )
    return response;
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                 Get Twitter Posts                                   //
/////////////////////////////////////////////////////////////////////////////////////////

const getPosts = (req, done) => {
    fetch(`https://api.twitter.com/1.1/statuses/user_timeline.json?count=50&user_id=${req.user.twitterCredentials.twitterID}`, {
        method: "get",
        headers:  {
            'Content-Type': 'application/json',
            "authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        }
    }).then(res => res.json()).then(posts => done(posts));
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                     New Tweet                                       //
/////////////////////////////////////////////////////////////////////////////////////////

function newTweet(req, done) {
    const access_token = encrypt.decrypt(req.user.twitterCredentials.token);
    const access_token_secret = encrypt.decrypt(req.user.twitterCredentials.tokenSecret);
    let T = new Twit({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token,
        access_token_secret,
        timeout_ms: 60*1000,
        strictSSL: false,
    })
    T.post("statuses/update", { status: req.body.tweet}, function(err, data, response) {
        if(err) {
            console.log(err);
            const result = {
                success: false,
                message: "something wen't wrong, please try again later"
            }
            done(result);
        }
        else {
            const result = {
                success: true,
                message: ""
            }
            done(result);
        }
    })
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                      Exports                                        //
/////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    callback,
    disconnect,
    update,
    getFeed,
    getPosts,
    newTweet,
}