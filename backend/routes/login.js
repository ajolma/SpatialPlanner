const bcrypt = require('bcrypt-nodejs');

let logged = [];

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

function Login(args) {
    this.userModel = args.userModel;
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

function createHash(passwd) {
    return bcrypt.hashSync(passwd, bcrypt.genSaltSync(8), null);
}

function createHash(passwd) {
    return bcrypt.hashSync(passwd, bcrypt.genSaltSync(8), null);
}

function isPasswdValid(passwd, hash) {
    return bcrypt.compareSync(passwd, hash);
}

Login.prototype = {
    register: function() {
        let self = this;
        return function(req, res) {
            if (!req.body.username ||
                !req.body.password ||
                req.body.password.length == 0 ||
                req.body.password.length == 0) {
                return res.status(409).json({"message": "username already in use"});
            }
            let user = new self.userModel({
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
        }
    },
    login: function() {
        let self = this;
        return function(req, res) {
            if (!req.body.username ||
                !req.body.password ||
                req.body.password.length == 0 ||
                req.body.password.length == 0) {
                return res.status(403).json({"message": "Wrong username or password"});
            }
            self.userModel.findOne({username: req.body.username}, function(err, user) {
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
        }
    },
    logout: function() {
        let self = this;
        return function(req, res) {
            let token = req.headers.token;
            for (let i = 0; i < logged.length; i++) {
                if (token === logged[i].token) {
                    console.log("logout "+logged[i].username);
                    logged.splice(i,1);
                    return res.status(200).json({"message": "success"});
                }
            }
            res.status(404).json({"message": "not found"});
        }
    },
    isUserLogged: isUserLogged,
    getUsers: function() {
        let self = this;
        return function(req, res) {
            //isUserLogged(req, res, function() {
                self.userModel.find({}, 'username', function(err, users) {
                    let u = [];
                    for (let i = 0; i < users.length; i++) {
                        u.push(users[i].username);
                    }
                    res.status(200).json(u);
                });
            //});
        }
    }
};

var login = function(args) {
    return new Login(args);
}

module.exports = login;
