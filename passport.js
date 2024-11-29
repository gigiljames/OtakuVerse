const passport = require("passport");
const GoogleStartegy = require("passport-google-oauth20").Strategy;
const Customer = require("./models/customerModel");
require("dotenv").config();

passport.use(
  new GoogleStartegy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refershToken, profile, done) => {
      try {
        let customer = await Customer.findOne({ google_id: profile.id });
        if (customer) {
          return done(null, customer);
        } else {
          customer = new Customer({
            customer_name: profile.displayName,
            customer_email: profile.emails[0].value,
            google_id: profile.id,
          });
          await customer.save();
          return done(null, customer);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((customer, done) => {
  done(null, customer.id);
});

passport.deserializeUser((id, done) => {
  Customer.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

module.exports = passport;
