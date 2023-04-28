require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const port = process.env.PORT || 3000;
const User = require('./models/user');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect(process.env.MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

app.get('/', function(req, res){
    res.render('home');
});

app.get('/login', function(req, res){
    res.render('login');
});

app.get('/register', function(req, res){
    res.render('register');
});

app.post('/register', function(req, res){
    bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
        const newUser= new User({
            email: req.body.username,
            password:hash
        });
    
        newUser.save()
            .then( () => res.render('secrets'))
            .catch( (err) => console.log(err))    
    });
    
});

app.post('/login', function(req, res){
    const username = req.body.username;
    const password =req.body.password;
    
    User.findOne({email: username})
        .then( (foundUser) => {
            if (foundUser){
                bcrypt.compare(password, foundUser.password).then(function(result) {
                    if (result == true) {
                        res.render('secrets');
                    }
                });
            
            }
        })
        .catch( (err) => console.log(err));
});
       

app.listen(port, function(){
    console.log("server successfully started");
});