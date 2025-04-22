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
const endRoundBtn       = document.getElementById('endRoundBtn');
const turnHeader        = document.getElementById('turnHeader');
const timerCanvas       = document.getElementById('timerCanvas');
const ctx               = timerCanvas.getContext('2d');
const timerText         = document.getElementById('timerText');
const roundNumber       = document.getElementById('roundNumber');
const scoresBody        = document.getElementById('scoresBody');
const scoringSection    = document.getElementById('scoringSection');
const inputsContainer   = document.getElementById('inputsContainer');
const pointsForm        = document.getElementById('pointsForm');

let numPlayers, timerSeconds, currentRound, currentPlayer;
const maxRounds = 4;
let scores = [], names = [];
let remainingSeconds, timerInterval;

// Generar inputs de nombre al cambiar número de jugadores
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

// Comenzar la partida
configForm.addEventListener('submit', e => {
  e.preventDefault();
  timerSeconds = +turnTimeSelect.value;
  numPlayers   = +numPlayersSelect.value;
  names = [];
  for (let i = 1; i <= numPlayers; i++) {
    const v = document.getElementById(`playerName${i}`).value.trim();
    names.push(v || `Jugador ${i}`);
  }
  currentRound  = 1;
  currentPlayer = 1;
  scores        = Array.from({length: numPlayers}, () => Array(maxRounds).fill(null));
  configCard.classList.add('hidden');
  gameCard.classList.remove('hidden');
  startRound();
});

// Abrir reglamento
ruleBtn.addEventListener('click', () => {
  window.open(
    'https://ruibalgames.com/wp-content/uploads/2015/10/Reglamento-RUMMY-BURAKO-Cl%C3%A1sico-y-Profesional.pdf',
    '_blank'
  );
});

// Formatea segundos a mm:ss
function formatTime(s) {
  const m = Math.floor(s/60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

// Dibuja el círculo de progreso
function drawCircle(fraction) {
  const r = timerCanvas.width/2 - 10;
  ctx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);
  ctx.beginPath();
  ctx.arc(100,100,r,0,2*Math.PI);
  ctx.strokeStyle = '#e5e5e5'; ctx.lineWidth = 15; ctx.stroke();
  ctx.beginPath();
  ctx.arc(100,100,r,-Math.PI/2,-Math.PI/2+2*Math.PI*fraction);
  ctx.strokeStyle = '#333'; ctx.lineWidth = 15; ctx.stroke();
}

// Inicia y actualiza timer
function startTimer() {
  remainingSeconds = timerSeconds;
  updateTimer();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingSeconds--;
    if (remainingSeconds < 0) remainingSeconds = 0;
    updateTimer();
  },1000);
}

// Actualiza texto y círculo
function updateTimer() {
  timerText.textContent = formatTime(remainingSeconds);
  drawCircle(remainingSeconds / timerSeconds);
}

// Renderiza encabezado (ronda y jugador)
function renderHeader() {
  turnHeader.textContent = 
    `Ronda ${currentRound}/${maxRounds} — Turno de ${names[currentPlayer-1]}`;
  roundNumber.textContent = currentRound;
}

// Renderiza la tabla de puntuaciones
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

// Renderiza inputs de puntuación (por ronda)
function renderInputs() {
  inputsContainer.innerHTML = '';
  for (let i = 1; i <= numPlayers; i++) {
    const div = document.createElement('div');
    div.className = 'input-group';
    const lbl = document.createElement('label');
    lbl.textContent = names[i-1];
    const inp = document.createElement('input');
    inp.type = 'number'; inp.min = 0;
    inp.value = scores[i-1][currentRound-1] ?? 0;
    inp.id    = `input-player-${i}`;
    div.append(lbl, inp);
    inputsContainer.appendChild(div);
  }
}

// “Terminar Turno”: solo avanza al siguiente jugador y reinicia el reloj
endTurnBtn.addEventListener('click', () => {
  clearInterval(timerInterval);

  currentPlayer = currentPlayer < numPlayers 
    ? currentPlayer + 1 
    : 1;

  // Si volvemos al Jugador 1 y no es la primera ronda, seguimos en la misma
  // ¡la ronda sólo cambia al guardar puntos!
  renderHeader();
  renderTable();
  renderInputs();
  startTimer();
});

// “Fin de ronda”: detiene el timer y muestra el formulario de puntos
endRoundBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  scoringSection.classList.remove('hidden');
  endTurnBtn.disabled = true;
  endRoundBtn.disabled = true;
});

// “Guardar puntos de ronda”: guarda, avanza de ronda y reinicia UI
pointsForm.addEventListener('submit', e => {
  e.preventDefault();
  // vuelca en columna actual
  for (let i = 1; i <= numPlayers; i++) {
    scores[i-1][currentRound-1] = 
      +document.getElementById(`input-player-${i}`).value || 0;
  }
  renderTable();

  // ocultar scoring y reactivar botones
  scoringSection.classList.add('hidden');
  endTurnBtn.disabled = false;
  endRoundBtn.disabled = false;

  // fin de juego?
  if (currentRound === maxRounds) {
    const totals = scores.map(arr=>arr.reduce((a,b)=>a+(b||0),0));
    const minPts = Math.min(...totals);
    const winner = names[totals.indexOf(minPts)];
    alert(`¡Fin de juego!\nGanador: ${winner}\ncon ${minPts} puntos.`);
    return;
  }

  // paso a la siguiente ronda
  currentRound++;
  currentPlayer = 1;
  startRound();
});

// Inicia cada ronda
function startRound() {
  renderHeader();
  renderTable();
  renderInputs();
  roundNumber.textContent = currentRound;
  startTimer();
}