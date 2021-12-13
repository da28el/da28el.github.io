var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Box = /** @class */ (function () {
    function Box() {
        this._active = true;
    }
    Box.prototype.draw = function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.posX, this.posY, this.sizeW, this.sizeH);
        this._draw();
    };
    Box.prototype.move = function (x, y) {
        var rv = true;
        // UNGUARDED
        // this.posX = x - mouseOffsetX;
        // this.posY = y - mouseOffsetY;
        // EDGEGUARDED
        var xp = x - mouseOffsetX;
        var yp = y - mouseOffsetY;
        var xrange = xp + this.sizeW;
        var yrange = yp + this.sizeH;
        if (xp > 0 && xrange < width)
            this.posX = xp;
        else
            rv = false;
        if (yp > 0 && yrange < height)
            this.posY = yp;
        else
            rv = false;
        return rv;
    };
    Box.prototype.getName = function () {
        return "";
    };
    // Backend
    Box.prototype._get = function () {
        return;
    };
    Box.prototype._draw = function () {
        return;
    };
    Box.prototype._addInput = function (i) {
        return;
    };
    return Box;
}());
// Boxes
var Box_Number = /** @class */ (function (_super) {
    __extends(Box_Number, _super);
    function Box_Number(n) {
        var _this = _super.call(this) || this;
        _this._value = n;
        _this.sizeH = 30;
        _this.sizeW = 20;
        _this.color = "rgb(128,255,128)";
        return _this;
    }
    Box_Number.prototype._get = function () { return this._value; };
    Box_Number.prototype._draw = function () {
        ctx.fillStyle = "#000000";
        ctx.fillText(this._value.toString(), this.posX + this.sizeW / 4, this.posY + this.sizeH / 2);
    };
    return Box_Number;
}(Box));
var Box_NumericOperator = /** @class */ (function (_super) {
    __extends(Box_NumericOperator, _super);
    function Box_NumericOperator() {
        var _this = _super.call(this) || this;
        _this._input1 = null;
        _this._input2 = null;
        _this.sizeH = 40;
        _this.sizeW = 40;
        _this.color = "rgb(255, 128, 128)";
        return _this;
    }
    Box_NumericOperator.prototype._addInput = function (i) {
        if (!this._input1 || !this._input1._active)
            this._input1 = i;
        else if (!this._input2 || !this._input2._active)
            this._input2 = i;
    };
    Box_NumericOperator.prototype._addInput1 = function (i1) { this._input1 = i1; };
    ;
    Box_NumericOperator.prototype._addInput2 = function (i2) { this._input2 = i2; };
    Box_NumericOperator.prototype._get = function () { return; };
    Box_NumericOperator.prototype._draw = function () {
        ctx.fillStyle = "#000000";
        ctx.fillText(this.text, this.posX + this.sizeW / 2, this.posY + this.sizeH / 2);
        ctx.strokeStyle = "rgb(255,0,0)";
        if (this._input1) {
            ctx.beginPath();
            ctx.moveTo(this.posX, this.posY + this.sizeH * 1 / 3);
            ctx.lineTo(this._input1.posX + this._input1.sizeW, this._input1.posY + this._input1.sizeH / 2);
            ctx.stroke();
        }
        if (this._input2) {
            ctx.beginPath();
            ctx.moveTo(this.posX, this.posY + this.sizeH * 2 / 3);
            ctx.lineTo(this._input2.posX + this._input2.sizeW, this._input2.posY + this._input2.sizeH / 2);
            ctx.stroke();
        }
    };
    return Box_NumericOperator;
}(Box));
var Box_Add = /** @class */ (function (_super) {
    __extends(Box_Add, _super);
    function Box_Add() {
        var _this = _super.call(this) || this;
        _this.text = "+";
        return _this;
    }
    Box_Add.prototype._get = function () { return (this._input1._get() + this._input2._get()); };
    return Box_Add;
}(Box_NumericOperator));
var Box_Subtract = /** @class */ (function (_super) {
    __extends(Box_Subtract, _super);
    function Box_Subtract() {
        var _this = _super.call(this) || this;
        _this.text = "-";
        return _this;
    }
    Box_Subtract.prototype._get = function () { return (this._input1._get() - this._input2._get()); };
    return Box_Subtract;
}(Box_NumericOperator));
var Box_Multiply = /** @class */ (function (_super) {
    __extends(Box_Multiply, _super);
    function Box_Multiply() {
        var _this = _super.call(this) || this;
        _this.text = "*";
        return _this;
    }
    Box_Multiply.prototype._get = function () { return (this._input1._get() * this._input2._get()); };
    return Box_Multiply;
}(Box_NumericOperator));
var Box_Divide = /** @class */ (function (_super) {
    __extends(Box_Divide, _super);
    function Box_Divide() {
        var _this = _super.call(this) || this;
        _this.text = "/";
        return _this;
    }
    Box_Divide.prototype._get = function () { return (this._input1._get() / this._input2._get()); };
    return Box_Divide;
}(Box_NumericOperator));
var Box_NumericDisplay = /** @class */ (function (_super) {
    __extends(Box_NumericDisplay, _super);
    function Box_NumericDisplay(n) {
        var _this = _super.call(this) || this;
        _this._input = null;
        _this.sizeH = 20;
        _this.sizeW = 40;
        _this.color = "rgb(128,128,128)";
        _this.name = n;
        return _this;
    }
    Box_NumericDisplay.prototype._addInput = function (i) { if (!this._input || !this._input._active)
        this._input = i; };
    Box_NumericDisplay.prototype._get = function () {
        if (!this._input)
            return 0;
        console.log(this._input._get());
        return this._input._get();
    };
    Box_NumericDisplay.prototype._draw = function () {
        ctx.fillStyle = "#000000";
        ctx.fillText("Disp", this.posX + this.sizeW / 8, this.posY + this.sizeH / 2);
        if (this._input) {
            ctx.beginPath();
            ctx.moveTo(this.posX, this.posY + this.sizeH / 2);
            ctx.lineTo(this._input.posX + this._input.sizeW, this._input.posY + this._input.sizeH / 2);
            ctx.stroke();
        }
    };
    Box_NumericDisplay.prototype.getName = function () {
        return this.name;
    };
    return Box_NumericDisplay;
}(Box));
var Box_NumericInput = /** @class */ (function (_super) {
    __extends(Box_NumericInput, _super);
    function Box_NumericInput(n) {
        var _this = _super.call(this) || this;
        _this.sizeH = 20;
        _this.sizeW = 40;
        _this.color = "rgb(128,128,128)";
        _this.name = n;
        return _this;
    }
    Box_NumericInput.prototype._get = function () {
        var val = document.getElementById(this.name);
        if (!val)
            return 0;
        return +val.value;
    };
    Box_NumericInput.prototype._draw = function () {
        ctx.fillStyle = "#000000";
        ctx.fillText("Input", this.posX + this.sizeW / 8, this.posY + this.sizeH / 2);
    };
    Box_NumericInput.prototype.getName = function () {
        return this.name;
    };
    return Box_NumericInput;
}(Box));
// Setup:
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width; // = window.innerWidth;
var height = canvas.height; // = window.innerHeight;
var containerBoxes = [];
// Input:
var boxSelected = false;
var mouseOffsetX = 0;
var mouseOffsetY = 0;
var wireing = false;
var wireSource;
var boxClear = false;
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
function mousePressed(evt) {
    var pos = getMousePos(canvas, evt);
    // Box select
    for (var i = 0; i < containerBoxes.length; i++) {
        var x1 = containerBoxes[i].posX;
        var y1 = containerBoxes[i].posY;
        var x2 = x1 + containerBoxes[i].sizeW;
        var y2 = y1 + containerBoxes[i].sizeH;
        if (pos.x > x1 && pos.x < x2 && pos.y > y1 && pos.y < y2) {
            boxSelected = true;
            mouseOffsetX = pos.x - x1;
            mouseOffsetY = pos.y - y1;
            if (containerBoxes.length > 1) {
                var item = containerBoxes.splice(i, 1);
                containerBoxes.splice(0, 0, item[0]);
            }
            // Wireing
            if (wireing) {
                if (!wireSource)
                    wireSource = containerBoxes[0];
                else {
                    containerBoxes[0]._addInput(wireSource);
                    wireSource = null;
                    wireing = false;
                }
            }
            // delete box
            if (boxClear) {
                var b = containerBoxes[0];
                containerBoxes.splice(0, 1);
                for (var a in b) {
                    delete b[a];
                }
                b._active = false;
                boxClear = false;
            }
            return;
        }
    }
}
function mouseReleased() {
    boxSelected = false;
    mouseOffsetX = 0;
    mouseOffsetY = 0;
}
function mouseMoved(evt) {
    var pos = getMousePos(canvas, evt);
    if (boxSelected) {
        containerBoxes[0].move(pos.x, pos.y);
    }
}
function addBox(type) {
    var b;
    var v;
    switch (type) {
        case 1:
            v = +prompt("NUMERIC Value:");
            b = new Box_Number(v);
            break;
        case 2:
            v = prompt("Numeric Operator (+-*/):");
            if (v == "+")
                b = new Box_Add();
            else if (v == "-")
                b = new Box_Subtract();
            else if (v == "*")
                b = new Box_Multiply();
            else if (v == "/")
                b = new Box_Divide();
            else {
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
    containerBoxes.push(b);
    input();
}
function wire() {
    boxClear = false;
    wireing = true;
}
// Run:
function loop() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    for (var i = containerBoxes.length - 1; i >= 0; i--) {
        containerBoxes[i].draw();
    }
    requestAnimationFrame(loop);
}
var inputTable = document.getElementById("iTable");
function input() {
    while (inputTable.firstChild)
        inputTable.removeChild(inputTable.firstChild);
    for (var i = 0; i < containerBoxes.length; i++) {
        if (containerBoxes[i] instanceof Box_NumericInput) {
            var row = document.createElement("tr");
            var rowName = document.createElement("td");
            rowName.innerHTML = containerBoxes[i].getName() + ":";
            var rowValue = document.createElement("input");
            rowValue.type = "number";
            rowValue.value = "0";
            rowValue.id = containerBoxes[i].getName();
            row.appendChild(rowName);
            row.appendChild(rowValue);
            inputTable.appendChild(row);
        }
    }
}
var outputTable = document.getElementById("oTable");
function run() {
    while (outputTable.firstChild)
        outputTable.removeChild(outputTable.firstChild);
    for (var i = 0; i < containerBoxes.length; i++) {
        if (containerBoxes[i] instanceof Box_NumericDisplay) {
            var row = document.createElement("tr");
            var rowName = document.createElement("td");
            rowName.innerHTML = containerBoxes[i].getName() + ":";
            var rowValue = document.createElement("td");
            rowValue.innerHTML = containerBoxes[i]._get().toString();
            row.appendChild(rowName);
            row.appendChild(rowValue);
            outputTable.appendChild(row);
        }
    }
}
function clearOne() {
    wireing = false;
    wireSource = null;
    boxClear = true;
    input();
}
function clearAll() {
    containerBoxes = [];
}
var ip = new Box_NumericInput("temp");
ip.posX = 50;
ip.posY = 100;
var n1 = new Box_Number(1.8);
n1.posX = 50;
n1.posY = 30;
var n2 = new Box_Number(32);
n2.posX = 50;
n2.posY = 200;
var o1 = new Box_Multiply();
o1.posX = 120;
o1.posY = 50;
o1._addInput1(n1);
o1._addInput2(ip);
var o2 = new Box_Subtract();
o2.posX = 120;
o2.posY = 150;
o2._addInput1(ip);
o2._addInput2(n2);
var n3 = new Box_Number(32);
n3.posX = 200;
n3.posY = 100;
var n4 = new Box_Number(1.8);
n4.posX = 200;
n4.posY = 200;
var o3 = new Box_Add();
o3.posX = 240;
o3.posY = 70;
o3._addInput1(o1);
o3._addInput2(n3);
var o4 = new Box_Divide();
o4.posX = 240;
o4.posY = 180;
o4._addInput1(o2);
o4._addInput2(n4);
var f = new Box_NumericDisplay("to Farenheit");
f.posX = 350;
f.posY = 80;
f._addInput(o3);
var c = new Box_NumericDisplay("to Celsius");
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
