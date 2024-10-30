import * as Three from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
const renderer = new Three.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
renderer.setAnimationLoop(animate)

const BALL_RADIUS = .5

function updateHitsAndAccuary() {
    document.querySelector('#hits').innerText = `Hits: ${hits}`
    document.querySelector('#accuracy').innerText = `Accuracy : ${Math.floor((hits/clicks)*100)}`
}

document.body.appendChild(renderer.domElement)

const scene = new Three.Scene()
const camera = new Three.PerspectiveCamera(75, innerWidth/innerHeight, .1, 1000)

const light = new Three.PointLight(0xffffff, 50, 100)
light.position.y = 2
light.position.z = 3
scene.add(light)

const material = new Three.MeshStandardMaterial({ color: 0x808080 })

const roomDown = new Three.Mesh(new Three.BoxGeometry(10, 1, 10), material)
roomDown.position.y -= .5
scene.add(roomDown)

const roomTop = new Three.Mesh(new Three.BoxGeometry(10, 1, 10), material)
roomTop.position.y = 5
scene.add(roomTop)

const roomLeft = new Three.Mesh(new Three.BoxGeometry(1, 10, 10), material)
roomLeft.position.x = 5
scene.add(roomLeft)

const roomRight = new Three.Mesh(new Three.BoxGeometry(1, 10, 10), material)
roomRight.position.x = -5
scene.add(roomRight)

const roomFront = new Three.Mesh(new Three.BoxGeometry(10, 10, 1), material)
roomFront.position.z = -5
scene.add(roomFront)

const roomBack = new Three.Mesh(new Three.BoxGeometry(10, 10, 1), material)
roomBack.position.z = 5
scene.add(roomBack)

camera.position.z = 4
camera.position.y = 1
const direction = new Three.Vector3()
const rayCaster = new Three.Raycaster(camera.position, direction)

function checkIntersection() {
    camera.getWorldDirection(direction)
    const objects = rayCaster.intersectObjects(scene.children, false)
    for(let i = 0; i < objects.length; i++) {
        if(objects[i].faceIndex > 20) {
            scene.remove(objects[i].object)
            genBall()
        }
    }
    updateHitsAndAccuary()
}

function genBall() {
    const ballGeo = new Three.SphereGeometry(BALL_RADIUS, 32, 32)
    const ballMat = new Three.MeshStandardMaterial({ color: 'cyan' })
    const ball = new Three.Mesh(ballGeo, ballMat)
    ball.position.y = Math.floor(Math.random()*4) + 1
    ball.position.x = -Math.floor(Math.random()*4) + 1
    ball.position.z = -4
    scene.add(ball)
    return ball
}

genBall()
genBall()
genBall()

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const loader = new FBXLoader()

const gun = new Three.Object3D()

function loadGun() {
    loader.load('Pistol.fbx', (object) => {
        object.scale.set(.0005, .0005, .0005)
        object.rotation.y = Math.PI
        object.position.z = 4
        object.position.x = .2
        object.position.y = .85
        gun.copy(object)
        scene.add(gun)
    })
}

loadGun()

const onMouseMove = (event) => {
    if (document.pointerLockElement != null) {
        const movementX = event.movementX;
        const movementY = event.movementY;
        camera.rotation.y -= movementX * 0.001;
        camera.rotation.x -= movementY * 0.001;
        camera.rotation.x = clamp(camera.rotation.x, -Math.PI / 2, Math.PI / 2);
        gun.rotation.copy(camera.rotation)
        gun.rotation.y = Math.PI
    }
};

document.onclick = () => {
    if(document.pointerLockElement != null) {
        checkIntersection()
    } else {
        document.body.requestPointerLock()
    }
}

document.addEventListener('mousemove', onMouseMove);

function animate(){
    renderer.render(scene, camera)
}
