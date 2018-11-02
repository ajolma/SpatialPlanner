let express = require('express');
let parser = require('body-parser');
let router = require('./routes');
const pub_router = require('./routes/pub_router');
const mongoose = require('mongoose');
const userModel = require('./models/user');
const bcrypt = require('bcrypt-nodejs');

mongoose.connect('mongodb://localhost/spatialplanner').then(
    () => {console.log("MongoDB connection success")},
    (error) => {console.log("MongoDB connection failure:"+error)}
);

let app = express();

app.use(parser.json());

// user db
let logged = [];

// login API

function isUserLogged(req, res, next) {
    let token = req.headers.token;
    for (let i = 0; i < logged.length; i++) {
        if (token === logged[i].token) {
            console.log("user = "+logged[i].username);
            req.user = logged[i].username;
            return next();
        }
    }
    res.status(403).json({"message": "not allowed"});
}

function createToken() {
    let token = "";
    let letters = "abcdefghijklmnopqrstuvxyz0123456789";
    for (let i = 0; i < 1024; i++) {
        let temp = Math.floor(Math.random()*letters.length);
        token += letters[temp];
    }
    return token;
}

app.get("/users", function(req, res) {
    isUserLogged(req, res, function() {
        userModel.find({}, 'username', function(err, users) {
            let u = [];
            for (let i = 0; i < users.length; i++) {
                u.push(users[i].username);
            }
            res.status(200).json(u);
        });
    });
});

function createHash(passwd) {
    return bcrypt.hashSync(passwd, bcrypt.genSaltSync(8), null);
}

function isPasswdValid(passwd, hash) {
    return bcrypt.compareSync(passwd, hash);
}

app.post("/register", function(req, res) {
    if (!req.body.username ||
        !req.body.password ||
        req.body.password.length == 0 ||
        req.body.password.length == 0) {
        return res.status(409).json({"message": "username already in use"});
    }
    let user = new userModel({
        username: req.body.username,
        password: createHash(req.body.password)
    });
    user.save(function(err, item) {
        if (err) {
            return res.status(409).json({"message": "username already in use"});
        }
        console.log("register ok "+item.username);
        res.status(200).json({"message": "success"});
    });
});

app.post("/login", function(req, res) {
    if (!req.body.username ||
        !req.body.password ||
        req.body.password.length == 0 ||
        req.body.password.length == 0) {
        return res.status(403).json({"message": "Wrong username or password"});
    }
    userModel.findOne({username: req.body.username}, function(err, user) {
        if (!user) {
            return res.status(403).json({"message": "Wrong username or password"});
        }
        if (!err && isPasswdValid(req.body.password, user.password)) {
            console.log("login "+user.username);
            let token = createToken();
            logged.push({
                "username": user.username,
                "token": token
            });
            return res.status(200).json({"token": token});
        }
        res.status(403).json({"message": "Wrong username or password"});
    });
});

app.post("/logout", function(req, res) {
    let token = req.headers.token;
    for (let i = 0; i < logged.length; i++) {
        if (token === logged[i].token) {
            console.log("logout "+logged[i].username);
            logged.splice(i,1);
            return res.status(200).json({"message": "success"});
        }
    }
    res.status(404).json({"message": "not found"});
});

app.use("/api", isUserLogged, router);
app.use("/", pub_router);

app.listen(3001);

console.log("Running at port 3001");
