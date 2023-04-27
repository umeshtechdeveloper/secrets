require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

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
    const newUser= new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save()
        .then( () => res.render('secrets'))
        .catch( (err) => console.log(err))    
});

app.post('/login', function(req, res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username})
        .then( (foundUser) => {
            if (foundUser){
                if (foundUser.password === password) {
                    res.render('secrets');
                }
            }
        })
        .catch( (err) => console.log(err));
});
       

app.listen(port, function(){
    console.log("server successfully started");
});