let Key = {
    _pressed: {},
    
    SPACE: 32,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    Q: 81,
    E: 69,
    SPACE: 32,
    SHIFT: 16,
    CTRL: 17,

    isDown: function(keyCode){
        return this._pressed[keyCode];
    },
    onKeyDown: function(event) {
        this._pressed[event.keyCode] = true;
    },  
    onKeyUp: function(event) {
        delete this._pressed[event.keyCode];
    },
    reset: function(){
        this._pressed = {};
    }
};

window.addEventListener('keyup', function(event) { Key.onKeyUp(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeyDown(event); }, false);

export {Key};