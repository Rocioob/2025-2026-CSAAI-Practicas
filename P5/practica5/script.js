const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 500;

let gameRunning = false;
let gameMode = '';
let score = { player: 0, bot: 0 };
let keys = {};
let totalSeconds = 0;
let timerInterval = null;
let animationId = null; 

const ball = { x: 400, y: 250, radius: 12, vx: 0, vy: 0, friction: 0.985 };
const player = { x: 150, y: 250, radius: 20, color: '#2196f3', speed: 4.5, angle: 0 };

const bots = [
    { x: 650, y: 150, radius: 20, color: '#f44336', speed: 2.8 },
    { x: 700, y: 250, radius: 20, color: '#f44336', speed: 2.2 }
];

const allies = [
    { x: 300, y: 350, radius: 20, color: '#1976d2', speed: 2.5 }
];

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function updateTimer() {
    if (!gameRunning) return;
    totalSeconds++;
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    document.getElementById('timer').innerText = `${m}:${s}`;
}

function startGame(mode) {
    
    const music = document.getElementById('bgMusic');
    if (music) {
        music.volume = 0.2; 
        music.play()
            .then(() => console.log("Música reproduciéndose"))
            .catch(error => console.error("Error al reproducir audio:", error));
    }
    gameMode = mode;
    score = { player: 0, bot: 0 };
    totalSeconds = 0;
    document.getElementById('p-score').innerText = "0";
    document.getElementById('b-score').innerText = "0";
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    resetPositions();
    startCountdown();
}

function startCountdown() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    let count = 3;
    const cd = document.getElementById('countdown');
    cd.style.display = "block";
    cd.innerText = count;
    
    const interval = setInterval(() => {
        count--;
        if (count > 0) cd.innerText = count;
        else if (count === 0) cd.innerText = "¡VAMOS!";
        else {
            clearInterval(interval);
            cd.innerText = "";
            cd.style.display = "none";
            gameRunning = true;
            gameLoop(); 
        }
    }, 1000);
}

function resetPositions() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;
    player.x = 100;
    player.y = canvas.height / 2;
    bots[0].x = 650; bots[0].y = 150;
    bots[1].x = 720; bots[1].y = 250;
    allies[0].x = 250; allies[0].y = 350;
}
function update() {
    if (!gameRunning) return;

    // 1. Movimiento Jugador
    if (keys['ArrowUp'] && player.y > player.radius) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.radius) player.y += player.speed;
    if (keys['ArrowLeft'] && player.x > player.radius) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.radius) player.x += player.speed;

    if (keys['KeyA']) player.angle -= 0.1;
    if (keys['KeyD']) player.angle += 0.1;

    
    [...bots, ...allies].forEach(b => {
        const dx = ball.x - b.x;
        const dy = ball.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 5) {
            b.x += (dx / dist) * b.speed;
            b.y += (dy / dist) * b.speed;
        }
    });

    
    ball.x += ball.vx; ball.y += ball.vy;
    ball.vx *= ball.friction; ball.vy *= ball.friction;

    
    const goalTop = 200, goalBottom = 300;
    const margin = 2; 

    
    if (ball.x - ball.radius <= 10) {
        if (ball.y > goalTop && ball.y < goalBottom) {
            checkGoal('bot');
            return;
        }
        ball.vx *= -0.8; 
        ball.x = 10 + ball.radius + margin; 
    }
    
    
    if (ball.x + ball.radius >= canvas.width - 10) {
        if (ball.y > goalTop && ball.y < goalBottom) {
            checkGoal('player');
            return;
        }
        ball.vx *= -0.8; 
        ball.x = canvas.width - 10 - ball.radius - margin; 
    }

    
    if (ball.y - ball.radius <= 10) {
        ball.vy *= -0.8;
        ball.y = 10 + ball.radius + margin;
    } else if (ball.y + ball.radius >= canvas.height - 10) {
        ball.vy *= -0.8;
        ball.y = canvas.height - 10 - ball.radius - margin;
    }

   
    [player, ...bots, ...allies].forEach(p => {
        const dx = ball.x - p.x;
        const dy = ball.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < p.radius + ball.radius) {
            if (p === player && keys['Space']) {
                ball.vx = Math.cos(player.angle) * 12;
                ball.vy = Math.sin(player.angle) * 12;
            } else {
                const angle = Math.atan2(dy, dx);
                ball.vx = Math.cos(angle) * 5;
                ball.vy = Math.sin(angle) * 5;
            }
            
            const angle = Math.atan2(dy, dx);
            ball.x = p.x + Math.cos(angle) * (p.radius + ball.radius + 2);
            ball.y = p.y + Math.sin(angle) * (p.radius + ball.radius + 2);
        }
    });
}

function checkGoal(winner) {
    gameRunning = false;
    score[winner]++;
    document.getElementById('p-score').innerText = score.player;
    document.getElementById('b-score').innerText = score.bot;

    
    const goalSound = document.getElementById('goalSound');
    if (goalSound) {
        goalSound.currentTime = 0;
        goalSound.volume = 0.7;
        goalSound.play().catch(() => {});
    }

    const cd = document.getElementById('countdown');
    cd.style.display = "block";
    cd.innerText = winner === 'player' ? "¡GOOOL!" : "¡GOL RIVAL!";

    setTimeout(() => {
        if (gameMode === 'golden-goal' || (gameMode === '3-goals' && (score.player === 3 || score.bot === 3))) {
            clearInterval(timerInterval);
            endGame(score.player > score.bot);
        } else {
            resetPositions();
            startCountdown();
        }
    }, 2000);
}

function endGame(win) {
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('result-text').innerText = win ? "¡CAMPEÓN!" : "DERROTA...";
}

function draw() {
    
    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 3;

    
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 10);
    ctx.lineTo(canvas.width / 2, canvas.height - 10);
    ctx.stroke();

    
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2);
    ctx.stroke();

   
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();

    
    ctx.strokeRect(10, canvas.height / 2 - 100, 80, 200);
    
    ctx.strokeRect(canvas.width - 90, canvas.height / 2 - 100, 80, 200);

    
    ctx.fillStyle = "white";
    
    ctx.fillRect(0, 200, 10, 100);
    
    ctx.fillRect(canvas.width - 10, 200, 10, 100);

    
    [player, ...allies, ...bots].forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath(); 
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); 
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    
    if (gameRunning) {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "rgba(0, 229, 255, 0.8)";
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(
            player.x + Math.cos(player.angle) * 50, 
            player.y + Math.sin(player.angle) * 50
        );
        ctx.stroke();
        ctx.restore();
    }

    
    ctx.fillStyle = "white";
    ctx.beginPath(); 
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); 
    ctx.fill();
    
    ctx.fillStyle = "#333";
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(
            ball.x + Math.cos(i * 1.2) * 6, 
            ball.y + Math.sin(i * 1.2) * 6, 
            3, 0, Math.PI * 2
        );
        ctx.fill();
    }
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function resetToMenu() { location.reload(); }


const mobileButtons = {
    'btn-up': 'ArrowUp',
    'btn-down': 'ArrowDown',
    'btn-left': 'ArrowLeft',
    'btn-right': 'ArrowRight',
    'btn-rotate-l': 'KeyA',
    'btn-rotate-r': 'KeyD',
    'btn-shoot': 'Space'
};


Object.entries(mobileButtons).forEach(([id, keyCode]) => {
    const btn = document.getElementById(id);
    if (!btn) return;

    
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys[keyCode] = true;
    });

    
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys[keyCode] = false;
    });
});

draw();


function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

const mobileControls = document.getElementById('mobile-controls');
if (mobileControls) {
    if (isTouchDevice()) {
        mobileControls.style.display = 'flex';
    } else {
        mobileControls.style.display = 'none';
    }
}
