const RaspiIO = require('raspi-io');
const PiCamera = require('raspicam');
const NumJS = require('numjs');
const OpenCV = require('opencv');

const Config = require('./Config');
const Servo = require('./Servo');
const CoordinateMap = require('./CoordinateMap');

class CatToy {
    constructor(){
        this.initialize();
    }
};

CatToy.prototype.initialize = function(){
    this.controller = new Controller();
    this.servo = new Servo();
    this.imageMap = new CoordinateMap();   
    this.camera = new PiCamera({
        'mode': 'photo',
        'output': '/tmp/cat_toy.jpg',
        'timeout': 1,
        'width': Config.camera.resolution[0],
        'height': Config.camera.resolution[1],
        'encoding': 'jpg',
    });
    var chain = [this.registerMap, this.findBounds, this.servo.center, this.servo.start], self = this;
    self.servo.setMode('static');
    self.servo.on('finished', () => {
        if(chain.length == 0) {
            self.servo.removeAllListeners('finished');
            self.play();
        } else (chain.pop())()
    });
    (chain.pop())();
};

CatToy.prototype.findBounds = function () {
    var servo = this.servo, camera = this.camera;
    var points = [];
    servo.setMode('bounds');
    servo.on('bounds', camera.start);
    camera.on('read', (error, timestamp, filename) => {
        camera.stop();
        OpenCV.readImage(filename, function(error, image){
            var point = Util.extractCoordinate(image);
            if (points.length == 0)
                points.push(point);
            else {
                switch (points.length) {
                case 1:
                    if (Point.distance(point, points[0]) > 10) {
                        points[0] = point;
                        servo.bounds.theta[0] -= servo.step;
                        servo.append(new Point(servo.bounds.theta[0], servo.getPosition().y));
                    } else {
                        points.push(point);
                        servo.center();
                    }
                    break;
                case 2:
                    if (Point.distance(point, points[1]) > 10) {
                        points[1] = point;
                        servo.bounds.theta[1] += servo.step;
                        servo.append(new Point(servo.bounds.theta[1], servo.getPosition().y));
                    } else {
                        points.push(point);
                        servo.center();
                    }
                    break;
                case 3:
                    if (Point.distance(point, points[2]) > 10) {
                        points[2] = point;
                        servo.bounds.phi[0] -= servo.step;
                        servo.append(new Point(servo.getPosition().x, servo.bounds.phi[0]));
                    } else {
                        points.push(point);
                        servo.center();
                    }
                    break;
                case 4:
                    if (Point.distance(point, points[3]) > 10) {
                        points[3] = point;
                        servo.bounds.phi[1] += servo.step;
                        servo.append(new Point(servo.getPosition().x, servo.bounds.phi[1]));
                    } else {
                        servo.removeAllListeners('bounds');
                        servo.emit('finished');
                        camera.removeAllListeners('read');
                        camera.stop();
                    }
                }
            }
        });
    });
    camera.start();
};

CatToy.prototype.registerMap = function(){
    var map = this.map, servo = this.servo;
    servo.setMode('static');
    servo.on('finished', camera.start);
    camera.on('read', function (error, timestamp, filename) {
        camera.stop();
        if (error) return console.error(error);
        OpenCV.readImage(filename, function(error, image){
            if (error) return console.error(error);
            map.set(Util.extractLaserCoordinate(image), servo.getPosition()));
        });
    });
    for(var i = servo.bounds.theta[0], l = servo.bounds.theta[1]; i <= l; i = i + Config.servo.step){
        for(var j = servo.bounds.phi[0], m = servo.bounds.phi[1]; j <= m; j = j + Config.servo.step){
            servo.append(new Point(i, j));
        }
    }
};

CatToy.prototype.play = function(){
    var controller = this.controller,
        servo = this.servo,
        camera = this.camera,
        map = this.imageMap;
    camera.on('read', function(error, filename){
        if (error) return console.error(error);
        OpenCV.readImage(filename, function(error, image){
            if (error) return console.error(error);
            var movements = controller.calculateMove(Util.extractLaserCoordinate(image), Util.extractCatCoordinate(image));
            servo.append(map.translate(movements), camera.start);
        });
    });
};
