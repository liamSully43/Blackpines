const express = require("express");
const passport = require("passport");
const fetch = require("node-fetch");
const { validationResult } = require("express-validator");

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
            console.log(req.body.username);
            console.log(req.body.password);
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
    Customer.findByUsername(req.body.username).then(function(sanitizedUser) {
        if(sanitizedUser) {
            const oldPassword = req.body.oldPassword;
            const newPassword = req.body.newPassword;
            sanitizedUser.changePassword(oldPassword, newPassword, function(err, user, info) {
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
//                                       Logout                                        //
/////////////////////////////////////////////////////////////////////////////////////////

function logout(req, res) {
    req.logout();
    res.redirect("/entry");
}

/////////////// Exports

module.exports = {
    login,
    register,
    changePassword,
    logout,
}