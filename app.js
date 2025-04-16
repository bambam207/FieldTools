function calcContainer() {
  // Read unit selectors
  const wUnit = document.getElementById('cbWeightUnit').value;   // "lbs","kg","us_ton","metric_ton"
  const lUnit = document.getElementById('cbLengthUnit').value;   // "ft" or "m"
  const cType = parseFloat(document.getElementById('cbContainerType').value); // length in ft

  // Converters
  const toFtFromM   = v => v / 0.3048;      // meters → ft
  const toLbsFromKg = v => v * 2.20462;     // kg → lbs
  const toLbsFromUS = v => v * 2000;        // US tons → lbs
  const toLbsFromMT = v => v * 2204.62;     // metric tons → lbs
  const fromLbs    = (v,unit) => {
    if (unit === 'kg')         return (v / 2.20462).toFixed(2);
    if (unit === 'us_ton')     return (v / 2000).toFixed(2);
    if (unit === 'metric_ton') return (v / 2204.62).toFixed(2);
    return v.toFixed(2);        // lbs
  };

  // Desired container center (in ft)
  const L = cType;
  const C = L / 2;

  // Read each object, convert, accumulate and compute placement
  let cumW = 0, cumM = 0;
  const entries = [];
  for (let i = 1; i <= 6; i++) {
    const wRaw = parseFloat(document.getElementById(`cbLoad${i}W`).value);
    const dRaw = parseFloat(document.getElementById(`cbLoad${i}D`).value);
    if (isNaN(wRaw) || isNaN(dRaw)) continue;

    // Convert to base units
    let wLbs = wRaw;
    if (wUnit === 'kg')         wLbs = toLbsFromKg(wRaw);
    else if (wUnit === 'us_ton')   wLbs = toLbsFromUS(wRaw);
    else if (wUnit === 'metric_ton') wLbs = toLbsFromMT(wRaw);

    let dFt = (lUnit === 'm') ? toFtFromM(dRaw) : dRaw;

    // Compute x_i so (cumM + wLbs * x_i)/(cumW + wLbs) = C
    const xFt = cumW + wLbs === 0
      ? dFt / 2                           // first object: place as far left as fits
      : (C * (cumW + wLbs) - cumM) / wLbs;

    // Update accumulators
    cumW += wLbs;
    cumM += wLbs * xFt;

    entries.push({ idx: i, wRaw, dRaw, wLbs, dFt, xFt });
  }

  // Populate results table
  const tbody = document.querySelector('#containerTable tbody');
  tbody.innerHTML = '';
  entries.forEach(e => {
    const wDisp = fromLbs(e.wLbs, wUnit);
    const dDisp = (lUnit === 'm')
      ? (e.dFt * 0.3048).toFixed(2)
      : e.dFt.toFixed(2);
    const xDisp = (lUnit === 'm')
      ? (e.xFt * 0.3048).toFixed(2)
      : e.xFt.toFixed(2);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="border:1px solid #ccc;padding:8px">Obj ${e.idx}</td>
      <td style="border:1px solid #ccc;padding:8px">${wDisp} ${wUnit}</td>
      <td style="border:1px solid #ccc;padding:8px">${dDisp} ${lUnit}</td>
      <td style="border:1px solid #ccc;padding:8px">${xDisp} ${lUnit}</td>
    `;
    tbody.appendChild(tr);
  });

  // Summary overall CG
  const resultDiv = document.getElementById('containerResult');
  if (cumW === 0) {
    resultDiv.textContent = 'No objects entered.';
    return;
  }
  const overallCGFt  = cumM / cumW;
  const overallCGDisp = (lUnit === 'm')
    ? (overallCGFt * 0.3048).toFixed(2)
    : overallCGFt.toFixed(2);
  const totalLoadDisp = fromLbs(cumW, wUnit);

  resultDiv.innerHTML = `
    Total Load: ${totalLoadDisp} ${wUnit}<br>
    Overall CG: ${overallCGDisp} ${lUnit} from left
    (${((overallCGFt / L) * 100).toFixed(1)}% of length)
  `;
}