// Unit conversion helper
function getConversionFactors() {
  const unit = document.getElementById('units').value;
  let weightFactor = 1; // default: lbs
  let lengthFactor = 1; // default: ft
  let weightDisplayUnit = "lbs";
  let lengthDisplayUnit = "ft";

  if (unit === "lb_ft") {
    weightFactor = 1;
    lengthFactor = 1;
    weightDisplayUnit = "lbs";
    lengthDisplayUnit = "ft";
  } else if (unit === "us_ton_ft") {
    weightFactor = 2000;
    lengthFactor = 1;
    weightDisplayUnit = "US tons";
    lengthDisplayUnit = "ft";
  } else if (unit === "kg_m") {
    weightFactor = 2.20462;
    lengthFactor = 3.28084;
    weightDisplayUnit = "kg";
    lengthDisplayUnit = "m";
  } else if (unit === "metric_ton_m") {
    weightFactor = 2204.62;
    lengthFactor = 3.28084;
    weightDisplayUnit = "metric tons";
    lengthDisplayUnit = "m";
  }
  return { weightFactor, lengthFactor, weightDisplayUnit, lengthDisplayUnit };
}

// Sling Calculator
function calcSling() {
  // Conversion factors
  const { weightFactor, lengthFactor, weightDisplayUnit, lengthDisplayUnit } = getConversionFactors();

  // Parse required inputs (and convert to base units: lbs, ft)
  const loadInput = parseFloat(document.getElementById('load').value);
  const D1Input = parseFloat(document.getElementById('d1').value);
  const D2Input = parseFloat(document.getElementById('d2').value);
  
  const loadBase = loadInput * weightFactor;
  const D1Base = D1Input * lengthFactor;
  const D2Base = D2Input * lengthFactor;
  
  // Optional inputs (as strings)
  const H_input = document.getElementById('height').value;
  const L1_input = document.getElementById('l1').value;
  const L2_input = document.getElementById('l2').value;
  
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = '';
  
  // Validate required inputs
  if (isNaN(loadBase) || isNaN(D1Base) || isNaN(D2Base)) {
    tbody.innerHTML = '<tr><td colspan="5">Please enter valid values for Load, D1, and D2.</td></tr>';
    return;
  }
  
  // Case 1: Preset Mode – if neither hook height nor leg lengths are provided
  if ((H_input === '' || isNaN(parseFloat(H_input))) && 
      ( (L1_input === '' || isNaN(parseFloat(L1_input))) || (L2_input === '' || isNaN(parseFloat(L2_input))) )) {
    const presets = [60, 50, 45, 35];
    presets.forEach(thetaDeg => {
      const thetaRad = thetaDeg * Math.PI / 180;
      // Assume for each preset angle, leg length = D / cos(theta) for each side.
      const L1_calcBase = D1Base / Math.cos(thetaRad);
      const L2_calcBase = D2Base / Math.cos(thetaRad);
      // Vertical components:
      const H1_calcBase = D1Base * Math.tan(thetaRad);
      const H2_calcBase = D2Base * Math.tan(thetaRad);
      // Tensions (as before):
      const T1_base = (loadBase * D2Base * L1_calcBase) / ((H1_calcBase) * (D1Base + D2Base));
      const T2_base = (loadBase * D1Base * L2_calcBase) / ((H2_calcBase) * (D1Base + D2Base));
      
      // Convert outputs back to chosen units:
      const L1_display = L1_calcBase / lengthFactor;
      const L2_display = L2_calcBase / lengthFactor;
      const T1_display = T1_base / weightFactor;
      const T2_display = T2_base / weightFactor;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>Preset ${thetaDeg}°</td>
        <td>${L1_display.toFixed(2)} ${lengthDisplayUnit}<br>${thetaDeg.toFixed(1)}°</td>
        <td>${L2_display.toFixed(2)} ${lengthDisplayUnit}<br>${thetaDeg.toFixed(1)}°</td>
        <td>${T1_display.toFixed(2)} ${weightDisplayUnit}</td>
        <td>${T2_display.toFixed(2)} ${weightDisplayUnit}</td>
      `;
      tbody.appendChild(row);
    });
    return;
  }
  
  // Case 2: Use provided hook height or manual leg lengths
  let mode = '';
  let L1_base, L2_base;
  if (L1_input !== '' && L2_input !== '' && !isNaN(parseFloat(L1_input)) && !isNaN(parseFloat(L2_input))) {
    L1_base = parseFloat(L1_input) * lengthFactor;
    L2_base = parseFloat(L2_input) * lengthFactor;
    mode = 'Manual Legs';
  } else if (H_input !== '' && !isNaN(parseFloat(H_input))) {
    const H_valBase = parseFloat(H_input) * lengthFactor;
    L1_base = Math.sqrt(D1Base * D1Base + H_valBase * H_valBase);
    L2_base = Math.sqrt(D2Base * D2Base + H_valBase * H_valBase);
    mode = 'Auto Legs (from H)';
  } else {
    tbody.innerHTML = '<tr><td colspan="5">Enter either both leg lengths (L1 & L2) or Vertical Hook Height (H).</td></tr>';
    return;
  }
  
  // Compute vertical components from calculated or entered leg lengths.
  const H1_base = Math.sqrt(L1_base * L1_base - D1Base * D1Base);
  const H2_base = Math.sqrt(L2_base * L2_base - D2Base * D2Base);
  if (isNaN(H1_base) || isNaN(H2_base) || H1_base <= 0 || H2_base <= 0) {
    tbody.innerHTML = '<tr><td colspan="5">Invalid geometry: Ensure L1 > D1 and L2 > D2 (or provide valid H).</td></tr>';
    return;
  }
  
  const angle1 = Math.asin(H1_base / L1_base) * (180 / Math.PI);
  const angle2 = Math.asin(H2_base / L2_base) * (180 / Math.PI);
  
  const T1_base = (loadBase * D2Base * L1_base) / (H1_base * (D1Base + D2Base));
  const T2_base = (loadBase * D1Base * L2_base) / (H2_base * (D1Base + D2Base));
  
  const L1_display = L1_base / lengthFactor;
  const L2_display = L2_base / lengthFactor;
  const T1_display = T1_base / weightFactor;
  const T2_display = T2_base / weightFactor;
  
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${mode}</td>
    <td>${L1_display.toFixed(2)} ${lengthDisplayUnit}<br>${angle1.toFixed(1)}°</td>
    <td>${L2_display.toFixed(2)} ${lengthDisplayUnit}<br>${angle2.toFixed(1)}°</td>
    <td>${T1_display.toFixed(2)} ${weightDisplayUnit}</td>
    <td>${T2_display.toFixed(2)} ${weightDisplayUnit}</td>
  `;
  tbody.appendChild(row);
}