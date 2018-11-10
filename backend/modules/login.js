const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');

function createHash(passwd) {
    return bcrypt.hashSync(passwd, bcrypt.genSaltSync(8), null);
}

function isPasswdValid(passwd, hash) {
    return bcrypt.compareSync(passwd, hash);
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

function Login(args) {
    this.userModel = args.userModel;
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
    initialize: function() {
        return passport.initialize();
    },
    session: function() {
        return passport.session();
    },
    authenticate: function(a, b) {
        return passport.authenticate(a, b);
    },
    isUserLogged: function (req, res, next) {
        let token = req.headers.token;
        if (req.isAuthenticated()) {
            if (token === req.session.token) {
                return next();
            }
        }
        res.status(403).json({"message": "not allowed"});
    },
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

var singleton;

var login = function(args) {
    if (!singleton) {
        singleton = new Login(args);
        passport.serializeUser(function(user, done) {
            console.log('Serialize user:'+JSON.stringify(user));
            done(null, user._id);
        });
        passport.deserializeUser(function(_id, done) {
            console.log('Deserialize user:'+_id);
            args.userModel.findById(_id, function(err, user) {
                if (err || !user) {
                    return done(err || 'not found');
                }
                done(null, user);
            });
        });
        passport.use(
            'local-login',
            new localStrategy(
                {
                    usernameField: 'username',
                    passwordField: 'password',
                    passReqToCallback: true
                },
                function (req, username, password, done){
                    if (!req.body.username ||
                        !req.body.password ||
                        req.body.password.length == 0 ||
                        req.body.password.length == 0) {
                        return done(null, false, "Wrong username or password");
                    }
                    args.userModel.findOne(
                        {username: req.body.username},
                        function(err, user) {
                            if (err) {
                                return done(err);
                            }
                            if (isPasswdValid(req.body.password, user.password)) {
                                console.log("login "+user.username);
                                let token = createToken();
                                req.session.token = token;
                                req.session.username = username;
                                return done(null, user);
                            }
                            return done(null, false, "Wrong username or password");
                        });
                }));
    }
    return singleton;
}

module.exports = login;
