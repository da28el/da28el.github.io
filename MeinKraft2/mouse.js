let Mouse = {
    _pressed: {},
    
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2,
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,

    isDown: function(keyCode){
        return this._pressed[keyCode];
    },
    onKeyDown: function(event) {
        if (document.pointerLockElement !== canvas)
            canvas.requestPointerLock();
        else
            this._pressed[event.button] = true;
    },  
    onKeyUp: function(event) {
        delete this._pressed[event.button];
    },
    onMouseMove(event) {
        if (document.pointerLockElement !== canvas)
            return;
        const rect = canvas.getBoundingClientRect();
        this.x = event.clientX - rect.left;
        this.y = event.clientY - rect.top;
        this.dx += event.movementX;
        this.dy += event.movementY;  
    },
    onMouseLeave(event) {
        this.reset();
    },
    reset: function(){
        this._pressed = {};
        this.x = 0;
        this.y = 0;
        this.dx = 0;
        this.dy = 0;
    },
    requestFullscreen() {
        const element = document.querySelector("canvas");
        if(element.requestFullscreen) {
            element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if(element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
};

const canvas = document.querySelector("#glcanvas");

canvas.addEventListener('mouseup',      function(event) { Mouse.onKeyUp(event);     });
canvas.addEventListener('mousedown',    function(event) { Mouse.onKeyDown(event);   });
canvas.addEventListener('mousemove',    function(event) { Mouse.onMouseMove(event); });
canvas.addEventListener('mouseleave',   function(event) { Mouse.onMouseLeave(event);});

export { Mouse };