// script.js

// Referencias DOM
const configCard        = document.getElementById('configCard');
const gameCard          = document.getElementById('gameCard');
const configForm        = document.getElementById('configForm');
const turnTimeSelect    = document.getElementById('turnTimeSelect');
const numPlayersSelect  = document.getElementById('numPlayersSelect');
const playerNamesContainer = document.getElementById('playerNamesContainer');
const ruleBtn           = document.getElementById('ruleBtn');
const endTurnBtn        = document.getElementById('endTurnBtn');
const turnHeader        = document.getElementById('turnHeader');
const timerCanvas       = document.getElementById('timerCanvas');
const ctx               = timerCanvas.getContext('2d');
const timerText         = document.getElementById('timerText');
const roundNumber       = document.getElementById('roundNumber');
const scoresBody        = document.getElementById('scoresBody');
const inputsContainer   = document.getElementById('inputsContainer');
const pointsForm        = document.getElementById('pointsForm');

let numPlayers, timerSeconds, currentPlayer, currentRound;
const maxRounds = 4;
let scores = [];
let names  = [];
let remainingSeconds, timerInterval;

// Al cambiar número de jugadores ajusto inputs de nombres
numPlayersSelect.addEventListener('change', () => {
  playerNamesContainer.innerHTML = '';
  for (let i = 1; i <= +numPlayersSelect.value; i++) {
    const lbl = document.createElement('label');
    lbl.textContent = `Nombre Jugador ${i}`;
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.id   = `playerName${i}`;
    inp.placeholder = `Jugador ${i}`;
    inp.required = true;
    lbl.appendChild(inp);
    playerNamesContainer.appendChild(lbl);
  }
});

// Inicio del juego: oculto configuración y muestro la card de juego
configForm.addEventListener('submit', e => {
  e.preventDefault();
  timerSeconds = +turnTimeSelect.value;
  numPlayers   = +numPlayersSelect.value;
  names = [];
  for (let i = 1; i <= numPlayers; i++) {
    const v = document.getElementById(`playerName${i}`).value.trim();
    names.push(v || `Jugador ${i}`);
  }
  // inicializo estado
  currentPlayer = 1;
  currentRound  = 1;
  scores        = Array.from({length: numPlayers}, () => Array(maxRounds).fill(null));
  configCard.classList.add('hidden');
  gameCard.classList.remove('hidden');
  initTurn();
});

// Abrir reglamento
ruleBtn.addEventListener('click', () => {
  window.open('https://ruibalgames.com/wp-content/uploads/2015/10/Reglamento-RUMMY-BURAKO-Cl%C3%A1sico-y-Profesional.pdf', '_blank');
});

// Formatea segundos a mm:ss
function formatTime(s) {
  const m = Math.floor(s/60);
  const sec = s%60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

// Dibuja el círculo del timer
function drawCircle(fraction) {
  const r = timerCanvas.width/2 - 10;
  ctx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);
  // fondo gris
  ctx.beginPath();
  ctx.arc(100, 100, r, 0, 2*Math.PI);
  ctx.strokeStyle = '#e5e5e5'; ctx.lineWidth = 15; ctx.stroke();
  // progreso
  ctx.beginPath();
  ctx.arc(100, 100, r, -Math.PI/2, -Math.PI/2 + 2*Math.PI*fraction);
  ctx.strokeStyle = '#333'; ctx.lineWidth = 15; ctx.stroke();
}

// Inicia el timer y actualiza cada segundo
function startTimer() {
  remainingSeconds = timerSeconds;
  updateTimer();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingSeconds--;
    if (remainingSeconds < 0) remainingSeconds = 0;
    updateTimer();
  }, 1000);
}

// Actualiza el texto y el círculo en pantalla
function updateTimer() {
  timerText.textContent = formatTime(remainingSeconds);
  drawCircle(remainingSeconds / timerSeconds);
}

// Rellena el header con jugador y ronda actual
function renderHeader() {
  turnHeader.textContent = `Turno de ${names[currentPlayer-1]}`;
  roundNumber.textContent = currentRound;
}

// Pinta la tabla de puntuaciones
function renderTable() {
  scoresBody.innerHTML = '';
  for (let i = 0; i < numPlayers; i++) {
    const row = document.createElement('tr');
    const total = scores[i].reduce((a,b)=>a+(b||0),0);
    const cells = scores[i].map(v=>`<td>${v==null?'–':v}</td>`).join('');
    row.innerHTML = `<td>${names[i]}</td>${cells}<td>${total}</td>`;
    scoresBody.appendChild(row);
  }
}

// Prepara los inputs de puntos (todos deshabilitados hasta Terminar Turno)
function renderInputs() {
  inputsContainer.innerHTML = '';
  for (let i = 1; i <= numPlayers; i++) {
    const div = document.createElement('div');
    div.className = 'input-group';
    const lbl = document.createElement('label');
    lbl.textContent = names[i-1];
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min  = 0;
    inp.value = 0;
    inp.id    = `input-player-${i}`;
    inp.disabled = true;              // inactivo hasta endTurnBtn
    div.append(lbl, inp);
    inputsContainer.appendChild(div);
  }
}

// Maneja solo la detención del timer y habilita inputs
endTurnBtn.addEventListener('click', e => {
  clearInterval(timerInterval);
  // habilito sólo el input del jugador activo
  for (let i = 1; i <= numPlayers; i++) {
    document.getElementById(`input-player-${i}`).disabled = (i !== currentPlayer);
  }
  // desactivo el botón para evitar múltiples clicks
  endTurnBtn.disabled = true;
});

// Guarda puntos y avanza jugador/ronda
pointsForm.addEventListener('submit', e => {
  e.preventDefault();
  // tomo puntos del input habilitado
  const pts = +document.getElementById(`input-player-${currentPlayer}`).value || 0;
  scores[currentPlayer-1][currentRound-1] = pts;

  // avanzo turno/ronda
  if (currentPlayer < numPlayers) {
    currentPlayer++;
  } else {
    currentPlayer = 1;
    currentRound++;
  }

  // fin de juego?
  if (currentRound > maxRounds) {
    const totals = scores.map(arr=>arr.reduce((a,b)=>a+(b||0),0));
    const winner = names[totals.indexOf(Math.max(...totals))];
    alert(`Fin de juego. Ganador: ${winner}`);
    return;
  }

  // reconfiguro para el siguiente turno
  initTurn();
});

// Inicializa cada turno: header, tabla, inputs y timer
function initTurn() {
  // reactivo botón y destrabo todos inputs
  endTurnBtn.disabled = false;
  renderHeader();
  renderTable();
  renderInputs();
  startTimer();
}
