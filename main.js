import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// BASE SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;

// RENDERER
const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// MODEL LOADING
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'jsm/libs/draco/gltf/' );
const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

let model;

loader.load( './public/myRoomBaked.glb', function (glft) {    
    model = glft.scene;
    model.position.set(0.368,-0.69,0);
    model.traverse((node)=>{
        if (node.isMesh) {
            node.castShadow = true;
            node.recieveShadow = true;
        }
    });
    scene.add(model);
}, undefined, ( error ) => console.error(error));


// LIGHTS
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(-1, 2, 5);
dirLight.castShadow = true;
scene.add(dirLight);
const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambLight);

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}

function lerp(a, b, t) {
    return a + t*(b - a)
}

let scrollPercent = 0;
function scalePercent(start, end) {
    return (scrollPercent - start) / (end - start);
}

const animationScript = (start, end, func) => {return { start: start, end: end, func: func }};
let animationScripts = [];


animationScripts.push(animationScript(0, 101, ()=>{
    camera.position.z = Math.max(5*scalePercent(100, 0), 0) + 0.15;
}));

animationScripts.push(animationScript(0, 90, ()=>{
    camera.rotation.x = 0;
}));

animationScripts.push(animationScript(90, 101, ()=>{
    camera.rotation.x = Math.min(0, -0.085*scalePercent(90, 101));
}));

animationScripts.push(animationScript(100, 101, ()=>{
    window.location.replace("./homepage.html");
    window.location.href = "./homepage.html"
}));



function playScrollAnimations() {
    animationScripts.forEach((a) => {
        if (scrollPercent >= a.start && scrollPercent < a.end)
            a.func();
    })
}

document.body.onscroll = () => {
    scrollPercent = 
        ((document.documentElement.scrollTop || document.body.scrollTop) /
            ((document.documentElement.scrollHeight || document.body.scrollHeight) -
                document.documentElement.clientHeight))*100;
    //document.getElementById('scrollProgress').innerText = 'Scroll Progress : ' + scrollPercent.toFixed(2);
}

function animate() {
    requestAnimationFrame(animate);

    playScrollAnimations();

	renderer.render( scene, camera );
}

window.scrollTo({top:0, behavior:'smooth'})
animate();

// Preload images for smooth transition
// let preloadedImages = [];
// function preloadImagesFromPage(url) {
//     fetch(url)
//         .then(response => response.text())
//         .then(html => {
//             const tempDiv = document.createElement('div');
//             tempDiv.innerHTML = html;

//             const images = tempDiv.querySelectorAll('img');
//             images.forEach(img => {
//                 const newImg = new Image();
//                 newImg.src = img.src;
//                 preloadedImages.push(newImg);
//             });

//             // console.log("Images preloaded:", preloadedImages);
//         })
//         .catch(error => console.error('Failed to preload images:', error));
// }
// preloadImagesFromPage('homepage.html');