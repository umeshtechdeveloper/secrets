require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

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

mongoose.connect(process.env.MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res){
    
    res.render('home');
});

app.get('/login', function(req, res){
    
    res.render('login');
});

app.get('/register', function(req, res){
    
    res.render('register');
});

app.get('/secrets', function(req, res){
    
    if (req.isAuthenticated()){
        res.render('secrets');
    } else {
        res.redirect('/login');
    }
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