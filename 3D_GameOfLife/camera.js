import { WORLD_SIZE } from "./world.js";

let Camera = {
    position: [WORLD_SIZE/2, WORLD_SIZE/2, WORLD_SIZE],
    up: [0, 1, 0],
    direction: [0, 0, -1], // front
    right: [-1, 0, 0],
    rotation: [0, -90, 0], // pitch yaw roll
    WORLD_UP: [0, 1, 0],

    movementSpeed: 5,
    mouseSensitivity: 0.3,

    update: function() {

        const pitch = radians(this.rotation[0]);
        const yaw = radians(this.rotation[1]);

        this.direction = [
            Math.cos(pitch)*Math.cos(yaw),
            Math.sin(pitch),
            Math.cos(pitch)*Math.sin(yaw)
        ];
        vec3.normalize(this.direction, this.direction);
        
        vec3.cross(this.right, this.WORLD_UP, this.direction);
        vec3.normalize(this.right, this.right);
        
        vec3.cross(this.up, this.right, this.direction);
        vec3.normalize(this.up, this.up);
    },

    target: function() {
        let target = vec3.create();
        vec3.add(target, this.position, this.direction);
        return target;
    },

    handleInput: function(key, mouse, deltaTime) {
        let movement = [0, 0, 0];
        if (key.isDown(key.W)) {
            vec3.add(movement, movement, this.direction);
        }
        if (key.isDown(key.S)) {
            vec3.subtract(movement, movement, this.direction);
        }
        if (key.isDown(key.A)) {
            vec3.add(movement, movement, this.right);
        }
        if (key.isDown(key.D)) {
            vec3.subtract(movement, movement, this.right);
        }
        if (key.isDown(key.Q)) {
            vec3.subtract(movement, movement, this.WORLD_UP);
        }
        if (key.isDown(key.E)) {
            vec3.add(movement, movement, this.WORLD_UP);
        }

        vec3.normalize(movement, movement);
        vec3.scale(movement, movement, this.movementSpeed * deltaTime);

        vec3.add(this.position, this.position, movement);

        this.rotation[0] -= mouse.dy * this.mouseSensitivity;
        this.rotation[1] += mouse.dx * this.mouseSensitivity;

        if (this.rotation[0] > 89.0)
            this.rotation[0] = 89.0;
        if (this.rotation[0] < -89.0)
            this.rotation[0] = -89.0;
    },

    raycast: function(world) {
        let ray_pos = vec3.create();
        vec3.add(ray_pos, ray_pos, this.position);
        let ray_dir = vec3.create();
        vec3.add(ray_dir, ray_dir, this.direction);
        let ray = {
            position: ray_pos,
            direction: ray_dir
        };

        let maxDistance = 100;
        let stepSize = 0.01;
        let step = vec3.create();
        vec3.scale(step, ray.direction, stepSize);

        let hit = null;

        let previous_position = vec3.create();
        for(let i = 0; i < maxDistance / stepSize; i++) {
            vec3.add(ray.position, ray.position, step);
            let position = [Math.round(ray.position[0]), Math.round(ray.position[1]), Math.round(ray.position[2])];
            let state = world.getState(position[0], position[1], position[2]);
            if(state) {
                hit = position;
                break;
            } else {
                previous_position = vec3.clone(position);
            }
        }
        return {hit, side: previous_position};
    }

};

function radians(degrees) {
    return degrees * Math.PI / 180;
}

export { Camera };