const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github').Strategy;
const assert = require('assert');

module.exports = function(app, db) {
  
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());

 

  passport.serializeUser((user, done) => {
     done(null, user.id); // corrected from 'return done(null, user.id)'
  });

  passport.deserializeUser((id, done) => {
    db.collection('socialusers').findOne(
      {id: id},
      (err, doc) => {
        console.log("deserialized: " + JSON.stringify(doc, null, '\t')); // pretty prints objects
        done(null, doc);
      }
    );
  });

  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    db.collection('socialusers').findAndModify(

      /* This is the mongoshell format. use below for mongo driver */
      // { query: { id: profile.id},
      // update: {
      //   $setOnInsert:{
      //     id: profile.id,
      //     name: profile.displayName || 'John Doe',
      //     photo: profile.photos[0].value || '',
      //     email: profile.email || 'No public email', // profile has no 'emails'
      //     created_on: new Date(),
      //     provider: profile.provider || ''
      //   },
      //   $set: {
      //     last_login: new Date()
      //   },
      //   $inc: {
      //     login_count: 1
      //   }
      // },
      // upsert: true,
      // new: true }
      { id: profile.id }, //query
      {},  // sort
      {$setOnInsert: {  // update
        id: profile.id,
        name: profile.displayName || 'John Doe',
        photo: profile.photos[0].value || '',
        email: profile.email || 'No public email',
        created_on: new Date()
      }, $set: {
        last_login: new Date()
      }, $inc: {
        login_count: 1
      }},
      { upsert: true, new: true } // option 
    ,
      (err, doc) => {
        if(err) throw err;
        // console.log(doc);
        cb(null, doc.value); // user object is in doc.value
      }
    )
  }
  ));



  

}