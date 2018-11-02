const mongoose = require("mongoose");

const polygonSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Polygon'],
        required: true
    },
    coordinates: {
        type: [[[Number]]], // Array of arrays of arrays of numbers
        required: true
    }
});

let Schema = mongoose.Schema({
    creator: {
        type: String,
        required: true
    },
    geometries: {
        type: [polygonSchema],
        required: true
    },
    tags: {
        type: [String],
        required: true
    }
});

module.exports = mongoose.model("Layer", Schema);
