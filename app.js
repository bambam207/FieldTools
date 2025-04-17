// ----------------- Utility: Unit Conversion -----------------
function getConversionFactors() {
  const wU = document.getElementById('cbWeightUnit').value;
  const lU = document.getElementById('cbLengthUnit').value;
  let weightFactor = 1, weightDisplay = 'lbs';
  if (wU === 'kg')         { weightFactor = 2.20462;  weightDisplay = 'kg'; }
  if (wU === 'us_ton')     { weightFactor = 2000;     weightDisplay = 'US tons'; }
  if (wU === 'metric_ton') { weightFactor = 2204.62; weightDisplay = 'metric tons'; }
  let lengthFactor = 1, lengthDisplay = 'ft';
  if (lU === 'm') { lengthFactor = 3.28084; lengthDisplay = 'm'; }
  return { weightFactor, lengthFactor, weightDisplay, lengthDisplay };
}

// ----------------- Container Balance Calculator -----------------
function calcContainer() {
  const { weightFactor, lengthFactor, weightDisplay, lengthDisplay } = getConversionFactors();
  const L        = parseFloat(document.getElementById('cbContainerType').value);
  const marginFt = 8/12;
  const usableL  = L - 2*marginFt;

  // collect objects
  const objs = [];
  for (let i = 1; i <= 6; i++) {
    const w = parseFloat(document.getElementById(`cbLoad${i}W`).value);
    const d = parseFloat(document.getElementById(`cbLoad${i}D`).value);
    if (!isNaN(w) && !isNaN(d)) {
      objs.push({ idx: i, wLbs: w*weightFactor, dFt: d*lengthFactor });
    }
  }

  const tbody     = document.querySelector('#containerTable tbody');
  const resultDiv = document.getElementById('containerResult');
  tbody.innerHTML = '';
  resultDiv.innerHTML = '';

  if (objs.length === 0) {
    resultDiv.textContent = 'Enter at least one object.';
    return;
  }

  // sum widths
  const totalW = objs.reduce((sum,o)=>sum+o.dFt,0);

  // error if > container length
  if (totalW > L) {
    resultDiv.innerHTML = `
      <p style="color:red;font-weight:bold;">
        ⚠️ Combined widths (${totalW.toFixed(2)} ft) exceed container length (${L.toFixed(2)} ft).<br/>
        They must fit within 0 – ${L.toFixed(2)} ft.
      </p>`;
    return;
  }

  // warning if > usable length
  let warning = '';
  if (totalW > usableL) {
    warning = `<p style="color:red;font-weight:bold;">
      ⚠️ Combined widths (${totalW.toFixed(2)} ft) exceed usable length (${usableL.toFixed(2)} ft).<br/>
      They will occupy the 8″ no‑go zones.
    </p>`;
  }

  // compute flush‑packed centers
  let prefix=marginFt, sumW=0, sumWC=0;
  objs.forEach(o=>{
    o.cip0 = prefix + o.dFt/2;
    sumW  += o.wLbs;
    sumWC += o.wLbs * o.cip0;
    prefix += o.dFt;
  });

  // center CG
  const C    = L/2;
  const raw  = C - (sumWC/sumW);
  const minG = marginFt - objs[0].cip0;
  const last = objs[objs.length-1];
  const maxG = (L - marginFt) - last.cip0;
  const g    = Math.max(minG, Math.min(raw, maxG));

  // render rows
  objs.forEach(o=>{
    const tr  = document.createElement('tr');
    const pos = ((o.cip0 + g)/lengthFactor).toFixed(2);
    tr.innerHTML = `
      <td>Obj ${o.idx}</td>
      <td>${(o.wLbs/weightFactor).toFixed(2)} ${weightDisplay}</td>
      <td>${(o.dFt/lengthFactor).toFixed(2)} ${lengthDisplay}</td>
      <td>${pos} ${lengthDisplay}</td>
    `;
    tbody.appendChild(tr);
  });

  // summary
  resultDiv.innerHTML = warning + `
    <p>
      Rack CG target: ${ (L/2).toFixed(2) } ft<br/>
      Applied shift: ${ g.toFixed(2) } ft
    </p>
  `;
}

// wire up the button on load
window.addEventListener('load', () => {
  document.getElementById('cbGo').onclick = calcContainer;
});