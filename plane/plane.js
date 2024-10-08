import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AirplaneControls } from 'airplane';

let camera, controls, scene, renderer;
let model;
let dirLight, ambLight;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('jsm/libs/draco/gltf/');
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

const clock = new THREE.Clock();

init();

function init() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = 0.5;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.fog = new THREE.FogExp2(0xcccccc, 0.1);

    // LIGHTS
    dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(-1, 2, 5).normalize();
    dirLight.castShadow = true;
    scene.add(dirLight);

    ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambLight);

    // MODEL
    loader.load('./public/island.glb', function (glft) {
        model = glft.scene;
        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.recieveShadow = true;
            }
        });
        scene.add(model);
    }, undefined, (error) => console.error(error));

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    // CONTROLS
    controls = new AirplaneControls(camera, renderer.domElement);
    controls.domElement = renderer.domElement;

    // RESIZE
    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {

    const delta = clock.getDelta();
    
    controls.update(delta);

    renderer.render(scene, camera);
}
