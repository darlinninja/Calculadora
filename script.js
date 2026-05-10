let current = '0';
let buffer = '';
let operator = null;
let mode = 'basic';

// Base de datos de conversiones (Base: 1 Metro / 1 Gramo)
const units = {
    length: {
        "Kilómetros": 1000,
        "Metros": 1,
        "Centímetros": 0.01,
        "Millas": 1609.34,
        "Yardas": 0.9144,
        "Pies": 0.3048
    },
    weight: {
        "Kilogramos": 1000,
        "Gramos": 1,
        "Libras": 453.592,
        "Onzas": 28.3495
    }
};

const screens = {
    basic: document.getElementById('basic-screen'),
    converter: document.getElementById('converter-screen')
};

function changeCategory() {
    mode = document.getElementById('mode-selector').value;
    clearAll();
    
    if (mode === 'basic') {
        screens.basic.style.display = 'block';
        screens.converter.style.display = 'none';
    } else {
        screens.basic.style.display = 'none';
        screens.converter.style.display = 'block';
        loadUnits(mode);
    }
}

function loadUnits(category) {
    const fromSelect = document.getElementById('unit-from');
    const toSelect = document.getElementById('unit-to');
    
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    for (let unit in units[category]) {
        fromSelect.innerHTML += `<option value="${unit}">${unit}</option>`;
        toSelect.innerHTML += `<option value="${unit}">${unit}</option>`;
    }
    
    // Seleccionar por defecto la segunda opción en el "A" para que no sean iguales
    toSelect.selectedIndex = 1; 
    convert();
}

function press(num) {
    if (current === '0' && num !== '.') current = num;
    else current += num;
    
    if (mode === 'basic') renderBasic();
    else convert();
}

function convert() {
    if (mode === 'basic') return;
    
    const fromUnit = document.getElementById('unit-from').value;
    const toUnit = document.getElementById('unit-to').value;
    const valFrom = parseFloat(current);
    
    document.getElementById('val-from').innerText = current;

    if (isNaN(valFrom)) {
        document.getElementById('val-to').innerText = '0';
        return;
    }

    // Fórmula mágica: (Valor * Tasa Origen) / Tasa Destino
    const rateFrom = units[mode][fromUnit];
    const rateTo = units[mode][toUnit];
    const result = (valFrom * rateFrom) / rateTo;

    // Mostrar con máximo 4 decimales
    document.getElementById('val-to').innerText = parseFloat(result.toFixed(4));
}

function clearAll() {
    current = '0';
    buffer = '';
    operator = null;
    if (mode === 'basic') renderBasic();
    else convert();
}

function backspace() {
    current = current.slice(0, -1);
    if (current === '') current = '0';
    
    if (mode === 'basic') renderBasic();
    else convert();
}

// Funciones de la calculadora normal
function setOp(op) {
    if (mode !== 'basic') return;
    operator = op;
    buffer = current;
    current = '0';
    document.getElementById('sub-display').innerText = buffer + ' ' + operator;
}

function execute() {
    if (mode !== 'basic' || !operator) return;
    
    let a = parseFloat(buffer);
    let b = parseFloat(current);
    let res = 0;

    if (operator === '+') res = a + b;
    if (operator === '-') res = a - b;
    if (operator === '*') res = a * b;
    if (operator === '/') res = a / b;

    current = res.toString();
    operator = null;
    document.getElementById('sub-display').innerText = '';
    renderBasic();
}

function renderBasic() {
    document.getElementById('main-display').innerText = current;
}
function renderBasic() {
    const display = document.getElementById('main-display');
    display.innerText = current;

    // Si el número tiene más de 8 dígitos, reduce el tamaño de la letra
    if (current.length > 8) {
        display.style.fontSize = "25px";
    } else {
        display.style.fontSize = "40px";
    }
}
// Este código hace que la app cargue instantáneamente
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});