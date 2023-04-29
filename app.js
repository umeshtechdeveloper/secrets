require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const port = process.env.PORT || 3000;
const User = require('./models/user');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URL, {useUnifiedTopology: true, useNewUrlParser: true});

passport.use(User.createStrategy());

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/', function(req, res){
    res.render('home');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/secrets');
  });

app.get('/login', function(req, res){
    res.render('login');
});

app.get('/register', function(req, res){
    res.render('register');
});

app.get('/secrets', function(req, res, next){
    
    if (req.isAuthenticated()){
        User.find({ secret: { $ne: null } })
        .then( function (foundUsers){
        res.render('secrets', {usersWithSecret: foundUsers})
        })
        .catch( (err) => console.log(err))
    } else {
        res.redirect('/login');
    }
});       

app.get('/submit', function(req, res){
   
    if (req.isAuthenticated()){
        res.render('submit');
    } else {
        res.redirect('/login');
    }
});

app.post('/submit', function(req, res){
    const submittedSecret = req.body.secret;
    const userId = req.user.id;

    User.findOneAndUpdate({_id: userId}, {secret: submittedSecret})
        .then( () => res.redirect('/secrets'))
        .catch( (err) => console.log(err))
    });

app.post('/register', function(req, res){
    
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, function(){
              res.redirect('/secrets');  
            });
        }
    });
});

app.post('/login', function(req, res){
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if (err) {
            console.log(err);
        } else {
            passport.authenticate('local')(req, res, function(){
                res.redirect('/secrets');  
            })
       }
    });
});

app.get('/logout', function(req, res){
    req.logout( function (err){
        if (err) { return next(err); }
        res.redirect('/');
        
    });
   
})
       

app.listen(port, function(){
    console.log("server successfully started");
});