const RaspiIO = require('raspi-io');
const PiCamera = require('raspicam');
const OpenCV = require('opencv');
const Promise = require('bluebird');
const EventPromise = require('promisify-event');

const Config = require('./Config');
const Servo = require('./Servo');
const Dispatcher = require('./Dispatcher');
const CoordinateMap = require('./CoordinateMap');
const Util = require('./Util');
const Logger = require('./Logger');

var readImage = Promise.promisify(OpenCV.readImage);

class Toy {
    constructor() {
	this.dispatcher = new Dispatcher();
        this.servo = new Servo(this.dispatcher);
        this.imageMap = new CoordinateMap();
        this.camera = new PiCamera({
            'mode': 'photo',
            'output': '/tmp/cat_toy.jpg',
            'timeout': 1,
            'width': Config.camera.resolution[0],
            'height': Config.camera.resolution[1],
            'encoding': 'jpg',
        });
    };
    async initialize() {
        Logger.info("Initializing Cat Toy");
        await this.findBounds();
        await this.registerMap();
    };
    async findBounds() {
        Logger.info("Finding Boundaries of Autonomous Control")
        var servo = this.servo,
            camera = this.camera,
            points = [];
        
        await servo.center();
        for(var i = 0; i < 4; i++){
            Logger.info("Finding " + i + " boundary");
            let image = await this.getImage();
            var point = Util.extractLaserCoordinate(image);
            if (point === null) return Logger.error("Camera not positioned properly!");
            points.push(point);
            
            var first = true;
            while(point !== null && (Point.distance(point, points[i]) > 10 || first)){
                points[i] = point;
                switch(i){
                    case 0:
                        servo.bounds.theta[0] -= servo.step;
                        await servo.setPosition(new Point(servo.bounds.theta[0], servo.getPosition().y));
                        break;
                    case 1:
                        servo.bounds.theta[1] += servo.step;
                        await servo.setPosition(new Point(servo.bounds.theta[1], servo.getPosition().y));
                        break;
                    case 2:
                        servo.bounds.phi[0] -= servo.step;
                        await servo.setPosition(new Point(servo.getPosition().x, servo.bounds.phi[0]));
                        break;
                    case 3:
                        servo.bounds.phi[1] += servo.step;
                        await servo.setPosition(new Point(servo.getPosition().x, servo.bounds.phi[1]));
                }
                let image = await this.getImage();
                point = Util.extractLaserCoordinate(image);
                console.log(point);
                first = false;
            }
            await servo.center();
        }
    };
    async registerMap() {
        for(var i = this.servo.bounds.theta[0], l = this.servo.bounds.theta[1]; i <= l; i++){
            for(var j = this.servo.bounds.phi[0], m = this.servo.bounds.phi[1]; j <= m; j++){
                await this.servo.setPosition(new Point(i, j));
                let image = await this.getImage();
                this.map.set(Util.extractLaserCoordinate(image), this.servo.getPosition());
            }
        }
    };
    async getImage(){
        this.camera.start();
        let result = await EventPromise(this.camera, 'read');
	this.camera.stop();
        return readImage('/tmp/' + result[2]);
    };
    play() {
        var servo = this.servo,
            map = this.imageMap,
            camera = this.camera = new PiCamera({
                'mode': 'timelapse',
                'output': '/tmp/cat_toy.jpg',
                'timelapse': 100,
                'width': Config.camera.resolution[0],
                'height': Config.camera.resolution[1],
                'encoding': 'jpg',
            });
        camera.on('read', (error, timestamp, filename) => {
            if (error) return console.error(error);
            OpenCV.readImage(filename, (error, image) => {
                if (error) return console.error(error);
                servo.append(map.translate(Util.calculateMove(Util.extractLaserCoordinate(image), Util.extractCatCoordinate(image))));
            });
        });
        camera.start();
    };
};

module.exports = Toy;
