const Point = require('./Point');

class CoordianteMap {
  constructor() {
    this._x = new Map();
    this._y = new Map();
  }
  delete(k) {
    return this._x.delete(k.x) && this._y.delete(k.y);
  }
  get(k) {
    return new Point(this._x.get(k.x), this._y.get(k.y));
  }
  has(k) {
    return this._x.has(k.x) && this._y.has(k.y);
  }
  set(k, v) {
    this._x.set(k.x, v.x);
    this._y.set(k.y, v.y);
    return this;
  }
}
