require("dotenv").config();
const cryptr = require("cryptr");

const encrypt = new cryptr(process.env.ENCRYPTION_SECRET_KEY);

/////////////////////////////////////////////////////////////////////////////////////////
//                             Facebook API Callback                                    //
/////////////////////////////////////////////////////////////////////////////////////////

function callback(req, res, Customer) {
    console.log(req.account);
    const token = encrypt.encrypt(req.account.token);
    // const tokenSecret = encrypt.encrypt(req.account.tokenSecret);
    req.user.facebookCredentials = {
        token,
        // tokenSecret,
        facebookID: req.account.id,
    };
    req.user.facebookProfile = req.account;
    Customer.updateOne(
        {_id: req.user._id},
        {facebookCredentials: {
            token,
            // tokenSecret,
            facebookID: req.account.id,
        }, facebookProfile: req.account},
        {multi: false},
        function(err) { 
            if(err) console.log(err);
        }
    )
}

/////////////////////////////////////////////////////////////////////////////////////////
//                              Disconnect From Facebook                                //
/////////////////////////////////////////////////////////////////////////////////////////

function disconnect(req, Customer, done) {
    req.user.facebookCredentials = null;
    req.user.facebookProfile = null;
    Customer.updateOne(
        {_id: req.user._id},
        {facebookCredentials: null, facebookProfile: null},
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
//                              Update Facebook Account                                 //
/////////////////////////////////////////////////////////////////////////////////////////

function update(req, res) {
    // update user's facebook account
    console.log("Facebook profile updated");
}

/////////////// Exports

module.exports = {
    callback,
    disconnect,
    update,
}