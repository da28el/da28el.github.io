import { Chunk } from "./world.js";

class Player {
    constructor() {
        this.position = [0, 0, 0];
        this.speed = 0.1;
        this.jump_speed = 0.2;
        this.gravity = 0.005;
        this.flying = false;
    }
    
    collide(chunk) {
        let x = Math.floor(this.position[0]);
        let y = Math.floor(this.position[1]);
        let z = Math.floor(this.position[2]);
        let neighbors = [
            chunk.blocks[Chunk.IDX(x + 1, y, z)],
            chunk.blocks[Chunk.IDX(x - 1, y, z)],
            chunk.blocks[Chunk.IDX(x, y + 1, z)],
            chunk.blocks[Chunk.IDX(x, y - 1, z)],
            chunk.blocks[Chunk.IDX(x, y, z + 1)],
            chunk.blocks[Chunk.IDX(x, y, z - 1)],
        ];
        for (let i = 0; i < neighbors.length; i++) {
            if (neighbors[i] && (neighbors[i].id != Block.IDs.AIR))
                return true;
        }
        return false;
    }

    move(Key) {
        
    }

    forward() {
        return [Math.sin(radians(this.rotation[1])), 0, Math.cos(radians(this.rotation[1]))];
    }
}