const RaspiIO = require('raspi-io');
const PiCamera = require('raspicam');
const NumJS = require('numjs');
const OpenCV = require('opencv');

const Servo = require('./Servo');
const Config = require('./Config');

class CatToy {
    constructor(){
        this.initialize();
    }
};

CatToy.prototype.initialize = function(){
    this.controller = new Servo();
    this.controller.start();
    
    this.imageMap = new Map();
    
    this.camera = new PiCamera({
        'mode': 'photo',
        'output': '/tmp/cat_toy.jpg',
        'timeout': 1,
        'width': Config.camera.resolution[0],
        'height': Config.camera.resolution[1],
        'encoding': 'jpg',
    });
    this.controller.center();
    this.controller.findBounds(this.camera);
}