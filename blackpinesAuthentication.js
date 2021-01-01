const passport = require("passport");
const fetch = require("node-fetch");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
const cryptr = require("cryptr");

const encrypt = new cryptr(process.env.ENCRYPTION_SECRET_KEY);

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
                const timeStamp = date + 900000;
                const query = `un=${username}&tk=${token}&ts=${timeStamp}`; // query attached to link in email
                
                var transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'discoverdrink@gmail.com',
                        pass: "150425LMS",
                    }
                });
        
                const email = {
                    to: username,
                    subject: "Reset Password",
                    html: `
                    <head>
                        <style>

                            section {
                                width: 100%;
                                height: 100%;
                                display: grid;
                                place-items: center;
                                background-color: #f0f0f0;
                                padding: 100px 0px;
                            }

                            section > div {
                                width: 40%;
                                height: auto;
                                padding: 50px;
                                display: grid;
                                margin: auto;
                                place-items: center;
                                background-color: #ffffff;
                                border-radius: 10px;
                            }

                            h1 {
                                color: #212121;
                                font-family: sans-serif;
                                font-size: 25px;
                                margin-bottom: 20px;
                                padding-bottom: 20px;
                                border-bottom: solid 1px lightgrey;
                            }

                            p, a, a:visted {
                                width: 100%;
                                color: #232323;
                            }

                            a, a:visted {
                                text-align: center;
                                margin: auto;
                                margin-top: 50px;
                                padding: 20px 0px;
                                color: #ffffff !important;
                                background-color: #009a7f;
                                font-size: 16px;
                                text-decoration: none;
                                border-radius: 10px;
                            }

                            a:hover {
                                color: #f0f0f0;
                                background-color: #007a63;
                            }
                        </style>
                    </head>
                    <body>
                        <section>
                            <div>
                                <h1>Password Reset?</h1>
                                <p>Forgotten your password? Need to reset your password? Not a problem, just click the Reset Password Button below to do so. If you didn't request to reset your password, please just ignore this email. This link will expire after 15 minutes.</p>
                                <a href="http://localhost:3000/reset-password?${query}">Reset Password</a>
                            </div>
                        </section>
                    </body>
                    `,
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