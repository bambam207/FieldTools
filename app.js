// ----------------- Container Balance Calculator -----------------
function calcContainer() {
  // 1) Units & rack
  const wU        = document.getElementById('cbWeightUnit').value;  
  const lU        = document.getElementById('cbLengthUnit').value;  
  const L         = parseFloat(document.getElementById('cbContainerType').value); // 20 or 40
  const marginFt  = 8/12;   // 8" no‑go on each end
  const usableLen = L - 2*marginFt;

  // 2) Converters
  const toFt    = v => (lU === 'm' ? v/0.3048 : v);
  const toLbs   = v => {
    if (wU === 'kg')         return v*2.20462;
    if (wU === 'us_ton')     return v*2000;
    if (wU === 'metric_ton') return v*2204.62;
    return v;
  };
  const fromLbs = v => {
    if (wU === 'kg')         return (v/2.20462).toFixed(2);
    if (wU === 'us_ton')     return (v/2000).toFixed(2);
    if (wU === 'metric_ton') return (v/2204.62).toFixed(2);
    return v.toFixed(2);
  };

  // 3) Gather objects
  const objs = [];
  for (let i = 1; i <= 6; i++) {
    const w = parseFloat(document.getElementById(`cbLoad${i}W`).value);
    const d = parseFloat(document.getElementById(`cbLoad${i}D`).value);
    if (isNaN(w) || isNaN(d)) continue;
    objs.push({ idx: i, wLbs: toLbs(w), dFt: toFt(d) });
  }
  if (!objs.length) {
    document.getElementById('containerResult').textContent = 'Enter at least one object.';
    return;
  }

  // 4) Total widths
  const totalWidth = objs.reduce((sum, o) => sum + o.dFt, 0);

  // 5) If they don’t fit within the **usable length**, warn & stop
  const resultDiv = document.getElementById('containerResult');
  if (totalWidth > usableLen) {
    resultDiv.innerHTML = `
      <p style="color:red;font-weight:bold;">
        ⚠️ Combined widths (${totalWidth.toFixed(2)} ft) exceed usable length (${usableLen.toFixed(2)} ft).<br/>
        Please reduce or resize your objects so they fit between the 8″ no‑go zones.
      </p>
    `;
    document.querySelector('#containerTable tbody').innerHTML = '';
    return;
  }

  // 6) Compute flush‑packed centers (cip0) & weight sums
  let prefix = marginFt, sumW = 0, sumWC = 0;
  objs.forEach(o => {
    o.cip0   = prefix + o.dFt/2;
    sumW    += o.wLbs;
    sumWC   += o.wLbs * o.cip0;
    prefix   += o.dFt;
  });

  // 7) Level by weight: shift so CG lands at center, clamp inside margins
  const C    = L/2;
  const raw  = C - (sumWC / sumW);
  const minG = marginFt - objs[0].cip0;
  const last = objs[objs.length - 1];
  const maxG = (L - marginFt) - last.cip0;
  const g    = Math.max(minG, Math.min(raw, maxG));

  // 8) Render table
  const tbody = document.querySelector('#containerTable tbody');
  tbody.innerHTML = '';
  objs.forEach(o => {
    const x  = o.cip0 + g;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>Obj ${o.idx}</td>
      <td>${fromLbs(o.wLbs)} ${wU}</td>
      <td>${lU==='m'
           ? (o.dFt*0.3048).toFixed(2)
           : o.dFt.toFixed(2)} ${lU}</td>
      <td>${lU==='m'
           ? (x*0.3048).toFixed(2)
           : x.toFixed(2)} ${lU}</td>
    `;
    tbody.appendChild(tr);
  });

  // 9) Summary (no red margin‑warning here)
  resultDiv.innerHTML = `
    <p>
      Rack CG target: ${C.toFixed(2)} ft<br/>
      Applied shift: ${g.toFixed(2)} ft
    </p>
  `;
}