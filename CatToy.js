const RaspiIO = require('raspi-io');
const PiCamera = require('raspicam');
const NumJS = require('numjs');
const OpenCV = require('opencv');

const Config = require('./Config');
const Servo = require('./Servo');
const Dispatcher = require('./Dispatcher');
const CoordinateMap = require('./CoordinateMap');

var readCamera = (emitter, event = 'read') => {
    return new Promise(((resolve, reject) => {
        emitter.on(event, (error, timestamp, filename) => {
            emitter.removeAllListeners(event)
            if (error) reject(error);
            else resolve(filename);
        });
    }).bind(null, Promise.resolve, Promise.reject));
};
var readImage = Promise.promisify(OpenCV.readImage);

class CatToy {
    constructor() {
        this.controller = new Controller();
        this.servo = new Servo();
        this.dispatcher = new Dispatcher();
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
        await this.servo.findBounds();
        await this.servo.registerMap();
        return Promise.resolve();
    };
    async findBounds() {
        var servo = this.servo,
            camera = this.camera,
            points = [];
        
        await servo.center();
        for(var i = 0; i < 4; i++){
            let image = await this.getImage();
            var point = Util.extractLaserCoordinate(image);
            points.push(point);
            
            var first = true;
            while(Point.distance(point, points[i]) > 10 || first){
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
        let filename = await readCamera(this.camera);
        this.camera.stop();
        return readImage(filename);
    };
    play() {
        var controller = this.controller,
            servo = this.servo,
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
                servo.append(map.translate(controller.calculateMove(Util.extractLaserCoordinate(image), Util.extractCatCoordinate(image))));
            });
        });
        camera.start();
    };
};