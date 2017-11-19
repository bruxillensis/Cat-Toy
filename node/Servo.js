const exec = require('child_process').exec;
const NumJS = require('numjs');
const OpenCV = require('opencv');

const Config = require('./Config');
const Util = require('./Util');
const Point = require('./Point');

class Servo extends eventEmitter{
    constructor() {
        super();
        this.mode = 'static';
        this.theta = Config.servo.theta;
        this.phi = Config.servo.phi;
        this.step = Config.servo.step;
        this.position = new Point(-1, -1);
        this.pinDic = {
            'P1-7': 0,
            'P1-11': 1,
            'P1-12': 2,
            'P1-13': 3,
            'P1-15': 4,
            'P1-16': 5,
            'P1-18': 6,
            'P1-22': 7
        }
        this.bounds = {
            theta: [90, 90],
            phi: [90, 90]
        };
        this.movementQueue = [];
    }
};

Servo.prototype.start = function () {
    var self = this;
    console.log("Launching Servo Controller");
    exec('./servod --step-size=' + this.step + 'us', (error, stdout, stderr) => {
        if(error){
            console.error("Error in launching servo controller:");
            console.error(error);
        } else self.emit('finished');
    });
};

Servo.prototype.getPosition = function () {
    return this.position
};

Servo.prototype.setMode = function(mode) {
    switch(mode){
        case 'static':
        case 'bounds':
            this.movementQueue = [];
            break;
        case 'continuous':
            self.removeAllListeners('finished');
            break;
    }
};

Servo.prototype.center = function () {
    this.setMode('static');
    this.append(new Point(90, 90));
};

Servo.prototype.append = function(movements){
    if (this.mode == 'static') {
        this.movementQueue.push(movements);
        this.emit('_start', {this});
    } else {
        var stopped = this.movementQueue.length == 0;
        if (movements.isArray()) this.movementQueue = movements.reverse().concat(this.movementQueue);
        else this.movementQueue.unshift(movements);
        if (stopped) this.emit('_start' {this});
    }
};

Servo.prototype.on('_start', (servo) => {
    servo._set(servo.movementQueue.pop());
});

Servo.prototype._set = function (position) {
    var self = this;
    exec("echo " + self.pinDic[self.theta] + "=" + position.x + " > /dev/servoblaster", () => {
        exec("echo " + self.pinDic[self.phi] + "=" + position.y + " > /dev/servoblaster", () => {
            self.position = position;
            self.emit('_stop', { self });
        });
    });
};

Servo.prototype.on('_stop', (servo) => {
    if (servo.mode == 'static'){
        servo.movementQueue = [];
        servo.emit('finished');
    } else if (servo.mode == 'bounds'){
        servo.movementQueue = [];
        servo.emit('bounds');        
    } else {
        if ( this.movementQueue.length != 0 ) this._set(this.movementQueue.pop());
        else this.emit('finished');
    }
});
