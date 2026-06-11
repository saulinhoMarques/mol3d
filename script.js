import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.querySelector("#webgl");
const loaderScreen = document.querySelector("#loader");
const barFill = document.querySelector("#barFill");
const loaderPercent = document.querySelector("#loaderPercent");
const modelStatus = document.querySelector("#modelStatus");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog("#030612", 7, 24);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.2, 7.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;

scene.add(new THREE.AmbientLight("#ffffff", 1.8));
const mainLight = new THREE.DirectionalLight("#ffffff", 2.6);
mainLight.position.set(4, 5, 4);
scene.add(mainLight);
const cyanLight = new THREE.PointLight("#00f5ff", 6, 22);
cyanLight.position.set(4, 2.5, 3.5);
scene.add(cyanLight);
const purpleLight = new THREE.PointLight("#8a2be2", 6, 22);
purpleLight.position.set(-4, 2, 3);
scene.add(purpleLight);

let phone = null;
let phoneLoaded = false;

const gltfLoader = new GLTFLoader();
gltfLoader.load(
  "./assets/celular.glb",
  (gltf) => {
    const model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        child.frustumCulled = false;
        if (child.material) {
          child.material.side = THREE.DoubleSide;
          child.material.needsUpdate = true;
        }
      }
    });
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    model.position.x -= center.x;
    model.position.y -= center.y;
    model.position.z -= center.z;
    phone = new THREE.Group();
    phone.add(model);
    const maxSize = Math.max(size.x, size.y, size.z);
    phone.scale.setScalar(3.2 / maxSize);
    phone.position.set(1.65, -0.15, 0);
    phone.rotation.set(0.12, -0.55, 0.04);
    scene.add(phone);
    phoneLoaded = true;
    modelStatus.textContent = "celular.glb carregado";
    modelStatus.style.color = "#00f5ff";
    finishLoader();
    console.log("Celular 3D carregado com sucesso!", gltf);
  },
  (progress) => {
    if (progress.total) {
      const percent = Math.round((progress.loaded / progress.total) * 100);
      barFill.style.width = `${percent}%`;
      loaderPercent.textContent = `${percent}%`;
    }
  },
  (error) => {
    console.warn("Não foi possível carregar assets/celular.glb. Usando modelo reserva.", error);
    createFallbackPhone();
    finishLoader();
    modelStatus.textContent = "usando modelo reserva";
    modelStatus.style.color = "#ffcf5c";
  }
);

function finishLoader() {
  barFill.style.width = "100%";
  loaderPercent.textContent = "100%";
  setTimeout(() => loaderScreen.classList.add("hidden"), 420);
}

function createFallbackPhone() {
  phone = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 3.1, 0.22),
    new THREE.MeshStandardMaterial({ color: "#060711", metalness: 0.65, roughness: 0.28 })
  );
  phone.add(body);
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(1.32, 2.72, 0.035),
    new THREE.MeshStandardMaterial({ color: "#002d33", metalness: 0.2, roughness: 0.08, emissive: "#00f5ff", emissiveIntensity: 0.45 })
  );
  screen.position.z = 0.13;
  phone.add(screen);
  phone.position.set(1.65, -0.15, 0);
  phone.rotation.set(0.12, -0.55, 0.04);
  scene.add(phone);
}

const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1100;
const positions = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount * 3; i++) positions[i] = (Math.random() - 0.5) * 22;
particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({ size: 0.026, color: "#00f5ff", transparent: true, opacity: 0.75 }));
scene.add(particles);

const rings = new THREE.Group();
for (let i = 0; i < 4; i++) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.7 + i * 0.4, 0.006, 12, 140),
    new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? "#00f5ff" : "#8a2be2", transparent: true, opacity: 0.22 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.z = -1.2 - i * 0.25;
  rings.add(ring);
}
rings.position.set(1.65, -0.15, 0);
scene.add(rings);

let mouseX = 0, mouseY = 0;
window.addEventListener("mousemove", (event) => {
  mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
});

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("active"); });
}, { threshold: 0.18 });
reveals.forEach((item) => observer.observe(item));

function animate() {
  requestAnimationFrame(animate);
  const scrollY = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
  particles.rotation.y += 0.0007;
  particles.rotation.x += 0.00025;
  rings.rotation.z += 0.002;
  rings.rotation.x = Math.sin(Date.now() * 0.0007) * 0.14;
  camera.position.x += (mouseX * 0.35 - camera.position.x) * 0.035;
  camera.position.y += (1.2 - mouseY * 0.22 - camera.position.y) * 0.035;
  camera.position.z = 7.5 - progress * 1.2;
  camera.lookAt(0, 0, 0);
  if (phone) {
    phone.rotation.y = -0.55 + progress * Math.PI * 4.4;
    phone.rotation.x = 0.12 + Math.sin(progress * Math.PI * 3) * 0.25;
    phone.rotation.z = 0.04 + Math.sin(Date.now() * 0.001) * 0.035;
    phone.position.x = 1.65 - progress * 3.25;
    phone.position.y = -0.15 + Math.sin(Date.now() * 0.0012) * 0.11;
    phone.position.z = progress * 0.7;
    rings.position.x = phone.position.x;
    rings.position.y = phone.position.y;
    rings.position.z = phone.position.z - 0.3;
  }
  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
