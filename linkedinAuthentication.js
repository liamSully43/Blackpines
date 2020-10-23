require("dotenv").config();
const cryptr = require("cryptr");

const encrypt = new cryptr(process.env.ENCRYPTION_SECRET_KEY);

/////////////////////////////////////////////////////////////////////////////////////////
//                             Linkedin API Callback                                    //
/////////////////////////////////////////////////////////////////////////////////////////

function callback(req, res, Customer) {
    const token = encrypt.encrypt(req.account.token);
    const tokenSecret = encrypt.encrypt(req.account.tokenSecret);
    req.user.linkedinCredentials = {
        token,
        tokenSecret,
        linkedinID: req.account.id,
    };
    req.user.linkedinProfile = req.account._json;
    Customer.updateOne(
        {_id: req.user._id},
        {linkedinCredentials: {
            token,
            tokenSecret,
            linkedinID: req.account.id,
        }, linkedinProfile: req.account._json},
        {multi: false},
        function(err) {
            if(err) {
                req.flash("linkedinError", "Something went wrong, please try again later");
                return res.redirect("/account");
            }
        }
    )
    res.redirect("/account");
}

/////////////////////////////////////////////////////////////////////////////////////////
//                              Disconnect From Linkedin                                //
/////////////////////////////////////////////////////////////////////////////////////////

function disconnect(req, res, Customer) {
    req.user.linkedinCredentials = null;
    req.user.linkedinProfile = null;
    Customer.updateOne(
        {_id: req.user._id},
        {linkedinCredentials: null, linkedinProfile: null},
        {multi: false},
        function(err) {
            if(err) {
                req.flash("linkedinError", "Something went wrong, please try again later");
                return res.redirect("/account");
            }
        }
    )
    res.redirect("/account");
}

/////////////////////////////////////////////////////////////////////////////////////////
//                              Update Linkedin Account                                 //
/////////////////////////////////////////////////////////////////////////////////////////

function update(req, res) {
    // update user's linkedin account
    console.log("Linkedin profile updated");
}

/////////////// Exports

module.exports = {
    callback,
    disconnect,
    update,
}