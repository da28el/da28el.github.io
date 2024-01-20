import { Block } from "./block.js";
import { perlin_noise } from "./noise.js";

const WORLD_SIZE = 8;
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
    }

    getChunk(x, z) {
        return this.chunks[Math.floor(x/CHUNK_SIZE) + Math.floor(z/CHUNK_SIZE)*WORLD_SIZE];
    }

    getBlock(x, y, z) {
        let chunk = this.getChunk(x, z);
        if (chunk == null) return null;
        return this.getChunk(x, z).get(x, y, z);
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

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    let block = this.blocks[Chunk.IDX(x, y, z)];
                    block.visible = false;
                    if (block.id != Block.IDs.AIR) {
                        let neighbors = [
                            this.blocks[Chunk.IDX(x + 1, y, z)],
                            this.blocks[Chunk.IDX(x - 1, y, z)],
                            this.blocks[Chunk.IDX(x, y + 1, z)],
                            this.blocks[Chunk.IDX(x, y - 1, z)],
                            this.blocks[Chunk.IDX(x, y, z + 1)],
                            this.blocks[Chunk.IDX(x, y, z - 1)],
                        ];
                        for (let i = 0; i < neighbors.length; i++) {
                            if (neighbors[i] && (neighbors[i].id == Block.IDs.AIR))
                                block.visible = true;
                        }
                    }
                }
            } 
        }
    }

}

export { World };