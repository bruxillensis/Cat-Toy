const NumJS = require('numjs');
const OpenCV = require('opencv');
const Point = require('./Point');
const Config = require('./Config');
const Logger = require('./Logger');

module.exports = {
    extractLaserCoordinate: function(image){
        Logger.info("Extracting laser coordinate");
        
        width = image.width()
        height = image.height()
        if (width < 1 || height < 1) Logger.error('Image has no size');
        image.inRange([0, 0, 5], [0, 0, 255]);
        image.dilate(4);
        image.save('/tmp/cat_toy_threshed.jpg');
        let contours = image.findContours();
	if (contours.size() < 1) return null;
        
        let box = contours.boundingRect(0);
        return new Point(box.x + box.width/2, box.y + box.height/2);
    },
    extractCatCoordinate: function(image){
        Logger.info("Extracting cat coordinate");
        var lowThresh = 0;
        var highThresh = 100;

        width = image.width()
        height = image.height()
        if (width < 1 || height < 1) Logger.error('Image has no size');
        
        image.convertGrayscale();
        image.canny(0, 100);
        image.dilate(2);
        image.save('./cat_toy.jpg');
        contours = im_canny.findContours();
    },
    calculateMove: (laser, cat) => {
        Logger.info("Calculating next move");
        return new Point(100, 100);
    }
}
