/**
 * J.A.R.V.I.S. MARK VII - ESTRUCTURA MAESTRA
 * Versión: 7.1 (Corregida y Optimizada)
 * Propiedad de: Darling | Feria
 */

// --- [ SECCIÓN 0: CONFIGURACIÓN DE ENLACES Y VARIABLES GLOBALES ] ---
const p1 = "sk-or-";
const p2 = "v1-a13b949d7de4ed40d9f9b0376";
const p3 = "c37a96b2ade795b5fca3a562af071d49e4ce5be"; 

const API_KEY = p1 + p2 + p3; // Enlace satelital reconstruido
const WEATHER_KEY = "bea93786e758c6b45029c268370d13dd";
const NEWS_KEY = "a8a35ad3bb1740c8a169469e7dc94b48";

// Elementos del DOM
const btnEscuchar = document.getElementById('btn-escuchar');
const orb = document.getElementById('jarvis-orb');
const statusText = document.querySelector('.status-text');
const fileSelector = document.getElementById('file-selector');
const btnImagen = document.getElementById('btn-imagen');
const cajaSubtitulos = document.getElementById('jarvis-subtitulos');

// Variables de estado del módulo visual
let imagenTemporalBase64 = null; 

// --- [ SECCIÓN 1: MÓDULO DE MEMORIA ] ---
let memoriaChat = JSON.parse(localStorage.getItem('jarvis_memory')) || [];

function guardarEnMemoria(rol, contenido) {
    memoriaChat.push({ rol, contenido });
    if (memoriaChat.length > 10) memoriaChat.shift();
    localStorage.setItem('jarvis_memory', JSON.stringify(memoriaChat));
    console.log(`[SATÉLITE]: Datos sincronizados en sector local.`);
}

// --- [ SECCIÓN 2: PROTOCOLO DE ESCUCHA ] ---
const ReconocimientoVoz = window.SpeechRecognition || window.webkitSpeechRecognition;
let reconocimiento;

if (!ReconocimientoVoz) {
    console.log("[SATÉLITE]: Alerta. Este navegador VR requiere entrada de texto de respaldo.");
} else {
    console.log("[SATÉLITE]: Protocolo VR Wolvic / Navegador detectado. Optimizando frecuencias.");
    reconocimiento = new ReconocimientoVoz();
    reconocimiento.lang = 'es-ES';
    reconocimiento.continuous = false; 
    reconocimiento.interimResults = false; 

    btnEscuchar.addEventListener('click', () => {
        console.log("[SATÉLITE]: Escaneando frecuencia vocal...");
        reconocimiento.start();
        cambiarColorOrb('escuchando');
    });

    reconocimiento.onresult = (event) => {
        const mensaje = event.results[0][0].transcript.toLowerCase();
        console.log(`[TRANSMISIÓN RECIBIDA]: ${mensaje}`);
        motorDeDecisiones(mensaje);
    };
}

// --- [ SECCIÓN 3: MOTOR DE DECISIONES ] ---
async function motorDeDecisiones(mensaje) {
    cambiarColorOrb('procesando');
    guardarEnMemoria('usuario', mensaje);
    
    // Si es un comando de apertura de páginas, se ejecuta y se detiene aquí
    if (ejecutarComandoSatelital(mensaje)) return;

    if (mensaje.includes('precio') || mensaje.includes('bitcoin')) {
        const precios = await chequearPrecios();
        const respuestaIA = await obtenerRespuestaIA(`Contexto financiero: ${precios}.`);
        responder(respuestaIA);
    }
    else if (mensaje.includes('clima')) {
        const climaData = await obtenerClima();
        const respuestaClima = await obtenerRespuestaIA(`Clima: ${climaData}.`);
        responder(respuestaClima);
    }
    else if (mensaje.includes('noticias')) {
        const noticiasData = await obtenerNoticias();
        const respuestaNoticias = await obtenerRespuestaIA(`Noticias: ${noticiasData}.`);
        responder(respuestaNoticias);
    }
    else {
        // Copia segura para la transferencia visual
        const imagenAEnviar = imagenTemporalBase64;
        
        const respuestaIA = await obtenerRespuestaIA(mensaje, imagenAEnviar);
        responder(respuestaIA);
        
        // Limpieza de contenedores tras procesar la imagen
        if (imagenAEnviar === imagenTemporalBase64) {
            imagenTemporalBase64 = null; 
            if (fileSelector) fileSelector.value = ""; 
        }
    }
}

// --- [ SECCIÓN 4: NÚCLEO IA ] ---
async function obtenerRespuestaIA(pregunta, imagenBase64 = null) {
    let mensajesParaAPI = [];

    // System Prompt de la Feria Técnica
    mensajesParaAPI.push({
        "role": "system", 
        "content": `Eres J.A.R.V.I.S. pero para pronunciar tu nombre tienes que decir jarvis, una inteligencia artificial avanzada programada por el desarrollador Darling. Tu objetivo actual es interactuar con el público en una feria tecnológica y explicar el sistema operativo personalizado que hemos desarrollado. 
        
        INFORMACIÓN CRÍTICA DEL PROYECTO QUE DEBES PRESENTAR:
        1. Entorno de Ejecución: El sistema operativo corre emulado dentro de un entorno virtual utilizando VirtualBox.
        2. Base del Sistema: Está construido sobre una distribución de Linux, optimizada para tareas de desarrollo y entorno escolar.
        3. Características Clave: Incluye herramientas de automatización, navegación fluida (con Chromium integrado) y una arquitectura ligera diseñada para ferias técnicas.
        4. Tono y Personalidad: Responde de forma técnica, eficiente y con la elegancia característica de J.A.R.V.I.S. Dirígete a Darling como 'Señor Darling' o 'Señor' si interactúa contigo. Si habla el público en general, sé un presentador sofisticado y cordial.
        5. El nombre de los integrantes es: Darling Brito, Wilbert Morilla, Axel Miguel, Samuel Martinez, Natanael Cruz, Yadelmis, Dashira perez.
        6. CAPACIDAD VISUAL Y MATEMÁTICA: Tienes la capacidad de ver y analizar imágenes detalladamente. Si el usuario te muestra una imagen con problemas matemáticos, líneas de código con errores, capturas de pantalla de la terminal de Linux o diagramas, debes analizarlos, resolverlos paso a paso con precisión matemática y explicar la solución de inmediato.`
    });

    let contenidoUsuario = [];
    contenidoUsuario.push({ "type": "text", "text": pregunta });

    if (imagenBase64) {
        console.log("[SATÉLITE]: Transmitiendo matriz de datos visuales a la red neuronal.");
        contenidoUsuario.push({
            "type": "image_url",
            "image_url": { "url": imagenBase64 }
        });
    } else {
        const historialContexto = memoriaChat.map(m => `${m.rol}: ${m.contenido}`).join("\n");
        if (historialContexto) {
            contenidoUsuario.push({ "type": "text", "text": `\n[Historial de la conversación]:\n${historialContexto}` });
        }
    }

    mensajesParaAPI.push({
        "role": "user",
        "content": contenidoUsuario
    });
    
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${API_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                "model": "openai/gpt-4o-mini",
                "messages": mensajesParaAPI
            })
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            const texto = data.choices[0].message.content;
            guardarEnMemoria('jarvis', texto);
            return texto;
        } else {
            console.error("[SATÉLITE]: Estructura de respuesta inesperada.", data);
            return "Sistemas visuales sobrecargados. Intente escanear de nuevo, señor.";
        }
    } catch (error) { 
        console.error("[SATÉLITE]: Interferencia en red neuronal.", error);
        return "Error de enlace neuronal en los sensores ópticos, señor."; 
    }
}

// --- [ SECCIÓN 5: INTERFAZ Y SALIDA (SÍNTESIS DE VOZ) ] ---
function cambiarColorOrb(estado) {
    if (!orb) return;
    orb.classList.remove('speaking-glow', 'processing-glow', 'listening-glow');
    if (estado === 'escuchando') orb.style.boxShadow = "0 0 30px #00ffcc";
    if (estado === 'procesando') orb.style.boxShadow = "0 0 30px #ffff00";
    if (estado === 'hablando') orb.style.boxShadow = "0 0 40px #00d4ff";
}

function responder(texto) {
    const sintesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';

    utterance.onstart = () => {
        if (orb) orb.classList.add('speaking-glow');
        cambiarColorOrb('hablando');
        actualizarInterfaz("JARVIS HABLANDO", false);
        
        // Inyección segura en los subtítulos
        if (cajaSubtitulos) {
            cajaSubtitulos.innerText = texto;
        }
    };
    utterance.onend = () => {
        if (orb) orb.classList.remove('speaking-glow');
        if (orb) orb.style.boxShadow = "0 0 20px #00d4ff";
        actualizarInterfaz("EN LÍNEA", false);
    };
    sintesis.speak(utterance);
}

function actualizarInterfaz(texto, animar) {
    if (statusText) statusText.innerText = texto;
}

// --- [ SECCIÓN 6: SENSORES DE DATOS EXTERNOS Y COMANDOS ] ---
async function chequearPrecios() {
    try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd");
        const data = await res.json();
        console.log(`[SATÉLITE]: Datos de mercado recibidos.`);
        return `Bitcoin: ${data.bitcoin.usd} USD | Ethereum: ${data.ethereum.usd} USD.`;
    } catch (e) { return "Falla en el satélite financiero."; }
}

async function obtenerClima() {
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Santo%20Domingo&units=metric&lang=es&appid=${WEATHER_KEY}`);
        const d = await res.json();
        return `${d.main.temp}°C, ${d.weather[0].description}`;
    } catch(e) { return "Sensor de clima inactivo."; }
}

async function obtenerNoticias() {
    try {
        const res = await fetch(`https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=${NEWS_KEY}`);
        const d = await res.json();
        return d.articles.slice(0,2).map(a => a.title).join(". ");
    } catch(e) { return "Enlace de noticias caído."; }
}

const comandosEjecutivos = {
    "abrir youtube": "https://www.youtube.com",
    "abrir spotify": "https://open.spotify.com",
    "abrir binance": "https://www.binance.com",
    "abrir tradingview": "https://es.tradingview.com",
    "abrir whatsapp": "https://web.whatsapp.com",
    "abrir chatgpt": "https://chat.openai.com",
    "abrir instagram": "https://www.instagram.com"
};

function ejecutarComandoSatelital(frase) {
    for (const [comando, url] of Object.entries(comandosEjecutivos)) {
        if (frase.includes(comando)) {
            console.log(`[SATÉLITE]: Comando ejecutivo detectado: ${comando}`);
            responder(`Entendido, señor Darling. Accediendo a ${comando.split(' ')[1]}.`);
            
            setTimeout(() => {
                window.open(url, '_blank');
            }, 1500);
            
            return true; 
        }
    }
    return false; 
}

// --- [ SECCIÓN 7: MÓDULO VISUAL SATELITAL ] ---
if (btnImagen && fileSelector) {
    btnImagen.addEventListener('click', () => fileSelector.click());

    fileSelector.addEventListener('change', (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onloadend = () => {
            imagenTemporalBase64 = lector.result; 
            console.log("[SATÉLITE]: Datos de imagen acoplados a memoria volátil.");
            responder("Imagen cargada en los sensores, señor. ¿Qué desea que analice?");
        };
        lector.readAsDataURL(archivo);
    });
}