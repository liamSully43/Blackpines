require("dotenv").config();
const cryptr = require("cryptr");
const OAuth = require("oauth");
const fetch = require("node-fetch");

const encrypt = new cryptr(process.env.ENCRYPTION_SECRET_KEY);

const oauth = new OAuth.OAuth(
    "https://api.linkedin.com/oauth/request_token",
    "https://api.linkedin.com/oauth/access_token",
    process.env.LINKEDIN_CLIENT_ID,
    process.env.LINKEDIN_CLIENT_SECRET,
    '1.0A',
    null,
    'HMAC-SHA1'
);

const OAuth2 = OAuth.OAuth2;
const oauth2 = new OAuth2(
    process.env.LINKEDIN_CLIENT_ID,
    process.env.LINKEDIN_CLIENT_SECRET,
    "https://api.linkedin.com/",
    null,
    "oauth2/token",
    null
);

/////////////////////////////////////////////////////////////////////////////////////////
//                             Linkedin API Callback                                   //
/////////////////////////////////////////////////////////////////////////////////////////

function callback(req, res, Customer) {
    console.log(req.account);
    const token = encrypt.encrypt(req.account.token);
    const tokenSecret = encrypt.encrypt(req.account.tokenSecret);
    req.user.linkedinCredentials = {
        token,
        tokenSecret,
        linkedinID: req.account.id,
    };
    req.user.linkedinProfile = req.account;
    Customer.updateOne(
        {_id: req.user._id},
        {linkedinCredentials: {
            token,
            tokenSecret,
            linkedinID: req.account.id,
        }, linkedinProfile: req.account},
        {multi: false},
        function(err) { 
            if(err) console.log(err);
        }
    )
}

/////////////////////////////////////////////////////////////////////////////////////////
//                              Disconnect From Linkedin                               //
/////////////////////////////////////////////////////////////////////////////////////////

function disconnect(req, Customer, done) {
    req.user.linkedinCredentials = null;
    req.user.linkedinProfile = null;
    Customer.updateOne(
        {_id: req.user._id},
        {linkedinCredentials: null, linkedinProfile: null},
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
//                              Update Linkedin Account                                //
/////////////////////////////////////////////////////////////////////////////////////////

function update(req, res) {
    // update user's linkedin account
    console.log("Linkedin profile updated");
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                     New Post                                        //
/////////////////////////////////////////////////////////////////////////////////////////

function newPost(req, done) {
    const access_token = encrypt.decrypt(req.user.linkedinCredentials.token);
    const headers = {
        "Authorization": `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
        "author": req.user.linkedinCredentials.linkedinID,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "shareCommentary": "first post via API", // user's text/post
            "shareMediaCategory": "NONE",
        },
        "visibility": "PUBLIC",
        "X-Restli-Protocol-Version": "2.0.0",
    }
    oauth2._request(
        "POST",
        `https://api.linkedin.com/v2/ugcPosts`,
        headers,
        null,
        access_token,
        ////////////////////////////////////////////////// returns: {"message":"Empty entity body is not allowed for create method request","status":400}
        /*
        status/post api: https://docs.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
        */
        function(err, response, data, other, extra) {
            if(err) {
                console.log("err");
                console.log(err);
                const message = {
                    text: "Failed",
                    success: false,
                }
                done(message, "linkedin");
            }
            else {
                console.log("success");
                console.log(response);
                const message = {
                    text: "Posted",
                    success: true,
                }
                done(message, "linkedin");
            }
            // console.log("response");
            // console.log(response);
            // console.log("data");
            // console.log(data);
            // console.log("other");
            // console.log(other);
            // console.log("extra");
            // console.log(extra);
        }
    );
}

/////////////// Exports

module.exports = {
    callback,
    disconnect,
    update,
    newPost,
}