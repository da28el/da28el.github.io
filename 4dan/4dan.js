// Import the functions you need from the SDKs you need
//import { initializeApp } from "/firebase/app";
//import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
//import { getDatabase, ref, set, onValue } from "firebase/database";
//import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCAIrPQoI40g6-oWCHbUasXgeZkgX2z-ik",
    authDomain: "dan-6d4d3.firebaseapp.com",
    projectId: "dan-6d4d3",
    storageBucket: "dan-6d4d3.appspot.com",
    messagingSenderId: "357440660226",
    appId: "1:357440660226:web:54128eec70fc8fb507d81b",
    databaseURL: "https://dan-6d4d3-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

document.getElementById("msg-form").addEventListener("submit", sendMessage);

var user_input = prompt("username:");
while(user_input.toLocaleLowerCase() == "admin"){
    alert("Eric försök inte ens");
    user_input = prompt("username:");
}
const cipher = prompt("key:");
const user = encrypt(user_input, cipher);
user_input = "";

function sendMessage(e){
    e.preventDefault();
    const msgInput = document.getElementById("msg-input");
    if(msgInput.value == "") return;
    const msg = encrypt(msgInput.value, cipher);
    const timestap = Date.now().toString()

    msgInput.value = "";

    document
        .getElementById("msgs")
        .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest"});

    db.ref("messages/" + timestap).set({
        user,
        msg,
    });
}

const fetchChat = db.ref("messages/");

fetchChat.on("child_added", function(snapshot){
    const msgs = snapshot.val();
    if(decrypt(msgs.user,cipher) == "" && cipher != "0") return;
    var msg;
    if(isValidHttpUrl(decrypt(msgs.msg, cipher))){
        msg = `<li class=${
            decrypt(user,cipher) === decrypt(msgs.user,cipher) ? "sent" : "receive"
            }><span>${decrypt(msgs.user, cipher)}: </span><img src="${decrypt(msgs.msg, cipher)}" width=100% height=100%></li>`;
    } else {
        msg = `<li class=${
            decrypt(user,cipher) === decrypt(msgs.user,cipher) ? "sent" : "receive"
            }><span>${decrypt(msgs.user, cipher)}: </span>${decrypt(msgs.msg, cipher)}</li>`;
    }
    
      document.getElementById("msgs").innerHTML += msg;
})

function encrypt(msg, cipher){
    if(!msg) msg = "";
    return window.btoa(CryptoJS.AES.encrypt(msg, cipher).toString());
}

function decrypt(msg, cipher){
    if(!msg) msg = "";
    try {
        return CryptoJS.AES.decrypt(window.atob(msg), cipher).toString(CryptoJS.enc.Utf8);
    } catch (_) {
        return "";
    }

}

function isValidHttpUrl(string) {
    var url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
