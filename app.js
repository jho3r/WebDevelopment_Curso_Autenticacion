require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
//const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const saltRounds = 10; // salt rounds for bcrypt

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(session({
    secret: "This is a secret", // session secret
    resave: false, // don't save session if unmodified
    saveUninitialized: false // don't create session until something stored
    }));
app.use(passport.initialize());
app.use(passport.session());

//Establish connection to MongoDB
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/wikiDB";
mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

//const secret = process.env.SECRET_KEY || "thisisourlittlesecret.";
//userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
    res.render("home");
});

app.route('/login')
    .get(function(req, res){
        res.render("login");
    })
    .post(function(req, res){
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
        req.login(user, function(err){
            if(err){
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets");
                });
            }
        });
    });


app.route('/register')
    .get(function(req, res){
        res.render("register");
    })
    .post(function(req, res){
        User.register({username: req.body.username}, req.body.password, function(err,user){
            if(err){
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets");
                });
            }
        })
    });

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

app.route("/secrets")
    .get(function(req, res){
        if(req.isAuthenticated()){
            res.render("secrets");
        } else {
            res.redirect("/login");
        }
    });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});