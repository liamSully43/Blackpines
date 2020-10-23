require("dotenv").config();
const cryptr = require("cryptr");

const encrypt = new cryptr(process.env.ENCRYPTION_SECRET_KEY);

/////////////////////////////////////////////////////////////////////////////////////////
//                             Facebook API Callback                                    //
/////////////////////////////////////////////////////////////////////////////////////////

function callback(req, res, Customer) {
    const token = encrypt.encrypt(req.account.token);
    const tokenSecret = encrypt.encrypt(req.account.tokenSecret);
    req.user.facebookCredentials = {
        token,
        tokenSecret,
        facebookID: req.account.id,
    };
    req.user.facebookProfile = req.account._json;
    Customer.updateOne(
        {_id: req.user._id},
        {facebookCredentials: {
            token,
            tokenSecret,
            facebookID: req.account.id,
        }, facebookProfile: req.account._json},
        {multi: false},
        function(err) {
            if(err) {
                req.flash("facebookError", "Something went wrong, please try again later");
                return res.redirect("/account");
            }
        }
    )
    res.redirect("/account");
}

/////////////////////////////////////////////////////////////////////////////////////////
//                              Disconnect From Facebook                                //
/////////////////////////////////////////////////////////////////////////////////////////

function disconnect(req, res, Customer) {
    req.user.facebookCredentials = null;
    req.user.facebookProfile = null;
    Customer.updateOne(
        {_id: req.user._id},
        {facebookCredentials: null, facebookProfile: null},
        {multi: false},
        function(err) {
            if(err) {
                req.flash("facebookError", "Something went wrong, please try again later");
                return res.redirect("/account");
            }
        }
    )
    res.redirect("/account");
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