/* jshint esversion: 6 */


const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 600;


const playerImg = new Image(); playerImg.src = 'nave.png';
const alienImg = new Image(); alienImg.src = 'aliens.png';
const explosionImg = new Image(); explosionImg.src = 'explosion.png';

const shootSound = new Audio('laser.mp3');
const explosionSound = new Audio('explosion.mp3');
const loseLifeSound = new Audio('lose-life.mp3');
const victorySound = new Audio('victory.mp3');
const defeatSound = new Audio('defeat.mp3');


let score = 0, lives = 3, energy = 100;
let gameOver = false, victory = false;
const ENERGY_COST = 20, RECHARGE_RATE = 0.4;

const player = { x: 375, y: 520, w: 50, h: 50, speed: 8, bullets: [] };
const aliens = { rows: 3, cols: 8, data: [], speed: 0.5, direction: 1, bullets: [] };

function initAliens() {
    aliens.data = [];
    for (let r = 0; r < aliens.rows; r++) {
        for (let c = 0; c < aliens.cols; c++) {
            aliens.data.push({ x: c * 90 + 60, y: r * 50 + 60, w: 40, h: 30, alive: true, explosion: 0 });
        }
    }
}

function shoot() {
    if (energy >= ENERGY_COST && !gameOver && !victory) {
        player.bullets.push({ x: player.x + 23, y: player.y, w: 4, h: 15 });
        energy -= ENERGY_COST;
        shootSound.currentTime = 0; shootSound.play().catch(()=>{});
    }
}


let moveInterval = null;
function startMove(dir) {
    if (moveInterval) clearInterval(moveInterval);
    moveInterval = setInterval(() => {
        if (dir === 'left' && player.x > 0) player.x -= player.speed;
        if (dir === 'right' && player.x < canvas.width - player.w) player.x += player.speed;
    }, 20);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-left').ontouchstart = (e) => { e.preventDefault(); startMove('left'); };
    document.getElementById('btn-left').ontouchend = () => clearInterval(moveInterval);
    document.getElementById('btn-right').ontouchstart = (e) => { e.preventDefault(); startMove('right'); };
    document.getElementById('btn-right').ontouchend = () => clearInterval(moveInterval);
    document.getElementById('btn-shoot').ontouchstart = (e) => { e.preventDefault(); shoot(); };
});


const keys = {};
window.onkeydown = e => { keys[e.code] = true; if(e.code === 'Space') shoot(); };
window.onkeyup = e => keys[e.code] = false;

function update() {
    if (gameOver || victory) return;

    // recarga de energia
    if (energy < 100) energy += RECHARGE_RATE;
    document.getElementById('energy-bar').style.width = energy + "%";

    // mover por teclado
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.w) player.x += player.speed;
    
    
    player.bullets.forEach((b, i) => {
        b.y -= 10;
        if (b.y < 0) player.bullets.splice(i, 1);
        aliens.data.forEach(a => {
            if (a.alive && b.x > a.x && b.x < a.x + a.w && b.y > a.y && b.y < a.y + a.h) {
                a.alive = false; a.explosion = 15; score += 10;
                player.bullets.splice(i, 1);
                explosionSound.currentTime = 0; explosionSound.play().catch(()=>{});
            }
        });
    });

    
    aliens.bullets.forEach((eb, i) => {
        eb.y += 4;
        if (eb.y > canvas.height) aliens.bullets.splice(i, 1);
        if (eb.x > player.x && eb.x < player.x + player.w && eb.y > player.y && eb.y < player.y + player.h) {
            lives--;
            aliens.bullets.splice(i, 1);
            loseLifeSound.play().catch(()=>{});
            if (lives <= 0) { gameOver = true; defeatSound.play().catch(()=>{}); }
        }
    });

    
    let aliveAliens = aliens.data.filter(a => a.alive);
    let currentSpeed = (aliens.speed + (24 - aliveAliens.length) * 0.1) * aliens.direction;
    let edge = false;

    aliveAliens.forEach(a => {
        a.x += currentSpeed;
        if (a.x + a.w > canvas.width || a.x < 0) edge = true;
    });

    if (edge) {
        aliens.direction *= -1;
        aliens.data.forEach(a => { if (a.alive) a.y += 20; });
    }

    // DISPARO ENEMIGO
    if (Math.random() < 0.015 && aliveAliens.length > 0) {
        const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
        aliens.bullets.push({ x: shooter.x + shooter.w / 2, y: shooter.y + shooter.h });
    }

    if (aliveAliens.length === 0) { victory = true; victorySound.play().catch(()=>{}); }
    if (aliens.data.some(a => a.alive && a.y + a.h > player.y)) { gameOver = true; defeatSound.play().catch(()=>{}); }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Naves
    ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
    aliens.data.forEach(a => {
        if (a.alive) ctx.drawImage(alienImg, a.x, a.y, a.w, a.h);
        else if (a.explosion > 0) { ctx.drawImage(explosionImg, a.x, a.y, a.w, a.h); a.explosion--; }
    });

    // balas
    ctx.fillStyle = '#0f2';
    player.bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 15));
    ctx.fillStyle = '#f00';
    aliens.bullets.forEach(eb => ctx.fillRect(eb.x, eb.y, 4, 15));
    
    
    document.getElementById('score').textContent = `PUNTOS: ${score}`;
    document.getElementById('lives').textContent = `VIDAS: ${' \u2764\ufe0f '.repeat(lives)}`;

    if (gameOver || victory) {
        ctx.fillStyle = "#633d6e"; 
        ctx.fillRect(0,0,canvas.width, canvas.height);
        
        ctx.fillStyle = victory ? "#0f2" : "red";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // para horizontal
    
        const isLandscape = window.innerHeight < 500;
        
        
        const fontSize = isLandscape ? "bold 60px" : "bold 80px";
        const titleY = isLandscape ? canvas.height * 0.4 : canvas.height / 2 - 40;
        const subtitleY = isLandscape ? canvas.height * 0.6 : canvas.height / 2 + 40;

        ctx.font = `${fontSize} Courier New`;
        ctx.fillText(victory ? "¡VICTORIA!" : "GAME OVER", canvas.width/2, titleY);
        
        
        ctx.fillStyle = "white";
        ctx.font = isLandscape ? "20px Courier New" : "30px Courier New";
        ctx.fillText(victory ? "Sector Canva Centauri asegurado" : "La humanidad ha caído...", canvas.width/2, subtitleY);

        
        document.getElementById('play-again-btn').style.display = "block";
    }
}

document.getElementById('play-again-btn').onclick = () => location.reload();
function loop() { update(); draw(); requestAnimationFrame(loop); }
initAliens(); loop();