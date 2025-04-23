// --- DOM refs ---
const landingCard    = document.getElementById('landingCard');
const selectRummy    = document.getElementById('selectRummy');
const selectBurako   = document.getElementById('selectBurako');

const rummyConfig    = document.getElementById('rummyConfigCard');
const burakoConfig   = document.getElementById('burakoConfigCard');
const rummyGame      = document.getElementById('rummyGameCard');
const burakoScore    = document.getElementById('burakoScoreCard');

const burakoModeEls  = document.getElementsByName('burakoMode');
const burakoNamesCt  = document.getElementById('burakoNamesContainer');
const burakoConfigForm = document.getElementById('burakoConfigForm');

const burakoTableCt  = document.getElementById('burakoTableContainer');
const burakoInputsCt = document.getElementById('burakoInputsContainer');
const burakoPointsForm = document.getElementById('burakoPointsForm');
const burakoRuleBtn  = document.getElementById('burakoRuleBtn');

// --- Estado global ---
let gameType;
let burakoMode;      // "1v1", "1v1v1" o "2v2"
let burakoNames = [];
let burakoScores = [];  // matriz [jugador][ronda]
let burakoRound = 0;

// --- Landing listeners ---
selectRummy.addEventListener('click', () => {
  landingCard.classList.add('hidden');
  rummyConfig.classList.remove('hidden');
});
selectBurako.addEventListener('click', () => {
  gameType = 'burako';
  landingCard.classList.add('hidden');
  burakoConfig.classList.remove('hidden');
});

// --- Burako config: mostrar inputs según modo ---
burakoModeEls.forEach(el => {
  el.addEventListener('change', () => {
    burakoMode = el.value;
    // limpiar y generar burakoMode inputs
    burakoNamesCt.innerHTML = '';
    let count = burakoMode === '2v2' ? 4 
              : burakoMode === '1v1v1' ? 3 
              : 2;
    for (let i = 1; i <= count; i++) {
      let div = document.createElement('div');
      div.className = 'input-group';
      let lbl = document.createElement('label');
      lbl.textContent = `Jugador ${i}:`;
      let inp = document.createElement('input');
      inp.type = 'text';
      inp.id = `burakoPlayer${i}`;
      inp.placeholder = `Nombre ${i}`;
      inp.required = true;
      div.append(lbl, inp);
      burakoNamesCt.appendChild(div);
    }
  });
});

// --- Al enviar configuración de Burako ---
burakoConfigForm.addEventListener('submit', e => {
  e.preventDefault();
  // leer nombres
  burakoNames = [];
  let inputs = burakoNamesCt.querySelectorAll('input');
  inputs.forEach(inp => burakoNames.push(inp.value.trim() || inp.placeholder));
  // inicializar scores
  let players = burakoNames.length;
  burakoScores = Array.from({length: players}, () => []);
  burakoRound = 0;
  burakoConfig.classList.add('hidden');
  burakoScore.classList.remove('hidden');
  renderBurakoTable();
  renderBurakoInputs();
});

// --- Botón reglamento Burako ---
burakoRuleBtn.addEventListener('click', () => {
  alert('Reglamento de Burako: …'); 
});

// --- Render tabla Burako ---
function renderBurakoTable() {
  let html = '<table><thead><tr><th>Ronda</th>';
  burakoNames.forEach(name => html += `<th>${name}</th>`);
  html += '<th>Total</th></tr></thead><tbody>';
  burakoScores.forEach((roundScores, idx) => {
    html += `<tr><td>${idx+1}</td>`;
    let total = 0;
    roundScores.forEach(s => { html += `<td>${s}</td>`; total+=s; });
    html += `<td>${total}</td></tr>`;
  });
  html += '</tbody></table>';
  burakoTableCt.innerHTML = html;
}

// --- Render inputs Burako ---
function renderBurakoInputs() {
  burakoInputsCt.innerHTML = '';
  burakoNames.forEach((name, idx) => {
    let div = document.createElement('div');
    div.className = 'input-group';
    let lbl = document.createElement('label');
    lbl.textContent = `${name}:`;
    let inp = document.createElement('input');
    inp.type = 'number'; inp.min = -999999; inp.value = 0;
    inp.id = `roundInput${idx}`;
    div.append(lbl, inp);
    burakoInputsCt.appendChild(div);
  });
}

// --- Al agregar puntos de Burako ---
burakoPointsForm.addEventListener('submit', e => {
  e.preventDefault();
  // lee valores y añade nueva ronda
  let roundScores = burakoNames.map((_, idx) => {
    return parseInt(document.getElementById(`roundInput${idx}`).value, 10) || 0;
  });
  burakoScores.push(roundScores);
  burakoRound++;
  renderBurakoTable();
  // chequea si alguien llegó a 3000+
  let totals = burakoNames.map((_, i) =>
    burakoScores.reduce((sum, rs) => sum + (rs[i]||0), 0)
  );
  let winnerIdx = totals.findIndex(t => t >= 3000);
  if (winnerIdx !== -1) {
    alert(`¡Ganador: ${burakoNames[winnerIdx]} con ${totals[winnerIdx]} puntos!`);
    return;
  }
  renderBurakoInputs();
});
