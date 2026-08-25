// ========== LUXURY ANIMATIONS MODULE ==========

function initRevealAnimations() {
    document.querySelectorAll(".category-card, .bento-card, .product-card, .stat-card").forEach((el) => {
        el.classList.add("reveal");
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
}

function attachTiltCards() {
    document.querySelectorAll(".tilt-card").forEach((card) => {
        card.addEventListener("mousemove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const rotateX = ((y / rect.height) - 0.5) * -8;
            const rotateY = ((x / rect.width) - 0.5) * 8;

            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "rotateX(0deg) rotateY(0deg) translateY(0) scale(1)";
        });
    });
}

function initSpatialParallax() {
    document.addEventListener("mousemove", (event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;

        document.querySelectorAll(".spatial-layer").forEach((layer) => {
            const depth = Number(layer.dataset.depth || 10);
            layer.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
        });
    });
}

function initParticles() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const particles = [];
    const count = 75;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.3,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            a: Math.random() * 0.5 + 0.1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.a})`;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// Skeleton loading injector
function generateSkeletons(container, count = 4) {
    if (!container) return;
    let html = '';
    for(let i=0; i<count; i++) {
        html += `
            <div class="skeleton-card" style="padding:20px;border-radius:24px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);height:360px;display:flex;flex-direction:column;gap:15px;animation:pulse 1.8s infinite;">
                <div style="flex:1;background:rgba(255,255,255,0.04);border-radius:16px;"></div>
                <div style="height:20px;width:60%;background:rgba(255,255,255,0.04);border-radius:4px;"></div>
                <div style="height:24px;width:90%;background:rgba(255,255,255,0.04);border-radius:4px;"></div>
                <div style="height:20px;width:40%;background:rgba(255,255,255,0.04);border-radius:4px;"></div>
            </div>
        `;
    }
    container.innerHTML = html;
}

// Expose globally
window.initRevealAnimations = initRevealAnimations;
window.attachTiltCards = attachTiltCards;
window.initSpatialParallax = initSpatialParallax;
window.initParticles = initParticles;
window.generateSkeletons = generateSkeletons;
