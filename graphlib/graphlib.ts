const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const WIDTH: number = canvas.width;
const HEIGHT: number = canvas.height;

interface Collider {
    layer: number;
    contains(x: number, y: number): boolean;
}

class BoxCollider implements Collider {
    layer: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    constructor(x1: number, y1: number, x2: number, y2: number, layer: number) {
        this.layer = layer;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    contains(x: number, y: number): boolean {
        return (x >= this.x1 && x <= this.x2 &&
                y >= this.y1 && y <= this.y2);
    }
}

class CircleCollider implements Collider {
    layer: number;
    x1: number;
    y1: number;
    r: number;
    constructor(x1: number, y1: number, r: number, layer: number) {
        this.layer = layer;
        this.x1 = x1;
        this.y1 = y1;
        this.r = r;
    }
    contains(x: number, y: number): boolean {
        return Math.hypot(this.x1 - x, this.y1 - y) < this.r;
    }
    
}

class Circuit {
    grid_spacing: number = 10;
    components: Component[] = [];
    wires: Wire[] = [];
    constructor() {}   
    
    addComponent(component: Component): void {
        while (this.components.some(c => component.id === c.id)) {
            component.id++;
        }
        this.components.push(component);
    }

    removeComponent(component: Component|number): Component|null {
        if(component instanceof Component) {
            const idx = this.components.indexOf(component);
            return this.components.splice(idx, 1)[0];
        }
        else if(!isNaN(component)) {
            return this.components.filter(c => c.id === component)[0]
        }
        return null;
    }

    getComponentById(componentId: number) {
        return this.components.filter(c => c.id === componentId)[0];
    }

    connect(node1, node2) {}

    draw(): void {
        ctx.fillStyle = "#000000";
        for(let x = this.grid_spacing/2; x < WIDTH; x += this.grid_spacing) {
            for(let y = this.grid_spacing/2; y < HEIGHT; y += this.grid_spacing) {
                ctx.fillRect(x-1, y-1, 2, 2);
            }
        }

    }

    generateNetlist(): string { return "" }
    simulate() {}
}

enum ComponentType {
    R, L, C,
    NAND
}

class Component {
    id: number;
    type: ComponentType;
    inputs: [_Node];
    outputs: [_Node];
    position: {x: number, y: number};
    value: any;
    constructor(id) {
        this.id = id;
        this.type;
        this.inputs;
        this.outputs;
        this.position;
        this.value;
    }

    evaluate() {}

    draw(ctx2d) {}
}

class _Node {
    id: number;
    connections: [];
    value: any;
    constructor() {
        this.id;
        this.connections;
        this.value;
    }

    connect() {}

    disconnect() {}
}

class Wire {
    id: number;
    value: any;
    points: [{x: number, y: number}];
    constructor() {
        this.id;
        this.value;
        this.points;
    }

    connect() {}

    draw(ctx2d: CanvasRenderingContext2D): void {

    }
}

function main() {
    const circuit = new Circuit();
    const resistor = new Component(0);
    resistor.type = ComponentType.R;
    resistor.value = 100;
    resistor.inputs = [new _Node()];
    circuit.addComponent(new Component(0))
}