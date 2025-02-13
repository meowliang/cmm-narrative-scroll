import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

//setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); //sets camera field of view

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'), //sets the camera to the DOM element
});

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
// camera.position.setZ(30);
camera.position.setZ(40);

// Create a gradient texture
const canvas = document.createElement('canvas');
canvas.width = 256; // Width of the gradient
canvas.height = 256; // Height of the gradient
const context = canvas.getContext('2d');

// Create the gradient
const gradient = context.createRadialGradient(
    canvas.width / 1.5, canvas.height / 2.5, 0, // Center and start radius
    canvas.width / 2, canvas.height / 2, canvas.width / 2 // End radius
);
gradient.addColorStop(0, '#FFFDEC'); // Top color
gradient.addColorStop(.64, '#81C7D3');
gradient.addColorStop(1, '#B1AFDA'); // Bottom color 

// Fill the canvas with the gradient
context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);

// Convert the canvas to a texture
const gradientTexture = new THREE.CanvasTexture(canvas);

// Set the gradient as the scene background
scene.background = gradientTexture;


// // cubemap

// const loader = new THREE.CubeTextureLoader();
// const texture = loader.load([
//     'assets/skybox/px.jpg', // Right
//     'assets/skybox/nx.jpg', // Left
//     'assets/skybox/py.jpg', // Top
//     'assets/skybox/ny.jpg', // Bottom
//     'assets/skybox/pz.jpg', // Back
//     'assets/skybox/nz.jpg', // Front
// ]);

// // Set the skybox as the scene background
// scene.background = texture;

//load objects into array to add animation

const objects = []; 
const textureLoader = new THREE.TextureLoader();
const folderPath = './imgs/';
const totalImages = 15;

//load images
for (let i=1; i <= totalImages; i++) {
    const texturePath = `${folderPath}${i}.jpg`;

    textureLoader.load(
        texturePath,
        (loadedTexture) => {
            objects.push(loadedTexture);

            const bgImg = new THREE.Mesh(
                new THREE.PlaneGeometry(20,20),
                new THREE.MeshBasicMaterial({ map: loadedTexture, side: THREE.DoubleSide })
            );
    
            const x = THREE.MathUtils.randFloatSpread(100); // Range: -10 to 10
            const y = THREE.MathUtils.randFloatSpread(100);
            const z = THREE.MathUtils.randFloatSpread(100);

            bgImg.position.set(x, y, z);

            const rX = THREE.MathUtils.randFloat(0, Math.PI * 2); // Range: -10 to 10
            const rY = THREE.MathUtils.randFloat(0, Math.PI * 2);
            const rZ = THREE.MathUtils.randFloat(0, Math.PI * 2);

            bgImg.rotation.set(rX, rY, rZ);

            scene.add(bgImg);

            objects.push({ mesh: bgImg });
        }, 
        undefined,
        (error) => {
            console.error(`error loading texture: ${texturePath}`, error);
        }
    );
}


//add lighting

const pointLight = new THREE.PointLight(0xffffff); //better for spotlighting
pointLight.position.set(20,5,10);

const ambientLight = new THREE.AmbientLight(0xffffff); //better for lighting up everything in the room
scene.add(pointLight, ambientLight);

// const lightHelper = new THREE.PointLightHelper(pointLight);
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper);

//add dragging interaction

const controls = new OrbitControls(camera, renderer.domElement); //listens for DOM events on the mouse and updates camera accordingly

function addStar() { //create random scattered objects in space
    const geometry = new THREE.SphereGeometry(0.25, 24, 24);
    const material = new THREE.MeshStandardMaterial( { color: 0xFFFDEC });
    const star = new THREE.Mesh( geometry, material );

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread( 100 )); //built in threejs function that generates random number between 1 and parameter. uses destructuring!

    star.position.set(x, y, z);
    scene.add(star);
}

Array(200).fill().forEach(addStar);


function moveCamera() { //defines interacts that occur when the document is scrolled

    const t = document.body.getBoundingClientRect().top; //gives us dimensions of the viewport so that camera position can be mapped to it when it changes

    camera.position.z = t * -0.01;
    camera.position.x = t * -0.0002;
    camera.position.y = t * -0.0002;

    // objects.forEach(({ mesh }) => {
    //         mesh.rotation.x += -0.01;
    //         mesh.rotation.y += -0.005;
    //         mesh.rotation.z += 0.005;
    //     });
    
}

document.body.onscroll = moveCamera; //camera interacts when the user scrolls the page

function animate() {
    requestAnimationFrame( animate );

    controls.update();

    renderer.render( scene, camera ); //reduces the need to call renderer over and over again
}



animate();

