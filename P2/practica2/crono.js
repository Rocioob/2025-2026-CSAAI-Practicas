const crono = {
    activo: false,
    inicio: null, // COMO EL NONE DE PYTHON
    tiempo: 0,
    intervalo: null,

    start: function() {
        if (this.activo) return;
        this.activo = true;
        this.inicio = Date.now() - this.tiempo;
        this.intervalo = setInterval(() => {
            this.tiempo = Date.now() - this.inicio;
            if (typeof this.onTick === 'function') this.onTick(this.tiempo);
        }, 30);
    },

    stop: function() {
        this.activo = false;
        clearInterval(this.intervalo);
    },

    format: function(ms) {
        const totalSeg = Math.floor(ms / 1000);
        const min = Math.floor(totalSeg / 60).toString().padStart(2, '0');
        const seg = (totalSeg % 60).toString().padStart(2, '0');
        const cent = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
        return min + ":" + seg + ":" + cent;
    }
};


const MAX_INTENTOS = 7;
//crea una clave random
function generarClaveSecreta() {
    let numeros = [];
    while (numeros.length < 4) {
        let n = Math.floor(Math.random() * 10);
        if (!numeros.includes(n)) {
            numeros.push(n);
        }
    }
    return numeros;
}
let claveSecreta = generarClaveSecreta();
let intentosRestantes = MAX_INTENTOS;
let aciertos = [false, false, false, false];
let partidaTerminada = false;


const dIntentos = document.getElementById('intentos');
const dCrono = document.getElementById('cronometro');
const dMensaje = document.getElementById('mensaje');


function presionarNumero(num, boton) {
    if (partidaTerminada) return;

    // si esta parado funciona
    if (!crono.activo) crono.start();

    // si acierto el numero desactivo el botón
    boton.disabled = true;
    boton.style.opacity = "0.3";

    // resto un intento
    intentosRestantes--;
    dIntentos.innerHTML = intentosRestantes;

    // comprobación de si en numero esta en la clave
    let encontrado = false;
    for (let i = 0; i < 4; i++) {
        if (claveSecreta[i] === num) {
            aciertos[i] = true;
            encontrado = true;
            document.getElementById('d' + i).innerHTML = num;
            document.getElementById('d' + i).style.color = "#33ff33";
        }
    }

    if (encontrado) {
        dMensaje.innerHTML = "¡Acertaste el " + num + "!";
    } else {
        dMensaje.innerHTML = "El " + num + " no está.";
    }

    // mensaje final
    if (aciertos.every(a => a == true)) {
        partidaTerminada = true;
        crono.stop();
        let intentosUsados = MAX_INTENTOS - intentosRestantes;
        dMensaje.innerHTML = "¡VICTORIA! Tiempo empleado: " + dCrono.innerHTML + ", Intentos consumidos: " + intentosUsados + ", Intentos restantes: " + intentosRestantes;
        // Mostrar imagen de victoria
        document.getElementById('victoria-img').style.display = 'block';
    } else if (intentosRestantes === 0) {
        partidaTerminada = true;
        crono.stop();
        dMensaje.innerHTML = "BOOM! Has perdido. La clave era " + claveSecreta.join("");
    }
}

// para que funcione el boton start
document.getElementById('start-btn').onclick = () => {
    crono.start();
};

document.getElementById('reset-btn').onclick = () => {
    location.reload(); 
};

// funcion del boton stop -> parar
document.getElementById('stop-btn').onclick = () => {
    crono.stop();
};

//cada vez que pasa el tiempo se actualiza el cronometro
crono.onTick = (ms) => {
    dCrono.innerHTML = crono.format(ms);
};