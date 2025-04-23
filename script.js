// Referencias DOM
const landingCard      = document.getElementById('landingCard');
const selectRummy      = document.getElementById('selectRummy');
const selectBurako     = document.getElementById('selectBurako');

const rummyConfigCard  = document.getElementById('rummyConfigCard');
const rummyGameCard    = document.getElementById('rummyGameCard');
const burakoConfigCard = document.getElementById('burakoConfigCard');
const burakoScoreCard  = document.getElementById('burakoScoreCard');

// --- RUMMY ---
const configForm        = document.getElementById('configForm');
const turnTimeSelect    = document.getElementById('turnTimeSelect');
const numPlayersSelect  = document.getElementById('numPlayersSelect');
const playerNamesContainer = document.getElementById('playerNamesContainer');

const ruleBtn           = document.getElementById('ruleBtn');
const turnHeader        = document.getElementById('turnHeader');
const timerCanvas       = document.getElementById('timerCanvas');
const ctx               = timerCanvas.getContext('2d');
const timerText         = document.getElementById('timerText');
const endTurnBtn        = document.getElementById('endTurnBtn');
const endRoundBtn       = document.getElementById('endRoundBtn');
const roundNumber       = document.getElementById('roundNumber');
const scoresBody        = document.getElementById('scoresBody');
const scoringSection    = document.getElementById('scoringSection');
const inputsContainer   = document.getElementById('inputsContainer');
const pointsForm        = document.getElementById('pointsForm');

let numPlayers, timerSeconds, currentRound, currentPlayer;
const maxRounds = 4;
let scores = [], names = [];
let remainingSeconds, timerInterval;

// --- BURAKO ---
const burakoConfigForm    = document.getElementById('burakoConfigForm');
const burakoModeEls       = document.getElementsByName('burakoMode');
const burakoNamesCt       = document.getElementById('burakoNamesContainer');

const burakoRuleBtn       = document.getElementById('burakoRuleBtn');
const burakoTableCt       = document.getElementById('burakoTableContainer');
const burakoInputsCt      = document.getElementById('burakoInputsContainer');
const burakoPointsForm    = document.getElementById('burakoPointsForm');

let burakoMode, burakoNames = [], burakoScores = [], burakoRound = 0;

// --- Landing Logic ---
selectRummy.addEventListener('click', () => {
  landingCard.classList.add('hidden');
  rummyConfigCard.classList.remove('hidden');
  burakoConfigCard.classList.add('hidden');
  burakoScoreCard.classList.add('hidden');
});
selectBurako.addEventListener('click', () => {
  landingCard.classList.add('hidden');
  burakoConfigCard.classList.remove('hidden');
  rummyConfigCard.classList.add('hidden');
  rummyGameCard.classList.add('hidden');
});

// --- RUMMY: Generar inputs de nombre ---
numPlayersSelect.addEventListener('change', () => {
  playerNamesContainer.innerHTML = '';
  for (let i = 1; i <= +numPlayersSelect.value; i++) {
    const div = document.createElement('div');
    div.className = 'input-group';
    const lbl = document.createElement('label');
    lbl.textContent = `Jugador ${i}:`;
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.id   = `playerName${i}`;
    inp.placeholder = `Jugador ${i}`;
    inp.required = true;
    div.append(lbl, inp);
    playerNamesContainer.appendChild(div);
  }
});

// --- RUMMY: Inicio de la partida ---
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
  rummyConfigCard.classList.add('hidden');
  rummyGameCard.classList.remove('hidden');
  startRummyRound();
});

// --- RUMMY: Reglamento ---
ruleBtn.addEventListener('click', () => {
  window.open(
    'https://ruibalgames.com/wp-content/uploads/2015/10/Reglamento-RUMMY-BURAKO-Cl%C3%A1sico-y-Profesional.pdf',
    '_blank'
  );
});

// --- RUMMY: Helpers ---
function formatTime(s) {
  const m = Math.floor(s/60), sec = s%60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
}
function drawCircle(fraction) {
  const r = timerCanvas.width/2 - 10;
  ctx.clearRect(0,0,timerCanvas.width,timerCanvas.height);
  ctx.beginPath(); ctx.arc(100,100,r,0,2*Math.PI);
  ctx.strokeStyle='#e5e5e5'; ctx.lineWidth=15; ctx.stroke();
  ctx.beginPath(); ctx.arc(100,100,r,-Math.PI/2,-Math.PI/2+2*Math.PI*fraction);
  ctx.strokeStyle='#333'; ctx.lineWidth=15; ctx.stroke();
}
function startTimer() {
  remainingSeconds = timerSeconds; updateRummyTimer();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingSeconds--; if (remainingSeconds<0) remainingSeconds=0;
    updateRummyTimer();
  },1000);
}
function updateRummyTimer() {
  timerText.textContent = formatTime(remainingSeconds);
  drawCircle(remainingSeconds/timerSeconds);
}

// --- RUMMY: Render y lógica ---
function renderRummyHeader() {
  turnHeader.textContent = 
    `Ronda ${currentRound}/${maxRounds} — Turno de ${names[currentPlayer-1]}`;
  roundNumber.textContent = currentRound;
}
function renderRummyTable() {
  scoresBody.innerHTML = '';
  for (let i=0;i<numPlayers;i++){
    const row = document.createElement('tr');
    const total = scores[i].reduce((a,b)=>a+(b||0),0);
    const cells = scores[i].map(v=>`<td>${v==null?'–':v}</td>`).join('');
    row.innerHTML = `<td>${names[i]}</td>${cells}<td>${total}</td>`;
    scoresBody.appendChild(row);
  }
}
function renderRummyInputs() {
  inputsContainer.innerHTML = '';
  for (let i=1;i<=numPlayers;i++){
    const div = document.createElement('div');
    div.className = 'input-group';
    const lbl = document.createElement('label');
    lbl.textContent = names[i-1];
    const inp = document.createElement('input');
    inp.type='number'; inp.min=0; inp.value = scores[i-1][currentRound-1]||0;
    inp.id = `input-player-${i}`;
    div.append(lbl, inp);
    inputsContainer.appendChild(div);
  }
}
endTurnBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  currentPlayer = currentPlayer < numPlayers ? currentPlayer+1 : 1;
  renderRummyHeader(); renderRummyTable(); renderRummyInputs(); startTimer();
});
endRoundBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  scoringSection.classList.remove('hidden');
  endTurnBtn.disabled = endRoundBtn.disabled = true;
});
pointsForm.addEventListener('submit', e => {
  e.preventDefault();
  for (let i=1;i<=numPlayers;i++){
    scores[i-1][currentRound-1] =
      +document.getElementById(`input-player-${i}`).value||0;
  }
  renderRummyTable();
  scoringSection.classList.add('hidden');
  endTurnBtn.disabled = endRoundBtn.disabled = false;
  if (currentRound===maxRounds){
    const totals = scores.map(arr=>arr.reduce((a,b)=>a+(b||0),0));
    const winner = names[totals.indexOf(Math.max(...totals))];
    alert(`Fin de juego. Ganador: ${winner}`);
    return;
  }
  currentRound++; currentPlayer=1; startRummyRound();
});
function startRummyRound(){
  renderRummyHeader(); renderRummyTable(); renderRummyInputs(); startTimer();
}

// --- BURAKO: Configuración ---
burakoModeEls.forEach(el=>{
  el.addEventListener('change',()=>{
    burakoMode = el.value;
    burakoNamesCt.innerHTML = '';
    let count = burakoMode==='2v2'?4:burakoMode==='1v1v1'?3:2;
    for(let i=1;i<=count;i++){
      const div = document.createElement('div');
      div.className='input-group';
      const lbl = document.createElement('label');
      lbl.textContent = `Jugador ${i}:`;
      const inp = document.createElement('input');
      inp.type='text'; inp.id=`burakoPlayer${i}`; inp.placeholder=`Jugador ${i}`;
      inp.required=true;
      div.append(lbl, inp);
      burakoNamesCt.appendChild(div);
    }
  });
});
burakoConfigForm.addEventListener('submit',e=>{
  e.preventDefault();
  burakoNames = [];
  burakoScores = [];
  burakoRound = 0;
  const inputs = burakoNamesCt.querySelectorAll('input');
  inputs.forEach(inp=>burakoNames.push(inp.value.trim()||inp.placeholder));
  burakoScores = [];
  burakoConfigCard.classList.add('hidden');
  burakoScoreCard.classList.remove('hidden');
  renderBurakoTable();
  renderBurakoInputs();
});

// --- BURAKO: Reglamento ---
burakoRuleBtn.addEventListener('click',()=>{
  alert('Reglamento de Burako: …');
});

// --- BURAKO: Render y lógica ---
function renderBurakoTable(){
  let html = '<table><thead><tr><th>Ronda</th>';
  burakoNames.forEach(name=> html+=`<th>${name}</th>`);
  html+='<th>Total</th></tr></thead><tbody>';
  burakoScores.forEach((roundScores,idx)=>{
    html+=`<tr><td>${idx+1}</td>`;
    let total=0;
    roundScores.forEach(s=>{ html+=`<td>${s}</td>`; total+=s; });
    html+=`<td>${total}</td></tr>`;
  });
  html+='</tbody></table>';
  burakoTableCt.innerHTML = html;
}
function renderBurakoInputs(){
  burakoInputsCt.innerHTML = '';
  burakoNames.forEach((_,i)=>{
    const div = document.createElement('div');
    div.className='input-group';
    const lbl = document.createElement('label');
    lbl.textContent = `${burakoNames[i]}:`;
    const inp = document.createElement('input');
    inp.type='number'; inp.min='-999999'; inp.value=0; inp.id=`roundInput${i}`;
    div.append(lbl, inp);
    burakoInputsCt.appendChild(div);
  });
}
burakoPointsForm.addEventListener('submit',e=>{
  e.preventDefault();
  const roundScores = burakoNames.map((_,i)=>
    parseInt(document.getElementById(`roundInput${i}`).value,10)||0
  );
  burakoScores.push(roundScores);
  burakoRound++;
  renderBurakoTable();
  const totals = burakoNames.map((_,i)=>
    burakoScores.reduce((sum,rs)=>sum+(rs[i]||0),0)
  );
  const winnerIdx = totals.findIndex(t=>t>=3000);
  if(winnerIdx!==-1){
    alert(`¡Ganador: ${burakoNames[winnerIdx]} con ${totals[winnerIdx]} puntos!`);
    return;
  }
  renderBurakoInputs();
});
