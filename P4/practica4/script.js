/* jshint esversion: 8 */
/* jshint browser: true */
/* jshint devel: true */

let gameActive = false;
let currentLevel = 1;
let time = 0;
let timerInterval;
let musicOn = true;

const data = {
    f1: { w1: { n: 'MAYA', i: 'maya.png' }, w2: { n: 'RAYA', i: 'raya.png' } },
    f2: { w1: { n: 'MESI', i: 'mesi.png' } , w2: { n: 'MESA', i: 'mesa.png' }},
    f3: { w1: { n: 'PATA', i: 'pata.png' } , w2: { n: 'PAPA', i: 'papa.png' }},
    f4: { w1: { n: 'FRESA', i: 'fresa.png' } , w2: { n: 'PRESA', i: 'presa.png' }}
};

const levelsMap = [
    [0,1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1,0],
    [1,1,0,0,1,1,0,0],
    [1,0,1,1,0,0,1,0],
    [0,1,1,0,1,0,0,1]
];

const grid = document.getElementById('grid');
const audio = document.getElementById('bg-music');

function setupGrid() {
    const pair = data[document.getElementById('word-pair').value];
    const layout = levelsMap[currentLevel - 1] || levelsMap[0];
    const showTitles = document.getElementById('show-titles').checked;
    grid.innerHTML = '';
    
    layout.forEach((type, index) => {
        const item = type === 0 ? pair.w1 : pair.w2;
        const imgContent = `<img src="${item.i}" alt="${item.n}">`;
        const titleContent = showTitles ? `<b>${item.n}</b>` : '';
        grid.innerHTML += `
            <div class="card" id="card-${index}">
                ${imgContent}
                ${titleContent}
            </div>`;
    });
}

async function startLevel() {
    if (!gameActive || currentLevel > 5) return;

    document.getElementById('lvl').textContent = `${currentLevel}/5`;
    document.getElementById('big-lvl-display').textContent = `${currentLevel}/5`;
    document.getElementById('status').textContent = "Jugando";
    document.getElementById('display-word').textContent = `Nivel ${currentLevel}`;

    await new Promise(r => setTimeout(r, 1000));
    if (!gameActive) return;

    const speed = 1200 - (currentLevel * 150);
    
    for (let i = 0; i < 8; i++) {
        if (!gameActive) break; 

        document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
        const activeCard = document.getElementById(`card-${i}`);
        if (activeCard) {
            activeCard.classList.add('active');
            document.getElementById('display-word').textContent = activeCard.querySelector('b').textContent;
        }
        await new Promise(r => setTimeout(r, speed));
    }

    if (gameActive) {
        if (currentLevel >= 5) {
            finishGame();
        } else {
            currentLevel++;
            setupGrid();
            startLevel();
        }
    }
}

document.getElementById('btn-start').onclick = () => {
    gameActive = true;
    currentLevel = parseInt(document.getElementById('start-lvl').value);
    time = 0;
    
    document.getElementById('btn-start').disabled = true;
    document.getElementById('btn-stop').disabled = false;
    document.getElementById('word-pair').disabled = true;
    document.getElementById('start-lvl').disabled = true;
    
    if(musicOn) audio.play();
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        time += 0.1;
        document.getElementById('time').textContent = time.toFixed(1) + 's';
    }, 100);

    setupGrid();
    startLevel();
};

document.getElementById('btn-stop').onclick = () => {
    stopAll();
    document.getElementById('status').textContent = "Detenido";
    document.getElementById('display-word').textContent = 'Pulsa "Empezar"';
};

document.getElementById('btn-music').onclick = () => {
    musicOn = !musicOn;
    document.getElementById('btn-music').textContent = `Música: ${musicOn ? 'ON' : 'OFF'}`;
    musicOn && gameActive ? audio.play() : audio.pause();
};

function stopAll() {
    gameActive = false;
    clearInterval(timerInterval);
    audio.pause();
    audio.currentTime = 0;
    document.getElementById('btn-start').disabled = false;
    document.getElementById('btn-stop').disabled = true;
    document.getElementById('word-pair').disabled = false;
    document.getElementById('start-lvl').disabled = false;
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
}

function finishGame() {
    stopAll();
    document.getElementById('status').textContent = "¡Completado!";
    const displayWord = document.getElementById('display-word');
    displayWord.innerHTML = "🏆 ¡PARTIDA FINALIZADA! 🏆";
    displayWord.style.color = "#2e7d32";
    
    setTimeout(() => {
        alert(`¡Felicidades! Has completado el desafío en ${time.toFixed(1)}s`);
        displayWord.style.color = "";
    }, 500);
}

document.getElementById('word-pair').onchange = setupGrid;
setupGrid();