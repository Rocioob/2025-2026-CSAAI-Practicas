
class Crono {
    constructor(display) {
        this.display = display;
        this.activo = false;
        this.inicio = null;
        this.tiempo = 0;
        this.intervalo = null;
    }


    format(ms) {
        const totalSeg = Math.floor(ms / 1000);
        const min = Math.floor(totalSeg / 60).toString().padStart(2, '0');
        const seg = (totalSeg % 60).toString().padStart(2, '0');
        const cent = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
        return `${min}:${seg}:${cent}`;
    }

    start() {
        if (this.activo) return;
        this.activo = true;
        this.inicio = Date.now() - this.tiempo;
        this.intervalo = setInterval(() => {
            this.tiempo = Date.now() - this.inicio;
            this.display.innerHTML = this.format(this.tiempo);
        }, 30);
    }

    stop() {
        this.activo = false;
        clearInterval(this.intervalo);
    }

    reset() {
        this.stop();
        this.tiempo = 0;
        this.inicio = null;
        this.display.innerHTML = "00:00:00";
    }
}


const MAX_INTENTOS = 7;
let claveSecreta = generarClaveSecreta();
let intentosRestantes = MAX_INTENTOS;
let aciertos = [false, false, false, false];
let partidaTerminada = false;

const dCrono = document.getElementById('cronometro');
const crono = new Crono(dCrono);

const dIntentos = document.getElementById('intentos');
const dMensaje = document.getElementById('mensaje');

function generarClaveSecreta() {
    let numeros = [];
    while (numeros.length < 4) {
        let n = Math.floor(Math.random() * 10);
        if (!numeros.includes(n)) numeros.push(n);
    }
    return numeros;
}

function presionarNumero(num, boton) {
    if (partidaTerminada) return;
    if (!crono.activo) crono.start();

    boton.disabled = true;
    boton.style.opacity = "0.3";
    intentosRestantes--;
    dIntentos.innerHTML = intentosRestantes;

    let encontrado = false;
    for (let i = 0; i < 4; i++) {
        if (claveSecreta[i] === num) {
            aciertos[i] = true;
            encontrado = true;
            const digitoVisual = document.getElementById('d' + i);
            digitoVisual.innerHTML = num;
            digitoVisual.style.color = "#33ff33"; // color acierto
        }
    }

    dMensaje.innerHTML = encontrado ? `¡Acertaste el ${num}!` : `El ${num} no está.`;

    if (aciertos.every(a => a === true)) {
        finalizarPartida(true);
    } else if (intentosRestantes === 0) {
        finalizarPartida(false);
    }
}

function finalizarPartida(victoria) {
    partidaTerminada = true;
    crono.stop();
    if (victoria) {
        let usados = MAX_INTENTOS - intentosRestantes;
        dMensaje.innerHTML = `¡VICTORIA! Tiempo: ${dCrono.innerHTML}, Intentos: ${usados}, Restantes: ${intentosRestantes}`;
        document.getElementById('victoria-img').style.display = 'block';
    } else {
        dMensaje.innerHTML = `BOOM! Has perdido. La clave era ${claveSecreta.join("")}`;
        
        claveSecreta.forEach((n, i) => document.getElementById('d' + i).innerHTML = n);
    }
}

// botones de control
document.getElementById('start-btn').onclick = () => crono.start();
document.getElementById('stop-btn').onclick = () => crono.stop();
document.getElementById('reset-btn').onclick = resetJuego;

// reinicia el juego
function resetJuego() {
    crono.reset();
    claveSecreta = generarClaveSecreta();
    intentosRestantes = MAX_INTENTOS;
    aciertos = [false, false, false, false];
    partidaTerminada = false;
    
    dIntentos.innerHTML = MAX_INTENTOS;
    dMensaje.innerHTML = "";
    document.getElementById('victoria-img').style.display = 'none';


    for (let i = 0; i < 4; i++) {
        const d = document.getElementById('d' + i);
        d.innerHTML = "*";
        d.style.color = "#ff4444";
    }

    const botones = document.getElementsByClassName('num-btn');
    for (let b of botones) {
        b.disabled = false;
        b.style.opacity = "1";
    }
}