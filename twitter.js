/*

Function Index:
    
callback
disconnect
update
getFeed
getPosts
newTweet
getTweet
getUser
like
reply
retweet
deleteTweet
follow
unfollow
getUsersTweets
getUsersFollowers
getUsersFollowing
searchUsers
searchPosts

*/

require("dotenv").config();
const cryptr = require("cryptr");
const OAuth = require("oauth");
const fetch = require("node-fetch");
const Twit = require("twit");

const encrypt = new cryptr(process.env.ENCRYPTION_SECRET_KEY);

const oauth = new OAuth.OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    process.env.TWITTER_CONSUMER_KEY,
    process.env.TWITTER_CONSUMER_SECRET,
    '1.0A',
    null,
    'HMAC-SHA1'
);

/////////////////////////////////////////////////////////////////////////////////////////
//                             Twitter API Callback                                    //
/////////////////////////////////////////////////////////////////////////////////////////

function callback(req, res, Customer) {
    const token = encrypt.encrypt(req.account.token);
    const tokenSecret = encrypt.encrypt(req.account.tokenSecret);
    let twitterAccount = req.account._json;
    twitterAccount.token = token;
    twitterAccount.tokenSecret = tokenSecret;
    req.user.twitter.push(twitterAccount);
    Customer.updateOne(
        {_id: req.user._id},
        { $push: { twitter: { $each: [twitterAccount] } } }, // pushes the new account to the array of Twitter accounts
        {multi: false},
        function(err) {if(err) console.log(err)}
    )
}

/////////////////////////////////////////////////////////////////////////////////////////
//                              Disconnect From Twitter                                //
/////////////////////////////////////////////////////////////////////////////////////////

function disconnect(req, res, Customer, done) {
    const id = req.body.id;
    for(let accounts of req.user.twitter) {
        if(accounts.id_str === id) {
            accounts = null;
            Customer.updateOne(
                {_id: req.user._id,},
                { $pull: { twitter: { id_str: id } } }, // pulls/removes the user selected Twitter account
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
            break;
        }
    }
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
    let feeds = [];
    const callback = () => {
        if(feeds.length === req.user.twitter.length) {
            done(feeds);
        }
    }
    for(let account of req.user.twitter) {
        const token = encrypt.decrypt(account.token);
        const tokenSecret = encrypt.decrypt(account.tokenSecret);;
        oauth.get(
            "https://api.twitter.com/1.1/statuses/home_timeline.json?count=50&include_my_retweet=true&tweet_mode=extended",
            token,
            tokenSecret,
            function(err, data) {
                if(err) {
                    console.log(err);
                    const res = {
                        message: "Unable to fetch your twitter home timeline, please try again later",
                        success: false, 
                    }
                    feeds.push(res);
                }
                else {
                    const feed = Function(`"use strict";return ${data}`)();
                    const res = {
                        feed,
                        success: true,
                    }
                    feeds.push(res);
                };
                callback();
            }
        )
    }
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                 Get Twitter Posts                                   //
/////////////////////////////////////////////////////////////////////////////////////////

const getPosts = (req, done) => {
    let feeds = [];
    const callback = () => {
        if(feeds.length === req.user.twitter.length) {
            done(feeds);
        }
    }
    for(let account of req.user.twitter) {
        fetch(`https://api.twitter.com/1.1/statuses/user_timeline.json?count=50&user_id=${account.id_str}&include_my_retweet=true&tweet_mode=extended`, {
            method: "get",
            headers:  {
                'Content-Type': 'application/json',
                "authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
            }
        }).then(res => res.json()).then(posts => {
            const result = {
                feed: posts,
                success: true,
            }
            feeds.push(result);
            callback();
        }).catch((err) => {
            console.log(err);
            const result = {
                message: "Something went wrong, please try again later",
                success: false,
            }
            feeds.push(result);
            callback();
        });
    }
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                    New Tweet                                        //
/////////////////////////////////////////////////////////////////////////////////////////

function newTweet(req, done) {
    let results = [];
    const callback = () => {
        if(results.length === req.body.accounts.length) {
            done(results);
        }
    }
    for(let account of req.body.accounts) {
        const access_token = encrypt.decrypt(account.token);
        const access_token_secret = encrypt.decrypt(account.tokenSecret);
        const T = new Twit({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token,
            access_token_secret,
            timeout_ms: 60*1000,
            strictSSL: false,
        })
        T.post("statuses/update", { status: req.body.post}, function(err) {
            if(err) {
                console.log(err);
                const message = {
                    text: `Unable to post to @${account.screen_name}'s Twitter, please try again later`,
                    success: false,
                }
                results.push(message);
            }
            else {
                const message = {
                    text: `Posted to @${account.screen_name}'s Twitter`,
                    success: true,
                }
                results.push(message);
            }
            callback();
        })
    }
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                    Get Tweet                                        //
/////////////////////////////////////////////////////////////////////////////////////////

function getTweet(id, done) {
    fetch(`https://api.twitter.com/1.1/statuses/show.json?id=${id}&tweet_mode=extended`, {
        method: "get",
        headers:  {
            'Content-Type': 'application/json',
            "authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        }
    }).then(res => res.json()).then(post => {
        const results = {
            success: true,
            post,
        }
        done(results);
    }).catch((err) => {
        console.log(err);
        const results = {
            success: false,
            post: "Something went wrong, please try again later",
        }
        done(results);
    })
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                    Get User                                         //
/////////////////////////////////////////////////////////////////////////////////////////

function getUser(req, done) {
    const token = encrypt.decrypt(req.user.twitter.token);
    const tokenSecret = encrypt.decrypt(req.user.twitter.tokenSecret);
    const id = req.query.id;
    const handle = req.query.handle;
    oauth.get(
        `https://api.twitter.com/1.1/users/show.json?user_id=${id}&screen_name=${handle}`,
        token,
        tokenSecret,
        function(err, data) {
            if(err) {
                console.log(err);
                done(false);
            }
            else {
                done(data);
            }
        }
    ) 
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                   Like Tweets                                       //
/////////////////////////////////////////////////////////////////////////////////////////

function like(req, done) {
    const token = encrypt.decrypt(req.user.twitter.token);
    const tokenSecret = encrypt.decrypt(req.user.twitter.tokenSecret);
    oauth.post(
        `https://api.twitter.com/1.1/favorites/create.json?id=${req.body.id}`,
        token,
        tokenSecret,
        null,
        "application/json",
        function(err, data) {
            if(err) {
                console.log(err);
                const error = Function(`"use strict";return ${data}`)();
                if(error.errors[0].code === 139) {
                    oauth.post(
                        `https://api.twitter.com/1.1/favorites/destroy.json?id=${req.body.id}`,
                        token,
                        tokenSecret,
                        null,
                        "application/json",
                        function(err, data) {
                            if(err) {
                                console.log(err);
                                return done(null);
                            }
                            else {
                                return done(false);
                            }
                        }
                    )
                }
                else {
                    done(null);
                }
            }
            else {
                done(true);
            }
        }
    )
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                 Reply to Tweets                                     //
/////////////////////////////////////////////////////////////////////////////////////////

function reply(req, done) {
    const id = req.body.id;
    const tweet = req.body.tweet;
    const handle = req.body.handle;
    const tweetArray = tweet.split(" ");
    const status = (tweetArray[0] !== `@${handle}`) ? `@${handle} ${tweet}` : tweet;
    
    const access_token = encrypt.decrypt(req.user.twitter.token);
    const access_token_secret = encrypt.decrypt(req.user.twitter.tokenSecret);
    const T = new Twit({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token,
        access_token_secret,
        timeout_ms: 60*1000,
        strictSSL: false,
    })
    T.post("statuses/update", { in_reply_to_status_id: id, status: status}, function(err, data, response) {
        if(err) {
            console.log(err);
            done(false);
        }
        else {
            done(true);
        }
    })
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                      Retweet                                        //
/////////////////////////////////////////////////////////////////////////////////////////

function retweet(req, done) {
    const id = req.body.id;    
    const access_token = encrypt.decrypt(req.user.twitter.token);
    const access_token_secret = encrypt.decrypt(req.user.twitter.tokenSecret);
    const T = new Twit({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token,
        access_token_secret,
        timeout_ms: 60*1000,
        strictSSL: false,
    })
    T.post("statuses/retweet/:id", { id }, function(err, data, response) {
        if(err) {
            console.log(err);
            if(err.allErrors[0].code === 327) {
                oauth.post(
                    `https://api.twitter.com/1.1/statuses/unretweet/${id}.json?trim_user=true`,
                    access_token,
                    access_token_secret,
                    null,
                    "application/json",
                    function(err, data) {
                        if(err) {
                            console.log(err);
                            return done(null);
                        }
                        else {
                            return done(false);
                        }
                    }
                )
            }
            else {
                done(null);
            }
        }
        else {
            done(true);
        }
    })
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                   Delete Tweet                                      //
/////////////////////////////////////////////////////////////////////////////////////////

function deleteTweet(req, done) {
    const token = encrypt.decrypt(req.user.twitter.token);
    const tokenSecret = encrypt.decrypt(req.user.twitter.tokenSecret);
    oauth.post(
        `https://api.twitter.com/1.1/statuses/destroy/${req.body.id}.json?trim_user=true`,
        token,
        tokenSecret,
        null,
        "application/json",
        function(err, data) {
            if(err) {
                console.log(err);
                done(false);
            }
            else {
                done(true)
            }
        }
    )
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                   Follow User                                       //
/////////////////////////////////////////////////////////////////////////////////////////

function follow(req, done) {
    const token = encrypt.decrypt(req.user.twitter.token);
    const tokenSecret = encrypt.decrypt(req.user.twitter.tokenSecret);
    oauth.post(
        `https://api.twitter.com/1.1/friendships/create.json?user_id=${req.body.id}`,
        token,
        tokenSecret,
        null,
        "application/json",
        function(err, data) {
            if(err) {
                console.log(err);
                done(null);
            }
            else {
                done(true)
            }
        }
    )
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                   Unfollow User                                     //
/////////////////////////////////////////////////////////////////////////////////////////

function unfollow(req, done) {
    const token = encrypt.decrypt(req.user.twitter.token);
    const tokenSecret = encrypt.decrypt(req.user.twitter.tokenSecret);
    oauth.post(
        `https://api.twitter.com/1.1/friendships/destroy.json?user_id=${req.body.id}`,
        token,
        tokenSecret,
        null,
        "application/json",
        function(err, data) {
            if(err) {
                console.log(err);
                done(null);
            }
            else {
                done(false)
            }
        }
    )
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                 Get User's Tweets                                   //
/////////////////////////////////////////////////////////////////////////////////////////

const getUsersTweets = (req, done) => {
    fetch(`https://api.twitter.com/1.1/statuses/user_timeline.json?count=50&user_id=${req.query.id}&tweet_mode=extended?trim_user=true`, {
        method: "get",
        headers:  {
            'Content-Type': 'application/json',
            "authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        }
    }).then(res => res.json()).then(tweets => {
        const res = {
            success: true,
            tweets,
        }
        done(res);
    }).catch(err => {
        console.log(err);
        const res = {
            success: false
        }
        done(res);
    });
}

/////////////////////////////////////////////////////////////////////////////////////////
//                               Get User's Followers                                  //
/////////////////////////////////////////////////////////////////////////////////////////

const getUsersFollowers = (req, done) => {
    fetch(`https://api.twitter.com/1.1/followers/list.json?user_id=${req.query.id}&count=50&skip_status=true`, {
        method: "get",
        headers:  {
            'Content-Type': 'application/json',
            "authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        }
    }).then(res => res.json()).then(accounts => {
        const res = {
            success: true,
            accounts,
        }
        done(res);
    }).catch(err => {
        console.log(err);
        const res = {
            success: false
        }
        done(res);
    });
}

/////////////////////////////////////////////////////////////////////////////////////////
//                            Get Who the User Follows                                 //
/////////////////////////////////////////////////////////////////////////////////////////

const getUsersFollowing = (req, done) => {
    fetch(`https://api.twitter.com/1.1/friends/list.json?user_id=${req.query.id}&count=50&skip_status=true`, {
        method: "get",
        headers:  {
            'Content-Type': 'application/json',
            "authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
        }
    }).then(res => res.json()).then(accounts => {
        const res = {
            success: true,
            accounts,
        }
        done(res);
    }).catch(err => {
        console.log(err);
        const res = {
            success: false
        }
        done(res);
    });
}

/////////////////////////////////////////////////////////////////////////////////////////
//                               Search for Twitter Users                              //
/////////////////////////////////////////////////////////////////////////////////////////

function searchUsers (req, query, done, fail) {
    const access_token = process.env.TWITTER_TOKEN;
    const access_token_secret = process.env.TWITTER_TOKEN_SECRET;
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

/////////////////////////////////////////////////////////////////////////////////////////
//                               Search for Twitter Posts                              //
/////////////////////////////////////////////////////////////////////////////////////////

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
    getTweet,
    getUser,
    like,
    reply,
    retweet,
    deleteTweet,
    follow,
    unfollow,
    getUsersTweets,
    getUsersFollowers,
    getUsersFollowing,
    searchUsers,
    searchPosts,
}