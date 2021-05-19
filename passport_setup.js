const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

// used to serialize the user for the session
passport.deserializeUser(function (id, done) {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {

        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value,
            email: profile.emails[0].value
        }

        try {
            //find the user in our database 
            let user = await User.findOne({ googleId: profile.id })

            if (user) {
                //If user present in our database.
                done(null, user)
            } else {
                // if user is not preset in our database save user data to database.
                user = await User.create(newUser)
                done(null, user)
            }
        } catch (err) {
            console.error(err)
        }
    }
));