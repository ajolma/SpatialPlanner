let express = require('express');
const layerModel = require('../models/layer');

let router = express.Router();

// TODO: optimizations (such as tags collection)

// Layers API

router.get("/layers", function(req, res) {
    layerModel.find({}, function(err, layers) {
        if (err) {
            return res.status(409).json({"message": err});
        }
        res.status(200).json(layers);
    });
});

router.post("/layers", function(req, res) {
    if (!req.body.tags || req.body.tags.length === 0 ||
        !req.body.geometries || req.body.geometries.length === 0) {
        return res.status(400).json({
            "message":
            "Cowardly refusing to create layers without tags and/or geometries."});
    }
    let layer = new layerModel({
        creator: req.user,
        tags: req.body.tags,
        geometries: req.body.geometries
    });
    layer.save(function(err, layer) {
        if (err) {
            return res.status(409).json({"message": err});
        }
        res.status(200).json({'message': 'success'});
    });
});

router.delete("/layers/:id", function(req, res) {
    layerModel.findById(req.params.id, function(err, layer) {
        if (err) {
            return res.status(404).json({'message': 'not found'});
        }
        if (req.user === layer.creator) {
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

module.exports = router;
