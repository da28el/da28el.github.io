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

let user_input = prompt("username:");
const cipher = prompt("key:");
const user = encrypt(user_input, cipher);
user_input = "";

function sendMessage(e){
    e.preventDefault();
    const msgInput = document.getElementById("msg-input");
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
    //if(decrypt(msgs.user,cipher) == "") return;
    const msg = `<li class=${
        decrypt(user,cipher) === decrypt(msgs.user,cipher) ? "sent" : "receive"
      }><span>${decrypt(msgs.user, cipher)}: </span>${decrypt(msgs.msg, cipher)}</li>`;
      document.getElementById("msgs").innerHTML += msg;
})

function encrypt(msg, cipher){
    if(!msg) msg = "";
    return window.btoa(CryptoJS.AES.encrypt(msg, cipher).toString());
}

function decrypt(msg, cipher){
    if(!msg) msg = "";
    const m = CryptoJS.AES.decrypt(window.atob(msg), cipher).toString(CryptoJS.enc.Utf8);
    if(m = "") return "🔒";
    else return m;
}
