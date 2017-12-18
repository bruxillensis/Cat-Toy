const NumJS = require('numjs');
const OpenCV = require('opencv');
const Point = require('./Point');
const Config = require('./Config');
const Logger = require('./Logger');

module.exports = {
    extractLaserCoordinate: function(image){
        Logger.info("Extracting laser coordinate");
        console.log(image.get(0, 0));
	//var coordinate = (image[:, :, 2] > 250).nonzero();
        return new Point(NumJS.median(NumJS.asarray(coordinate[0])), NumJS.median(NumJS.asarray(coordinate[1])));
    },
    extractCatCoordinate: function(image){
        Logger.info("Extracting cat coordinate");
        let frame = image.array

        OpenCV.Resize(frame, frame, OpenCV.Size(500, 500), interpolation=CV_INTER_LINEAR)
        let gray = OpenCV.GaussianBlur(OpenCV.cvtColor(frame, OpenCV.COLOR_BGR2GRAY), (21, 21), 0)

        if (!avg){
            avg = gray.copy().astype("float")
            return
        }

        let frameDelta = OpenCV.absdiff(gray, OpenCV.convertScaleAbs(avg))

        let thresh = OpenCV.threshold(frameDelta, Config.camera.delta_thresh, 255, OpenCV.THRESH_BINARY)[1]
        thresh = OpenCV.dilate(thresh, undefined, 2)
        contours = OpenCV.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    },
    calculateMove: (laser, cat) => {
        Logger.info("Calculating next move");
        return new Point(100, 100);
    }
}
