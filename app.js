// ----------------- Utility: Unit Conversion -----------------
function getConversionFactors() {
  // Sling page uses #weightUnit and #lengthUnit
  const weightUnit = document.getElementById('weightUnit')?.value || 'lbs';
  const lengthUnit = document.getElementById('lengthUnit')?.value || 'ft';

  // Weight → base (lbs)
  let weightFactor = 1;
  let weightDisplayUnit = 'lbs';
  if (weightUnit === 'us_ton') {
    weightFactor = 2000;
    weightDisplayUnit = 'US tons';
  } else if (weightUnit === 'kg') {
    weightFactor = 2.20462;
    weightDisplayUnit = 'kg';
  } else if (weightUnit === 'metric_ton') {
    weightFactor = 2204.62;
    weightDisplayUnit = 'metric tons';
  }

  // Length → base (ft)
  let lengthFactor = 1;
  let lengthDisplayUnit = 'ft';
  if (lengthUnit === 'm') {
    lengthFactor = 3.28084;
    lengthDisplayUnit = 'm';
  }

  return { weightFactor, lengthFactor, weightDisplayUnit, lengthDisplayUnit };
}

// ----------------- Sling Load Calculator -----------------
function calcSling() {
  const { weightFactor, lengthFactor, weightDisplayUnit, lengthDisplayUnit } = getConversionFactors();

  // Inputs (converted to base units)
  const loadInput = parseFloat(document.getElementById('load').value);
  const D1Input   = parseFloat(document.getElementById('d1').value);
  const D2Input   = parseFloat(document.getElementById('d2').value);
  const loadBase  = loadInput * weightFactor;
  const D1Base    = D1Input * lengthFactor;
  const D2Base    = D2Input * lengthFactor;

  // Optional fields
  const H_input  = document.getElementById('height').value;
  const L1_input = document.getElementById('l1').value;
  const L2_input = document.getElementById('l2').value;

  const tbody = document.querySelector('#resultTable tbody');
  tbody.innerHTML = '';

  // Validate required
  if (isNaN(loadBase) || isNaN(D1Base) || isNaN(D2Base)) {
    tbody.innerHTML = '<tr><td colspan="5">Please enter valid Load, D1 and D2.</td></tr>';
    return;
  }

  const hasHeight = !(H_input === '' || isNaN(parseFloat(H_input)));
  const hasLegs   = !(L1_input === '' || isNaN(parseFloat(L1_input))) &&
                    !(L2_input === '' || isNaN(parseFloat(L2_input)));

  // Preset angles mode
  if (!hasHeight && !hasLegs) {
    [60,50,45,35].forEach(thetaDeg => {
      const θ = thetaDeg * Math.PI/180;
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

  // Auto/manual legs mode
  let mode='', L1b, L2b;
  if (hasLegs) {
    L1b = parseFloat(L1_input)*lengthFactor;
    L2b = parseFloat(L2_input)*lengthFactor;
    mode = 'Manual Legs';
  } else if (hasHeight) {
    const Hb = parseFloat(H_input)*lengthFactor;
    L1b = Math.hypot(D1Base, Hb);
    L2b = Math.hypot(D2Base, Hb);
    mode = 'Auto Legs (from H)';
  } else {
    tbody.innerHTML = '<tr><td colspan="5">Enter either L1 & L2 or Hook Height.</td></tr>';
    return;
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
  // Units selectors
  const wUnit = document.getElementById('cbWeightUnit').value;   // "lbs" or "kg"
  const lUnit = document.getElementById('cbLengthUnit').value;   // "ft" or "m"
  const cType = parseFloat(document.getElementById('cbContainerType').value); // 20 or 40 (ft)

  // Converters
  const toMeters = v => v * 0.3048;
  const toLbs    = v => v * 2.20462;

  // Container length in chosen unit
  let contLen = cType;
  if (lUnit === 'm') contLen = toMeters(contLen);

  // Six positions evenly at i/7 of container
  const positions = [];
  for (let i=1; i<=6; i++) positions.push(contLen * i/7);

  // Collect loads & compute moments
  let totalLoadLbs = 0, totalMoment = 0;
  const tbody = document.querySelector('#containerTable tbody');
  tbody.innerHTML = '';

  for (let i=1; i<=6; i++) {
    const input = document.getElementById(`cbLoad${i}`);
    const val   = parseFloat(input?.value);
    if (!isNaN(val)) {
      // convert to base lbs
      const loadLbs = (wUnit==='kg'? toLbs(val) : val);
      // moment in base-ft: use contLen in ft
      const posFt = (lUnit==='m'? positions[i-1]/0.3048 : positions[i-1]);
      totalLoadLbs += loadLbs;
      totalMoment  += loadLbs * posFt;

      // display in table
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>Object ${i}</td>
        <td>${val.toFixed(2)} ${wUnit}</td>
        <td>${positions[i-1].toFixed(2)} ${lUnit}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  const resultDiv = document.getElementById('containerResult');
  if (totalLoadLbs === 0) {
    resultDiv.textContent = 'No loads entered.';
    return;
  }

  // overall CG
  const cgFt = totalMoment / totalLoadLbs;
  const cgDisp = (lUnit === 'm'? toMeters(cgFt) : cgFt);
  // totalLoad back to selected unit
  const loadDisp = (wUnit==='kg'? (totalLoadLbs/2.20462).toFixed(2) : totalLoadLbs.toFixed(2));

  resultDiv.innerHTML = `
    Total Load: ${loadDisp} ${wUnit}<br>
    Overall CG: ${cgDisp.toFixed(2)} ${lUnit} from left
    (${((cgFt/cType)*100).toFixed(1)}% of container length).
  `;
}