// Referencias al DOM
const startBtn      = document.getElementById('startBtn');
const numPlayersIn  = document.getElementById('numPlayers');
const selDiv        = document.getElementById('player-selection');
const gameDiv       = document.getElementById('game');
const timerCanvas   = document.getElementById('timerCanvas');
const ctx           = timerCanvas.getContext('2d');
const roundInfo     = document.getElementById('roundInfo');
const scoresDiv     = document.getElementById('scores');
const ruleBtn       = document.getElementById('ruleBtn');

let numPlayers, round = 1, maxRounds = 4;
let scores = [];

// Arranca el juego
startBtn.addEventListener('click', () => {
  numPlayers = parseInt(numPlayersIn.value);
  scores = Array(numPlayers).fill(0);
  selDiv.classList.add('hidden');
  gameDiv.classList.remove('hidden');
  renderScores();
  startRound();
});

// Muestra reglamento en nueva pestaña
ruleBtn.addEventListener('click', () => {
  window.open(
    'https://ruibalgames.com/wp-content/uploads/2015/10/Reglamento-RUMMY-BURAKO-Cl%C3%A1sico-y-Profesional.pdf',
    '_blank'
  );
});

function startRound() {
  roundInfo.textContent = `Ronda: ${round}`;
  startTimer(60, () => {
    if (round < maxRounds) {
      round++;
      renderScores();
      startRound();
    } else {
      showWinner();
    }
  });
}

function startTimer(seconds, callback) {
  const start = Date.now();
  (function draw() {
    const elapsed  = (Date.now() - start) / 1000;
    const remaining = seconds - elapsed;
    if (remaining <= 0) return callback();
    drawCircle(remaining / seconds, Math.ceil(remaining));
    requestAnimationFrame(draw);
  })();
}

function drawCircle(fraction, displaySec) {
  const r = timerCanvas.width/2 - 10;
  ctx.clearRect(0, 0, timerCanvas.width, timerCanvas.height);

  // fondo gris
  ctx.beginPath();
  ctx.arc(100, 100, r, 0, Math.PI*2);
  ctx.strokeStyle = '#eee';
  ctx.lineWidth   = 10;
  ctx.stroke();

  // avance negro
  ctx.beginPath();
  ctx.arc(100, 100, r, -Math.PI/2, -Math.PI/2 + fraction*Math.PI*2);
  ctx.strokeStyle = '#333';
  ctx.lineWidth   = 10;
  ctx.stroke();

  // texto segundos
  ctx.font        = '20px sans-serif';
  ctx.textAlign   = 'center';
  ctx.textBaseline= 'middle';
  ctx.fillText(displaySec, 100, 100);
}

function renderScores() {
  let html = '<table><tr>';
  for (let i=0; i<numPlayers; i++) html += `<th>Jugador ${i+1}</th>`;
  html += '</tr><tr>';
  for (let i=0; i<numPlayers; i++) html += `<td>${scores[i]}</td>`;
  html += '</tr></table>';
  scoresDiv.innerHTML = html;
}

function showWinner() {
  const maxScore = Math.max(...scores);
  const winner   = scores.indexOf(maxScore) + 1;
  alert(`Ganador: Jugador ${winner}`);
}
