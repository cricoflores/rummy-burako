// script.js

// Referencias DOM
const configCard         = document.getElementById('configCard');
const gameCard           = document.getElementById('gameCard');
const configForm         = document.getElementById('configForm');
const turnTimeSelect     = document.getElementById('turnTimeSelect');
const numPlayersSelect   = document.getElementById('numPlayersSelect');
const playerNamesContainer = document.getElementById('playerNamesContainer');
const ruleBtn            = document.getElementById('ruleBtn');
const endTurnBtn         = document.getElementById('endTurnBtn');
const turnHeader         = document.getElementById('turnHeader');
const timerCanvas        = document.getElementById('timerCanvas');
const ctx                = timerCanvas.getContext('2d');
const timerText          = document.getElementById('timerText');
const roundNumber        = document.getElementById('roundNumber');
const scoresBody         = document.getElementById('scoresBody');
const inputsContainer    = document.getElementById('inputsContainer');
const pointsForm         = document.getElementById('pointsForm');

let numPlayers, timerSeconds, currentPlayer, currentRound;
const maxRounds = 4;
let scores = [], names = [];
let remainingSeconds, timerInterval;

// Genera inputs de nombre al cambiar número de jugadores
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

// Inicio de la partida
configForm.addEventListener('submit', e => {
  e.preventDefault();
  timerSeconds = +turnTimeSelect.value;
  numPlayers   = +numPlayersSelect.value;
  names = [];
  for (let i = 1; i <= numPlayers; i++) {
    const v = document.getElementById(`playerName${i}`).value.trim();
    names.push(v || `Jugador ${i}`);
  }
  currentPlayer = 1;
  currentRound  = 1;
  scores        = Array.from({length: numPlayers}, () => Array(maxRounds).fill(null));
  configCard.classList.add('hidden');
  gameCard.classList.remove('hidden');
  initTurn();
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
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Dibuja el círculo de progreso
function drawCircle(fraction) {
  const r = timerCanvas.width / 2 - 10;
  ctx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);
  ctx.beginPath();
  ctx.arc(100, 100, r, 0, 2 * Math.PI);
  ctx.strokeStyle = '#e5e5e5'; ctx.lineWidth = 15; ctx.stroke();
  ctx.beginPath();
  ctx.arc(100, 100, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * fraction);
  ctx.strokeStyle = '#333'; ctx.lineWidth = 15; ctx.stroke();
}

// Arranca el timer
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

// Actualiza texto y círculo
function updateTimer() {
  timerText.textContent = formatTime(remainingSeconds);
  drawCircle(remainingSeconds / timerSeconds);
}

// Renderiza header y ronda
function renderHeader() {
  turnHeader.textContent = `Turno de ${names[currentPlayer - 1]}`;
  roundNumber.textContent = currentRound;
}

// Pinta la tabla de puntuaciones
function renderTable() {
  scoresBody.innerHTML = '';
  for (let i = 0; i < numPlayers; i++) {
    const row = document.createElement('tr');
    const total = scores[i].reduce((a, b) => a + (b || 0), 0);
    const cells = scores[i].map(v => `<td>${v == null ? '–' : v}</td>`).join('');
    row.innerHTML = `<td>${names[i]}</td>${cells}<td>${total}</td>`;
    scoresBody.appendChild(row);
  }
}

// Genera inputs de puntos para la ronda actual
function renderInputs() {
  inputsContainer.innerHTML = '';
  for (let i = 1; i <= numPlayers; i++) {
    const div = document.createElement('div');
    div.className = 'input-group';
    const lbl = document.createElement('label');
    lbl.textContent = names[i - 1];
    const inp = document.createElement('input');
    inp.type = 'number'; inp.min = 0;
    inp.value = scores[i - 1][currentRound - 1] ?? 0;
    inp.id = `input-player-${i}`;
    div.append(lbl, inp);
    inputsContainer.appendChild(div);
  }
}

// “Terminar Turno”: detiene, avanza y reinicia
endTurnBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  if (currentPlayer < numPlayers) {
    currentPlayer++;
  } else {
    currentPlayer = 1;
    currentRound++;
  }
  if (currentRound > maxRounds) {
    const totals = scores.map(arr => arr.reduce((a, b) => a + (b || 0), 0));
    const winner = names[totals.indexOf(Math.max(...totals))];
    alert(`Fin de juego. Ganador: ${winner}`);
    return;
  }
  initTurn();
});

// “Guardar puntos de ronda”: guarda y actualiza tabla
pointsForm.addEventListener('submit', e => {
  e.preventDefault();
  for (let i = 1; i <= numPlayers; i++) {
    const val = +document.getElementById(`input-player-${i}`).value || 0;
    scores[i - 1][currentRound - 1] = val;
  }
  renderTable();
});

// Inicializa cada turno
function initTurn() {
  renderHeader();
  renderTable();
  renderInputs();
  startTimer();
}
