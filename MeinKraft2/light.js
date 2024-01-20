

class Light {
    constructor(position = [0, 0, 0], direction = [0, 0, 0], ambient = [1, 1, 1], diffuse = [1, 1, 1], specular = [1, 1, 1], constant = 1, linear = 0.09, quadratic = 0.032) {
        this.position = position;
        this.direction = direction;

        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;

        this.constant = constant;
        this.linear = linear;
        this.quadratic = quadratic;
    }
}