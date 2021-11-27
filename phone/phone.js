function detectMob() {
    var toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];
    return toMatch.some(function (toMatchItem) {
        return navigator.userAgent.match(toMatchItem);
    });
}
var ongoingTouches = [];
function startup() {
    if (!detectMob()) {
        alert("Get on ur phone if u want to play with me ;)");
        window.location.href = '../index.html';
    }
    var el = document.getElementById("canvas");
    el.addEventListener("touchstart", handleStart, false);
    el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleCancel, false);
    el.addEventListener("touchmove", handleMove, false);
}
document.addEventListener("DOMContentLoaded", startup);
function handleStart(evt) {
    evt.preventDefault();
    console.log("touchstart.");
    var el = document.getElementById("canvas");
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        console.log("touchstart: " + i + "...");
        ongoingTouches.push(copyTouch(touches[i]));
        var color = colorForTouch(touches[i]);
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(touches[i].pageX, touches[i].pageY, 4, 0, 2 * Math.PI, false);
        ctx.fill();
        console.log("touchstart: " + i + ".");
    }
}
function handleMove(evt) {
    evt.preventDefault();
    var el = document.getElementById("canvas");
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        var color = colorForTouch(touches[i]);
        var idx = ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {
            console.log("continuing touch " + idx);
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.lineWidth = 4;
            ctx.strokeStyle = color;
            ctx.stroke();
            ongoingTouches.splice(idx, 1, copyTouch(touches[i]));
            console.log(".");
        }
        else {
            console.log("Unknown touch to continue");
        }
    }
}
function handleEnd(evt) {
    evt.preventDefault();
    log("touchend");
    var el = document.getElementById("canvas");
    var ctx = el.getContext("2d");
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        var color = colorForTouch(touches[i]);
        var idx = ongoingTouchIndexById(touches[i].identifier);
        if (idx >= 0) {
            ctx.lineWidth = 4;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[idx].pageX, ongoingTouches[idx].pageY);
            ctx.lineTo(touches[i].pageX, touches[i].pageY);
            ctx.fillRect(touches[i].pageX - 4, touches[i].pageY - 4, 8, 8);
            ongoingTouches.splice(idx, 1);
        }
        else {
            console.log("Unknown touch to end");
        }
    }
}
function handleCancel(evt) {
    evt.preventDefault();
    console.log("touchcalcel.");
    var touches = evt.changedTouches;
    for (var i = 0; i < touches.length; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier);
        ongoingTouches.splice(idx, 1);
    }
}
function colorForTouch(touch) {
    var r = touch.identifier % 16;
    var g = Math.floor(touch.identifier / 3) % 16;
    var b = Math.floor(touch.identifier / 7) % 16;
    var R = r.toString(16);
    var G = g.toString(16);
    var B = b.toString(16);
    var color = "#" + R + G + B;
    return color;
}
function copyTouch(_a) {
    var identifier = _a.identifier, pageX = _a.pageX, pageY = _a.pageY;
    return { identifier: identifier, pageX: pageX, pageY: pageY };
}
function ongoingTouchIndexById(idToFind) {
    for (var i = 0; i < ongoingTouches.length; i++) {
        var id = ongoingTouches[i].identifier;
        if (id == idToFind) {
            return i;
        }
    }
    return -1;
}
function log(msg) {
    var p = document.getElementById('log');
    p.innerHTML = msg + "\n" + p.innerHTML;
}
