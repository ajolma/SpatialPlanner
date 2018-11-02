let express = require('express');
const layerModel = require('../models/layer');
const userModel = require('../models/user');

let router = express.Router();

// TODO: optimizations (such as tags collection)

// Users API

router.get("/creators", function(req, res) {
    userModel.find({}, function(err, users) {
        if (err) {
            return res.status(409).json({"message": err});
        }
        let u = [];
        for (let i = 0; i < users.length; i++) {
            u.push(users[i].username);
        }
        res.status(200).json(u);
    });
});


// Layers API

router.get("/layers", function(req, res) {
    console.log(JSON.stringify(req.query));
    if (!req.query.tag) {
        return res.status(400).json({"message": "tag missing"});
    }
    layerModel.find({tags: req.query.tag}, function(err, layers) {
        if (err) {
            return res.status(409).json({"message": err});
        }
        res.status(200).json(layers);
    });
});

// Tags API, horribly unoptimal

router.get("/tags", function(req, res) {
    layerModel.find({}, function(err, layers) {
        if (err) {
            return res.status(409).json({"message": err});
        }
        let tags_set = new Set();
        for (let i = 0; i < layers.length; i++) {
            for (let j = 0; j < layers[i].tags.length; j++) {
                tags_set.add(layers[i].tags[j]);
            }
        }
        let tags_array = [];
        tags_set.forEach(function(tag) {
            tags_array.push(tag);
        });
        res.status(200).json(tags_array.sort());
    });
});

module.exports = router;
