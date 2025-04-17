// ----------------- Unit conversion -----------------
function getFactors() {
  const wU = document.getElementById('weightUnit').value;
  const lU = document.getElementById('lengthUnit').value;
  let wf=1, wD='lbs';
  if (wU==='kg')         { wf=2.20462;  wD='kg'; }
  if (wU==='us_ton')     { wf=2000;     wD='US tons'; }
  if (wU==='metric_ton') { wf=2204.62; wD='metric tons'; }
  let lf=1, lD='ft';
  if (lU==='m') { lf=3.28084; lD='m'; }
  return { wf, wD, lf, lD };
}

// ----------------- Sling load logic -----------------
function calcSling() {
  const { wf,wD,lf,lD } = getFactors();
  const loadVal = parseFloat(document.getElementById('load').value);
  const D1val   = parseFloat(document.getElementById('d1').value);
  const D2val   = parseFloat(document.getElementById('d2').value);
  const HinVal  = parseFloat(document.getElementById('height').value);
  const L1inVal = parseFloat(document.getElementById('l1').value);
  const L2inVal = parseFloat(document.getElementById('l2').value);
  const tbody   = document.querySelector('#resultTable tbody');
  tbody.innerHTML = '';

  // validate
  if (isNaN(loadVal)||isNaN(D1val)||isNaN(D2val)) {
    tbody.innerHTML = '<tr><td colspan="5">Please fill Load, D1 & D2.</td></tr>';
    return;
  }

  // convert to base lbs/ft
  const load = loadVal * wf;
  const D1   = D1val   * lf;
  const D2   = D2val   * lf;
  const H    = HinVal  * lf;
  const L1in = L1inVal * lf;
  const L2in = L2inVal * lf;

  const haveH = !isNaN(HinVal);
  const haveL = !isNaN(L1inVal) && !isNaN(L2inVal);

  // Pre‑set angles if neither H nor L given
  if (!haveH && !haveL) {
    [60,50,45,35].forEach(deg=>{
      const θ   = deg * Math.PI/180;
      const L1b = D1 / Math.cos(θ);
      const L2b = D2 / Math.cos(θ);
      const H1  = D1 * Math.tan(θ);
      const H2  = D2 * Math.tan(θ);
      const T1  = load * D2 * L1b / (H1 * (D1 + D2));
      const T2  = load * D1 * L2b / (H2 * (D1 + D2));

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>Preset ${deg}°</td>
        <td>${(L1b/lf).toFixed(2)} ${lD}<br>${deg}°</td>
        <td>${(L2b/lf).toFixed(2)} ${lD}<br>${deg}°</td>
        <td>${(T1/wf).toFixed(2)} ${wD}</td>
        <td>${(T2/wf).toFixed(2)} ${wD}</td>
      `;
      tbody.appendChild(tr);
    });
    return;
  }

  // manual‑legs vs height‑derived
  let mode, L1b, L2b;
  if (haveL) {
    mode = 'Manual Legs';
    L1b = L1in;
    L2b = L2in;
  } else {
    mode = 'From Height';
    L1b = Math.hypot(D1, H);
    L2b = Math.hypot(D2, H);
  }

  // check geometry
  const H1 = Math.sqrt(L1b*L1b - D1*D1);
  const H2 = Math.sqrt(L2b*L2b - D2*D2);
  if (isNaN(H1)||isNaN(H2)||H1<=0||H2<=0) {
    tbody.innerHTML = '<tr><td colspan="5">Invalid geometry.</td></tr>';
    return;
  }

  const a1 = Math.asin(H1/L1b) * 180/Math.PI;
  const a2 = Math.asin(H2/L2b) * 180/Math.PI;
  const T1 = load * D2 * L1b / (H1 * (D1 + D2));
  const T2 = load * D1 * L2b / (H2 * (D1 + D2));

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${mode}</td>
    <td>${(L1b/lf).toFixed(2)} ${lD}<br>${a1.toFixed(1)}°</td>
    <td>${(L2b/lf).toFixed(2)} ${lD}<br>${a2.toFixed(1)}°</td>
    <td>${(T1/wf).toFixed(2)} ${wD}</td>
    <td>${(T2/wf).toFixed(2)} ${wD}</td>
  `;
  tbody.appendChild(tr);
}

// hook up the button
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('go').onclick = calcSling;
});