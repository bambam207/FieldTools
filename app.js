// ----------------- Container Balance Calculator -----------------
function calcContainer() {
  // 1) Read selectors
  const wUnit = document.getElementById('cbWeightUnit').value;    // "lbs","kg","us_ton","metric_ton"
  const lUnit = document.getElementById('cbLengthUnit').value;    // "ft" or "m"
  const cType = parseFloat(document.getElementById('cbContainerType').value); // rack length in ft

  // 2) Converters
  const toFtFromM   = v => v / 0.3048;    // m → ft
  const toLbsFromKg = v => v * 2.20462;   // kg → lbs
  const toLbsFromUS = v => v * 2000;      // US tons → lbs
  const toLbsFromMT = v => v * 2204.62;   // metric tons → lbs
  const fromLbs    = (v,unit) => {
    if (unit==='kg')         return (v/2.20462).toFixed(2);
    if (unit==='us_ton')     return (v/2000).toFixed(2);
    if (unit==='metric_ton') return (v/2204.62).toFixed(2);
    return v.toFixed(2);      // lbs
  };

  // 3) Rack constraints
  const marginFt = 8/12;    // 8 inches in feet
  const L        = cType;   // rack length in ft
  const C        = L/2;     // desired combined CG (ft)

  let cumW = 0, cumM = 0;
  const tbody = document.querySelector('#containerTable tbody');
  tbody.innerHTML = '';

  // 4) Loop objects 1–6
  for (let i = 1; i <= 6; i++) {
    const wRaw = parseFloat(document.getElementById(`cbLoad${i}W`).value);
    const dRaw = parseFloat(document.getElementById(`cbLoad${i}D`).value);
    if (isNaN(wRaw) || isNaN(dRaw)) continue;

    // Convert to base units
    let wLbs = wRaw;
    if (wUnit==='kg')        wLbs = toLbsFromKg(wRaw);
    else if (wUnit==='us_ton')  wLbs = toLbsFromUS(wRaw);
    else if (wUnit==='metric_ton') wLbs = toLbsFromMT(wRaw);

    let dFt = (lUnit==='m') ? toFtFromM(dRaw) : dRaw;

    // Compute center‑pos xFt:
    let xFt;
    if (cumW === 0) {
      // First object: push as far left as possible
      xFt = marginFt + dFt/2;
    } else {
      // Solve (cumM + wLbs*x) / (cumW + wLbs) = C
      xFt = (C * (cumW + wLbs) - cumM) / wLbs;
    }

    // Enforce end‑margins so object doesn’t cross into the first/last 8"
    const minX = marginFt + dFt/2;
    const maxX = L - marginFt - dFt/2;
    xFt = Math.min(Math.max(xFt, minX), maxX);

    // Update cumulatives
    cumW += wLbs;
    cumM += wLbs * xFt;

    // Display row
    const wDisp = fromLbs(wLbs, wUnit);
    const dDisp = (lUnit==='m' ? (dFt*0.3048).toFixed(2) : dFt.toFixed(2));
    const xDisp = (lUnit==='m' ? (xFt*0.3048).toFixed(2) : xFt.toFixed(2));

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="border:1px solid #ccc;padding:8px">Obj ${i}</td>
      <td style="border:1px solid #ccc;padding:8px">${wDisp} ${wUnit}</td>
      <td style="border:1px solid #ccc;padding:8px">${dDisp} ${lUnit}</td>
      <td style="border:1px solid #ccc;padding:8px">${xDisp} ${lUnit}</td>
    `;
    tbody.appendChild(tr);
  }

  // 5) Summary combined CG
  const resultDiv = document.getElementById('containerResult');
  if (cumW === 0) {
    resultDiv.textContent = 'No objects entered.';
    return;
  }
  const overallCGFt  = cumM / cumW;
  const overallCGDisp= (lUnit==='m' ? (overallCGFt*0.3048).toFixed(2) : overallCGFt.toFixed(2));
  const totalLoadDisp= fromLbs(cumW, wUnit);

  resultDiv.innerHTML = `
    Total Load: ${totalLoadDisp} ${wUnit}<br>
    Overall CG: ${overallCGDisp} ${lUnit} from left
    (${((overallCGFt/L)*100).toFixed(1)}% of rack length)
  `;
}