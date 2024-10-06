class Vec2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    static length(v) {
        return Math.sqrt(Vec2.dot(v, v));
    }
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
    static add(v1, v2, vr = new Vec2()) {
        vr.x = v1.x + v2.x; vr.y = v1.y + v2.y;
        return vr;
    }
    static subtract(v1, v2, vr = new Vec2()) {
        return Vec2.add(v1, Vec2.multiply(v2, -1.0), vr);
    }
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
}