import { CHUNK_HEIGHT } from "./world.js";

class Block {

    static IDs = {
        AIR: 0,
        GRASS: 1,
        DIRT: 2,
        STONE: 3,
    };
    
    constructor(position, id) {
        this.position = position;
        this.id = id;
        this.visible = true;
        this.light = 0.0;//position[1]/CHUNK_HEIGHT;
    }

}

export { Block };