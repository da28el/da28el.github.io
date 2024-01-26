const WORLD_SIZE = 32;
class World {
    constructor() {
        this.data = null;
        this.buffer = null;
        this.time = 0;

        this.init();
    }

    init() {
        this.data = new Array(WORLD_SIZE * WORLD_SIZE * WORLD_SIZE).fill(0);
        this.data[World.IDX(WORLD_SIZE/2, WORLD_SIZE/2, WORLD_SIZE/2)] = 1;
        this.data[World.IDX(WORLD_SIZE/2-1, WORLD_SIZE/2, WORLD_SIZE/2)] = 1;
        this.data[World.IDX(WORLD_SIZE/2+1, WORLD_SIZE/2, WORLD_SIZE/2)] = 1
        this.data[World.IDX(WORLD_SIZE/2+1, WORLD_SIZE/2+1, WORLD_SIZE/2)] = 1
        this.data[World.IDX(WORLD_SIZE/2, WORLD_SIZE/2+2, WORLD_SIZE/2)] = 1
        this.buffer = new Array(WORLD_SIZE * WORLD_SIZE * WORLD_SIZE).fill(0);
        this.time = 0;
    }

    static IDX(x, y, z) {
        return Math.floor(x) + Math.floor(y)*WORLD_SIZE + Math.floor(z)*WORLD_SIZE*WORLD_SIZE;
    }

    setState(x, y, z, state, buffer = false) {
        // out of bounds = do nothing
        if(x < 0 || x >= WORLD_SIZE || y < 0 || y >= WORLD_SIZE || z < 0 || z >= WORLD_SIZE) return;
        if(buffer)
            this.buffer[World.IDX(x, y, z)] = state;
        else
            this.data[World.IDX(x, y, z)] = state;
    }

    getState(x, y, z) {
        // out of bounds = 0
        if(x < 0 || x >= WORLD_SIZE || y < 0 || y >= WORLD_SIZE || z < 0 || z >= WORLD_SIZE) return 0;
        return this.data[World.IDX(x, y, z)];
    }

    neighbors(x, y, z, moore3D) {
        let count = 0;
        for(let dx = -1; dx <= 1; dx++) {
            for(let dy = -1; dy <= 1; dy++) {
                if (moore3D) {
                    for(let dz = -1; dz <= 1; dz++) {
                        if(dx == 0 && dy == 0 && dz == 0) continue;
                        count += this.getState(x + dx, y + dy, z + dz);
                    }
                } else {
                    if(dx == 0 && dy == 0) continue;
                    count += this.getState(x + dx, y + dy, z);
                }
            }
        }
        return count;
    }

    // underpopulation, overpopulation, reproduction
    update(u, o, r, moore3D = true) {
        for(let x = 0; x < WORLD_SIZE; x++) {
            for(let y = 0; y < WORLD_SIZE; y++) {
                let z = 8;
                for(let z = 0; z < WORLD_SIZE; z++) {
                    let neighbors = this.neighbors(x, y, z, moore3D);
                    // active cell
                    if(this.getState(x, y, z) == 1) {
                        // dies of underpopulation or overpopulation
                        if(neighbors < u || neighbors > o)
                            this.setState(x, y, z, 0, true);
                        // else lives on
                        else
                            this.setState(x, y, z, 1, true);
                    // dead cell
                    } else {
                        // reproduction
                        if(neighbors == r)
                            this.setState(x, y, z, 1, true);
                    }
                }
            }
        }
        this.data = this.buffer;
        this.buffer = new Array(WORLD_SIZE * WORLD_SIZE * WORLD_SIZE).fill(0);
        this.time++;
    }

    reset() {
        this.init();
    }

    soup() {
        for(let x = 0; x < WORLD_SIZE; x++) {
            for(let y = 0; y < WORLD_SIZE; y++) {
                for(let z = 0; z < WORLD_SIZE; z++) {
                    this.setState(x, y, z, Math.round(Math.random()));
                }
            }
        }
    }

    getStateString(s, u, o, r, m) {
        let str = "";
        str += s + "," + u + "," + o + "," + r + "," + (m?1:0) + ",";
        for(let i = 0; i < this.data.length; i++) {
            if(this.data[i] == 0) continue;
            str += i + ",";
        }
        str = str.substring(0, str.length - 1);
        return str;
    }

    setStateString(str) {
        this.data = new Array(WORLD_SIZE * WORLD_SIZE * WORLD_SIZE).fill(0);
        let index = 0;
        let parts = str.split(",");
        for(let i = 5; i < parts.length; i++) {
            index = parseInt(parts[i]);
            this.data[index] = 1;
        }
        return parts.slice(0, 5);
    }

}

export { World, WORLD_SIZE };