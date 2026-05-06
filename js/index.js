import * as THREE from "https://unpkg.com/three@0.162.0/build/three.module.js";

const canvasHost = document.getElementById("globeCanvas");
const screens = Array.from(document.querySelectorAll(".screen"));

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x040a16);

const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
canvasHost.appendChild(renderer.domElement);

const globe = new THREE.Mesh(
  new THREE.SphereGeometry(1, 128, 128),
  new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load("https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg"),
    roughness: 0.9,
    metalness: 0.02
  })
);
scene.add(globe);

scene.add(new THREE.AmbientLight(0xffffff, 0.34));

const sun = new THREE.DirectionalLight(0xffffff, 1.28);
sun.position.set(4.5, 2.5, 3.2);
scene.add(sun);

const fill = new THREE.DirectionalLight(0x58a8ff, 0.22);
fill.position.set(-3.2, -1.3, -2.6);
scene.add(fill);

const viewOne = { cameraY: 0.0, cameraZ: 1.86, globeY: -0.98 };
const viewTwo = { cameraY: 0.0, cameraZ: 2.95, globeY: 0.0 };
const viewThree = { cameraY: 0.0, cameraZ: 2.2, globeY: 1.05 };

const viewStates = {
  1: viewOne,
  2: viewTwo,
  3: viewThree
};

const currentState = {
  cameraY: viewOne.cameraY,
  cameraZ: viewOne.cameraZ,
  globeY: viewOne.globeY
};

const targetState = {
  cameraY: viewOne.cameraY,
  cameraZ: viewOne.cameraZ,
  globeY: viewOne.globeY
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

let activeViewport = 1;

function getActiveViewport() {
  return activeViewport;
}

function setTargetByViewport() {
  const view = viewStates[getActiveViewport()];
  targetState.cameraY = view.cameraY;
  targetState.cameraZ = view.cameraZ;
  targetState.globeY = view.globeY;
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  setTargetByViewport();
}

window.addEventListener("resize", resize);
window.addEventListener("scroll", setTargetByViewport, { passive: true });

const io = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      const viewportId = Number(entry.target.dataset.screen || "1");

      if (entry.isIntersecting) {
        entry.target.classList.add("is-active");

        if (entry.intersectionRatio >= 0.55) {
          activeViewport = viewportId;
          setTargetByViewport();
        }
      } else {
        entry.target.classList.remove("is-active");
      }
    });
  },
  { threshold: [0.45, 0.55, 0.7] }
);

screens.forEach(screen => io.observe(screen));
screens[0].classList.add("is-active");

function animate() {
  requestAnimationFrame(animate);

  currentState.cameraY = lerp(currentState.cameraY, targetState.cameraY, 0.04);
  currentState.cameraZ = lerp(currentState.cameraZ, targetState.cameraZ, 0.04);
  currentState.globeY = lerp(currentState.globeY, targetState.globeY, 0.04);

  camera.position.set(0, currentState.cameraY, currentState.cameraZ);
  camera.lookAt(0, 0, 0);
  globe.position.y = currentState.globeY;
  globe.rotation.y += 0.00085;

  renderer.render(scene, camera);
}

setTargetByViewport();
resize();
animate();