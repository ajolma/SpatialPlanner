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
    let query = {tags: req.query.tag};
    if (req.query.tags) {
        if (Array.isArray(req.query.tags)) {
        } else {
            query = {$and: [query, {tags: req.query.tags}]};
        }
    }
    if (req.query.creator) {
        query = {$and: [query, {creator: req.query.creator}]};
    }
    console.log(JSON.stringify(query));
    layerModel.find(query, function(err, layers) {
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
