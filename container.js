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

  // hide manual Calculate button
  if (calcBtn) calcBtn.style.display = 'none';

  // generate 6 rows
  const MAX_OBJS = 6;
  for (let i = 0; i < MAX_OBJS; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td><input type="number" step="any" min="0" placeholder="WT"></td>
      <td><input type="number" step="any" min="0" placeholder="WD"></td>
    `;
    tbody.appendChild(tr);
  }
  const rows = Array.from(tbody.querySelectorAll('tr'));

  // watch all inputs & dropdowns
  const watchers = Array.from(document.querySelectorAll(
    '#objects-table input, #first-pos, #length-unit, #weight-unit, #container-size, #platform-type'
  ));
  watchers.forEach(el => el.addEventListener('input', calculate));

  // initial calc
  calculate();

  function calculate() {
    // read settings
    const L        = parseFloat(containerSizeSelect.value) || 0;  // 20 or 40
    const uL       = lengthUnitSelect.value;                     // 'FT' or 'M'
    const uW       = weightUnitSelect.value;                     // 'TONS','LBS','KG'
    const platform = platformTypeSelect.value;                   // 'CONTAINER' or 'FLATRACK'
    const rawFirst = parseFloat(firstPosInput.value);
    // margin only for FLATRACK
    const margin   = (platform === 'FLATRACK')
      ? ((uL === 'ft') ? (8/12) : (8 * 0.0254))
      : 0;

    // update labels
    containerLengthDisp.textContent = L.toFixed(0);
    lenUnitLabel.textContent        = uL;
    cgUnitLabel.textContent         = uL;

    // calculate usable length
    const usableLength = L - 2 * margin;

    // gather items >0 weight
    const items = rows.map(tr => {
      const [wIn, wdIn] = tr.querySelectorAll('input');
      return {
        weight: parseFloat(wIn.value)  || 0,
        width:  parseFloat(wdIn.value) || 0
      };
    }).filter(it => it.weight > 0);

    // total weight
    const Wtot = items.reduce((s,i)=>s+i.weight,0);
    totalWeightEl.textContent = Wtot.toFixed(2) + ' ' + uW;

    // warning if widths exceed usable length
    const sumW = items.reduce((s,i)=>s+i.width,0);
    if (sumW > usableLength) {
      warningEl.textContent = `⚠️ Total widths exceed usable length (${usableLength.toFixed(2)} ${uL})`;
    } else {
      warningEl.textContent = '';
    }

    // clear results table
    resultsTbody.innerHTML = '';
    if (items.length === 0) return;

    // clamp first CG
    const w0   = items[0].width;
    const minF = margin + w0/2;
    const maxF = L - margin - w0/2;
    let x0 = !isNaN(rawFirst)
      ? Math.min(maxF, Math.max(minF, rawFirst))
      : minF;
    if (!isNaN(rawFirst) && (rawFirst < minF || rawFirst > maxF)) {
      warningEl.textContent = `⚠️ Obj 1 CG must be between ${minF.toFixed(2)} and ${maxF.toFixed(2)} ${uL}`;
    }

    const xs = [x0];

    // solve CG for each new item
    for (let i = 1; i < items.length; i++) {
      const wN       = items[i].weight;
      const sumWn    = items.slice(0, i+1).reduce((s,it)=>s+it.weight, 0);
      const targetM  = (L/2) * sumWn;
      const prevM    = items.slice(0, i)
                        .reduce((s,it,j)=>s + it.weight * xs[j], 0);
      let xi = (targetM - prevM) / wN;
      // clamp ends
      const halfW = items[i].width/2;
      const minXi = margin + halfW;
      const maxXi = L - margin - halfW;
      xi = Math.min(maxXi, Math.max(minXi, xi));
      xs.push(xi);
    }

    // render results table
    xs.forEach((x,i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${x.toFixed(2)}</td>
      `;
      resultsTbody.appendChild(tr);
    });
  }
});