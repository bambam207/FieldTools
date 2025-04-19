// container.js
document.addEventListener('DOMContentLoaded', () => {
  const tbody               = document.querySelector('#objects-table tbody');
  const totalWeightEl       = document.getElementById('total-weight');
  const resultsTbody        = document.querySelector('#results-table tbody');
  const firstPosInput       = document.getElementById('first-pos');
  const lengthUnitSelect    = document.getElementById('length-unit');
  const weightUnitSelect    = document.getElementById('weight-unit');
  const platformTypeSelect  = document.getElementById('platform-type');
  const containerSizeSelect = document.getElementById('container-size');
  const containerLengthDisp = document.getElementById('container-length-display');
  const lenUnitLabel        = document.getElementById('len-unit-label');
  const cgUnitLabel         = document.getElementById('cg-unit-label');
  const warningEl           = document.getElementById('warning');
  const calcBtn             = document.getElementById('calc-btn');
  const form               = document.getElementById('containerForm');

  // hide manual Calculate button
  if (calcBtn) calcBtn.style.display = 'none';

  // inject “Allow overlap for first two items” checkbox
  const overlapGroup = document.createElement('div');
  overlapGroup.className = 'form-group';
  overlapGroup.innerHTML = `
    <label>
      <input type="checkbox" id="allow-overlap" />
      Allow overlap for first two items
    </label>
  `;
  form.appendChild(overlapGroup);
  const overlapToggle = document.getElementById('allow-overlap');

  // generate 6 rows
  const MAX_OBJS = 6;
  for (let i = 0; i < MAX_OBJS; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td><input type="number" step="any" min="0" placeholder="WT"></td>
      <td><input type="number" step="any" min="0" placeholder="WD"></td>
    `;
    tbody.appendChild(tr);
  }
  const rows = Array.from(tbody.querySelectorAll('tr'));

  // watch all relevant inputs & dropdowns
  const watchers = Array.from(document.querySelectorAll(
    '#objects-table input, #first-pos, #length-unit, #weight-unit, #container-size, #platform-type, #allow-overlap'
  ));
  watchers.forEach(el => el.addEventListener('input', calculate));

  // initial calculation
  calculate();

  function calculate() {
    const L        = parseFloat(containerSizeSelect.value) || 0;  // 20 or 40
    const uL       = lengthUnitSelect.value;                     // 'FT' or 'M'
    const uW       = weightUnitSelect.value;                     // 'TONS','LBS','KG'
    const platform = platformTypeSelect.value;                   // 'CONTAINER' or 'FLATRACK'
    const rawFirst = parseFloat(firstPosInput.value);
    const allowOv  = overlapToggle.checked;
    // apply 8" margin only on FLATRACK
    const margin   = platform === 'FLATRACK'
      ? (uL === 'FT' ? 8/12 : 8 * 0.0254)
      : 0;

    // update labels
    containerLengthDisp.textContent = L.toFixed(0);
    lenUnitLabel.textContent        = uL;
    cgUnitLabel.textContent         = uL;

    // usable length for warning
    const usableLength = L - 2 * margin;

    // collect items with weight > 0
    const items = rows.map(tr => {
      const [wIn, wdIn] = tr.querySelectorAll('input');
      return {
        weight: parseFloat(wIn.value)  || 0,
        width:  parseFloat(wdIn.value) || 0
      };
    }).filter(it => it.weight > 0);

    // total weight display
    const Wtot = items.reduce((s,i) => s + i.weight, 0);
    totalWeightEl.textContent = Wtot.toFixed(2) + ' ' + uW;

    // warn if widths exceed usable length
    const sumW = items.reduce((s,i) => s + i.width, 0);
    warningEl.textContent = sumW > usableLength
      ? `⚠️ Total widths exceed usable length (${usableLength.toFixed(2)} ${uL})`
      : '';

    // clear previous results
    resultsTbody.innerHTML = '';
    if (items.length === 0) return;

    // clamp and compute first CG
    const w0   = items[0].width;
    const minF = margin + w0/2;
    const maxF = L - margin - w0/2;
    let x0 = !isNaN(rawFirst)
      ? Math.min(maxF, Math.max(minF, rawFirst))
      : minF;
    if (!isNaN(rawFirst) && (rawFirst < minF || rawFirst > maxF)) {
      warningEl.textContent = `⚠️ Obj 1 CG must be between ${minF.toFixed(2)} and ${maxF.toFixed(2)} ${uL}`;
    }

    const xs = [x0];

    // compute CG for each subsequent item
    for (let i = 1; i < items.length; i++) {
      const wN       = items[i].weight;
      const sumWn    = items.slice(0, i + 1).reduce((s,it) => s + it.weight, 0);
      const targetM  = (L/2) * sumWn;
      const prevM    = items.slice(0, i).reduce((s,it,j) => s + it.weight * xs[j], 0);
      let xi = (targetM - prevM) / wN;

      // clamp to end‑margins
      const halfW = items[i].width / 2;
      const minXi = margin + halfW;
      const maxXi = L - margin - halfW;
      xi = Math.min(maxXi, Math.max(minXi, xi));

      // enforce no‑overlap except when allowOv && i == 1
      const prevEdge = xs[i - 1] + (items[i - 1].width / 2) + halfW;
      if (!(allowOv && i === 1)) {
        xi = Math.max(xi, prevEdge);
      }

      xs.push(xi);
    }

    // render results table
    xs.forEach((x, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${x.toFixed(2)}</td>
      `;
      resultsTbody.appendChild(tr);
    });
  }
});