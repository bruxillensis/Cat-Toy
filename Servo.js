const Promise = require('bluebird');
const exec = Promise.promisify(require('child_process').exec);

const Config = require('./Config');
const Util = require('./Util');
const Point = require('./Point');
const Logger = require('./Logger');

class Servo {
    constructor(dispatcher) {
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
        this.dispatcher = dispatcher;
        this.dispatcher.on('start', (async() => {
            Logger.info("Starting new laser path");
            var position = this.dispatcher.get();
            while (position) {
                try {
                    await this.setPosition(position);
                    position = this.dispatcher.get();
                } catch (error) {
                    console.error(error);
                }
            }
        }).bind(this));
    };
    async initialize() {
        Logger.info("Launching Servo Controller");
        await exec('./servod --step-size=' + this.step + 'us');
    };
    async setPosition(position) {
        Logger.info("Setting servo position");
        await exec("echo " + this.pinDic[this.theta] + "=" + position.x + " > /dev/servoblaster");
        await exec("echo " + this.pinDic[this.phi] + "=" + position.y + " > /dev/servoblaster");
        this.position = position;
        return Promise.resolve(position);
    };
    getPosition() {
        Logger.info("Getting servo position");
        return this.position
    };
    center() {
        Logger.info("Centering servo");
        return this.setPosition(new Point((this.bounds.theta[1] - this.bounds.theta[0]) / 2, (this.bounds.phi[1] - this.bounds.phi[0]) / 2));
    };
};
module.exports = Servo;
