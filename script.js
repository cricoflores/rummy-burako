// script.js

// DOM
const ruleBtn       = document.getElementById('ruleBtn');
const endTurnBtn    = document.getElementById('endTurnBtn');
const turnHeader    = document.getElementById('turnHeader');
const timerCanvas   = document.getElementById('timerCanvas');
const ctx           = timerCanvas.getContext('2d');
const timerText     = document.getElementById('timerText');
const roundNumber   = document.getElementById('roundNumber');
const scoresBody    = document.getElementById('scoresBody');
const inputsContainer = document.getElementById('inputsContainer');
const pointsForm    = document.getElementById('pointsForm');

// Configuración de juego
const numPlayers   = 2;      // Cambiar si son 3 o 4
const maxRounds    = 4;
const timerSeconds = 60;

let currentPlayer = 1;
let currentRound  = 1;
let scores        = Array.from({length: numPlayers}, () => Array(maxRounds).fill(null));
let remainingSeconds, timerInterval;

// Formato mm:ss
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

// Dibuja el círculo del timer
function drawCircle(fraction) {
  const r = timerCanvas.width / 2 - 10;
  ctx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);

  // Fondo gris claro
  ctx.beginPath();
  ctx.arc(100, 100, r, 0, 2 * Math.PI);
  ctx.strokeStyle = '#e5e5e5';
  ctx.lineWidth   = 15;
  ctx.stroke();

  // Progreso oscuro
  ctx.beginPath();
  ctx.arc(100, 100, r, -Math.PI/2, -Math.PI/2 + 2 * Math.PI * fraction);
  ctx.strokeStyle = '#333';
  ctx.lineWidth   = 15;
  ctx.stroke();
}

// Arranca el timer
function startTimer() {
  remainingSeconds = timerSeconds;
  updateTimer();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingSeconds--;
    if (remainingSeconds < 0) {
      remainingSeconds = 0;
      clearInterval(timerInterval);
    }
    updateTimer();
  }, 1000);
}

// Actualiza texto y círculo
function updateTimer() {
  timerText.textContent = formatTime(remainingSeconds);
  drawCircle(remainingSeconds / timerSeconds);
}

// Renderiza encabezado y ronda
function renderHeader() {
  turnHeader.textContent = `Turno de Jugador ${currentPlayer}`;
  roundNumber.textContent = currentRound;
}

// Renderiza la tabla de puntuaciones
function renderTable() {
  scoresBody.innerHTML = '';
  for (let i = 0; i < numPlayers; i++) {
    const row = document.createElement('tr');
    const total = scores[i].reduce((sum, v) => sum + (v || 0), 0);
    const cells = scores[i]
      .map(v => `<td>${v == null ? '–' : v}</td>`)
      .join('');
    row.innerHTML = `<td>${i + 1}</td>${cells}<td>${total}</td>`;
    scoresBody.appendChild(row);
  }
}

// Renderiza los inputs para ingresar puntos
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

    div.appendChild(label);
    div.appendChild(input);
    inputsContainer.appendChild(div);
  }
}

// Lógica al finalizar turno
function handleEndTurn(e) {
  e.preventDefault();
  clearInterval(timerInterval);

  // Guardar puntos
  const input = document.getElementById(`input-player-${currentPlayer}`);
  const pts   = parseInt(input.value, 10) || 0;
  scores[currentPlayer - 1][currentRound - 1] = pts;

  // Avanzar jugador/ronda
  if (currentPlayer < numPlayers) {
    currentPlayer++;
  } else {
    currentPlayer = 1;
    currentRound++;
  }

  // Verificar fin de juego
  if (currentRound > maxRounds) {
    const totals = scores.map(arr => arr.reduce((a, b) => a + (b||0), 0));
    const max = Math.max(...totals);
    const winner = totals.indexOf(max) + 1;
    alert(`Fin de juego. Ganador: Jugador ${winner}`);
    return;
  }

  // Reiniciar turno
  initTurn();
}

// Inicializa un turno
function initTurn() {
  renderHeader();
  renderTable();
  renderInputs();
  startTimer();
}

// Evento reglamento
ruleBtn.addEventListener('click', () => {
  window.open(
    'https://ruibalgames.com/wp-content/uploads/2015/10/Reglamento-RUMMY-BURAKO-Cl%C3%A1sico-y-Profesional.pdf',
    '_blank'
  );
});

// Envío del form
pointsForm.addEventListener('submit', handleEndTurn);

// Arranque
initTurn();
