function email(username, token, timestamp) {
    const host = (process.env.PORT) ? "http://www.blackpines.co.uk" : "http://localhost:3000";
    const template = `
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
                <a href="${host}/reset-password?un=${username}&tk=${token}&ts=${timestamp}">Reset Password</a>
            </div>
        </section>
    </body>
    `;
    return template;
}

module.exports = email;