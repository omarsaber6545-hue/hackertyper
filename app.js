/* ==========================================================================
   PREMIUM CYBER SECURITY TERMINAL HUD ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------------------------
    // 1. STATE & AUDIO CONFIGURATION (WEB AUDIO API SYNTHESIZER)
    // ----------------------------------------------------------------------
    const state = {
        audioInitialized: false,
        isMuted: false,
        cpuUsage: 34,
        ramUsage: 58,
        threatsBlocked: 314,
        nodesFound: 0,
        activeKeys: [],
        ipAddress: "192.168.88.42"
    };

    let audioCtx = null;
    let masterGain = null;

    // Fetch dynamic IP or use a simulated one
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            state.ipAddress = data.ip;
            const ipEl = document.getElementById("user-ip");
            if (ipEl) ipEl.textContent = state.ipAddress;
        })
        .catch(() => {
            // Fallback if offline or blocked
            state.ipAddress = "192.168.88.42";
        });

    // Initialize Synthesizer Audio Context
    function initAudio() {
        if (state.audioInitialized) return;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContextClass();
            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime); // Master volume
            masterGain.connect(audioCtx.destination);
            state.audioInitialized = true;
            console.log("Web Audio API Synthesizer initialized successfully.");
        } catch (e) {
            console.warn("AudioContext not supported by this browser.", e);
        }
    }

    // Toggle mute state
    const muteBtn = document.getElementById("mute-btn");
    const volumeIcon = document.getElementById("volume-icon");

    muteBtn.addEventListener("click", () => {
        state.isMuted = !state.isMuted;
        playSynthBeep(600, 100, 0.05, "sine"); // Quick feedback beep
        
        if (state.isMuted) {
            if (masterGain) masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
            muteBtn.classList.add("muted");
            volumeIcon.innerHTML = `<path fill="currentColor" d="M3.27,1.44L2,2.72L8.28,9H3V15H7L12,20V12.72L18.78,19.5C17.39,20.46 15.77,21.05 14,21.23V23.29C16.32,23.09 18.45,22.18 20.19,20.81L21.28,21.9L22.56,20.62L3.27,1.44M12,4L9.91,6.09L12,8.18V4M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,13.25 18.59,14.4 17.9,15.36L19.39,16.85C20.4,15.45 21,13.79 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V11L16.18,13.18C16.38,12.81 16.5,12.42 16.5,12Z"/>`;
        } else {
            if (masterGain) masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            muteBtn.classList.remove("muted");
            volumeIcon.innerHTML = `<path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.77 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>`;
        }
    });

    // ----------------------------------------------------------------------
    // 2. SYNTHESIZER SOUND GENERATOR FUNCTIONS
    // ----------------------------------------------------------------------
    
    // Play generic synth beep
    function playSynthBeep(frequency = 440, durationMs = 100, volume = 0.1, type = "sine") {
        if (!state.audioInitialized || state.isMuted) return;
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        
        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + durationMs / 1000);
        
        osc.connect(gainNode);
        gainNode.connect(masterGain);
        
        osc.start();
        osc.stop(audioCtx.currentTime + durationMs / 1000 + 0.05);
    }

    // Futuristic mechanical/digital keyboard click synthesizer
    function playKeyclickSound() {
        if (!state.audioInitialized || state.isMuted) return;

        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = "triangle";
        // Frequency sweep from 1800Hz down to 200Hz for a crisp click
        osc.frequency.setValueAtTime(1800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.04);

        filter.type = "highpass";
        filter.frequency.setValueAtTime(500, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.045);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);

        // Subtly inject low-level noise pop
        const bufferSize = audioCtx.sampleRate * 0.008; // 8ms noise burst
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = buffer;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.008);

        const noiseFilter = audioCtx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.value = 3000;

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        noiseNode.start();
    }

    // Play cyber-alert notification sound
    function playNotificationSound() {
        if (!state.audioInitialized || state.isMuted) return;

        const now = audioCtx.currentTime;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, now); // A5
        osc1.frequency.setValueAtTime(1320, now + 0.08); // E6

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1100, now); // C#6
        osc2.frequency.setValueAtTime(1760, now + 0.08); // A6

        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(masterGain);

        osc1.start();
        osc2.start();
        
        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
    }

    // Play majestic sci-fi power-on sweep for boot screen
    function playBootSound() {
        if (!state.audioInitialized || state.isMuted) return;

        const now = audioCtx.currentTime;
        const duration = 3.5;
        
        // Deep sub oscillator
        const subOsc = audioCtx.createOscillator();
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(55, now);
        subOsc.frequency.linearRampToValueAtTime(110, now + duration * 0.8);

        // High sweep synth
        const sweepOsc = audioCtx.createOscillator();
        sweepOsc.type = "sawtooth";
        sweepOsc.frequency.setValueAtTime(150, now);
        sweepOsc.frequency.exponentialRampToValueAtTime(880, now + duration * 0.7);

        // Low pass filter sweep
        const lpFilter = audioCtx.createBiquadFilter();
        lpFilter.type = "lowpass";
        lpFilter.frequency.setValueAtTime(100, now);
        lpFilter.frequency.exponentialRampToValueAtTime(2000, now + duration * 0.75);
        lpFilter.Q.setValueAtTime(5, now);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + duration * 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        subOsc.connect(gainNode);
        sweepOsc.connect(lpFilter);
        lpFilter.connect(gainNode);
        gainNode.connect(masterGain);

        subOsc.start();
        sweepOsc.start();

        subOsc.stop(now + duration + 0.1);
        sweepOsc.stop(now + duration + 0.1);
    }

    // Play warning alert tone
    function playWarningSound() {
        if (!state.audioInitialized || state.isMuted) return;
        
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        // Frequency modulation for siren effect
        osc.frequency.linearRampToValueAtTime(280, now + 0.15);
        osc.frequency.linearRampToValueAtTime(220, now + 0.3);
        
        gainNode.gain.setValueAtTime(0.06, now);
        gainNode.gain.setValueAtTime(0.06, now + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 600;
        
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(masterGain);
        
        osc.start();
        osc.stop(now + 0.4);
    }

    // ----------------------------------------------------------------------
    // 3. BOOT SCREEN ANIMATION & BOOT LOGGER
    // ----------------------------------------------------------------------
    const startSystemBtn = document.getElementById("start-system-btn");
    const bootInitPrompt = document.getElementById("boot-init-prompt");
    const bootLoaderArea = document.getElementById("boot-loader-area");
    const bootLogs = document.getElementById("boot-logs");
    const bootProgressBar = document.getElementById("boot-progress-bar");
    const bootPercentage = document.getElementById("boot-percentage");
    const bootScreen = document.getElementById("boot-screen");
    const hudContainer = document.getElementById("hud-container");

    const bootSequenceLogs = [
        { text: "INITIALIZING SECURITY SUB-SYSTEM CORE...", delay: 200, type: "normal" },
        { text: "MOUNTING SECURE NEURAL STORAGE SECTOR...", delay: 400, type: "normal" },
        { text: "DECRYPTING FIRMWARE BLOCKS (SHA-512)...", delay: 200, type: "normal" },
        { text: "FIRMWARE VERIFIED: [OK] COMPATIBLE", delay: 100, type: "success" },
        { text: "جاري تهيئة النواة التشفيرية الذكية...", delay: 450, type: "normal" },
        { text: "تحميل نظام الحماية المتكامل ANTIGRAVITY OS...", delay: 300, type: "normal" },
        { text: "اتصال آمن جاري الإنشاء عبر النفق الافتراضي...", delay: 300, type: "normal" },
        { text: "IP DETECTED: LOCAL NEURAL ENDPOINT", delay: 150, type: "warning" },
        { text: "SYNTAX-CHECKING FIREWALL LOGISTICS...", delay: 250, type: "normal" },
        { text: "تم تفعيل أنظمة الرادار والمسح الشبكي...", delay: 400, type: "success" },
        { text: "ALLOCATING CRYPTOGRAPHIC REGISTER SECTOR 0xFF3...", delay: 100, type: "normal" },
        { text: "تجاوز نقاط العزل بنجاح. حماية نشطة...", delay: 300, type: "success" },
        { text: "STARTING CENTRAL PROCESSOR CONTROLLERS...", delay: 200, type: "normal" },
        { text: "بوابة الاتصال جاهزة للتشغيل الآمن...", delay: 200, type: "success" }
    ];

    // Trigger boot sequence when user clicks Start Button
    startSystemBtn.addEventListener("click", () => {
        // 1. Initialise Web Audio API
        initAudio();
        
        // 2. Play boot hum
        playBootSound();

        // 3. Hide prompt, show loader
        bootInitPrompt.classList.add("hidden");
        bootLoaderArea.classList.remove("hidden");

        // 4. Start log print & bar loading
        executeBootLogging(0);
    });

    function executeBootLogging(index) {
        if (index >= bootSequenceLogs.length) {
            // Boot sequence done! Trigger HUD transitions.
            setTimeout(completeBootSequence, 500);
            return;
        }

        const logObj = bootSequenceLogs[index];
        setTimeout(() => {
            // Append log line
            const line = document.createElement("div");
            line.className = `log-line ${logObj.type}`;
            line.textContent = `[SYS] ${logObj.text}`;
            bootLogs.appendChild(line);
            bootLogs.scrollTop = bootLogs.scrollHeight;

            // Update progress bar percentage incrementally
            const percent = Math.floor(((index + 1) / bootSequenceLogs.length) * 100);
            bootProgressBar.style.width = `${percent}%`;
            bootPercentage.textContent = `${percent.toString().padStart(2, '0')}%`;

            // Play quick tick beep
            playSynthBeep(1200 + percent * 5, 20, 0.02, "sine");

            // Proceed to next log
            executeBootLogging(index + 1);
        }, logObj.delay);
    }

    function completeBootSequence() {
        // Final chime
        playNotificationSound();

        // GSAP transition to fade out boot screen and fade in main HUD
        const tl = gsap.timeline();
        
        tl.to(bootScreen, {
            opacity: 0,
            scale: 0.95,
            filter: "blur(20px)",
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
                bootScreen.style.display = "none";
            }
        });

        tl.to(hudContainer, {
            onStart: () => {
                hudContainer.classList.remove("hidden");
                gsap.set(hudContainer, { opacity: 0, scale: 1.05 });
            },
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power4.out"
        }, "-=0.6");

        // Kickoff background canvas renders, clocks and periodic widgets
        tl.add(() => {
            initializeHUDFeatures();
        });
    }

    // ----------------------------------------------------------------------
    // 4. CENTRAL HUD FEATURES INITIALIZER
    // ----------------------------------------------------------------------
    function initializeHUDFeatures() {
        startClockAndDate();
        startMatrixBackground();
        startCPUMeterAndChart();
        startRadarSweep();
        startRegistryDumpUpdates();
        startThreatBlocksSim();
        startCryptoKeyLoop();
        setupInteractiveTerminal();
        setupCustomCursor();
        
        // Final trigger: greet with notification sound
        setTimeout(() => {
            playNotificationSound();
        }, 1000);
    }

    // ----------------------------------------------------------------------
    // 5. LIVE DIGITAL CLOCK & DYNAMIC SECURE DATE
    // ----------------------------------------------------------------------
    function startClockAndDate() {
        const clockEl = document.getElementById("digital-clock");
        const dateEl = document.getElementById("digital-date");

        function updateClock() {
            const now = new Date();
            const hrs = now.getHours().toString().padStart(2, '0');
            const mins = now.getMinutes().toString().padStart(2, '0');
            const secs = now.getSeconds().toString().padStart(2, '0');
            const ms = now.getMilliseconds().toString().padStart(3, '0');
            
            clockEl.textContent = `${hrs}:${mins}:${secs}.${ms}`;
            
            // Format a cool cyber Arabic date format
            // e.g., EPOCH_NODE . Day / Month / Year
            const yr = now.getFullYear();
            const mo = (now.getMonth() + 1).toString().padStart(2, '0');
            const dy = now.getDate().toString().padStart(2, '0');
            dateEl.textContent = `CYBER_ERA : ${yr}.${mo}.${dy} // NODE_SECURE`;
            
            requestAnimationFrame(updateClock);
        }
        updateClock();
    }

    // ----------------------------------------------------------------------
    // 6. CANVAS MATRIX RAIN & FLOATING PARTICLES (COMBINED)
    // ----------------------------------------------------------------------
    function startMatrixBackground() {
        const canvas = document.getElementById("canvas-bg");
        const ctx = canvas.getContext("2d");

        // Resize Canvas
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener("resize", resize);
        resize();

        // Matrix rain configuration
        // Arabic characters mixed with binary and cyber symbols
        const matrixChars = "01أبتجخدسشعرغفقمنهوي".split("");
        const fontSize = 16;
        let columns = Math.floor(canvas.width / fontSize);
        let rainDrops = Array(columns).fill(1);

        // Re-calculate columns if window resizes
        window.addEventListener("resize", () => {
            columns = Math.floor(canvas.width / fontSize);
            rainDrops = Array(columns).fill(1);
        });

        // Background Particles config
        const particles = [];
        const maxParticles = 60;
        for (let i = 0; i < maxParticles; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }

        // Draw Loop (running smoothly at 60fps)
        function draw() {
            // Draw semi-transparent background to create trail effect
            ctx.fillStyle = "rgba(2, 8, 4, 0.15)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 1. Draw Matrix Rain
            ctx.fillStyle = "#00ff66";
            ctx.font = `${fontSize}px var(--font-cyber), var(--font-arabic)`;
            
            for (let i = 0; i < rainDrops.length; i++) {
                const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                
                // Dimmer and brighter characters randomly
                ctx.fillStyle = Math.random() > 0.95 ? "#ffffff" : "rgba(0, 255, 102, 0.35)";
                ctx.fillText(char, i * fontSize, rainDrops[i] * fontSize);

                if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }

            // 2. Draw Floating Particles and Web Lines
            ctx.strokeStyle = "rgba(0, 255, 102, 0.08)";
            ctx.lineWidth = 0.5;
            for (let i = 0; i < maxParticles; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.fillStyle = "rgba(0, 255, 102, 0.25)";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();

                // Draw connection lines to close particles
                for (let j = i + 1; j < maxParticles; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        ctx.strokeStyle = `rgba(0, 255, 102, ${0.08 * (1 - dist / 100)})`;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(draw);
        }
        draw();
    }

    // ----------------------------------------------------------------------
    // 7. REAL-TIME CPU/RAM METERS & WAVE CHART
    // ----------------------------------------------------------------------
    function startCPUMeterAndChart() {
        const cpuBar = document.getElementById("cpu-progress-bar");
        const cpuTxt = document.getElementById("cpu-percent-txt");
        const ramBar = document.getElementById("ram-progress-bar");
        const ramTxt = document.getElementById("ram-percent-txt");

        const chartCanvas = document.getElementById("cpu-chart-canvas");
        const chartCtx = chartCanvas.getContext("2d");

        // Set dimensions for the chart
        function resizeChart() {
            const container = chartCanvas.parentNode;
            chartCanvas.width = container.clientWidth;
            chartCanvas.height = container.clientHeight;
        }
        window.addEventListener("resize", resizeChart);
        resizeChart();

        // History data points
        const points = Array(60).fill(34);
        
        // Periodic fluctuations
        setInterval(() => {
            // Simulating realistic CPU load swings
            const targetCPU = Math.floor(20 + Math.sin(Date.now() / 4000) * 15 + Math.random() * 25);
            const targetRAM = Math.floor(55 + Math.cos(Date.now() / 9000) * 3 + Math.random() * 4);

            state.cpuUsage = targetCPU;
            state.ramUsage = targetRAM;

            cpuBar.style.width = `${targetCPU}%`;
            cpuTxt.textContent = `${targetCPU}%`;
            ramBar.style.width = `${targetRAM}%`;
            ramTxt.textContent = `${targetRAM}%`;

            // Push value to chart history
            points.shift();
            points.push(targetCPU);
        }, 800);

        // Smooth wave draw animation
        function drawChart() {
            chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

            const w = chartCanvas.width;
            const h = chartCanvas.height;
            const step = w / (points.length - 1);

            // Draw Background grid lines
            chartCtx.strokeStyle = "rgba(0, 255, 102, 0.08)";
            chartCtx.lineWidth = 1;
            
            // Horizontal grid
            for (let i = 1; i < 4; i++) {
                const yGrid = (h / 4) * i;
                chartCtx.beginPath();
                chartCtx.moveTo(0, yGrid);
                chartCtx.lineTo(w, yGrid);
                chartCtx.stroke();
            }

            // Vertical grid
            for (let i = 1; i < 6; i++) {
                const xGrid = (w / 6) * i;
                chartCtx.beginPath();
                chartCtx.moveTo(xGrid, 0);
                chartCtx.lineTo(xGrid, h);
                chartCtx.stroke();
            }

            // Draw Area Chart path
            chartCtx.beginPath();
            chartCtx.moveTo(0, h);

            for (let i = 0; i < points.length; i++) {
                // Map values 0-100 to canvas height
                const valMapped = h - (points[i] / 100) * (h - 20) - 10;
                chartCtx.lineTo(i * step, valMapped);
            }
            chartCtx.lineTo(w, h);
            chartCtx.closePath();

            // Gradient fill
            const fillGradient = chartCtx.createLinearGradient(0, 0, 0, h);
            fillGradient.addColorStop(0, "rgba(0, 255, 102, 0.25)");
            fillGradient.addColorStop(1, "rgba(0, 255, 102, 0)");
            chartCtx.fillStyle = fillGradient;
            chartCtx.fill();

            // Stroke line
            chartCtx.beginPath();
            for (let i = 0; i < points.length; i++) {
                const valMapped = h - (points[i] / 100) * (h - 20) - 10;
                if (i === 0) {
                    chartCtx.moveTo(0, valMapped);
                } else {
                    chartCtx.lineTo(i * step, valMapped);
                }
            }
            chartCtx.strokeStyle = "var(--neon-green)";
            chartCtx.lineWidth = 2;
            chartCtx.shadowColor = "rgba(0, 255, 102, 0.5)";
            chartCtx.shadowBlur = 8;
            chartCtx.stroke();
            chartCtx.shadowBlur = 0; // Reset shadow

            requestAnimationFrame(drawChart);
        }
        drawChart();
    }

    // ----------------------------------------------------------------------
    // 8. RADAR HUD WIDGET (CANVAS BASED SWEEP)
    // ----------------------------------------------------------------------
    function startRadarSweep() {
        const radarCanvas = document.getElementById("radar-canvas");
        const radarCtx = radarCanvas.getContext("2d");
        const nodeCounter = document.getElementById("radar-nodes-count");

        function resizeRadar() {
            const container = radarCanvas.parentNode;
            radarCanvas.width = container.clientWidth;
            radarCanvas.height = container.clientHeight;
        }
        window.addEventListener("resize", resizeRadar);
        resizeRadar();

        let sweepAngle = 0;
        const sweepSpeed = 0.02; // Radian per frame
        const radarTargets = [];
        const maxTargets = 8;

        // Populate mock target coordinates relative to center
        function spawnTarget() {
            if (radarTargets.length >= maxTargets) return;
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 50; // Distance in percent from center
            radarTargets.push({
                angle: angle,
                dist: dist,
                opacity: 0,
                pulse: 0
            });
            state.nodesFound = radarTargets.length;
            nodeCounter.textContent = state.nodesFound;
        }

        // Spawn targets periodically
        setInterval(spawnTarget, 3000);
        for(let i=0; i<4; i++) spawnTarget();

        function drawRadar() {
            radarCtx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);
            
            const w = radarCanvas.width;
            const h = radarCanvas.height;
            const cx = w / 2;
            const cy = h / 2;
            const radius = Math.min(w, h) / 2 - 10;

            // Draw grid circles
            radarCtx.strokeStyle = "rgba(0, 255, 102, 0.15)";
            radarCtx.lineWidth = 1;
            
            for (let r = radius / 3; r <= radius; r += radius / 3) {
                radarCtx.beginPath();
                radarCtx.arc(cx, cy, r, 0, Math.PI * 2);
                radarCtx.stroke();
            }

            // Draw cross-hairs
            radarCtx.beginPath();
            radarCtx.moveTo(cx - radius, cy);
            radarCtx.lineTo(cx + radius, cy);
            radarCtx.moveTo(cx, cy - radius);
            radarCtx.lineTo(cx, cy + radius);
            radarCtx.stroke();

            // Draw sweep line
            sweepAngle += sweepSpeed;
            if (sweepAngle >= Math.PI * 2) {
                sweepAngle = 0;
            }

            const sx = cx + Math.cos(sweepAngle) * radius;
            const sy = cy + Math.sin(sweepAngle) * radius;

            // Sweep line gradient trail
            radarCtx.beginPath();
            radarCtx.moveTo(cx, cy);
            radarCtx.lineTo(sx, sy);
            radarCtx.strokeStyle = "rgba(0, 255, 102, 0.8)";
            radarCtx.lineWidth = 2.5;
            radarCtx.stroke();

            // Draw sweeping shadow/tail (sector fill)
            radarCtx.beginPath();
            radarCtx.moveTo(cx, cy);
            // Draw a few steps back to build trail
            for (let i = 0; i < 20; i++) {
                const angle = sweepAngle - (i * 0.02);
                radarCtx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
            }
            radarCtx.closePath();
            
            const gradient = radarCtx.createRadialGradient(cx, cy, 1, cx, cy, radius);
            gradient.addColorStop(0, "rgba(0, 255, 102, 0.15)");
            gradient.addColorStop(1, "rgba(0, 255, 102, 0)");
            
            radarCtx.fillStyle = gradient;
            radarCtx.fill();

            // Draw targets (blips)
            radarTargets.forEach((target, index) => {
                const tx = cx + Math.cos(target.angle) * (target.dist * 0.01 * radius);
                const ty = cy + Math.sin(target.angle) * (target.dist * 0.01 * radius);
                
                // Calculate difference in angle from sweep
                let diff = sweepAngle - target.angle;
                if (diff < 0) diff += Math.PI * 2;

                // When sweep overlaps blip, light it up
                if (diff < 0.2) {
                    target.opacity = 1.0;
                    target.pulse = 10;
                    // Play subtle blip noise
                    if (Math.random() > 0.7) {
                        playSynthBeep(2200, 40, 0.01, "sine");
                    }
                } else {
                    // Decay opacity slowly
                    target.opacity -= 0.005;
                    if (target.opacity < 0) target.opacity = 0;
                    if (target.pulse > 0) target.pulse -= 0.2;
                }

                if (target.opacity > 0) {
                    radarCtx.fillStyle = `rgba(0, 255, 102, ${target.opacity})`;
                    radarCtx.beginPath();
                    radarCtx.arc(tx, ty, 4 + target.pulse * 0.5, 0, Math.PI * 2);
                    radarCtx.fill();

                    // Tiny dot core
                    radarCtx.fillStyle = `rgba(255, 255, 255, ${target.opacity})`;
                    radarCtx.beginPath();
                    radarCtx.arc(tx, ty, 1.5, 0, Math.PI * 2);
                    radarCtx.fill();
                }
            });

            requestAnimationFrame(drawRadar);
        }
        drawRadar();
    }

    // ----------------------------------------------------------------------
    // 9. RAPID REGISTER DUMP GENERATOR (LEFT SIDEBAR)
    // ----------------------------------------------------------------------
    function startRegistryDumpUpdates() {
        const registersEl = document.getElementById("sys-registers");
        const regNames = ["EAX", "EBX", "ECX", "EDX", "RIP", "RSP", "RBP", "ESI", "EDI", "R8 ", "R9 ", "R10"];

        // Generate initial list
        regNames.forEach(name => {
            const row = document.createElement("div");
            row.className = "reg-row";
            
            const nameSpan = document.createElement("span");
            nameSpan.className = "reg-addr";
            nameSpan.textContent = `[${name}]`;
            
            const valSpan = document.createElement("span");
            valSpan.className = "reg-val";
            valSpan.textContent = "0x" + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
            valSpan.id = `reg-${name.trim()}`;

            row.appendChild(nameSpan);
            row.appendChild(valSpan);
            registersEl.appendChild(row);
        });

        // Fast update interval
        setInterval(() => {
            const randomReg = regNames[Math.floor(Math.random() * regNames.length)].trim();
            const valEl = document.getElementById(`reg-${randomReg}`);
            
            if (valEl) {
                // Update hex value
                const newVal = "0x" + Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
                valEl.textContent = newVal;
                valEl.classList.add("active");
                
                setTimeout(() => {
                    valEl.classList.remove("active");
                }, 150);
            }
        }, 120);
    }

    // ----------------------------------------------------------------------
    // 10. FIREWALL BLOCKED THREAT LOG (RIGHT SIDEBAR)
    // ----------------------------------------------------------------------
    function startThreatBlocksSim() {
        const threatLogList = document.getElementById("threat-log");
        const threatBlockedCounter = document.getElementById("threats-blocked");

        const simulatedThreats = [
            { type: "محاولة اختراق DDOS", desc: "تم كشف فيضان حزم ICMP من خادم بعيد." },
            { type: "فحص المنافذ الفرعية", desc: "تم حظر محاولة مسح للمنافذ 22, 80, 443." },
            { type: "تسلل هجوم SQL Injection", desc: "تطهير مدخلات الاستعلام في قاعدة بيانات الدخول." },
            { type: "حقن أكواد برمجية XSS", desc: "تصفية وسوم البرمجة النصية الخبيثة." },
            { type: "محاولة فك تشفير هجين", desc: "رفض حزمة التحقق المفرطة لقدرات القوة العمياء." },
            { type: "كشف فيروسات حصان طروادة", desc: "تم عزل الملف المحمل مؤقتًا وتدميره ذاتيًا." },
            { type: "تزوير بروتوكول ARP", desc: "تجاهل إعلان البوابة الافتراضية المزيف لحماية التوجيه." }
        ];

        function generateRandomIP() {
            return `${Math.floor(Math.random() * 220) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
        }

        function createThreatLog() {
            const index = Math.floor(Math.random() * simulatedThreats.length);
            const data = simulatedThreats[index];
            const ip = generateRandomIP();

            const item = document.createElement("div");
            item.className = "threat-item";
            
            const isNormalBlock = Math.random() > 0.2;
            if (!isNormalBlock) item.classList.add("blocked");

            item.innerHTML = `
                <div class="threat-header">
                    <span class="threat-type">${isNormalBlock ? "⛔ حظر تهديد" : "🛡️ حماية تلقائية"}</span>
                    <span class="threat-ip">${ip}</span>
                </div>
                <div class="threat-desc">${data.type} - ${data.desc}</div>
            `;

            threatLogList.insertBefore(item, threatLogList.firstChild);
            
            // Increments counter
            state.threatsBlocked += 1;
            threatBlockedCounter.textContent = state.threatsBlocked;

            // Maintain max 7 logs on HUD panel
            if (threatLogList.children.length > 7) {
                threatLogList.removeChild(threatLogList.lastChild);
            }

            // Synthesize Warning double tone
            playWarningSound();
        }

        // Loop interval
        setInterval(() => {
            createThreatLog();
        }, 5000 + Math.random() * 6000);

        // Prepopulate first 3
        for (let i = 0; i < 3; i++) {
            createThreatLog();
        }
    }

    // ----------------------------------------------------------------------
    // 11. CRYPTOGRAPHIC KEY GENERATOR WIDGET (RIGHT SIDEBAR)
    // ----------------------------------------------------------------------
    function startCryptoKeyLoop() {
        const hashEl = document.getElementById("crypto-key-hash");
        const barEl = document.getElementById("crypto-key-bar");

        function generateHexKey(len) {
            const alphabet = "ABCDEF0123456789";
            let key = "";
            for (let i = 0; i < len; i++) {
                key += alphabet[Math.floor(Math.random() * alphabet.length)];
            }
            return key;
        }

        let progress = 0;

        function updateKeyGenerator() {
            progress += 1.5;
            if (progress >= 100) {
                progress = 0;
                
                // Synthesize key change tick
                playSynthBeep(2800, 30, 0.015, "triangle");
                
                // Generate a randomized SHA-256 styled hash
                const prefix = generateHexKey(8);
                const suffix = generateHexKey(8);
                hashEl.textContent = `KEY: ${prefix}...${suffix}`;
                
                // Add key rotate animation glow using GSAP
                gsap.fromTo(hashEl, { color: "#00e5ff" }, { color: "var(--neon-green)", duration: 0.5 });
            }

            barEl.style.width = `${progress}%`;
            requestAnimationFrame(updateKeyGenerator);
        }
        updateKeyGenerator();
    }

    // ----------------------------------------------------------------------
    // 12. CENTRAL INTERACTIVE TERMINAL ENGINE
    // ----------------------------------------------------------------------
    function setupInteractiveTerminal() {
        const terminalBody = document.getElementById("terminal-body");
        const cursor = document.getElementById("cursor");
        
        // List of interesting Arabic sci-fi and hacker command simulation outputs
        const simulatedLogs = [
            "جاري تحميل الوحدات والموارد الأساسية...",
            "فحص أمن النواة المركزية: [آمن 100%]",
            "تهيئة بروتوكولات التوجيه الكمي للبيانات...",
            "تحديث قواعد بيانات التهديدات السحابية...",
            "اكتملت العملية: نجاح تهيئة الذاكرة المتطايرة.",
            "جاري كسر تشفير محاكاة الاتصال بالنفق رقم 42...",
            "حقن وحدات مكافحة التجسس النشط في خادم النواة...",
            "رصد محاولة اتصال مجهول المصدر... تم التحويل للعزل.",
            "مستوى فحص جدار الحماية: نشط - القوة المفرطة.",
            "تم عزل 12 ملفًا مشبوهًا بنجاح وتدميرها.",
            "تأمين واجهة المستخدم الرسومية ضد الاختراقات الجانبية...",
            "تحديث مفاتيح SHA-256 للتشفير الديناميكي المتعدد...",
            "توجيه خوادم DNS البديلة لتجنب تتبع المصدر...",
            "فحص نشاط خادم الذاكرة العشوائية المؤقتة... [مستقر]",
            "بدء التشفير الكمي لنظام الحزم الواردة...",
            "فصل الأجهزة الطرفية غير المصرح بها فورًا.",
            "محاكاة حقن شفرات الحماية المتقدمة تم إنجازها بنجاح.",
            "تم إصدار شهادة تشفير معتمدة جديدة للنظام الفرعي.",
            "استكشاف منافذ الاتصال المفتوحة... الإغلاق التلقائي نشط.",
            "جاري مزامنة الوقت الذري مع خادم المزامنة المحلي...",
            "اكتملت عملية حماية النواة بنجاح 60FPS."
        ];

        // Typewriter text printing animation helper
        function typeTextLine(text, parentElement, onComplete) {
            const line = document.createElement("div");
            line.className = "terminal-line command-output";
            
            // Randomly flag some outputs as red/success
            const roll = Math.random();
            if (roll > 0.85) {
                line.classList.add("output-error");
                line.textContent = `[⚠️ خطأ نظام] > `;
            } else if (roll > 0.7) {
                line.classList.add("output-success");
                line.textContent = `[✔️ نظام] > `;
            } else {
                line.textContent = `[حماية] > `;
            }

            parentElement.insertBefore(line, cursor.parentNode);
            
            let charIndex = 0;
            const textToType = text;

            function printChar() {
                if (charIndex < textToType.length) {
                    line.textContent += textToType.charAt(charIndex);
                    charIndex++;
                    
                    // Mechanical keyboard click
                    playKeyclickSound();
                    
                    // Fast scroll
                    terminalBody.scrollTop = terminalBody.scrollHeight;
                    
                    // Variable typing speed
                    setTimeout(printChar, 15 + Math.random() * 20);
                } else {
                    if (onComplete) onComplete();
                }
            }
            printChar();
        }

        // Intercept all keystrokes in the document
        window.addEventListener("keydown", (e) => {
            // Ignore system hotkeys (like refresh, devtools)
            if (e.key === "F5" || e.key === "F12" || (e.ctrlKey && e.key === "r")) {
                return;
            }
            e.preventDefault();

            // Select random simulation command text
            const randomLogText = simulatedLogs[Math.floor(Math.random() * simulatedLogs.length)];
            
            // Perform printing
            typeTextLine(randomLogText, terminalBody, () => {
                // Done printing line
            });

            // Prevent huge DOM leaks, limit lines to 40
            const activeLines = terminalBody.querySelectorAll(".command-output");
            if (activeLines.length > 40) {
                terminalBody.removeChild(activeLines[0]);
            }
        });

        // Click in terminal area simulates keystroke too (for mobile users)
        terminalBody.addEventListener("click", () => {
            const randomLogText = simulatedLogs[Math.floor(Math.random() * simulatedLogs.length)];
            typeTextLine(randomLogText, terminalBody);

            const activeLines = terminalBody.querySelectorAll(".command-output");
            if (activeLines.length > 40) {
                terminalBody.removeChild(activeLines[0]);
            }
        });
    }

    // ----------------------------------------------------------------------
    // 13. DYNAMIC MOUSE RIPPLES & CUSTOM SCI-FI CURSOR
    // ----------------------------------------------------------------------
    function setupCustomCursor() {
        const cursorRing = document.getElementById("custom-cursor");
        
        if (!cursorRing) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let currentX = mouseX;
        let currentY = mouseY;

        // Smoothly interpolate cursor follow (LERP)
        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function updateCursorPosition() {
            const dx = mouseX - currentX;
            const dy = mouseY - currentY;
            
            // Lerp multiplier 0.15 for butter smoothness
            currentX += dx * 0.15;
            currentY += dy * 0.15;

            cursorRing.style.left = `${currentX}px`;
            cursorRing.style.top = `${currentY}px`;

            requestAnimationFrame(updateCursorPosition);
        }
        updateCursorPosition();

        // Mouse click effects: Ring scale and Ripple particle
        window.addEventListener("mousedown", () => {
            cursorRing.classList.add("cursor-active");
            
            // Create a ripple ring in document
            const ripple = document.createElement("div");
            ripple.className = "mouse-ripple";
            ripple.style.left = `${mouseX}px`;
            ripple.style.top = `${mouseY}px`;
            document.body.appendChild(ripple);

            // Clean up ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Synth beep feedback
            playSynthBeep(2400, 40, 0.02, "sine");
        });

        window.addEventListener("mouseup", () => {
            cursorRing.classList.remove("cursor-active");
        });
    }
});
