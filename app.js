require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

//Establish connection to MongoDB
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/wikiDB";
mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = process.env.SECRET_KEY || "thisisourlittlesecret.";
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.route('/login')
    .get(function(req, res){
        res.render("login");
    })
    .post(function(req, res){
        const username = req.body.username;
        const password = req.body.password;
        User.findOne({email: username}, function(err, foundUser){
            if(err){
                console.log(err);
            } else {
                if(foundUser){
                    if(foundUser.password === password){
                        res.render("secrets");
                    }
                }else{
                    res.send("User not found");
                }
            }
        });
    });


app.route('/register')
    .get(function(req, res){
        res.render("register");
    })
    .post(function(req, res){
        const user = new User({
            email: req.body.username,
            password: req.body.password
        });
        user.save(function(err){
            if(!err){
                res.render("secrets");
            }else{
                console.log(err);
            }
        });
    });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});