const express = require("express");
const app = express();
const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' })
const passport = require("passport");
const cookieSession = require('cookie-session');
const connectDB = require('./config/db');
require('./passport_setup');
const { auth } = require('./middleware/auth');
const sendMail = require('./gmail');

//Init Middleware
app.use(express.json({ extended: false }));

//Connect Database
connectDB();

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send("You are not logged in!");
});

app.get('/fail', (req, res) => {
    res.send("You failed to log in!");
});

app.get('/success', auth, (req, res) => {
    res.send(`Welcome ${req.user.displayName}!`);

    sendMail(req.user.email)
        .then((result) => console.log('Email sent...', result))
        .catch((error) => console.log(error.message));
});

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/fail' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/success');
    });

app.get("/logout", (req, res) => {
    req.session = null;
    req.logOut();
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Listening on port 3000");
});