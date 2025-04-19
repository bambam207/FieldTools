document.addEventListener('DOMContentLoaded', () => {
  const tbody               = document.querySelector('#objects-table tbody');
  const totalWeightEl       = document.getElementById('total-weight');
  const positionsList       = document.getElementById('positions-list');
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

  // how many object rows to start with
  const MAX_OBJS = 6;

  // create rows
  for (let i = 0; i < MAX_OBJS; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td><input type="number" step="any" min="0" placeholder="wt" /></td>
      <td><input type="number" step="any" min="0" placeholder="wd" /></td>
    `;
    tbody.appendChild(tr);
  }

  // re‑calc on any input change
  Array.from(document.querySelectorAll(
    '#objects-table input, #first-pos, #length-unit, #weight-unit, #container-size'
  )).forEach(el => el.addEventListener('input', calculate));

  // initial
  calculate();

  function calculate() {
    // read settings
    const L   = parseFloat(containerSizeSelect.value) || 0;        // 20 or 40
    const uL  = lengthUnitSelect.value;                            // 'ft' or 'm'
    const uW  = weightUnitSelect.value;                            // 'ton','lb','kg'
    const rawFirst = parseFloat(firstPosInput.value);
    const margin = (uL === 'ft')
      ? 8/12       // 8 inches → 0.667 ft
      : 8*0.0254;  // 8 inches → 0.2032 m

    containerLengthDisp.textContent = L.toFixed(0);
    lenUnitLabel.textContent        = uL;

    // gather items with weight > 0
    const rows = Array.from(tbody.querySelectorAll('tr'));
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

    // warning if sum widths > L
    const sumW = items.reduce((s,i)=>s+i.width,0);
    warningEl.textContent = sumW > L
      ? '⚠️ Total widths exceed container length!'
      : '';

    // if no items, clear and exit
    positionsList.innerHTML = '';
    if (items.length === 0) return;

    // clamp first CG into valid range
    const w0 = items[0].width;
    const minFirst = margin + w0/2;
    const maxFirst = L - margin - w0/2;
    let x0 = (!isNaN(rawFirst))
      ? Math.min(maxFirst, Math.max(minFirst, rawFirst))
      : minFirst;
    // warn if they tried to go out of bounds
    if (!isNaN(rawFirst) && (rawFirst < minFirst || rawFirst > maxFirst)) {
      warningEl.textContent = `⚠️ Obj 1 CG must be between ${minFirst.toFixed(2)} and ${maxFirst.toFixed(2)} ${uL}`;
    }

    const xs = [x0];

    // target moment = (L/2)*sum(weights up to i)
    // iterative: xN = ( (L/2)*sumW_N ‑ sum(wk*xk, k< N) ) / wN
    for (let i = 1; i < items.length; i++) {
      const wN    = items[i].weight;
      const sumWn = items.slice(0, i+1).reduce((s,it)=>s+it.weight, 0);
      const momN  = (L/2) * sumWn;
      const prevM = items.slice(0, i).reduce((s,it,j)=>s + it.weight*xs[j], 0);
      const xi    = (momN - prevM) / wN;
      // enforce no‑go/margin for every object
      const halfW = items[i].width/2;
      const minXi = margin + halfW;
      const maxXi = L - margin - halfW;
      xs[i] = Math.min(maxXi, Math.max(minXi, xi));
    }

    // render positions
    positionsList.innerHTML = '';
    xs.forEach((x,i) => {
      const li = document.createElement('li');
      li.textContent = `Object ${i+1}: ${x.toFixed(2)} ${uL}`;
      positionsList.appendChild(li);
    });
  }
});