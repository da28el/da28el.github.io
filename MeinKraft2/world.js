import { Block } from "./block.js";
import { perlin_noise } from "./noise.js";

const WORLD_SIZE = 16;
class World {
    constructor() {
        this.chunks = new Array(WORLD_SIZE * WORLD_SIZE).fill(null);
        this.generate();
    }

    static IDX(x, z) {
        return Math.floor(x) + Math.floor(z)*WORLD_SIZE;
    }

    generate() {
        for (let x = 0; x < WORLD_SIZE; x++) {
            for (let z = 0; z < WORLD_SIZE; z++) {
                this.chunks[World.IDX(x, z)] = new Chunk(x, z);
            }
        }
        for(let i = 0; i < 2; i++)
            for(let chunk of this.chunks) 
                for(let block of chunk.blocks)
                    if(block != null)
                        this.updateBlock(block.position[0], block.position[1], block.position[2]);

        console.log("world generated");
    }

    getChunk(x, z) {
        return this.chunks[World.IDX(x/CHUNK_SIZE, z/CHUNK_SIZE)];
    }

    getBlock(x, y, z) {
        let chunk = this.getChunk(x, z);
        if (chunk == null) return null;
        return chunk.get(x-chunk.x, y, z-chunk.z);
    }

    setBlock(x, y, z, block) {
        let chunk = this.getChunk(x, z);
        if (chunk == null) return;
        return chunk.set(x-chunk.x, y, z-chunk.z, block);
    }

    breakBlock(x, y, z) {
        let block = this.getBlock(x, y, z);
        if (block == null) return;
        if (block.id == Block.IDs.AIR) return;
        this.setBlock(x, y, z, new Block([x, y, z], Block.IDs.AIR));
        this.updateNeighbors(x, y, z);
    }

    placeBlockId(x, y, z, id) {
        let block = this.getBlock(x, y, z);
        if (block == null) return;
        if (block.id != Block.IDs.AIR) return;
        this.setBlock(x, y, z, new Block([x, y, z], id));
        this.updateBlock(x, y, z);
        this.updateNeighbors(x, y, z);
    }

    getNeighbors(x, y, z) {
        return [
            this.getBlock(x + 1, y, z),
            this.getBlock(x - 1, y, z),
            this.getBlock(x, y + 1, z),
            this.getBlock(x, y - 1, z),
            this.getBlock(x, y, z + 1),
            this.getBlock(x, y, z - 1),
        ];
    }

    updateBlock(x, y, z){
        const block = this.getBlock(x, y, z);
        if (block == null) return;
        
        let neighbors = this.getNeighbors(x, y, z);
        
        // visibility
        block.visible = false; // default to false
        if (block.id != Block.IDs.AIR) { // if not air, check if any neighbors are air
            for (let i = 0; i < neighbors.length; i++) {
                if (neighbors[i] && (neighbors[i].id == Block.IDs.AIR)) // if neighbor is air, set visible to true
                    block.visible = true;
            }
        }

        // light
        let maxLight = 0.0;
        for(let i = 0; i < neighbors.length; i++)
            if (neighbors[i] && (neighbors[i].light > maxLight))
                maxLight = neighbors[i].light;
        block.light = maxLight - 0.1;
        if(block.id == Block.IDs.STONE) block.light = 1.0;
    }

    updateNeighbors(x, y, z) {
        this.updateBlock(x + 1, y, z);
        this.updateBlock(x - 1, y, z);
        this.updateBlock(x, y + 1, z);
        this.updateBlock(x, y - 1, z);
        this.updateBlock(x, y, z + 1);
        this.updateBlock(x, y, z - 1);
    }

}

const CHUNK_SIZE = 16;
const CHUNK_HEIGHT = 32;
class Chunk {
    constructor(x_chunk, z_chunk) {
        this.x = x_chunk*CHUNK_SIZE;
        this.z = z_chunk*CHUNK_SIZE;
        this.blocks = new Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE).fill(null);
        this.generate();
    }

    static IDX(x, y, z) {
        if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_HEIGHT || z < 0 || z >= CHUNK_SIZE)
            return null;
        return Math.floor(x) + CHUNK_SIZE * (Math.floor(y) + CHUNK_HEIGHT * Math.floor(z));
    }

    get(x, y, z) {
        return this.blocks[Chunk.IDX(x, y, z)];
    }

    set(x, y, z, block) {
        this.blocks[Chunk.IDX(x, y, z)] = block;
        return this.blocks[Chunk.IDX(x, y, z)];
    }

    generate() {
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                let height = Math.floor(Math.abs(perlin_noise((this.x + x)/(2*CHUNK_SIZE), (this.z + z)/(2*CHUNK_SIZE))) * CHUNK_HEIGHT) + CHUNK_HEIGHT/4;
                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    let id = Block.IDs.AIR;
                    if (y < height)
                        id = Block.IDs.GRASS;
                    if (y < height - 1)
                        id = Block.IDs.DIRT;
                    if (y < height - 2)
                        id = Block.IDs.STONE;
                    this.blocks[Chunk.IDX(x,y,z)] = new Block([this.x + x, y, this.z + z], id);
                }
            }
        }
    }
}

export { World, WORLD_SIZE, CHUNK_SIZE, CHUNK_HEIGHT };