let scene, camera, renderer, controls;
let sphere;
let balls = [];
let parameters = {
    ballSize: 0.1,
    ballSpeed: 0.02,
    gravity: 0.005,
    gravityEnabled: true,
    addBall: addBall,
    resetBalls: resetBalls,
    toggleGravity: toggleGravity
};

init();
animate();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true,
        roughness: 0.1,
        metalness: 0.1,
        reflectivity: 0.9
    });
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            addBall();
        }
    });

    const gui = new dat.GUI();
    gui.add(parameters, 'addBall').name('Add Ball "Press Spacebar"');
    gui.add(parameters, 'ballSize', 0.05, 0.5).name('Ball Size');
    gui.add(parameters, 'ballSpeed', 0.01, 0.1).name('Ball Speed').onChange(updateBallSpeeds);
    gui.add(parameters, 'gravity', 0, 0.1).name('Gravity');
    gui.add(parameters, 'gravityEnabled').name('Gravity Enabled').onChange(toggleGravity);
    gui.add(parameters, 'resetBalls').name('Reset');
}

function addBall() {
    const geometry = new THREE.SphereGeometry(parameters.ballSize, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: getRandomColor() });
    const ball = new THREE.Mesh(geometry, material);
    const safeDistance = 1.5 - parameters.ballSize; // Ensure the ball spawns within safe bounds
    ball.position.set(
        (Math.random() - 0.5) * safeDistance,
        (Math.random() - 0.5) * safeDistance,
        (Math.random() - 0.5) * safeDistance
    );
    ball.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * parameters.ballSpeed,
        (Math.random() - 0.5) * parameters.ballSpeed,
        (Math.random() - 0.5) * parameters.ballSpeed
    );
    balls.push(ball);
    scene.add(ball);
}

function getRandomColor() {
    // Ensure a valid hex color string is returned
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function updateBalls() {
    balls.forEach(ball => {
        ball.position.add(ball.velocity);

        if (parameters.gravityEnabled) {
            // Apply gravity towards the center
            const gravityDirection = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), ball.position).normalize();
            ball.velocity.add(gravityDirection.multiplyScalar(parameters.gravity));
        }

        // Check for collision with sphere walls
        const ballRadius = ball.geometry.parameters.radius;
        if (ball.position.length() + ballRadius >= 1.5) {
            ball.velocity.reflect(ball.position.clone().normalize());
            ball.material.color.set(getRandomColor());
        }

        // Ensure the ball stays within the sphere
        if (ball.position.length() > 1.5 - ballRadius) {
            ball.position.setLength(1.5 - ballRadius);
        }
    });
}

function updateBallSpeeds() {
    balls.forEach(ball => {
        const speed = parameters.ballSpeed;
        ball.velocity.set(
            (Math.random() - 0.5) * speed,
            (Math.random() - 0.5) * speed,
            (Math.random() - 0.5) * speed
        );
    });
}

function resetBalls() {
    balls.forEach(ball => {
        scene.remove(ball);
    });
    balls = [];
}

function toggleGravity() {
    // This function is a placeholder for potential future logic.
    // Currently, it does nothing since gravityEnabled is already being used directly in updateBalls.
}

function animate() {
    requestAnimationFrame(animate);
    updateBalls();
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
