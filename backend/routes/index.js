let express = require('express');
const areaModel = require('../models/area');

let router = express.Router();

router.get("/areas", function(req, res) {
    areaModel.find({}, function(err, areas) {
        if (err) {
            return res.status(409).json({"message": err});
        }
        res.status(200).json(areas);
    });
});

router.post("/areas", function(req, res) {
    let area = new areaModel({
        creator: req.body.creator,
        area: req.body.area,
        tags: req.body.tags
    });
    area.save(function(err, area) {
        if (err) {
            return res.status(409).json({"message": err});
        }
        res.status(200).json({'message': 'success'});
    });
});

router.delete("/areas/:id", function(req, res) {
    areaModel.findById(req.params.id, function(err, area) {
        if (err) {
            return res.status(404).json({'message': 'not found'});
        }
        if (req.user === area.creator) {
            areaModel.deleteOne(
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

module.exports = router;
