'use strict'

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const GitHubStrategy =  require('passport-github').Strategy;
const assert = require('assert');

const routes = require('./routes');
const auth = require('./auth');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');

MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true }, (err, client) => {
  assert.equal(err, null, 'Database error');
  console.log('successful database connection')
  var db = client.db('test');

  auth(app, db);
  routes(app, db);
  
  app.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port " + process.env.PORT);
  });
});
