const fetch = require("node-fetch");
const ouath = require("oauth");

function twitterAccount() {

}

function twitterPost(id, done) {
    fetch(`https://api.twitter.com/1.1/statuses/show.json?id=${id}`, {
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
            post,
        }
        done(results);
    })
}

function linkedinAccount() {

}

function linkedinPost() {

}

function facebookAccount() {

}

function facebookPost() {

}


module.exports = {
    twitterAccount,
    twitterPost,
    linkedinAccount,
    linkedinPost,
    facebookAccount,
    facebookPost,
}