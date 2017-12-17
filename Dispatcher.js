class Dispatcher extends require('events') {
    constructor() {
        super();
        this.queue = [];
    }
    append(data){
        let dispatch = (this.queue.length == 0);
        this.queue = data.concat(this.queue);
        if (dispatch) this.emit('start');
    }
    get(){
        return (this.queue.length != 0) ? this.queue.pop() : null;
    }
};
module.exports = Dispatcher;