function getFactors() {
  const wU = document.getElementById('weightUnit').value;
  const lU = document.getElementById('lengthUnit').value;
  let wD = 'lbs';
  if (wU === 'kg') wD = 'kg';
  if (wU === 'us_ton') wD = 'US tons';
  if (wU === 'metric_ton') wD = 'metric tons';
  let lD = 'ft';
  if (lU === 'm') lD = 'm';
  return { wU, wD, lU, lD };
}

function calcContainer() {
  const { wU, wD, lU, lD } = getFactors();
  const cLen = parseFloat(document.getElementById('containerLen').value);
  const noGo = (lU === 'ft' ? 8 / 12 : 0.2032);
  const usable = cLen - 2 * noGo;

  const ws = [], ds = [];
  for (let i = 1; i <= 6; i++) {
    const w = parseFloat(document.getElementById('w' + i).value);
    const d = parseFloat(document.getElementById('d' + i + 'c').value);
    if (!isNaN(w) && !isNaN(d)) {
      ws.push(w);
      ds.push(d);
    }
  }

  const tbody = document.querySelector('#containerTable tbody');
  tbody.innerHTML = '';
  document.getElementById('message').innerHTML = '';
  document.getElementById('summary').innerHTML = '';

  if (!ws.length) return;

  const sumW = ds.reduce((a, b) => a + b, 0);
  const initial = [];
  let cum = 0;
  for (let i = 0; i < ds.length; i++) {
    const pos = cum + ds[i] / 2;
    initial.push(pos);
    cum += ds[i];
  }

  const totW = ws.reduce((a, b) => a + b, 0);
  const mSum = ws.reduce((a, b, i) => a + b * initial[i], 0);
  const cg0 = mSum / totW;
  const shift = cLen / 2 - cg0;

  for (let i = 0; i < ws.length; i++) {
    const tr = document.createElement('tr');
    const finalPos = initial[i] + shift;
    tr.innerHTML = `
      <td>Obj ${i + 1}</td>
      <td>${ws[i].toFixed(2)} ${wD}</td>
      <td>${ds[i].toFixed(2)} ${lD}</td>
      <td>${finalPos.toFixed(2)} ${lD}</td>
    `;
    tbody.appendChild(tr);
  }

  if (sumW > usable) {
    document.getElementById('message').innerHTML =
      `<p class="warning">⚠ Combined widths (${sumW.toFixed(2)} ${lD}) exceed usable length (${usable.toFixed(2)} ${lD}) – objects will overlap to fit within ${noGo.toFixed(2)} to ${(cLen - noGo).toFixed(2)} ${lD}.</p>`;
  }

  document.getElementById('summary').innerHTML =
    `Total Load: ${totW.toFixed(2)} ${wD}<br>` +
    `Overall CG (initial): ${cg0.toFixed(2)} ${lD}<br>` +
    `Applied Shift: ${shift.toFixed(2)} ${lD}`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('calcBtn').addEventListener('click', calcContainer);
});