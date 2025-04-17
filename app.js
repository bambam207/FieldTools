// ----------------- Utility: Unit Conversion for Sling -----------------
function getConversionFactors() {
  const weightUnit = document.getElementById('weightUnit')?.value || 'lbs';
  const lengthUnit = document.getElementById('lengthUnit')?.value || 'ft';
  let weightFactor = 1, weightDisplayUnit = 'lbs';
  if (weightUnit === 'us_ton')       { weightFactor = 2000;     weightDisplayUnit = 'US tons'; }
  else if (weightUnit === 'kg')      { weightFactor = 2.20462;  weightDisplayUnit = 'kg';      }
  else if (weightUnit === 'metric_ton') { weightFactor = 2204.62; weightDisplayUnit = 'metric tons'; }

  let lengthFactor = 1, lengthDisplayUnit = 'ft';
  if (lengthUnit === 'm') { lengthFactor = 3.28084; lengthDisplayUnit = 'm'; }

  return { weightFactor, lengthFactor, weightDisplayUnit, lengthDisplayUnit };
}

// ----------------- Sling Load Calculator (unchanged) -----------------
function calcSling() {
  const { weightFactor, lengthFactor, weightDisplayUnit, lengthDisplayUnit } = getConversionFactors();
  const loadInput = parseFloat(document.getElementById('load').value);
  const D1Input   = parseFloat(document.getElementById('d1').value);
  const D2Input   = parseFloat(document.getElementById('d2').value);
  const loadBase  = loadInput * weightFactor;
  const D1Base    = D1Input * lengthFactor;
  const D2Base    = D2Input * lengthFactor;
  const H_input   = document.getElementById('height').value;
  const L1_input  = document.getElementById('l1').value;
  const L2_input  = document.getElementById('l2').value;
  const tbody     = document.querySelector('#resultTable tbody');
  tbody.innerHTML = '';

  if (isNaN(loadBase) || isNaN(D1Base) || isNaN(D2Base)) {
    tbody.innerHTML = '<tr><td colspan="5">Please enter valid Load, D1, and D2.</td></tr>';
    return;
  }

  const hasHeight = !(H_input === '' || isNaN(parseFloat(H_input)));
  const hasLegs   = !(L1_input === '' || isNaN(parseFloat(L1_input)))
                   && !(L2_input === '' || isNaN(parseFloat(L2_input)));

  if (!hasHeight && !hasLegs) {
    [60,50,45,35].forEach(thetaDeg => {
      const θ   = thetaDeg * Math.PI/180;
      const L1b = D1Base / Math.cos(θ);
      const L2b = D2Base / Math.cos(θ);
      const H1b = D1Base * Math.tan(θ);
      const H2b = D2Base * Math.tan(θ);
      const T1b = (loadBase * D2Base * L1b) / (H1b * (D1Base + D2Base));
      const T2b = (loadBase * D1Base * L2b) / (H2b * (D1Base + D2Base));

      const L1 = (L1b/lengthFactor).toFixed(2),
            L2 = (L2b/lengthFactor).toFixed(2),
            T1 = (T1b/weightFactor).toFixed(2),
            T2 = (T2b/weightFactor).toFixed(2);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>Preset ${thetaDeg}°</td>
        <td>${L1} ${lengthDisplayUnit}<br>${thetaDeg}°</td>
        <td>${L2} ${lengthDisplayUnit}<br>${thetaDeg}°</td>
        <td>${T1} ${weightDisplayUnit}</td>
        <td>${T2} ${weightDisplayUnit}</td>
      `;
      tbody.appendChild(row);
    });
    return;
  }

  let mode = '', L1b, L2b;
  if (hasLegs) {
    L1b = parseFloat(L1_input) * lengthFactor;
    L2b = parseFloat(L2_input) * lengthFactor;
    mode = 'Manual Legs';
  } else {
    const Hb = parseFloat(H_input) * lengthFactor;
    L1b = Math.hypot(D1Base, Hb);
    L2b = Math.hypot(D2Base, Hb);
    mode = 'Auto Legs (from H)';
  }

  const H1b = Math.sqrt(L1b*L1b - D1Base*D1Base),
        H2b = Math.sqrt(L2b*L2b - D2Base*D2Base);

  if (isNaN(H1b)||isNaN(H2b)||H1b<=0||H2b<=0) {
    tbody.innerHTML = '<tr><td colspan="5">Invalid geometry: ensure L > D.</td></tr>';
    return;
  }

  const a1 = Math.asin(H1b/L1b)*180/Math.PI,
        a2 = Math.asin(H2b/L2b)*180/Math.PI,
        T1b = (loadBase*D2Base*L1b)/(H1b*(D1Base+D2Base)),
        T2b = (loadBase*D1Base*L2b)/(H2b*(D1Base+D2Base));

  const L1 = (L1b/lengthFactor).toFixed(2),
        L2 = (L2b/lengthFactor).toFixed(2),
        T1 = (T1b/weightFactor).toFixed(2),
        T2 = (T2b/weightFactor).toFixed(2);

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${mode}</td>
    <td>${L1} ${lengthDisplayUnit}<br>${a1.toFixed(1)}°</td>
    <td>${L2} ${lengthDisplayUnit}<br>${a2.toFixed(1)}°</td>
    <td>${T1} ${weightDisplayUnit}</td>
    <td>${T2} ${weightDisplayUnit}</td>
  `;
  tbody.appendChild(row);
}

// ----------------- Container Balance Calculator -----------------
function calcContainer() {
  // 1) Units & rack
  const wU = document.getElementById('cbWeightUnit').value;  
  const lU = document.getElementById('cbLengthUnit').value;  
  const L  = parseFloat(document.getElementById('cbContainerType').value); // 20 or 40
  const marginFt = 8/12;   // 8" no‑go on each end
  const C = L/2;           // target CG

  // 2) Converters
  const toFt = v => (lU==='m' ? v/0.3048 : v);
  const toLbs = v => {
    if (wU==='kg')         return v*2.20462;
    if (wU==='us_ton')     return v*2000;
    if (wU==='metric_ton') return v*2204.62;
    return v;
  };
  const fromLbs = v => {
    if (wU==='kg')         return (v/2.20462).toFixed(2);
    if (wU==='us_ton')     return (v/2000).toFixed(2);
    if (wU==='metric_ton') return (v/2204.62).toFixed(2);
    return v.toFixed(2);
  };

  // 3) Gather objects
  const objs = [];
  for (let i=1; i<=6; i++) {
    const w = parseFloat(document.getElementById(`cbLoad${i}W`).value);
    const d = parseFloat(document.getElementById(`cbLoad${i}D`).value);
    if (isNaN(w) || isNaN(d)) continue;
    objs.push({
      idx: i,
      wLbs: toLbs(w),
      dFt : toFt(d)
    });
  }
  if (!objs.length) {
    document.getElementById('containerResult').textContent = 'Enter at least one object.';
    return;
  }

  // 4) Compute CIP0 (flush‑packed, no overlap) and sums
  let prefix=0, sumW=0, sumWC=0;
  objs.forEach(o=>{
    o.cip0 = prefix + o.dFt/2;
    sumW   += o.wLbs;
    sumWC  += o.wLbs * o.cip0;
    prefix += o.dFt;
  });
  const totalWidth = prefix;

  // 5) Raw shift to center CG
  const rawShift = C - (sumWC/sumW);

  // 6) Clamp so no object center goes outside [0,L]
  //    => CIP(i) = cip0 + g  with g in [minShift, maxShift]
  const minShift = (o => o.dFt/2 - o.cip0)(objs[0]);           // CIP(1)>=d1/2
  const last = objs[objs.length-1];
  const maxShift = (L - last.dFt/2) - last.cip0;               // CIP(n)<=L-dn/2
  const g = Math.max(minShift, Math.min(rawShift, maxShift));

  // 7) Render table
  const tbody = document.querySelector('#containerTable tbody');
  tbody.innerHTML = '';
  objs.forEach(o=>{
    const x = o.cip0 + g;
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

  // 8) Show warning if exceeding usable length and summary
  const usableLen = L - 2*marginFt;
  let html = '';
  if (totalWidth > usableLen) {
    html += `<p style="color:red;font-weight:bold;">
      ⚠️ Combined widths (${totalWidth.toFixed(2)} ft) exceed usable length (${usableLen.toFixed(2)} ft).<br/>
      Objects will overlap to fit within 0–${L.toFixed(0)} ft.
    </p>`;
  }
  html += `<p>
    Rack CG target: ${C.toFixed(2)} ft<br/>
    Applied shift: ${g.toFixed(2)} ft
  </p>`;
  document.getElementById('containerResult').innerHTML = html;
}