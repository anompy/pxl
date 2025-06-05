const telegram = Telegram.WebApp;
telegram.ready();

// --- Global Variables (Audio and Preloader) ---
let progress = 0;
let intervalId;
const loadedAudio = {};

// --- Audio Loading Functions (TIDAK BERUBAH DARI ASLI ANDA) ---
async function loadAudioAssets(audioUrls) {
  const promises = [];
  for (const key in audioUrls) {
    const audioUrl = audioUrls[key];
    const promise = new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.addEventListener('canplaythrough', () => {
        loadedAudio[key] = audio; // Simpan ke objek loadedAudio global
        resolve();
        progress += 100 / Object.keys(audioUrls).length + 1; // Logika progres Anda yang asli
      });
      audio.addEventListener('error', () => {
        reject(new Error(`Gagal memuat audio: ${audioUrl}`));
      });
      audio.src = audioUrl;
    });
    promises.push(promise);
  }
  return Promise.all(promises);
}


const audiosToLoad = {
    jump: 'https://anompy.github.io/pxl/assets/audio/jump.mp3',
    slide: 'https://anompy.github.io/pxl/assets/audio/slide.mp3',
    boom: 'https://anompy.github.io/pxl/assets/audio/vine-boom.mp3',
    start: 'https://anompy.github.io/pxl/assets/audio/game-start.mp3',
    music: 'https://anompy.github.io/pxl/assets/audio/game-music.mp3',
    over: 'https://anompy.github.io/pxl/assets/audio/game-over.mp3',
};

// --- Preloader Functions (TIDAK BERUBAH DARI ASLI ANDA) ---
function preLoading(status) {
    const preloaderContainer = document.getElementById('preloader-container');
    const progressBar = document.getElementById('preloader-status-bar');

    if (status) {
      preloaderContainer.style.display = 'flex';
      progress = 0; // Reset progress
      clearInterval(intervalId); // Hentikan interval sebelumnya jika ada
      intervalId = setInterval(() => {
        progressBar.style.width = `${progress}%`;

        if (progress >= 100) {
          clearInterval(intervalId);
          setTimeout(() => {
            preLoading(false);
          }, 2000);
        }
      }, 1000);
    } else {
      preloaderContainer.style.display = 'none';
      clearInterval(intervalId); // hentikan interval
    }
}

// --- Music Control Function (TIDAK BERUBAH DARI ASLI ANDA) ---
function playMusic(loop) {
    const musicElement = loadedAudio.music;

    if (loop) {
        musicElement.volume = 0.4;
        musicElement.loop = true;
        musicElement.play();
        
        
    } else {
        musicElement.pause();
        musicElement.currentTime = 0;
        musicElement.loop = false;
        console.log("Musik latar belakang dihentikan.");
    }
}

// --- Initial App Load Function (TIDAK BERUBAH DARI ASLI ANDA) ---
async function initMiniApp(){
    try {
        preLoading(true);
        const musicLoaded = await loadAudioAssets(audiosToLoad);
    } catch (error) {
        console.error('Gagal memuat beberapa atau semua gambar:', error.message);
    }
}

// --- Game Constants and State (Dipindahkan ke lingkup global, tanpa perubahan nilai atau tipe) ---
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const PLAYER_SPEED = 5;
const OBSTACLE_SPEED = 5;
const COIN_SPEED = 5;

let gameRunning = false;
let player;
let obstacles = [];
let coins = [];
let score = 0;
let coinCount = 0;
let gameSpeed = 1;
let lastObstacleTime = 0;
let animationId;
let isJumping = false;
let isSliding = false;
let slideTimer = 0;
let deathAnimation = false;
let deathRotation = 0;
let deathVelocityY = 0;
let particles = [];
let groundHeight = 80;

// --- Canvas and UI elements (Dideklarasikan di sini, akan diberi nilai di DOMContentLoaded) ---
let canvas;
let ctx;
let startScreen;
let gameOverScreen;
let startBtn;
let restartBtn;
let scoreDisplay;
let coinDisplay;
let finalScore;
let finalCoins;
let jumpBtn;
let slideBtn;

// --- Game Core Functions (Dipindahkan keluar DOMContentLoaded, TIDAK ADA PERUBAHAN LOGIKA INTERNAL) ---

// Resize canvas to fit container
function resizeCanvas() {
    // Pastikan elemen canvas sudah diinisialisasi sebelum digunakan
    if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
}

// Create particles for effects
function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 4 + 2,
            color: color,
            speedX: (Math.random() - 0.5) * 8,
            speedY: (Math.random() - 0.5) * 8,
            life: 30
        });
    }
}

// Initialize game
function initGame() {
    // Set canvas size
    resizeCanvas();

    // Calculate ground position
    const groundY = canvas.height - groundHeight;

    // Initialize player
    player = {
        x: 50,
        y: groundY - 60,
        width: 40,
        height: 60,
        velocityY: 0,
        isJumping: false,
        isSliding: false,
        slideTimer: 0,
        normalHeight: 60,
        slideHeight: 30
    };

    // Reset game state
    obstacles = [];
    coins = []; // Ini memang ada di kode asli Anda di dalam initGame
    particles = [];
    score = 0;
    coinCount = 0; // Ini memang ada di kode asli Anda di dalam initGame
    gameSpeed = 1;
    lastObstacleTime = 0;
    isJumping = false;
    isSliding = false;
    slideTimer = 0;
    deathAnimation = false;
    deathRotation = 0;
    deathVelocityY = 0;

    // Update UI (Logika ini tetap sama persis dengan asli Anda)
    scoreDisplay.textContent = score;
    // coinDisplay.textContent = coinCount; // Baris ini sengaja di-comment out di kode asli Anda dan saya pertahankan




    // Hide screens
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';

    // Start game loop
    gameRunning = true;
    gameLoop();
    // Mengaktifkan event listener game setelah game dimulai
    bindGameEvents();
    playMusic(true); // Memutar musik saat game dimulai
}

// Player actions - Handle jump (Dinamai handleJump agar konsisten dengan event binding)
function handleJump() {
    if (!player.isJumping && !deathAnimation) {
        player.velocityY = JUMP_FORCE;
        player.isJumping = true;
        createParticles(player.x + player.width / 2, player.y + player.height, "#44aaff", 10);
        if (loadedAudio.jump) { // Ditambahkan safety check
            loadedAudio.jump.play().catch(e => console.warn("Jump sound autoplay blocked.", e));
        }
    }
}

// Player actions - Handle slide (Dinamai handleSlide agar konsisten dengan event binding)
function handleSlide() {
    if (!player.isJumping && !player.isSliding && !deathAnimation) {
        player.isSliding = true;
        player.slideTimer = 40;
        player.height = player.slideHeight;
        player.y = (canvas.height - groundHeight) - player.slideHeight + 10;
        createParticles(player.x + player.width / 2, player.y + player.height, "#44aaff", 5);
        if (loadedAudio.slide) { // Ditambahkan safety check
            loadedAudio.slide.play().catch(e => console.warn("Slide sound autoplay blocked.", e));
        }
    }
}

// Create obstacles
function createObstacle() {
    const groundY = canvas.height - groundHeight;

    const obstacleTypes = [
        { width: 30, height: 50, y: groundY - 50, type: 'ground', color: '#ff3366' },
        { width: 60, height: 30, y: groundY - 30, type: 'ground', color: '#ff3366' },
        { width: 40, height: 60, y: groundY - 60, type: 'ground', color: '#ff3366' },
        { width: 70, height: 30, y: groundY - 80, type: 'lowCeiling', color: '#33cc33' },
        { width: 50, height: 40, y: groundY - 80, type: 'lowCeiling', color: '#33cc33' },
        { width: 90, height: 25, y: groundY - 80, type: 'lowCeiling', color: '#33cc33' }
    ];

    const type = Math.floor(Math.random() * obstacleTypes.length);

    obstacles.push({
        x: canvas.width,
        y: obstacleTypes[type].y,
        width: obstacleTypes[type].width,
        height: obstacleTypes[type].height,
        passed: false,
        type: obstacleTypes[type].type,
        color: obstacleTypes[type].color
    });
}


// Update game state
function update() {
    const groundY = canvas.height - groundHeight;

    if (deathAnimation) {
        deathVelocityY += GRAVITY;
        player.y += deathVelocityY;
        deathRotation += 10;

        if (Math.random() > 0.7) {
            createParticles(
                player.x + Math.random() * player.width,
                player.y + Math.random() * player.height,
                "#ff3366",
                1
            );
        }

        if (player.y > canvas.height + 100) {
            gameOver();
        }
        return;
    }

    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    if (player.y > groundY - player.height) {
        player.y = groundY - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    if (player.isSliding) {
        player.slideTimer--;
        if (player.slideTimer <= 0) {
            player.isSliding = false;
            player.height = player.normalHeight;
            player.y = groundY - player.height;
        }
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= OBSTACLE_SPEED * gameSpeed;

        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            continue;
        }

        if (!obstacles[i].passed && obstacles[i].x < player.x) {
            obstacles[i].passed = true;
            score += 10;
            scoreDisplay.textContent = score;
        }

        if (checkCollision(player, obstacles[i])) {
            startDeathAnimation();
            if (loadedAudio.boom) { // Ditambahkan safety check
                loadedAudio.boom.play().catch(e => console.warn("Boom sound autoplay blocked.", e));
            }
            return;
        }
    }




    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].x += particles[i].speedX;
        particles[i].y += particles[i].speedY;
        particles[i].life--;

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Generate new obstacles & coins (Logika ini tetap sama persis dengan asli Anda)
    const now = Date.now();
    if (now - lastObstacleTime > 1500 / gameSpeed) {
        createObstacle();
        lastObstacleTime = now;
    }
    

    gameSpeed = 1 + score * 0.001;
}

// Start death animation
function startDeathAnimation() {
    deathAnimation = true;
    deathVelocityY = -8;
    deathRotation = 0;
    playMusic(false); // Stop background music

    for (let i = 0; i < 30; i++) {
        createParticles(
            player.x + player.width / 2,
            player.y + player.height / 2,
            "#ff3366",
            1
        );
    }
}

// Check collision between two objects
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}

// Render game
function render() {
    const groundY = canvas.height - groundHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    particles.forEach(p => {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        ctx.fillStyle = obstacle.type === 'ground' ? '#cc2255' : '#229922';
        for (let i = 0; i < obstacle.width; i += 10) {
            for (let j = 0; j < obstacle.height; j += 10) {
                if (Math.random() > 0.7) {
                    ctx.fillRect(obstacle.x + i, obstacle.y + j, 5, 5);
                }
            }
        }

        if (obstacle.type === 'lowCeiling') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(obstacle.x, obstacle.y + obstacle.height, obstacle.width, 5);
        }
    });


    drawPlayer();

    ctx.fillStyle = '#3a4a3f';
    ctx.fillRect(0, groundY, canvas.width, groundHeight);

    ctx.fillStyle = '#2d3a32';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, groundY, 10, groundHeight);
    }
}

// Draw background
function drawBackground() {
    const groundY = canvas.height - groundHeight;

    const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
    gradient.addColorStop(0, '#1a2a3a');
    gradient.addColorStop(1, '#0a1420');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, groundY);

    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * groundY;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }

    ctx.fillStyle = '#2a3a4a';
    drawMountain(100, groundY, 80, 150);
    drawMountain(300, groundY, 60, 120);
    drawMountain(500, groundY, 70, 130);

    ctx.fillStyle = '#334455';
    drawMountain(50, groundY, 60, 100);
    drawMountain(200, groundY, 50, 90);
    drawMountain(400, groundY, 65, 110);
}

// Draw a mountain
function drawMountain(x, groundY, width, height) {
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x + width / 2, groundY - height);
    ctx.lineTo(x + width, groundY);
    ctx.closePath();
    ctx.fill();
}

// Draw player
function drawPlayer() {
    const groundY = canvas.height - groundHeight;

    ctx.save();

    if (deathAnimation) {
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        ctx.rotate(deathRotation * Math.PI / 180);
        ctx.translate(-player.width / 2, -player.height / 2);
    }

    ctx.fillStyle = deathAnimation ? '#ff3366' : '#44aaff';
    ctx.fillRect(deathAnimation ? 0 : player.x, deathAnimation ? 0 : player.y, player.width, player.height);

    ctx.fillStyle = deathAnimation ? '#cc2255' : '#3388cc';

    if (!deathAnimation) {
        ctx.fillRect(player.x + 10, player.y + 15, 5, 5);
        ctx.fillRect(player.x + 25, player.y + 15, 5, 5);

        if (player.isSliding) {
            ctx.fillRect(player.x + 15, player.y + 25, 10, 3);
        } else {
            ctx.fillRect(player.x + 12, player.y + 30, 16, 5);
        }
    } else {
        ctx.beginPath();
        ctx.moveTo(player.x + 10, player.y + 15);
        ctx.lineTo(player.x + 15, player.y + 20);
        ctx.moveTo(player.x + 15, player.y + 15);
        ctx.lineTo(player.x + 10, player.y + 20);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(player.x + 25, player.y + 15);
        ctx.lineTo(player.x + 30, player.y + 20);
        ctx.moveTo(player.x + 30, player.y + 15);
        ctx.lineTo(player.x + 25, player.y + 20);
        ctx.stroke();
    }

    ctx.fillRect(deathAnimation ? 0 : player.x - 5, deathAnimation ? 20 : player.y + 20, 5, 20);
    ctx.fillRect(deathAnimation ? player.width : player.x + player.width, deathAnimation ? 20 : player.y + 20, 5, 20);

    if (!player.isSliding && !deathAnimation) {
        ctx.fillRect(player.x + 5, player.y + player.height, 10, 10);
        ctx.fillRect(player.x + 25, player.y + player.height, 10, 10);
    }

    if (!deathAnimation) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(
            player.x + player.width / 2,
            groundY + 5,
            player.width / 2,
            5,
            0, 0, Math.PI * 2
        );
        ctx.fill();
    }

    ctx.restore();
}

// Game over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    // Menonaktifkan event listener game setelah game over
    unbindGameEvents();
    playMusic(false); // Menghentikan musik saat game over

    setTimeout(function () {
        finalScore.textContent = score;
        // finalCoins.textContent = coinCount; // Baris ini telah dihapus sesuai instruksi Anda
        gameOverScreen.style.display = 'flex';
        if (loadedAudio.over) { // Ditambahkan safety check
            loadedAudio.over.play().catch(e => console.warn("Game over sound autoplay blocked.", e));
        }
    }, 300);
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    update();
    render();

    animationId = requestAnimationFrame(gameLoop);
}

// --- Event Handlers (Dipindahkan keluar DOMContentLoaded) ---
let startY = 0; // for canvas swipe

const handleCanvasTouchStart = (e) => {
    if (e.touches.length === 1) {
        startY = e.touches[0].clientY;
    }
};

const handleCanvasTouchMove = (e) => {
    e.preventDefault(); // Prevent default scrolling browser during swipe
};

const handleCanvasTouchEnd = (e) => {
    if (startY !== 0) {
        const endY = e.changedTouches[0].clientY;
        const deltaY = endY - startY;

        if (deltaY > 10) { // Swipe down
            handleSlide();
        } else if (deltaY < -10) { // Swipe up
            handleJump();
        }
        startY = 0; // Reset startY
    }
};

// Global keyboard event handler
const handleGlobalKeyDown = (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        handleJump();
    } else if (e.code === 'ArrowDown') {
        handleSlide();
    }
};

// --- Binding and Unbinding Game-Specific Events ---
function bindGameEvents() {
    // UI button events (jump and slide)
    jumpBtn.addEventListener('touchstart', handleJump);
    slideBtn.addEventListener('touchstart', handleSlide);
    jumpBtn.addEventListener('mousedown', handleJump); // Mouse events for desktop
    slideBtn.addEventListener('mousedown', handleSlide);

    // Canvas touch events (swipe)
    canvas.addEventListener('touchstart', handleCanvasTouchStart);
    canvas.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleCanvasTouchEnd);

    // Global keyboard events
    document.addEventListener('keydown', handleGlobalKeyDown);
}

function unbindGameEvents() {
    // Remove UI button events
    jumpBtn.removeEventListener('touchstart', handleJump);
    slideBtn.removeEventListener('touchstart', handleSlide);
    jumpBtn.removeEventListener('mousedown', handleJump);
    slideBtn.removeEventListener('mousedown', handleSlide);

    // Remove Canvas touch events
    canvas.removeEventListener('touchstart', handleCanvasTouchStart);
    canvas.removeEventListener('touchmove', handleCanvasTouchMove);
    canvas.removeEventListener('touchend', handleCanvasTouchEnd);

    // Remove Global keyboard events
    document.removeEventListener('keydown', handleGlobalKeyDown);
}

// --- Initial Setup on DOMContentLoaded (Minimum code here) ---
document.addEventListener('DOMContentLoaded', () => {
    // Assign DOM elements to variables after the DOM is fully loaded
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    startScreen = document.getElementById('start-screen');
    gameOverScreen = document.getElementById('game-over-screen');
    startBtn = document.getElementById('start-btn');
    restartBtn = document.getElementById('restart-btn');
    outGame = document.getElementById('out-game');
    scoreDisplay = document.getElementById('score');
    coinDisplay = document.getElementById('coin-count');
    finalScore = document.getElementById('final-score');
    finalCoins = document.getElementById('final-coins'); // Variabel ini tetap ada, namun tidak digunakan dalam fungsi
    jumpBtn = document.getElementById('jump-btn');
    slideBtn = document.getElementById('slide-btn');

    // Global event listeners (always active regardless of game state)
    startBtn.addEventListener('click', () => {
       initGame();
       playMusic(true);
    });
    
    outGame.addEventListener('click', () => {
       telegram.close();
    });
    
    restartBtn.addEventListener('click', initGame);

    // Handle window resize (always active)
    window.addEventListener('resize', resizeCanvas);

    // Initial canvas setup
    resizeCanvas();
    ctx.fillStyle = '#0d0f1c'; // Draw initial background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
     
    //perluas miniapps
    telegram.requestFullscreen();
    // Start loading assets
    initMiniApp();
});
