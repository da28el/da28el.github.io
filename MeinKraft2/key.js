let Key = {
    _pressed: {},
    
    SPACE: 32,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    Q: 81,
    E: 69,
    L: 76,
    SPACE: 32,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    N1: 49,
    N2: 50,
    N3: 51,
    N4: 52,
    N5: 53,

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
    },
    release: function(keyCode){
        delete this._pressed[keyCode];
    }
};

window.addEventListener('keyup',    function(event) { Key.onKeyUp(event);   }, false);
window.addEventListener('keydown',  function(event) { Key.onKeyDown(event); }, false);

export {Key};