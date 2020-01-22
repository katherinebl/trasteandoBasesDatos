const express = require("express");
// const repository = require("./repository.js");

const passport = require('passport');
const BasicStrategy = require("passport-http").BasicStrategy;

const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const users = require('./repositories/users');

// Creo la aplicación express
const app = express();

//Middleware
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/login', require('./routes/login'));
app.use('/blogEntries', require('./routes/entries'));
app.use('/badwords', require('./routes/badwords'));
app.use('/users', require('./routes/users'));

// const SECRET_KEY = process.env.SECRETKEY;
const SECRET_KEY = 'SECRET_KEY'

async function verify(username, password, done) {

    let user = await users.find(username);
    if (!user) {
        return done(null, false, { message: 'User not found' });
    }

    if (await users.verifyPassword(user, password)) {
        return done(null, user);
    } else {
        return done(null, false, { message: 'Incorrect password' });
    }
}

passport.use(new BasicStrategy(verify));

app.use(passport.initialize());

const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET_KEY
}

passport.use(new JwtStrategy(jwtOpts, async (payload, done) => {

    const user = await users.find(payload.username);
    if (user) {
        return done(null, user);
    } else {
        return done(null, false, { message: 'User not found' });
    }

}));

module.exports = app;
