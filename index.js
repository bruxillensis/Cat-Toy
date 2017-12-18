const Toy = require('./Toy')

console.log('-------------------------------------------------------');
console.log('--                      Cat Toy                      --');
console.log('-------------------------------------------------------');

toy = new Toy();
(async () => {
    await toy.initialize();
    toy.play();
})();
