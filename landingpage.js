import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
import { TAARenderPass } from 'three/addons/postprocessing/TAARenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

// BASE SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xffffff );

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 0, 3);

// RENDERER
const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap 
renderer.setClearColor(0xffffff)
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.gammaOutput = true;
renderer.gammaInput = true;
renderer.gammaFactor = 12.2;
document.body.appendChild( renderer.domElement );

// MODEL LOADING
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'jsm/libs/draco/gltf/' );
const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

let model, pointer, confirm;
let interactable_front_names = ["CPU", "IC1", "IC2", "IC3", "IC4", "IC5"];
let interactable_back_names = ["RETURN", "MEINKRAFT", "RAYCAST", "LORENTZ", "EM"];
let interactables_front = [];
let interactables_back = [];

loader.load( './public/pcb1.glb', function (glft) {
    console.log(glft)
    model = glft.scene;
    model.position.set(0, 0, 2.25);
    model.traverse((node)=>{
        if (node.isMesh) {
            node.castShadow = true;
            node.recieveShadow = true;
        }
    });
    scene.add(model);
    for (let c of model.children) {
        if (interactable_front_names.includes(c.name))
            interactables_front.push(c);
        else if (interactable_back_names.includes(c.name))
            interactables_back.push(c);
    }
}, undefined, ( error ) => console.error(error));

loader.load('./public/soldering_iron.glb', (glft) => {
    pointer = glft.scene;
    pointer.position.set(0, 0, 2.5);
    pointer.scale.set(0.025, 0.025, 0.025);
    pointer.rotation.set(Math.PI/2 + 0.6, 0, -0.75)
    pointer.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.recieveShadow = true;
        }
    });
    scene.add(pointer);
}, undefined, (error) => console.error(error));

loader.load('./public/AREYOUSURE.glb', (glft) => {
    confirm = glft.scene;
    confirm.position.set(0, 1, 2.4);
    confirm.scale.set(0.25, 0.25, 0.25);
    confirm.rotation.set(Math.PI, 0, Math.PI);

    confirm.traverse((node) => {
        if (node.isMesh) {
            node.castShadow = true;
            node.recieveShadow = true;
        }
        if (node.name === "YES" || node.name === "NO")
            interactables_front.push(node);
    });
    scene.add(confirm);
}, undefined, (error) => console.error(error));

// CONTROLS
const mouse = new THREE.Vector2();
const controls = {
    update() {
        if (model && !animation && animationProgress < 2) {
            const c = 0.25;
            const x = model.rotation.x;
            const z = model.rotation.z;
            const targetX = Math.PI/2 + mouse.y / 12;
            const targetZ = mouse.x / 16 + animationProgress * Math.PI;
            model.rotation.set(x + c*(targetX - x), 0, z + c*(targetZ - z));    
        }
        if (pointer) {
            let ss = new THREE.Vector3(); // screen space
            let ws = new THREE.Vector3(); // world space
            let z = 2.5;
            
            ss.set(mouse.x, mouse.y, 0.5);
            ss.unproject( camera );
            ss.sub( camera.position ).normalize();
            var distance = (z - camera.position.z) / ss.z;
            ws.copy(camera.position).add(ss.multiplyScalar(distance));
            pointer.position.copy(ws);
        }
    }
}

// LIGHTS
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(-1, 2, 5);
dirLight.castShadow = true;
scene.add(dirLight);
const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambLight);

// POST
const composer = new EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);

const renderPass = new RenderPass(scene, camera);
const saoPass = new SAOPass(scene, camera);
saoPass.params.saoBias = 0.5;
saoPass.params.saoIntensity = 0.0012;
saoPass.params.saoScale = 0.3;
saoPass.params.saoKernelRadius = 40;
saoPass.params.saoMinResolution = 0;
const taaPass = new TAARenderPass(scene, camera);
taaPass.sampleLevel = 5;

const outlinePass = new OutlinePass( new THREE.Vector2( window.innerWidth, window.innerHeight ), scene, camera );
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 0.0;
outlinePass.edgeThickness = 1;
outlinePass.visibleEdgeColor.set( "#4c93e4" );
outlinePass.hiddenEdgeColor.set( new THREE.Color('black') );

const outputPass = new OutputPass();
composer.addPass(renderPass);
composer.addPass(saoPass);
composer.addPass(taaPass);
composer.addPass(outlinePass);
composer.addPass(outputPass);

// RAYCAST
const raycaster = new THREE.Raycaster();

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.render(scene, camera);
}

document.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(evt) {
    evt.preventDefault();
    mouse.set((evt.clientX / window.innerWidth) * 2 - 1, -(evt.clientY / window.innerHeight) * 2 + 1);
    if (animation) {
        outlinePass.selectedObjects = [];
        return;
    }
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(animationProgress === 1 ? interactables_back : interactables_front, true);
    outlinePass.selectedObjects = [];
    for (let collision of intersects) {
        outlinePass.selectedObjects = [collision.object];
    }
}


// document.addEventListener('mousedown', (evt) => {evt.preventDefault()}, false);

document.addEventListener('mouseup', onMouseClick, false);
function onMouseClick(evt) {
    if (!outlinePass.selectedObjects.length) return;
    console.log(outlinePass.selectedObjects[0]);
    const selectedName = outlinePass.selectedObjects[0].name;
    if (selectedName === "CPU_1") {
        animation = "CPU";
    }
    if (selectedName === "RETURN") {
        animation = "RETURN";
    }
    if (selectedName === "IC1_1") {
        updateCursor();
    }
    if (selectedName === "IC4_1") {
        animation = "LEGACY1";
    }
    if (selectedName === "YES") {
        // redirect
        window.location.href = "https://da28el.github.io/";
    }
    if (selectedName === "NO") {
        animation = "LEGACY2";
    }
    if (selectedName === "MEINKRAFT") {
        window.location.href = "https://da28el.github.io/MeinKraft2/index.html";
    }
    if (selectedName === "RAYCAST") {
        window.location.href = "https://da28el.github.io/raycast/raycast.html";
    }
    if (selectedName === "LORENTZ") {
        window.location.href = "https://da28el.github.io/ode/lorentz3d.html";
    }
    if (selectedName === "EM") {
        window.location.href = "https://da28el.github.io/em/em.html";
    }
}

let cursor = 0; 
function updateCursor() {
    const canvas = document.querySelector("canvas");
    switch (cursor) {
        case 0:
            canvas.style.cursor = "default";
            pointer.visible = false;
            break;
        case 1:
            canvas.style.cursor = "url('./public/CURSOR.svg'), auto"
            pointer.visible = false;
            break;
        case 2:
            canvas.style.cursor = "none";
            pointer.visible = true;
            break;
    }
    cursor = (cursor + 1) % 3;
}

let animation = false;
let animationProgress = 0;

function animate() {

    if (animation === "CPU") {
        const z = model.rotation.z;
        if (Math.abs(z - Math.PI) < Math.PI / 75) {
            animation = null;
            animationProgress = 1;
        } else {
            model.rotateZ(Math.PI / 100);
            model.position.z -= Math.sin(2*z) / 25;
        }
    } else
    if (animation === "RETURN") {
        const z = model.rotation.z;
        if (Math.abs(z) < Math.PI / 75) {
            animation = null;
            animationProgress = 0;
        } else {
            model.rotateZ(-Math.PI / 100);
            model.position.z += Math.sin(2*z) / 25;
        }
    }
    if (animation === "LEGACY1") {
        const y = confirm.position.y;
        if (y < 0) {
            animation = null;
            animationProgress = 2;
        } else {
            confirm.position.y -= 0.05;
        }
    }
    if (animation === "LEGACY2") {
        const y = confirm.position.y;
        if (y > 1) {
            animation = null;
            animationProgress = 0;
        } else {
            confirm.position.y += 0.05;
        }
    }
    
}

function loop() {
    requestAnimationFrame(loop);
    animate();

    controls.update();
    composer.render();
} loop();

document.querySelector("canvas").oncontextmenu = function (e) { e.preventDefault(); e.stopPropagation(); }