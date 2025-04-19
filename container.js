// container.js

document.addEventListener('DOMContentLoaded', () => {
  const tbody               = document.querySelector('#objects-table tbody');
  const totalWeightEl       = document.getElementById('total-weight');
  const firstPosInput       = document.getElementById('first-pos');
  const lengthUnitSelect    = document.getElementById('length-unit');
  const weightUnitSelect    = document.getElementById('weight-unit');
  const containerSizeSelect = document.getElementById('container-size');
  const containerLengthDisp = document.getElementById('container-length-display');
  const lenUnitLabel        = document.getElementById('len-unit-label');
  const warningEl           = document.getElementById('warning');
  const calcBtn             = document.getElementById('calc-btn');

  // hide the manual Calculate button
  if (calcBtn) calcBtn.style.display = 'none';

  // inject “Allow overlap” toggle
  const overlapGroup = document.createElement('div');
  overlapGroup.className = 'form-group';
  overlapGroup.innerHTML = `
    <label>
      <input type="checkbox" id="allow-overlap"/>
      Allow overlap for first two items
    </label>
  `;
  document.getElementById('containerForm').appendChild(overlapGroup);
  const overlapToggle = document.getElementById('allow-overlap');

  // build 6 rows
  const MAX_OBJS = 6;
  for (let i = 0; i < MAX_OBJS; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td><input type="number" step="any" min="0" class="weight" placeholder="wt"></td>
      <td><input type="number" step="any" min="0" class="width"  placeholder="wd"></td>
    `;
    tbody.appendChild(tr);
  }
  const rows = Array.from(tbody.querySelectorAll('tr'));

  // attach all inputs to recalc
  const watchers = [
    '#objects-table input',
    '#first-pos',
    '#length-unit',
    '#weight-unit',
    '#container-size',
    '#allow-overlap'
  ].flatMap(sel => Array.from(document.querySelectorAll(sel)));
  watchers.forEach(el => el.addEventListener('input', calculate));

  // initial run
  calculate();

  function calculate() {
    const L        = parseFloat(containerSizeSelect.value) || 0;  // 20 or 40
    const uL       = lengthUnitSelect.value;                     // 'ft' or 'm'
    const uW       = weightUnitSelect.value;                     // 'ton','lb','kg'
    const rawFirst = parseFloat(firstPosInput.value);
    const allowOv  = overlapToggle.checked;
    const margin   = (uL === 'ft') ? (8/12) : (8 * 0.0254);
    const usable   = L - 2 * margin;

    // enable/disable rows beyond #2 when overlap is on
    rows.forEach((tr, i) => {
      const inputs = tr.querySelectorAll('input');
      if (allowOv && i >= 2) {
        inputs.forEach(inp => inp.disabled = true);
      } else {
        inputs.forEach(inp => inp.disabled = false);
      }
    });

    // update container display
    containerLengthDisp.textContent = L.toFixed(0);
    lenUnitLabel.textContent        = uL;

    // gather only enabled rows with weight > 0
    const items = rows.map(tr => {
      const [wIn, wdIn] = tr.querySelectorAll('input');
      return {
        weight: wIn.disabled ? 0 : parseFloat(wIn.value)  || 0,
        width:  wdIn.disabled? 0 : parseFloat(wdIn.value) || 0
      };
    }).filter(it => it.weight > 0);

    // total weight
    const Wtot = items.reduce((s,i) => s + i.weight, 0);
    totalWeightEl.textContent = Wtot.toFixed(2) + ' ' + uW;

    // widths warning against usable span
    const sumW = items.reduce((s,i) => s + i.width, 0);
    warningEl.textContent = sumW > usable
      ? `⚠️ Total width (${sumW.toFixed(2)}) exceeds usable (${usable.toFixed(2)})`
      : '';

    // Positions calculation
    if (items.length === 0) {
      // clear result table
      document.querySelector('#resultTable tbody').innerHTML = '';
      return;
    }

    // first CG clamp
    const w0   = items[0].width;
    const minF = margin + w0/2;
    const maxF = L - margin - w0/2;
    let x0 = !isNaN(rawFirst)
      ? Math.min(maxF, Math.max(minF, rawFirst))
      : minF;
    if (!isNaN(rawFirst) && (rawFirst < minF || rawFirst > maxF)) {
      warningEl.textContent = 
        `⚠️ Obj 1 CG must be between ${minF.toFixed(2)} and ${maxF.toFixed(2)} ${uL}`;
    }

    const xs = [x0];

    // position subsequent items
    for (let i = 1; i < items.length; i++) {
      const wN      = items[i].weight;
      const sumWn   = items.slice(0, i+1).reduce((s,it) => s + it.weight, 0);
      const targetM = (L/2) * sumWn;
      const prevM   = items.slice(0, i)
                       .reduce((s,it,j) => s + it.weight * xs[j], 0);
      let xi = (targetM - prevM) / wN;

      // clamp to ends
      const halfW = items[i].width/2;
      const minXi = margin + halfW;
      const maxXi = L - margin - halfW;
      xi = Math.min(maxXi, Math.max(minXi, xi));

      // enforce no‑overlap for items ≥3
      if (!allowOv || i >= 2) {
        const prevEdge = xs[i-1] + (items[i-1].width/2) + halfW;
        xi = Math.max(xi, prevEdge);
      }

      xs[i] = xi;
    }

    // render into sling‑style result table
    const resultBody = document.querySelector('#resultTable tbody');
    resultBody.innerHTML = '';
    xs.forEach((x,i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${x.toFixed(2)} ${uL}</td>
      `;
      resultBody.appendChild(tr);
    });
  }
}