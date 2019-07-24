const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy

module.exports = function(app, db) {
  function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  app.route('/auth/github')
    .get(passport.authenticate('github'));

  app.route('/auth/github/callback')
    .get(passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/profile');
    });

  app.route('/')
    .get((req, res) => {
      res.render(process.cwd() + '/views/pug/index');
    });

  app.route('/profile')
    .get(ensureAuthenticated, (req, res) => {
      console.log("auth ensured");
      console.log("req.user: " + JSON.stringify(req.user, null, 4));
      console.log("type of req.user: " + (typeof req.user))
      res.render(process.cwd() + '/views/pug/profile', {user: req.user});
    });

  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });

  app.use((req, res, next) => {
    res.status(400)
      .type('text')
      .send('Not Found');
  })
}