const exec = require('child_process').exec;
const Util = require('./Util');

class Servo {
    constructor(theta, phi) {
        this.theta = theta;
        this.phi = phi;
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
    }
};

Servo.prototype.start = function () {
    console.log("Launching Servo Controller")
    exec('./servod' (error, stdout, stderr) => {
        console.error("Error in launching servo controller:");
        console.error(error);
    });
}

Servo.prototype.move = function (pin, location, callback) {
    exec("echo " + this.pinDic[pin] + "=" + location + " > /dev/servoblaster");
    if (callback) callback();
};

Servo.prototype.center = function () {
    var self = this;
    this.pins.forEach(function (pin) {
            self.move(pin, 90);
        }
    }
};

Servo.prototype.findBounds = function (camera) {
    var self = this;
    var points = [];
    camera.on('read', function (error, timestamp, filename) {
        var point = Util.extractCoordinate(filename);
        if (points.length == 0)
            points.push(point);
        else {
            switch (points.length) {
            case 1:
                if (point != points[0]) {
                    points[0] = point;
                    self.move(self.theta, --self.bounds.theta[0]);
                } else {
                    points.push(point);
                    self.center();
                }
                break;
            case 2:
                if (point != points[1]) {
                    points[1] = point;
                    self.move(self.theta, ++self.bounds.theta[1]);
                } else {
                    points.push(point);
                    self.center();
                }
                break;
            case 3:
                if (point != points[2]) {
                    points[2] = point;
                    self.move(self.phi, --self.bounds.phi[0]);
                } else {
                    points.push(point);
                    self.center();
                }
                break;
            case 4:
                if (point != points[3]) {
                    points[3] = point;
                    self.move(self.phi, ++self.bounds.phi[1]);
                } else {
                    points.push(point);
                    self.center();
                }
            }
        }
    });
    camera.on("exit", function () {
        camera.start();
    });
    camera.start();
};