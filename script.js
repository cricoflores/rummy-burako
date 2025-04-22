// script.js

// DOM
const configCard       = document.getElementById('configCard');
const gameCard         = document.getElementById('gameCard');
const startBtn         = document.getElementById('startBtn');
const numPlayersInput  = document.getElementById('numPlayersInput');
const ruleBtn          = document.getElementById('ruleBtn');
const endTurnBtn       = document.getElementById('endTurnBtn');
const turnHeader       = document.getElementById('turnHeader');
const timerCanvas      = document.getElementById('timerCanvas');
const ctx              = timerCanvas.getContext('2d');
const timerText        = document.getElementById('timerText');
const roundNumber      = document.getElementById('roundNumber');
const scoresBody       = document.getElementById('scoresBody');
const inputsContainer  = document.getElementById('inputsContainer');
const pointsForm       = document.getElementById('pointsForm');

// Variables de juego
let numPlayers, currentPlayer, currentRound;
const maxRounds    = 4;
const timerSeconds = 60;
let scores          = [];
let remainingSeconds, timerInterval;

// Formato mm:ss
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

// Dibuja el círculo de progreso
function drawCircle(fraction) {
  const r = timerCanvas.width / 2 - 10;
  ctx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);
  // fondo
  ctx.beginPath();
  ctx.arc(100, 100, r, 0, 2 * Math.PI);
  ctx.strokeStyle = '#e5e5e5';
  ctx.lineWidth   = 15;
  ctx.stroke();
  // avance
  ctx.beginPath();
  ctx.arc(100, 100, r, -Math.PI/2, -Math.PI/2 + 2 * Math.PI * fraction);
  ctx.strokeStyle = '#333';
  ctx.lineWidth   = 15;
  ctx.stroke();
}

// Inicia el timer
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

// Actualiza visual timer
function updateTimer() {
  timerText.textContent = formatTime(remainingSeconds);
  drawCircle(remainingSeconds / timerSeconds);
}

// Renderiza header y ronda
function renderHeader() {
  turnHeader.textContent = `Turno de Jugador ${currentPlayer}`;
  roundNumber.textContent = currentRound;
}

// Renderiza tabla de scores
function renderTable() {
  scoresBody.innerHTML = '';
  for (let i = 0; i < numPlayers; i++) {
    const row = document.createElement('tr');
    const total = scores[i].reduce((sum, v) => sum + (v||0), 0);
    const cells = scores[i]
      .map(v => `<td>${v == null ? '–' : v}</td>`)
      .join('');
    row.innerHTML = `<td>${i+1}</td>${cells}<td>${total}</td>`;
    scoresBody.appendChild(row);
  }
}

// Renderiza inputs para la ronda
function renderInputs() {
  inputsContainer.innerHTML = '';
  for (let i = 1; i <= numPlayers; i++) {
    const div = document.createElement('div');
    div.className = 'input-group';
    const label = document.createElement('label');
    label.textContent = `Jugador ${i}`;
    const input = document.createElement('input');
    input.type = 'number';
    input.min  = 0;
    input.value = 0;
    input.id    = `input-player-${i}`;
    input.disabled = (i !== currentPlayer);
    div.append(label, input);
    inputsContainer.appendChild(div);
  }
}

// Lógica de fin de turno
function handleEndTurn(e) {
  e.preventDefault();
  clearInterval(timerInterval);

  // Guardar puntaje
  const pts = parseInt(document.getElementById(`input-player-${currentPlayer}`).value,10) || 0;
  scores[currentPlayer-1][currentRound-1] = pts;

  // Avanzar turno
  if (currentPlayer < numPlayers) {
    currentPlayer++;
  } else {
    currentPlayer = 1;
    currentRound++;
  }

  // Fin de juego?
  if (currentRound > maxRounds) {
    const totals = scores.map(arr => arr.reduce((a,b)=>a+(b||0),0));
    const winner = totals.indexOf(Math.max(...totals)) + 1;
    alert(`Fin de juego. Ganador: Jugador ${winner}`);
    return;
  }

  initTurn();
}

// Inicializa un turno
function initTurn() {
  renderHeader();
  renderTable();
  renderInputs();
  startTimer();
}

// Inicia todo tras configurar jugadores
startBtn.addEventListener('click', () => {
  numPlayers     = Math.max(2, Math.min(4, parseInt(numPlayersInput.value,10)||2));
  currentPlayer  = 1;
  currentRound   = 1;
  scores         = Array.from({length: numPlayers}, () => Array(maxRounds).fill(null));
  configCard.classList.add('hidden');
  gameCard.classList.remove('hidden');
  initTurn();
});

// Evento Reglamento
ruleBtn.addEventListener('click', () => {
  window.open(
    'https://ruibalgames.com/wp-content/uploads/2015/10/Reglamento-RUMMY-BURAKO-Cl%C3%A1sico-y-Profesional.pdf',
    '_blank'
  );
});

// Envío de puntaje
pointsForm.addEventListener('submit', handleEndTurn);

