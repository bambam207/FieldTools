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

// ----------------- Container Balance Calculator (Centered Band) -----------------
function calcContainer() {
  const wUnit = document.getElementById('cbWeightUnit').value;
  const lUnit = document.getElementById('cbLengthUnit').value;
  const cType = parseFloat(document.getElementById('cbContainerType').value);

  const toFtFromM   = v => v / 0.3048;
  const toLbsFromKg = v => v * 2.20462;
  const toLbsFromUS = v => v * 2000;
  const toLbsFromMT = v => v * 2204.62;
  const fromLbs     = (v,unit) => {
    if (unit==='kg')         return (v/2.20462).toFixed(2);
    if (unit==='us_ton')     return (v/2000).toFixed(2);
    if (unit==='metric_ton') return (v/2204.62).toFixed(2);
    return v.toFixed(2);
  };

  const marginFt = 8/12, L = cType, C = L/2;

  let cumW = 0, cumM = 0;
  const objs = [];
  for (let i=1; i<=6; i++) {
    const wRaw = parseFloat(document.getElementById(`cbLoad${i}W`).value);
    const dRaw = parseFloat(document.getElementById(`cbLoad${i}D`).value);
    if (isNaN(wRaw)||isNaN(dRaw)) continue;
    let wLbs = wRaw;
    if (wUnit==='kg')        wLbs = toLbsFromKg(wRaw);
    else if(wUnit==='us_ton') wLbs = toLbsFromUS(wRaw);
    else if(wUnit==='metric_ton') wLbs = toLbsFromMT(wRaw);
    let dFt = (lUnit==='m')? toFtFromM(dRaw): dRaw;
    objs.push({idx:i,wLbs,dFt,wRaw});
  }

  objs.forEach((o,k)=>{
    let xFt = k===0
      ? marginFt + o.dFt/2
      : (C*(cumW+o.wLbs) - cumM)/o.wLbs;
    const minX = marginFt + o.dFt/2;
    const maxX = L - marginFt - o.dFt/2;
    xFt = Math.min(Math.max(xFt, minX), maxX);
    cumW += o.wLbs;
    cumM += o.wLbs*xFt;
    o.xFt = xFt;
  });

  const leftEdge  = Math.min(...objs.map(o=>o.xFt - o.dFt/2));
  const rightEdge = Math.max(...objs.map(o=>o.xFt + o.dFt/2));
  const leftGap   = leftEdge - marginFt;
  const rightGap  = (L - marginFt) - rightEdge;
  const shift     = (rightGap - leftGap)/2;
  objs.forEach(o=>{
    o.xFt = Math.min(Math.max(o.xFt+shift,
      marginFt+o.dFt/2),
      L-marginFt-o.dFt/2);
  });

  const tbody = document.querySelector('#containerTable tbody');
  tbody.innerHTML = '';
  objs.forEach(o=>{
    const wDisp = fromLbs(o.wLbs, wUnit);
    const dDisp = (lUnit==='m')? (o.dFt*0.3048).toFixed(2):o.dFt.toFixed(2);
    const xDisp = (lUnit==='m')? (o.xFt*0.3048).toFixed(2):o.xFt.toFixed(2);
    const tr = document.createElement('tr');
    tr.innerHTML=`
      <td style="border:1px solid #ccc;padding:8px">Obj ${o.idx}</td>
      <td style="border:1px solid #ccc;padding:8px">${wDisp} ${wUnit}</td>
      <td style="border:1px solid #ccc;padding:8px">${dDisp} ${lUnit}</td>
      <td style="border:1px solid #ccc;padding:8px">${xDisp} ${lUnit}</td>
    `;
    tbody.appendChild(tr);
  });

  const resultDiv = document.getElementById('containerResult');
  resultDiv.textContent = `Objects centered with equal breathing‑room; rack CG at ${C.toFixed(2)} ft.`;
}