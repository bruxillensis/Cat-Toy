/////////////////Construction//////////////////
class Point {
    constructor(x, y){
        if(y == undefined){
            this.x = x.x || 0;
            this.y = x.y || 0;
        } else {
            this.x = x || 0;
            this.y = y || 0;
        }
    }
};
Point.prototype.x = null;
Point.prototype.y = null;
///////////////////////////////////////////////

//////////////Information Commands/////////////
Point.prototype.degreesTo = function(v){
	var dx = this.x - v.x;
	var dy = this.y - v.y;
	var angle = Math.atan2(dy, dx); // radians
	return Point.normalizeAngle(angle * (180 / Math.PI) - 90); // degrees
};
Point.prototype.distance = function(v){
	var x = this.x - v.x;
	var y = this.y - v.y;
	return Math.sqrt(x * x + y * y);
};
Point.prototype.equals = function(toCompare){
	return this.x == toCompare.x && this.y == toCompare.y;
};
Point.prototype.length = function(){
	return Math.sqrt(this.x * this.x + this.y * this.y);
};
Point.prototype.toString = function(){
	return "(x=" + this.x + ", y=" + this.y + ")";
};
Point.prototype.liesBetween = function(pt1, pt2){
    if (Point.distance(pt1, this) < 1 || Point.distance(pt2, this) < 1) return true;
    var dxc = this.x - pt1.x,
        dyc = this.y - pt1.y,
        dxl = pt2.x - pt1.x,
        dyl = pt2.y - pt1.y;
    if (Math.abs(dxc * dyl - dyc * dxl) > 50)
        return false;
    if (Math.abs(dxl) >= Math.abs(dyl))
      return dxl > 0 ? pt1.x <= this.x && this.x <= pt2.x : pt2.x <= this.x && this.x <= pt1.x;
    else
      return dyl > 0 ? pt1.y <= this.y && this.y <= pt2.y : pt2.y <= this.y && this.y <= pt1.y;
};
///////////////////////////////////////////////

///////////////Chainable Commands//////////////
Point.prototype.normalize = function(thickness){
	var l = this.length();
	this.x = this.x / l * thickness;
	this.y = this.y / l * thickness;
    return this;
};
Point.prototype.orbit = function(origin, degrees){
	var radians = degrees * (Math.PI / 180), radius = Point.distance(origin, this);
	this.x = origin.x + radius * Math.cos(radians);
	this.y = origin.y + radius * Math.sin(radians);
    return this;
};
Point.prototype.offset = function(dx, dy){
	this.x += dx;
	this.y += dy;
    return this;
};
Point.prototype.subtract = function(v){
	return new Point(this.x - v.x, this.y - v.y);
};
Point.prototype.add = function(v){
	return new Point(this.x + v.x, this.y + v.y);
};
Point.prototype.clone = function(){
	return new Point(this.x, this.y);
};
Point.prototype.interpolate = function(v, f){
	return new Point( v.x + (this.x - v.x) * f, v.y + (this.y - v.y) * f );
};
Point.prototype.translate = function(rotation, vector){
    var cosT = Math.cos(rotation*Math.PI/180),
        sinT = Math.sin(rotation*Math.PI/180);
    return this.add(new Point(vector.x*cosT - vector.y*sinT, vector.x*sinT + vector.y*cosT));
};
///////////////////////////////////////////////

////////////////Static Commands////////////////
Point.interpolate = function(pt1, pt2, f){
	return pt1.interpolate(pt2, f);
};
Point.polar = function(len, angle){
	return new Point(len * Math.cos(angle), len * Math.sin(angle));
};
Point.distance = function(pt1, pt2){
	var x = pt1.x - pt2.x;
	var y = pt1.y - pt2.y;
	return Math.sqrt(x * x + y * y);
};
Point.normalizeAngle = function(angle){
    return ((angle %= 360) > 180) ? angle - 360 : ((angle <= -180) ? angle + 360 : angle);
};
///////////////////////////////////////////////

module.exports = Point;
