class Box{
    // Frontend
    posX:number;
    posY:number;
    sizeW:number;
    sizeH:number;
    color:string;
    _active:boolean = true;
    draw():void{
        ctx.fillStyle = this.color;
        ctx.fillRect(this.posX, this.posY, this.sizeW, this.sizeH);
        this._draw();
    }

    move(x:number, y:number):boolean{
        let rv:boolean = true;
        
        // UNGUARDED
        // this.posX = x - mouseOffsetX;
        // this.posY = y - mouseOffsetY;
        
        // EDGEGUARDED
        let xp = x - mouseOffsetX;
        let yp = y - mouseOffsetY;
        let xrange:number = xp + this.sizeW;
        let yrange:number = yp + this.sizeH;
        if(xp > 0 && xrange < width)
            this.posX = xp;
        else
            rv = false;
        if(yp > 0 && yrange < height)
            this.posY = yp;
        else
            rv = false;
        
        return rv;
    }

    getName(){
        return "";
    }

    // Backend
    _get():any{
        return;
    }
    _draw():void{
        return;
    }
    _addInput(i:any):any{
        return;
    }
}

// Boxes
class Box_Number extends Box{
    _value:number;
    constructor(n:number){
        super(); 
        this._value = n;
        this.sizeH = 30;
        this.sizeW = 20;
        this.color = "rgb(128,255,128)";
    }
    _get(){ return this._value; }
    _draw(){
        ctx.fillStyle = "#000000";
        ctx.fillText(this._value.toString(), this.posX + this.sizeW/4, this.posY+ this.sizeH/2);
    }
}
class Box_NumericOperator extends Box{
    text:string;
    _input1:Box = null; _input2:Box = null;
    _addInput(i:Box){
        if(!this._input1 || !this._input1._active) this._input1 = i;
        else if(!this._input2 || !this._input2._active) this._input2 = i;
    }
    _addInput1(i1:Box){ this._input1 = i1; }; _addInput2(i2:Box){ this._input2 = i2; }
    constructor(){
        super();
        this.sizeH = 40;
        this.sizeW = 40;
        this.color = "rgb(255, 128, 128)";
    }
    _get(){ return; }
    _draw(){
        ctx.fillStyle = "#000000";
        ctx.fillText(this.text, this.posX + this.sizeW/2, this.posY+ this.sizeH/2);
        ctx.strokeStyle = "rgb(255,0,0)";
        if(this._input1){
            ctx.beginPath();
            ctx.moveTo(this.posX, this.posY+this.sizeH*1/3);
            ctx.lineTo(this._input1.posX+this._input1.sizeW, this._input1.posY+this._input1.sizeH/2);
            ctx.stroke();
        }
        if(this._input2){
            ctx.beginPath();
            ctx.moveTo(this.posX, this.posY+this.sizeH*2/3);
            ctx.lineTo(this._input2.posX+this._input2.sizeW, this._input2.posY+this._input2.sizeH/2);
            ctx.stroke();
        }
    }
}
class Box_Add extends Box_NumericOperator{
    constructor(){ super(); this.text = "+"; }
    _get(){ return (this._input1._get() + this._input2._get()); }
}
class Box_Subtract extends Box_NumericOperator{
    constructor(){ super(); this.text = "-"; }
    _get(){ return (this._input1._get() - this._input2._get()); }
}
class Box_Multiply extends Box_NumericOperator{
    constructor(){ super(); this.text = "*"; }
    _get(){ return (this._input1._get() * this._input2._get()); }
}
class Box_Divide extends Box_NumericOperator{
    constructor(){ super(); this.text = "/"; }
    _get(){ return (this._input1._get() / this._input2._get()); }
}
class Box_NumericDisplay extends Box{
    _input:Box = null;
    name:string;
    constructor(n:string){
        super();
        this.sizeH = 20;
        this.sizeW = 40;
        this.color = "rgb(128,128,128)";
        this.name = n;
    }
    _addInput(i:Box){ if(!this._input || !this._input._active) this._input = i; }
    _get(){
        if(!this._input) return 0;
        console.log(this._input._get());
        return this._input._get();
    }
    _draw(){
        ctx.fillStyle = "#000000";
        ctx.fillText("Disp", this.posX + this.sizeW/8, this.posY+ this.sizeH/2);
        if(this._input){
            ctx.beginPath();
            ctx.moveTo(this.posX, this.posY+this.sizeH/2);
            ctx.lineTo(this._input.posX+this._input.sizeW, this._input.posY+this._input.sizeH/2);
            ctx.stroke();
        }
    }
    getName(){
        return this.name;
    }
}
class Box_NumericInput extends Box{
    name:string;
    constructor(n:string){
        super();
        this.sizeH = 20;
        this.sizeW = 40;
        this.color = "rgb(128,128,128)";
        this.name = n;
    }
    _get(){
        let val = document.getElementById(this.name) as HTMLInputElement;
        if(!val) return 0;
        return +val.value;
    }
    _draw(){
        ctx.fillStyle = "#000000";
        ctx.fillText("Input", this.posX + this.sizeW/8, this.posY+ this.sizeH/2);
    }
    getName(){
        return this.name;
    }
}

// Setup:
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

const width:number = canvas.width;// = window.innerWidth;
const height:number = canvas.height;// = window.innerHeight;

let containerBoxes:Box[] = [];

// Input:
let boxSelected:boolean = false;
let mouseOffsetX:number = 0;
let mouseOffsetY:number = 0;
let wireing:boolean = false;
let wireSource:Box;
let boxClear:boolean = false;

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function mousePressed(evt){
    let pos = getMousePos(canvas, evt);
    // Box select
    for(let i = 0; i < containerBoxes.length; i++){
        let x1:number = containerBoxes[i].posX;
        let y1:number = containerBoxes[i].posY;
        let x2:number = x1 + containerBoxes[i].sizeW;
        let y2:number = y1 + containerBoxes[i].sizeH;
        if(pos.x > x1 && pos.x < x2 && pos.y > y1 && pos.y < y2){
            boxSelected = true;
            mouseOffsetX = pos.x - x1;
            mouseOffsetY = pos.y - y1;
            
            
            if(containerBoxes.length > 1){
                let item = containerBoxes.splice(i, 1);
                containerBoxes.splice(0, 0, item[0]);
            }
            // Wireing
            if(wireing){
                if(!wireSource)
                wireSource = containerBoxes[0];
                else{
                    containerBoxes[0]._addInput(wireSource);
                    wireSource = null;
                    wireing = false;
                }
            }
            
            // delete box
            if(boxClear){
                let b = containerBoxes[0];
                containerBoxes.splice(0,1);
                for(let a in b){
                    delete b[a];
                }
                b._active = false;
                boxClear = false;
            }
            
            return;
        }
    }
}

function mouseReleased(){
    boxSelected = false;
    mouseOffsetX = 0;
    mouseOffsetY = 0;
}

function mouseMoved(evt){
    let pos = getMousePos(canvas, evt);
    if(boxSelected){
        containerBoxes[0].move(pos.x, pos.y);
    }
}

function addBox(type:number){
    let b:Box;
    let v:any;
    switch (type) {
        case 1:
            v = +prompt("NUMERIC Value:");
            b = new Box_Number(v);
            break;
        case 2:
            v = prompt("Numeric Operator (+-*/):");
            if(v == "+")
                b = new Box_Add();
            else if(v == "-")
                b = new Box_Subtract();
            else if(v == "*")
                b = new Box_Multiply();
            else if(v == "/")
                b = new Box_Divide();
            else{
                alert("Wrong input");
                return;
            }
            break;
        case 3:
            v = prompt("Display Name:");
            b = new Box_NumericDisplay(v);
            break;
        case 4:
            v = prompt("Input Name:");
            b = new Box_NumericInput(v);
            break;
        default:
            return;
            break;
    }
    b.posX = 0;
    b.posY = 0;
    containerBoxes.push(b)
    input();
}

function wire(){
    boxClear = false;
    wireing = true;
}

// Run:
function loop(){
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,width,height);

    for(let i = containerBoxes.length-1; i >= 0; i--){
        containerBoxes[i].draw();
    }

    requestAnimationFrame(loop);
}

let inputTable = document.getElementById("iTable");
function input(){
    while(inputTable.firstChild) inputTable.removeChild(inputTable.firstChild);
    for(let i = 0; i < containerBoxes.length; i++){
        if(containerBoxes[i] instanceof Box_NumericInput){
            let row = document.createElement("tr");
            let rowName = document.createElement("td");
            rowName.innerHTML = containerBoxes[i].getName() + ":";
            let rowValue = document.createElement("input");
            rowValue.type = "number";
            rowValue.id = containerBoxes[i].getName();
            row.appendChild(rowName);
            row.appendChild(rowValue);
            inputTable.appendChild(row);
        }
    }
}
let outputTable = document.getElementById("oTable");
function run(){
    while(outputTable.firstChild) outputTable.removeChild(outputTable.firstChild);
    for(let i = 0; i < containerBoxes.length; i++){
        if(containerBoxes[i] instanceof Box_NumericDisplay){
            let row = document.createElement("tr");
            let rowName = document.createElement("td");
            rowName.innerHTML = containerBoxes[i].getName() + ":";
            let rowValue = document.createElement("td");
            rowValue.innerHTML = containerBoxes[i]._get().toString();
            row.appendChild(rowName);
            row.appendChild(rowValue);
            outputTable.appendChild(row);
        }
    }
}

function clearOne(){
    wireing = false;
    wireSource = null;
    boxClear = true;
    input();
}

function clearAll(){
    containerBoxes = [];
}

let ip = new Box_NumericInput("temp");
ip.posX = 50;
ip.posY = 100;
let n1 = new Box_Number(1.8);
n1.posX = 50;
n1.posY = 30;
let n2 = new Box_Number(32);
n2.posX = 50;
n2.posY = 200;
let o1 = new Box_Multiply();
o1.posX = 120;
o1.posY = 50;
o1._addInput1(n1);
o1._addInput2(ip);
let o2 = new Box_Subtract();
o2.posX = 120;
o2.posY = 150;
o2._addInput1(ip);
o2._addInput2(n2);
let n3 = new Box_Number(32);
n3.posX = 200;
n3.posY = 100;
let n4 = new Box_Number(1.8);
n4.posX = 200;
n4.posY = 200;
let o3 = new Box_Add();
o3.posX = 240;
o3.posY = 70;
o3._addInput1(o1);
o3._addInput2(n3);
let o4 = new Box_Divide();
o4.posX = 240;
o4.posY = 180;
o4._addInput1(o2);
o4._addInput2(n4);
let f = new Box_NumericDisplay("to Farenheit");
f.posX = 350;
f.posY = 80;
f._addInput(o3);
let c = new Box_NumericDisplay("to Celsius");
c.posX = 350;
c.posY = 200;
c._addInput(o4);

containerBoxes.push(ip);
containerBoxes.push(n1);
containerBoxes.push(n2);
containerBoxes.push(n3);
containerBoxes.push(n4);
containerBoxes.push(o1);
containerBoxes.push(o2);
containerBoxes.push(o3);
containerBoxes.push(o4);
containerBoxes.push(f);
containerBoxes.push(c);

input();
run();

loop();