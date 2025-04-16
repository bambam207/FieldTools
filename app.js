// ----------------- Utility: Unit Conversion for Sling -----------------
function getConversionFactors() {
  const weightUnit = document.getElementById('weightUnit')?.value || 'lbs';
  const lengthUnit = document.getElementById('lengthUnit')?.value || 'ft';
  let weightFactor = 1, weightDisplayUnit = 'lbs';
  if (weightUnit === 'us_ton')      { weightFactor = 2000;    weightDisplayUnit = 'US tons'; }
  else if (weightUnit === 'kg')     { weightFactor = 2.20462; weightDisplayUnit = 'kg';      }
  else if (weightUnit === 'metric_ton') { weightFactor = 2204.62; weightDisplayUnit = 'metric tons'; }
  let lengthFactor = 1, lengthDisplayUnit = 'ft';
  if (lengthUnit === 'm') { lengthFactor = 3.28084; lengthDisplayUnit = 'm'; }
  return { weightFactor, lengthFactor, weightDisplayUnit, lengthDisplayUnit };
}

// ----------------- Sling Load Calculator -----------------
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
  const hasLegs   = !(L1_input === '' || isNaN(parseFloat(L1_input))) &&
                    !(L2_input === '' || isNaN(parseFloat(L2_input)));

  // Preset angles if no height or legs
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

  // Manual legs or auto from height
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
  // 1) units & rack
  const wU = document.getElementById('cbWeightUnit').value;
  const lU = document.getElementById('cbLengthUnit').value;
  const L  = parseFloat(document.getElementById('cbContainerType').value); // ft
  const m  = 8/12;    // margin in ft
  const C  = L/2;     // desired CG

  // 2) converters
  const toFt = v => lU==='m' ? v/0.3048 : v;
  const toLbs = v => {
    if (wU==='kg') return v*2.20462;
    if (wU==='us_ton') return v*2000;
    if (wU==='metric_ton') return v*2204.62;
    return v;
  };
  const fromLbs = v => {
    if (wU==='kg') return (v/2.20462).toFixed(2);
    if (wU==='us_ton') return (v/2000).toFixed(2);
    if (wU==='metric_ton') return (v/2204.62).toFixed(2);
    return v.toFixed(2);
  };

  // 3) collect
  let objs = [];
  for (let i=1; i<=6; i++) {
    const wR = parseFloat(document.getElementById(`cbLoad${i}W`).value);
    const dR = parseFloat(document.getElementById(`cbLoad${i}D`).value);
    if (isNaN(wR)||isNaN(dR)) continue;
    const wL = toLbs(wR);
    const dF = toFt(dR);
    objs.push({ i, wR, dR, wL, dF });
  }
  if (!objs.length) {
    document.getElementById('containerResult').textContent = 'Enter at least one object.';
    return;
  }

  // 4) prefix-CG and weight sum
  let prefix=0, sumW=0, sumWC=0;
  objs.forEach(o=>{
    const cip = m + prefix + o.dF/2;
    sumW   += o.wL;
    sumWC  += o.wL * cip;
    o.cip   = cip;
    prefix += o.dF;
  });

  // 5) compute g shift for leveling
  //    (sumW*(C) - sumWC)/sumW  → shift of CIP
  let g = (sumW*C - sumWC)/sumW;
  // clamp so band stays within margins
  const bandW = prefix;            // total width
  const maxG  = L - 2*m - bandW;  
  if (g<0) g=0;
  if (g>maxG) g=maxG;

  // 6) final positions
  objs.forEach(o=>{
    o.xF = o.cip + g;
  });

  // 7) render
  const tbody = document.querySelector('#containerTable tbody');
  tbody.innerHTML = '';
  objs.forEach(o=>{
    const wDisp = fromLbs(o.wL);
    const dDisp = (lU==='m') ? (o.dF*0.3048).toFixed(2) : o.dF.toFixed(2);
    const xDisp = (lU==='m') ? (o.xF*0.3048).toFixed(2) : o.xF.toFixed(2);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="border:1px solid #ccc;padding:8px">Obj ${o.i}</td>
      <td style="border:1px solid #ccc;padding:8px">${wDisp} ${wU}</td>
      <td style="border:1px solid #ccc;padding:8px">${dDisp} ${lU}</td>
      <td style="border:1px solid #ccc;padding:8px">${xDisp} ${lU}</td>
    `;
    tbody.appendChild(tr);
  });

  // 8) summary
  document.getElementById('containerResult').textContent =
    `Block leveled (CG=${C.toFixed(2)} ft), breathing shift = ${g.toFixed(2)} ft.`;
}