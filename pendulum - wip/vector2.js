/**
 * Vec2 implementation using .
 * @class Vec2
 */
class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    /**
     * Length of vector.
     * @function length
     * @memberOf Vec2.
     * @param  {Vec2} v input vector.
     * @return {Number} length of vector as Number.
     */
    static length(v) {
        return Math.sqrt(Vec2.dot(v, v));
    }
    /**
     * Scalar multiplication.
     * @function multiply
     * @memberOf Vec2.
     * @param  {Vec2}   v  input vector.
     * @param  {Number} s  scalar.
     * @param  {Vec2}   vf output vector.
     * @return {Vec2}      Modified vf = s*v.
     */
    static multiply(v, s, vr = new Vec2()) {
        if (!isNaN(s)) {
            vr.x = s * v.x;
            vr.y = s * v.y;
            return vr;
        }
        if (!isNaN(v)) {
            vr.x = s.x * v;
            vr.y = s.y * v;
            return vr;
        }
        throw Error("no scalar supplied");
    }
    /**
     * Vector addition.
     * @function add
     * @memberOf Vec2.
     * @param  {Vec2} v1 Addend1 vector.
     * @param  {Vec2} v2 Addend2 vector.
     * @param  {Vec2} vf Output vector.
     * @return {Vec2}    Sum vf = v1 + v2.
     */
    static add(v1, v2, vr = new Vec2()) {
        vr.x = v1.x + v2.x; vr.y = v1.y + v2.y;
        return vr;
    }
    /**
     * Vector subtraction.
     * @function subtract
     * @memberOf Vec2.
     * @param  {Vec2} v1 Minuend vector.
     * @param  {Vec2} v2 Subtrahend.
     * @param  {Vec2} vf Output vector.
     * @return {Vec2}    Difference vf = v1 - v2.
     */
    static subtract(v1, v2, vr = new Vec2()) {
        return Vec2.add(v1, Vec2.multiply(v2, -1.0), vr);
    }
    /**
     * Vector subtraction.
     * @function subtract
     * @memberOf Vec2.
     * @param  {Vec2} v1 Vector.
     * @param  {Vec2} v2 Factor.
     * @param  {Vec2} vf Output vector.
     * @return {Number}  Product vf = v1 * v2.
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    static normalize(v1, vr = new Vec2()) {
        const r = Vec2.length(v1);
        if (r == 0) return vr;
        return Vec2.multiply(v1, 1.0/r, vr);
    }
    static fromAngle(theta, vr = new Vec2()) {
        vr.x = Math.cos(theta);
        vr.y = Math.sin(theta);
        return vr;
    }
}