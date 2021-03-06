let express = require('express');
const layerModel = require('../models/layer');

let router = express.Router();

// TODO: optimizations (such as tags collection)

// Layers API

router.get("/layers", function(req, res) {
    let query = {creator: req.user.username};
    layerModel.find(query, function(err, layers) {
        if (err) {
            return res.status(409).json({"message": err});
        }
        res.status(200).json(layers);
    });
});

// room = "creator, tag"
// tags in alphabetical order

var io;

router.post("/layers", function(req, res) {
    if (!req.body.tags || req.body.tags.length === 0 ||
        !req.body.geometries || req.body.geometries.length === 0) {
        return res.status(400).json({
            "message":
            "Cowardly refusing to create layers without tags and/or geometries."});
    }
    let layer = new layerModel({
        creator: req.user.username,
        tags: req.body.tags,
        geometries: req.body.geometries
    });
    layer.save(function(err, layer) {
        if (err) {
            return res.status(409).json({"message": err});
        }
        let l = {
            _id: layer._id,
            creator: layer.creator,
            tags: layer.tags
        };
        l = JSON.stringify(l);
        for (let i = 0; i < req.body.tags.length; i++) {
            let channel = req.body.tags[i];
            console.log("new layer in channel " + channel);
            io.to(channel).emit('message', 'new layer: '+l);
            channel = req.user.username + ',' + channel;
            console.log("new layer in channel " + channel);
            io.to(channel).emit('message', 'new layer: '+l);
        }
        res.status(200).json({message: 'success', _id: layer._id});
    });
});

router.delete("/layers/:id", function(req, res) {
    layerModel.findById(req.params.id, function(err, layer) {
        if (err || !layer) {
            return res.status(404).json({'message': 'not found'});
        }
        if (req.user.username === layer.creator) {
            let l = {
                _id: layer._id,
                creator: layer.creator,
                tags: layer.tags
            };
            l = JSON.stringify(l);
            for (let i = 0; i < layer.tags.length; i++) {
                let channel = layer.tags[i];
                console.log("layer deleted in channel " + channel);
                io.to(channel).emit('message', 'layer deleted: '+l);
                channel = req.user.username + ',' + channel;
                console.log("layer deleted in channel " + channel);
                io.to(channel).emit('message', 'layer deleted: '+l);
            }   
            layerModel.deleteOne(
                {"_id":req.params.id},
                function(err) {
                    if (err) {
                        return res.status(409).json({'message': err});
                    }
                    res.status(200).json({'message': 'success'});
                });
        } else {
            res.status(403).json({message: "not allowed"});
        }
    });
});

// Tags API, horribly unoptimal

function exporter(_io) {
    io = _io;
    return router;
}

module.exports = exporter;
