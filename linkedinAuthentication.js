require("dotenv").config();
const cryptr = require("cryptr");
const OAuth = require("oauth");
const fetch = require("node-fetch");

const encrypt = new cryptr(process.env.ENCRYPTION_SECRET_KEY);

const oauth = new OAuth.OAuth(
    "https://api.linkedin.com/oauth/request_token",
    "https://api.linkedin.com/oauth/access_token",
    process.env.LINKEDIN_CONSUMER_KEY,
    process.env.LINKEDIN_CONSUMER_SECRET,
    '1.0A',
    null,
    'HMAC-SHA1'
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

function getFeed(req, done) {
    const user_token = encrypt.decrypt(req.user.linkedinCredentials.token);
    const user_secret = encrypt.decrypt(req.user.linkedinCredentials.tokenSecret);
    const user_id = req.user.linkedinCredentials.linkedinID;
    const access_token = process.env.LINKEDIN_ACCESS_TOKEN

    // https://api.linkedin.com/v1/people/~/network/updates?scope=self&count=50
    // https://api.linkedin.com/v2/network/id=wW7dsy9tav
    // https://api.linkedin.com/v2/network/id=${user_id}
    // https://api.linkedin.com/v2/connections?q=viewer&projection=(elements(*(to~)),paging)&start=0&count=10
    // http://api.linkedin.com/v1/people/~/connections:(id,first-name,last-name,location:(name),picture-url)
    // https://api.linkedin.com/v2/connections/urn:li:person:${user_id}
    // https://api.linkedin.com/v2/me?projection=(id)
    
    // LinkedIn scopes: r_organization_social%20r_1st_connections_size%20r_emailaddress%20rw_organization_admin%20r_basicprofile%20w_member_social%20w_organization_social
    
    const OAuth2 = OAuth.OAuth2;
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const headers = {
        'Content-Type': 'application/json',
        "Authorization" : `Bearer ${access_token}`,
    }
    const oauth2 = new OAuth2(
        clientId,
        clientSecret,
        'https://api.linkedin.com/',
    );
    oauth2._request(
        "GET",
        `https://api.linkedin.com/v2/me?id=(${user_id})`,
        headers,
        null,
        user_token,
        function(err, data) {
            if(err) {
                console.log(err);
                done(err);
            }
            else {
                done(data);
            }
        }
    )

    // this results in an 'invalid access token' error - see https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow?context=linkedin/context











    
    /*
    oauth.get(
        `https://api.linkedin.com/v2/network/id=wW7dsy9tav`,
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
    fetch(``, {
        method: "get",
        headers:  {
            'Content-Type': 'application/json',
        }
    }).then(posts => done(posts)).catch((err) => {
        console.log(err);
        done(false);
    });*/
}

/////////////// Exports

module.exports = {
    callback,
    disconnect,
    update,
    getFeed,
}