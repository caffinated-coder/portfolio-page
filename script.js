document.addEventListener('DOMContentLoaded', () => {
    initWebGLPortfolio();
    initMobileMenu();
    initContactForm();
    initAudioEngine();
    initScrollReveal();
});

/* ==========================================================================
   THREE.JS 3D WEBGL PARTICLE SYSTEM
   ========================================================================== */
function initWebGLPortfolio() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    
    // Perspective Camera: FOV, Aspect, Near, Far
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true // Transparent background to let HTML section colors show through
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 2. Global State
    const particleCount = 12000;
    const geometry = new THREE.BufferGeometry();
    
    // Arrays to hold shape positions
    const positionsCurrent = new Float32Array(particleCount * 3);
    const positionsSphere = new Float32Array(particleCount * 3);
    const positionsWave = new Float32Array(particleCount * 3);
    const positionsHelix = new Float32Array(particleCount * 3);
    
    const colors = new Float32Array(particleCount * 3);

    // Track mouse coordinates (projected to 3D space)
    const mouse3D = new THREE.Vector2(0, 0);
    const mouseTarget = new THREE.Vector3(0, 0, 0);
    let scrollPercent = 0;

    // Helper: Generate soft circle texture programmatically to avoid external asset dependencies
    function createCircleTexture() {
        const size = 16;
        const canvasTexture = document.createElement('canvas');
        canvasTexture.width = size;
        canvasTexture.height = size;
        const ctx = canvasTexture.getContext('2d');

        // Radial gradient for glowing soft edges
        const gradient = ctx.createRadialGradient(
            size / 2, size / 2, 0,
            size / 2, size / 2, size / 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvasTexture);
        return texture;
    }

    // 3. Mathematical Shape Generators
    function generateShapes() {
        const cyan = new THREE.Color('#38bdf8');
        const violet = new THREE.Color('#a78bfa');
        const white = new THREE.Color('#ffffff');

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // --- SHAPE 1: SPHERE (Golden spiral distribution) ---
            const phi = Math.acos(-1 + (2 * i) / particleCount);
            const theta = Math.sqrt(particleCount * Math.PI) * phi;
            const radiusSphere = 4.5 + Math.random() * 0.4; // Small radius breathing variability

            positionsSphere[i3] = radiusSphere * Math.sin(phi) * Math.cos(theta);
            positionsSphere[i3 + 1] = radiusSphere * Math.sin(phi) * Math.sin(theta);
            positionsSphere[i3 + 2] = radiusSphere * Math.cos(phi);

            // --- SHAPE 2: SINE-WAVE LANDSCAPE (Flat grid) ---
            const gridWidth = 110;
            const col = i % gridWidth;
            const row = Math.floor(i / gridWidth);
            const totalRows = Math.floor(particleCount / gridWidth);
            
            const spacing = 0.22;
            const xVal = (col - gridWidth / 2) * spacing;
            const zVal = (row - totalRows / 2) * spacing;
            
            positionsWave[i3] = xVal;
            // Base Y height using sines, animated in render loop
            positionsWave[i3 + 1] = Math.sin(xVal * 0.5) * Math.cos(zVal * 0.5) * 1.5;
            positionsWave[i3 + 2] = zVal;

            // --- SHAPE 3: DOUBLE HELIX VORTEX ---
            const helixHeight = 14;
            const turns = 18;
            const fraction = i / particleCount;
            const angle = fraction * turns * Math.PI * 2;
            
            // Double helix branches offset by PI
            const branchOffset = (i % 2 === 0) ? 0 : Math.PI;
            const radiusHelix = 2.5 + Math.sin(angle * 2.5) * 0.6; // Wobbly spiral

            positionsHelix[i3] = radiusHelix * Math.cos(angle + branchOffset);
            positionsHelix[i3 + 1] = (fraction - 0.5) * helixHeight;
            positionsHelix[i3 + 2] = radiusHelix * Math.sin(angle + branchOffset);

            // --- COLOR SETUP (Gradient interpolation based on index) ---
            let particleColor;
            if (i % 3 === 0) {
                particleColor = cyan;
            } else if (i % 3 === 1) {
                particleColor = violet;
            } else {
                particleColor = white;
            }

            colors[i3] = particleColor.r;
            colors[i3 + 1] = particleColor.g;
            colors[i3 + 2] = particleColor.b;

            // Initialize current positions to Sphere coordinates
            positionsCurrent[i3] = positionsSphere[i3];
            positionsCurrent[i3 + 1] = positionsSphere[i3 + 1];
            positionsCurrent[i3 + 2] = positionsSphere[i3 + 2];
        }

        // Apply attributes to geometry
        geometry.setAttribute('position', new THREE.BufferAttribute(positionsCurrent, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }

    generateShapes();

    // 4. Materials & Points
    const material = new THREE.PointsMaterial({
        size: 0.09,
        vertexColors: true,
        map: createCircleTexture(),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending // Glow additive blending for WebGL elegance
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 5. Scroll State Tracking
    window.addEventListener('scroll', () => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll <= 0) return;
        
        scrollPercent = window.scrollY / maxScroll;
        
        // Hide/Show Scroll Indicator depending on scroll height
        const indicator = document.getElementById('scrollIndicator');
        if (indicator) {
            if (window.scrollY > 100) {
                indicator.style.opacity = '0';
            } else {
                indicator.style.opacity = '1';
            }
        }
    });

    // 6. Pointer Tracking (Mouse coordinates mapped to 3D coords)
    const hoverRadius = 3.5;
    const hoverForce = 0.08;

    window.addEventListener('mousemove', (e) => {
        // Normalize coordinates to -1 -> +1
        mouse3D.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse3D.y = -(e.clientY / window.innerHeight) * 2 + 1;

        // Glow tracer tracker DOM
        const glow = document.getElementById('cursorGlow');
        if (glow) {
            glow.style.left = `${e.clientX}px`;
            glow.style.top = `${e.clientY}px`;
        }
    });

    // Handle screen resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 7. Render Animation Loop
    let clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();
        const delta = clock.getDelta();

        // Project mouse vector to estimated z=0 plane in 3D camera frustum
        mouseTarget.set(mouse3D.x * 12, mouse3D.y * 7, 0);

        // --- AUDIO-REACTIVE CALCULATIONS ---
        let volumeFactor = 1.0;
        if (window.audioAnalyser && window.audioIsPlaying) {
            const bufferLength = window.audioAnalyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            window.audioAnalyser.getByteFrequencyData(dataArray);

            let sum = 0;
            // Read first 8 bins (bass range) for maximum beat responsiveness
            const bandsToAnalyze = Math.min(8, bufferLength);
            for (let i = 0; i < bandsToAnalyze; i++) {
                sum += dataArray[i];
            }
            const average = sum / bandsToAnalyze;
            volumeFactor = 1.0 + (average / 255) * 0.35; // Pulse up to 35% larger
        }

        // Apply audio scale pulses smoothly
        const currentScale = THREE.MathUtils.lerp(points.scale.x, volumeFactor, 0.1);
        points.scale.set(currentScale, currentScale, currentScale);

        const positions = geometry.attributes.position.array;

        // Perform Shape Morphing & Physics calculations on the CPU
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            let targetX, targetY, targetZ;

            // Scroll morph interpolation ranges
            if (scrollPercent < 0.45) {
                // Sphere to Wave Morph
                const t = scrollPercent / 0.45;
                targetX = THREE.MathUtils.lerp(positionsSphere[i3], positionsWave[i3], t);
                targetY = THREE.MathUtils.lerp(positionsSphere[i3 + 1], positionsWave[i3 + 1], t);
                targetZ = THREE.MathUtils.lerp(positionsSphere[i3 + 2], positionsWave[i3 + 2], t);

                // Add wavy animation details if morphing into wave
                if (scrollPercent > 0.1) {
                    const wavyFactor = (scrollPercent - 0.1) / 0.35;
                    // Animate Wave height over time (influenced by audio volume)
                    const xVal = positionsWave[i3];
                    const zVal = positionsWave[i3 + 2];
                    const animatedWaveY = Math.sin(xVal * 0.4 + time * 1.5) * Math.cos(zVal * 0.4 + time * 1.5) * 1.6 * volumeFactor;
                    targetY = THREE.MathUtils.lerp(targetY, animatedWaveY, wavyFactor);
                }
            } else {
                // Wave to Helix Morph
                const t = (scrollPercent - 0.45) / 0.55;
                targetX = THREE.MathUtils.lerp(positionsWave[i3], positionsHelix[i3], t);
                targetY = THREE.MathUtils.lerp(positionsWave[i3 + 1], positionsHelix[i3 + 1], t);
                targetZ = THREE.MathUtils.lerp(positionsWave[i3 + 2], positionsHelix[i3 + 2], t);

                // Add wavy height details to wave target (influenced by audio volume)
                const xVal = positionsWave[i3];
                const zVal = positionsWave[i3 + 2];
                const animatedWaveY = Math.sin(xVal * 0.4 + time * 1.5) * Math.cos(zVal * 0.4 + time * 1.5) * 1.6 * volumeFactor;
                const activeWaveTargetY = THREE.MathUtils.lerp(animatedWaveY, positionsHelix[i3 + 1], t);
                targetY = THREE.MathUtils.lerp(targetY, activeWaveTargetY, 1.0);
            }

            // Smoothly ease current position toward targeted morph coordinate
            positions[i3] += (targetX - positions[i3]) * 0.09;
            positions[i3 + 1] += (targetY - positions[i3 + 1]) * 0.09;
            positions[i3 + 2] += (targetZ - positions[i3 + 2]) * 0.09;

            // --- CURSOR GRAVITY PHYSICS (VORTEX SWIRL) ---
            const dx = positions[i3] - mouseTarget.x;
            const dy = positions[i3 + 1] - mouseTarget.y;
            const dz = positions[i3 + 2] - mouseTarget.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < hoverRadius) {
                const force = (hoverRadius - dist) / hoverRadius * hoverForce;
                
                // Repel component
                positions[i3] += (dx / dist) * force * 0.3;
                positions[i3 + 1] += (dy / dist) * force * 0.3;
                positions[i3 + 2] += (dz / dist) * force * 0.3;

                // Swirl orbit component: perpendicular tangent forces
                positions[i3] -= (dy / dist) * force * 0.95;
                positions[i3 + 1] += (dx / dist) * force * 0.95;
            }
        }

        // Trigger updates in Three.js
        geometry.attributes.position.needsUpdate = true;

        // --- CAMERA ORBIT & PARALLAX ---
        const orbitAngle = scrollPercent * Math.PI * 0.32; // Rotate camera up to ~58 degrees
        const baseRadius = 15;
        const targetCamX = baseRadius * Math.sin(orbitAngle) + (mouse3D.x * 2.5); // Add mouse parallax
        const targetCamY = mouse3D.y * 2.5;
        const targetCamZ = baseRadius * Math.cos(orbitAngle);

        // Ease camera coordinates
        camera.position.x += (targetCamX - camera.position.x) * 0.06;
        camera.position.y += (targetCamY - camera.position.y) * 0.06;
        camera.position.z += (targetCamZ - camera.position.z) * 0.06;
        
        camera.lookAt(0, 0, 0);

        // Subtle scene rotation details (accelerated by audio beat)
        points.rotation.y = time * 0.04 * volumeFactor;
        points.rotation.x = time * 0.015 * volumeFactor;

        renderer.render(scene, camera);
    }

    animate();
}

/* ==========================================================================
   MOBILE MENU DRAWER
   ========================================================================== */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerLinks = document.querySelectorAll('.mobile-drawer-link');

    if (!mobileMenuBtn || !mobileDrawer) return;

    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = mobileDrawer.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
        document.body.classList.toggle('no-scroll', isActive);
    });

    drawerLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileDrawer.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });

    document.addEventListener('click', (e) => {
        if (mobileDrawer.classList.contains('active') && !mobileDrawer.contains(e.target) && e.target !== mobileMenuBtn) {
            mobileDrawer.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
}

/* ==========================================================================
   CONTACT FORM SUBMISSION
   ========================================================================== */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const resetFormBtn = document.getElementById('resetFormBtn');

    if (!contactForm || !formSuccess) return;

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        const submitText = submitBtn.querySelector('span');
        const originalText = submitText.textContent;

        submitBtn.disabled = true;
        submitText.textContent = 'Sending Message...';

        setTimeout(() => {
            contactForm.classList.add('hidden');
            formSuccess.classList.remove('hidden');

            submitBtn.disabled = false;
            submitText.textContent = originalText;
            contactForm.reset();
        }, 1200);
    });

    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            formSuccess.classList.add('hidden');
            contactForm.classList.remove('hidden');
        });
    }
}

/* ==========================================================================
   WEB AUDIO API & EQUALIZER VISUALIZER
   ========================================================================== */
function initAudioEngine() {
    const toggleBtn = document.getElementById('soundToggleBtn');
    const statusText = document.getElementById('sound-status-text');
    const canvas = document.getElementById('sound-canvas');
    if (!toggleBtn || !canvas) return;

    const ctx = canvas.getContext('2d');
    
    let audioContext = null;
    let audioSource = null;
    let filterNode = null;
    let analyserNode = null;
    let audio = null;
    let isPlaying = false;
    
    // Scale notes in C-minor (pentatonic) for hover chimes
    const scaleFrequencies = [261.63, 293.66, 311.13, 349.23, 392.00, 440.00, 466.16, 523.25, 587.33, 622.25, 698.46, 783.99];

    function setupAudio() {
        // Create context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Setup local audio loop
        audio = new Audio('RnBKPop_Dimming_90_Cm_Guitar_1_8bars_guitar_90BPM_Cminor_BANDLAB.wav');
        audio.loop = true;
        audio.crossOrigin = 'anonymous';
        
        // Create nodes
        audioSource = audioContext.createMediaElementSource(audio);
        filterNode = audioContext.createBiquadFilter();
        analyserNode = audioContext.createAnalyser();
        
        // Config filter
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 500; // Muffled at start
        filterNode.Q.value = 3;
        
        // Config analyser
        analyserNode.fftSize = 64;
        
        // Routing pipeline: source -> filter -> analyser -> destination
        audioSource.connect(filterNode);
        filterNode.connect(analyserNode);
        analyserNode.connect(audioContext.destination);

        // Expose analyser globally for WebGL particle engine
        window.audioAnalyser = analyserNode;

        // Control filter frequency on scroll
        window.addEventListener('scroll', () => {
            if (!filterNode || !audioContext) return;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll <= 0) return;
            const pct = window.scrollY / maxScroll;
            // Map scroll percentage to lowpass frequency cutoff: 400Hz -> 2500Hz
            filterNode.frequency.setTargetAtTime(400 + pct * 2100, audioContext.currentTime, 0.1);
        });
    }

    function playHoverChime() {
        if (!audioContext || isPlaying === false) return;
        
        // Resume context if suspended
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // Random note from scale
        const noteIndex = Math.floor(Math.random() * scaleFrequencies.length);
        const freq = scaleFrequencies[noteIndex];

        // Synthesize quick sine wave chime
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);

        // Connect through a highpass filter to keep it airy and clean
        const hpFilter = audioContext.createBiquadFilter();
        hpFilter.type = 'highpass';
        hpFilter.frequency.setValueAtTime(600, audioContext.currentTime);

        gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
        // Exponential decay envelope
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.6);

        osc.connect(hpFilter);
        hpFilter.connect(gainNode);
        // Bypass the scroll filter to keep chimes clear at all times
        gainNode.connect(audioContext.destination);

        osc.start();
        osc.stop(audioContext.currentTime + 0.65);
    }

    // Bind hover sounds to interactive elements
    function bindHoverSounds() {
        const triggers = document.querySelectorAll('a, button, .tech-card, .project-item, .contact-submit-btn');
        triggers.forEach(el => {
            el.addEventListener('mouseenter', () => {
                playHoverChime();
            });
        });
    }

    // Equalizer canvas visualizer loop
    function drawVisualizer() {
        if (!canvas || !ctx) return;
        
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);

        if (!isPlaying || !analyserNode) {
            // Draw static mute line
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(2, height / 2);
            ctx.lineTo(width - 2, height / 2);
            ctx.stroke();
            requestAnimationFrame(drawVisualizer);
            return;
        }

        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);

        // Draw 5 animated vertical lines representing frequency bands
        const barWidth = 2;
        const barGap = 2;
        const startX = (width - (5 * barWidth + 4 * barGap)) / 2;

        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 5; i++) {
            // Read index values from frequency spectrum data
            const index = Math.floor(i * (bufferLength / 5));
            const value = dataArray[index] || 0;
            // Map 0-255 range to canvas height
            const barHeight = THREE.MathUtils.mapLinear(value, 0, 255, 2, height - 4);
            
            const x = startX + i * (barWidth + barGap);
            const y = (height - barHeight) / 2;
            
            ctx.fillRect(x, y, barWidth, barHeight);
        }

        requestAnimationFrame(drawVisualizer);
    }
    
    // Start visualizer animation loop immediately (will show flat line until played)
    drawVisualizer();

    // Sound toggle event listener
    toggleBtn.addEventListener('click', async () => {
        if (!audioContext) {
            setupAudio();
            bindHoverSounds();
        }

        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        if (isPlaying) {
            // Mute / Pause loop
            audio.pause();
            statusText.textContent = 'SOUND OFF';
            toggleBtn.classList.remove('playing');
            isPlaying = false;
            window.audioIsPlaying = false;
        } else {
            // Unmute / Play loop
            audio.play().catch(err => console.log('Audio playback failed:', err));
            statusText.textContent = 'SOUND ON';
            toggleBtn.classList.add('playing');
            isPlaying = true;
            window.audioIsPlaying = true;
        }
    });
}

/* ==========================================================================
   SCROLL REVEAL OBSERVER FOR SECTION FLOW
   ========================================================================== */
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // If it contains stat counter values, trigger the counts
                const statNums = entry.target.querySelectorAll('.stat-num');
                statNums.forEach(num => {
                    if (!num.dataset.counted) {
                        num.dataset.counted = "true";
                        const target = parseInt(num.getAttribute('data-target'));
                        startRevealCounter(num, target);
                    }
                });
            } else {
                // Remove to allow re-animating when scrolling back up
                entry.target.classList.remove('revealed');
            }
        });
    }, {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

function startRevealCounter(el, target) {
    const duration = 1500; // ms
    const stepTime = Math.abs(Math.floor(duration / target));
    let current = 0;

    const timer = setInterval(() => {
        current += 1;
        el.textContent = current + (el.textContent.includes('%') ? '%' : el.textContent.includes('+') ? '+' : '');
        if (current >= target) {
            el.textContent = target + (target === 5 ? '+' : target === 99 ? '%' : '+');
            clearInterval(timer);
        }
    }, stepTime);
}
