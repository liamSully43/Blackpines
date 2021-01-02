const passport = require("passport");
const fetch = require("node-fetch");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const emailTemplate = require("./email-template");

/////////////////////////////////////////////////////////////////////////////////////////
//                                       Login                                         //
/////////////////////////////////////////////////////////////////////////////////////////

function login(req, res, next, Customer) {
    passport.authenticate("local", function(err, customer) {
        if(err) {
            const result = {
                success: false,
                message: "Something went wrong, please try again later"
            }
            console.log(err);
            return res.send(result);
        }
        if(!customer) {
            const result = {
                success: false,
                message: "Invalid email or password, please try again",
            }
            return res.send(result);
        }
        req.login(customer, function(err) {
            if(err) {
                const result = {
                    success: false,
                    message: "Something went wrong, please try again later"
                }
                console.log(err);
                return res.send(result);
            }
            else {
                const time = new Date();
                const lastLogIn = String(time).substr(0, 28);
                Customer.updateOne(
                    {_id: req.user._id},
                    {lastLogIn},
                    {multi: false},
                    function(err) {if(err) console.log(err)}
                )
            }
            // get account information from Twitter and update the database
            if(req.user.twitter.length > 0) {
                let accounts = [];
                const updateDatabase = () => {
                    if(accounts.length !== req.user.twitter.length) return;
                    Customer.updateOne(
                        {_id: req.user._id},
                        {$set: { twitter: accounts }},
                        {multi: false},
                        function(err) {
                            if(err) {
                                return console.log(err)
                            }
                            req.user.twitter = accounts;
                        }
                    )
                }
                for(let account of req.user.twitter) {
                    fetch(`https://api.twitter.com/1.1/users/show.json?user_id=${account.id_str}`, {
                        method: "get",
                        headers: {
                            'Content-Type': 'application/json',
                            "authorization": `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
                        }
                    })
                    .then(res => res.json()).then(data => {
                        data.token = account.token;
                        data.tokenSecret = account.tokenSecret;
                        accounts.push(data);
                        updateDatabase();
                    }).catch((err) => {
                        console.log(err);
                    });
                }
            }
            const result = {
                success: true,
                message: "",
            }
            return res.send(result);
        });
    }) (req, res, next);
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                      Register                                       //
/////////////////////////////////////////////////////////////////////////////////////////

function register(req, res, Customer) {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const result = {
            success: false,
            message: "Your password must be at least 8 characters",
        }
        return res.send(result);
    }
    const time = new Date();
    const createdAt = String(time).substr(0, 28);
    Customer.register({username: req.body.username, firstName: req.body.firstName, lastName: req.body.lastName, createdAt}, req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            const result = {
                success: false,
                message: "An account with that email already exists, please use a different email",
            }
            return res.send(result);
        }
        else {
            passport.authenticate("local", function(err, customer) {
                if(err || !customer) {
                    if(err) console.log(err);
                    const result = {
                        success: false,
                        message: "Something went wrong, please try again later",
                    }
                    return res.send(result);
                }
                req.login(customer, function(err) {
                    if(err) {
                        console.log(err);
                        const result = {
                            success: false,
                            message: "Something went wrong, please try again later",
                        }
                        return res.send(result);
                    }
                    const result = {
                        success: true,
                        message: "",
                    }
                    return res.send(result);
                });
            }) (req, res);
        }
    })
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                   Forgot Password                                   //
/////////////////////////////////////////////////////////////////////////////////////////

function forgotPassword(req, Customer, done) {
    const characters = [1,2,3,4,5,6,7,8,9,0,"q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "a", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "m", "n", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Z", "X", "C", "V", "B", "N", "M"]; 
    let token = "";
    for(let i = 0; i < 25; i++) {
        const num = Math.floor(Math.random() * characters.length);
        token += characters[num];
    }
    Customer.updateOne(
        {username: req.body.email},
        {resetPasswordToken: token},
        {multi: false},
        function(err) {
            if(err) {
                console.log(err);
                done(false);
            }
            else {
                const username = req.body.email;
                const date = Date.now();
                const timestamp = date + 900000;
                
                var transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'noreply.blackpines@gmail.com',
                        pass: process.env.EMAIL_PASSWORD,
                    }
                });

                const html = emailTemplate(username, token, timestamp);
        
                const email = {
                    to: username,
                    subject: "Password Reset",
                    html,
                };
                transporter.sendMail(email, function(err){
                    if(err) {
                        console.log(err);
                        done(false);
                    }
                    else {
                        done(true);
                    }
                });
            }
        }
    )
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                   Forgot Password                                   //
/////////////////////////////////////////////////////////////////////////////////////////

async function resetPassword (req, Customer, done) {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const result = {
            success: false,
            message: "Your password must be at least 8 characters",
        }
        return done(result);
    }
    const username = req.body.username;
    const password = req.body.password;
    const timestamp = req.body.timestamp;
    const token = req.body.token;
    const now = Date.now();
    if(timestamp < now) {
        const result = {
            success: false,
            message: "Your reset password token has expired, please try again later",
        }
        return done(result);
    }
    const user = await Customer.findOneAndUpdate({
        username,
        resetPasswordToken: token
    }, {
        resetPasswordToken: undefined
    });
    user.setPassword(password, function(err) {
        if(err) {
            console.log(err);
            const result = {
                success: false,
                message: "Something went wrong, please try again later",
            }
            return done(result);
        }
        user.save();
        req.login(user, function(err) {
            if(err) {
                console.log(err);
                const result = {
                    success: true,
                    route: "/entry"
                }
                done(result);
                return;
            }
            const result = {
                success: true,
                route: "/my-feed",
            }
            done(result);
        })
    })
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                   Change Password                                   //
/////////////////////////////////////////////////////////////////////////////////////////

function changePassword(req, Customer, done) {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const response = {
            message: "Your password must be at least 8 characters",
            success: false, 
        }
        return done(response);
    }
    Customer.findByUsername(req.user.username).then(function(sanitizedUser) {
        if(sanitizedUser) {
            const oldPassword = req.body.oldPassword;
            const newPassword = req.body.newPassword;
            sanitizedUser.changePassword(oldPassword, newPassword, function(err) {
                if(err) {
                    const response = {
                        message: "Wrong password entered, please try again",
                        success: false, 
                    }
                    return done(response);
                }
                sanitizedUser.save();
                const response = {
                    message: "Password successfully saved",
                    success: true, 
                }
                return done(response);
            })
        }
        else {
            const response = {
                message: "Something went wrong, please try again later",
                success: false, 
            }
            return done(response);
        }
    })
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                 Delete Account                                      //
/////////////////////////////////////////////////////////////////////////////////////////

function deleteAccount(req, Customer, done) {
    const id = req.user._id;
    Customer.deleteOne({_id: id}, (err) => {
        if(err) {
            console.log(err);
            done(false);
        }
        else {
            done(true);
        }
    });
}

/////////////// Exports

module.exports = {
    login,
    register,
    forgotPassword,
    resetPassword,
    changePassword,
    deleteAccount,
}