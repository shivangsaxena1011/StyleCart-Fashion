// ========== THREE.JS 3D SCENE MODULE ==========

function initMarketplace3D() {
    const canvas = document.getElementById("marketCanvas");
    if (!canvas || typeof THREE === 'undefined') return;
    
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 1.1, 7);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    const maroonLight = new THREE.PointLight(0x8f1d2d, 3, 9);
    maroonLight.position.set(-3, 2, 3);
    scene.add(maroonLight);

    const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xf4f4f4, metalness: 0.3, roughness: 0.25 });
    const maroonMaterial = new THREE.MeshStandardMaterial({ color: 0x5b101b, metalness: 0.3, roughness: 0.32 });
    const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x070707, metalness: 0.45, roughness: 0.3 });
    const silverMaterial = new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.8, roughness: 0.18 });

    const group = new THREE.Group();

    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.18, 48), blackMaterial);
    base.position.y = -1.65;
    group.add(base);

    const cube = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.35, 1.35), maroonMaterial);
    cube.rotation.set(0.35, 0.55, 0.2);
    cube.position.y = 0.15;
    group.add(cube);

    const screen = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.05, 0.08), whiteMaterial);
    screen.position.set(-1.55, 0.25, 0.25);
    screen.rotation.y = 0.48;
    group.add(screen);

    const screenInner = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.78, 0.085), blackMaterial);
    screenInner.position.set(-1.53, 0.25, 0.31);
    screenInner.rotation.y = 0.48;
    group.add(screenInner);

    const phone = new THREE.Mesh(new THREE.BoxGeometry(0.58, 1.25, 0.08), silverMaterial);
    phone.position.set(1.55, 0.2, 0.15);
    phone.rotation.y = -0.52;
    group.add(phone);

    const phoneScreen = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.02, 0.085), blackMaterial);
    phoneScreen.position.set(1.54, 0.2, 0.2);
    phoneScreen.rotation.y = -0.52;
    group.add(phoneScreen);

    const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(2.25, 0.012, 12, 120),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 })
    );
    ring1.rotation.x = Math.PI / 2.4;
    group.add(ring1);

    const ring2 = ring1.clone();
    ring2.rotation.y = Math.PI / 2.6;
    ring2.material = new THREE.MeshBasicMaterial({ color: 0x8f1d2d, transparent: true, opacity: 0.32 });
    group.add(ring2);

    const smallItems = [
        [-2.0, -0.9, 0.5],
        [2.1, -0.85, -0.2],
        [0.2, 1.65, -0.35],
        [0.95, 1.08, 0.85]
    ];

    smallItems.forEach((pos, index) => {
        const mesh = new THREE.Mesh(
            index % 2 === 0 ? new THREE.SphereGeometry(0.18, 24, 24) : new THREE.BoxGeometry(0.3, 0.3, 0.3),
            index % 2 === 0 ? silverMaterial : maroonMaterial
        );

        mesh.position.set(pos[0], pos[1], pos[2]);
        group.add(mesh);
    });

    const dotsGeometry = new THREE.BufferGeometry();
    const dotsCount = 250;
    const positions = new Float32Array(dotsCount * 3);

    for (let i = 0; i < dotsCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 6;
        positions[i + 1] = (Math.random() - 0.5) * 6;
        positions[i + 2] = (Math.random() - 0.5) * 6;
    }

    dotsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const dots = new THREE.Points(
        dotsGeometry,
        new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.02,
            transparent: true,
            opacity: 0.4
        })
    );

    scene.add(dots);
    scene.add(group);

    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener("mousemove", (event) => {
        mouseX = (event.clientX / window.innerWidth - 0.5) * 0.25;
        mouseY = (event.clientY / window.innerHeight - 0.5) * 0.15;
    });

    function resizeRenderer() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resizeRenderer);

    function animate() {
        requestAnimationFrame(animate);

        group.rotation.y += 0.005;
        group.rotation.x += (mouseY - group.rotation.x) * 0.025;
        group.position.x += (mouseX - group.position.x) * 0.025;

        ring1.rotation.z += 0.005;
        ring2.rotation.x += 0.003;
        dots.rotation.y -= 0.001;

        renderer.render(scene, camera);
    }

    resizeRenderer();
    animate();
}

window.initMarketplace3D = initMarketplace3D;
