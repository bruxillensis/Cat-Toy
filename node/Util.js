const NumJS = require('numjs');
const OpenCV = require('opencv');
const Point = require('./Point');

module.exports = {
    extractLaserCoordinate: function(image){
        var coordinate = (image[:, :, 2] > 250).nonzero();
        return new Point(NumJS.median(NumJS.asarray(coordinate[0])), NumJS.median(NumJS.asarray(coordinate[0])));
    },
    extractCatCoordinate: function(image){
        var coordinate = (image[:, :, 2] > 250).nonzero();
        return new Point(NumJS.median(NumJS.asarray(coordinate[0])), NumJS.median(NumJS.asarray(coordinate[0])));
    }
}
