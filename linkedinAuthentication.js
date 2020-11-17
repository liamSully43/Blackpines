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
    const token = encrypt.encrypt(req.account.token);
    const tokenSecret = encrypt.encrypt(req.account.tokenSecret);
    req.user.linkedinCredentials = {
        token,
        tokenSecret,
        linkedinID: req.account.id,
    };
    req.user.linkedinProfile = req.account;
    console.log(req.account);
    console.log(req.account.token);
    console.log("===== yeet =====");
    console.log(req.account.tokenSecret);
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
    const user_token = "AQVDXdLPbywIzEPGSGkrRL195XHk8668Av1jHPwX2r-M4_zf6WOlN6-dd_FWFebeMzH5cipeAn5945qSF-N1Qgm6zRZDV_RGBVZRtz4FYCkhO94H7FL-tzWhpZ8oXRlS2WbIl7_LmLLRwAqXA-hSub1geB9Dm2_fx9_2VetIukdv4OpOMEs_sir4dGs87MnHH8b9bbMuqWO8hwhSBs_1N1HYqn7eGRi7-qLOqNUQlIg6zgjbcx_gJhi5jxhCJyo1265hDHX9uvTbVeMVJ_m3FrOR2_pmUYL85Xab1IQhyEeSMBMGGucwHrPa34IFT8YweKLuj7O7kwWVV0aO0TsH6PDADNfj9w"; //encrypt.decrypt(req.user.linkedinCredentials.token);
    const user_secret = "AQU_Nb_DvWa2swr78uJt1TeqeRrBwg5-VXNPhLg6vw2yvULDb5jpWqXYjMUzybjQEWVdjDBZvDsEAcGHBRwqrZDnf5zP--YvsWhpd1XxH112_qDuIRwG4vP-rIuTNqw2DQzj5oyNMNIc7z25linVFs9mYojYTi1Ey1SUPEm3gPg4as7ULJFiORQTApwzHUkignscSWQhKfMnGUiVhJ4YX6AnxZyQH2KUZ2eIlXiCXy3dLRyTUYmfe828U5-sawH-ifo_Y9jiSloWPdvUKuTWK7AZ0JyWNhcUtz2G7jzTw-9CoYeO4fVJIC1WqzGEnLsSdS5JJMXP_cuM8St-VMjt7IKecfSaHg";// encrypt.decrypt(req.user.linkedinCredentials.tokenSecret);
    const iser_id = "wW7dsy9tav";
    // https://api.linkedin.com/v1/people/~/network/updates?scope=self&count=50
    // https://api.linkedin.com/v2/network/id=wW7dsy9tav
    
    const OAuth2 = OAuth.OAuth2;
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const headers = {
        'Content-Type': 'application/json',
    }
    const oauth2 = new OAuth2(
        clientId,
        clientSecret,
        'https://api.linkedin.com/',
    );
    oauth2._request(
        "GET",
        `https://api.linkedin.com/v2/network/id=${clientId}?oauth2_access_token=${clientId}`,
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