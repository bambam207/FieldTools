// A helper to convert input values from the chosen unit system to base units (lbs and ft)
function getConversionFactors() {
  const unit = document.getElementById('units').value;
  let weightFactor = 1; // to convert user weight to lbs
  let lengthFactor = 1; // to convert user lengths to ft
  let weightDisplayUnit = "lbs";
  let lengthDisplayUnit = "ft";
  
  if (unit === "lb_ft") {
    // No conversion needed.
    weightFactor = 1;
    lengthFactor = 1;
    weightDisplayUnit = "lbs";
    lengthDisplayUnit = "ft";
  } else if (unit === "us_ton_ft") {
    weightFactor = 2000; // 1 US ton = 2000 lbs
    lengthFactor = 1;
    weightDisplayUnit = "US tons";
    lengthDisplayUnit = "ft";
  } else if (unit === "kg_m") {
    weightFactor = 2.20462; // 1 kg = 2.20462 lbs
    lengthFactor = 3.28084; // 1 meter = 3.28084 ft
    weightDisplayUnit = "kg";
    lengthDisplayUnit = "m";
  } else if (unit === "metric_ton_m") {
    weightFactor = 2204.62; // 1 metric ton ≈ 2204.62 lbs
    lengthFactor = 3.28084; // 1 meter = 3.28084 ft
    weightDisplayUnit = "metric tons";
    lengthDisplayUnit = "m";
  }
  
  return { weightFactor, lengthFactor, weightDisplayUnit, lengthDisplayUnit };
}

// Advanced Sling Calculator
function calcSling() {
  // Get conversion factors based on selected unit.
  const { weightFactor, lengthFactor, weightDisplayUnit, lengthDisplayUnit } = getConversionFactors();

  // Retrieve inputs and convert to base units (lbs for weight, ft for lengths)
  const loadInput = parseFloat(document.getElementById('load').value);
  const D1Input = parseFloat(document.getElementById('d1').value);
  const D2Input = parseFloat(document.getElementById('d2').value);
  
  // Convert to base units:
  const loadBase = loadInput * weightFactor;       // lbs
  const D1Base = D1Input * lengthFactor;             // ft
  const D2Base = D2Input * lengthFactor;             // ft
  
  // Optional fields:
  const H_input = document.getElementById('height').value;
  const L1_input = document.getElementById('l1').value;
  const L2_input = document.getElementById('l2').value;
  
  const HProvided = !(H_input === '' || isNaN(parseFloat(H_input)));
  const L1Provided = !(L1_input === '' || isNaN(parseFloat(L1_input)));
  const L2Provided = !(L2_input === '' || isNaN(parseFloat(L2_input)));
  
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = '';
  
  // Validate required inputs
  if (isNaN(loadBase) || isNaN(D1Base) || isNaN(D2Base)) {
    tbody.innerHTML = '<tr><td colspan="5">Please enter valid values for Load, D1, and D2.</td></tr>';
    return;
  }
  
  // Case 1: If neither hook height nor leg lengths provided, use preset angles.
  if (!HProvided && !(L1Provided && L2Provided)) {
    const presets = [60, 50, 45, 35];
    presets.forEach(thetaDeg => {
      const thetaRad = thetaDeg * Math.PI / 180;
      // For a preset angle, assume the leg makes that angle with the horizontal.
      // Then L = D / cos(theta) for each leg.
      const L1_calcBase = D1Base / Math.cos(thetaRad);
      const L2_calcBase = D2Base / Math.cos(thetaRad);
      // Vertical components based on tangent:
      const H1_calcBase = D1Base * Math.tan(thetaRad);
      const H2_calcBase = D2Base * Math.tan(thetaRad);
      // Calculate tensions:
      const T1_base = (loadBase * D2Base * L1_calcBase) / (H1_calcBase * (D1Base + D2Base));
      const T2_base = (loadBase * D1Base * L2_calcBase) / (H2_calcBase * (D1Base + D2Base));
      
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
  
  // Case 2: Use provided H or manual leg lengths.
  let mode = '';
  let L1_base, L2_base;
  if (L1Provided && L2Provided) {
    L1_base = parseFloat(L1_input) * lengthFactor;
    L2_base = parseFloat(L2_input) * lengthFactor;
    mode = 'Manual Legs';
  } else if (HProvided) {
    const H_valBase = parseFloat(H_input) * lengthFactor; // convert height to ft
    L1_base = Math.sqrt(D1Base * D1Base + H_valBase * H_valBase);
    L2_base = Math.sqrt(D2Base * D2Base + H_valBase * H_valBase);
    mode = 'Auto Legs (from H)';
  } else {
    tbody.innerHTML = '<tr><td colspan="5">Enter either L1 & L2 or Vertical Hook Height (H).</td></tr>';
    return;
  }
  
  // Compute vertical components from each leg length:
  const H1_base = Math.sqrt(L1_base * L1_base - D1Base * D1Base);
  const H2_base = Math.sqrt(L2_base * L2_base - D2Base * D2Base);
  
  if (isNaN(H1_base) || isNaN(H2_base) || H1_base <= 0 || H2_base <= 0) {
    tbody.innerHTML = '<tr><td colspan="5">Invalid geometry: Ensure L1 > D1 and L2 > D2 (or valid H provided).</td></tr>';
    return;
  }
  
  const angle1 = Math.asin(H1_base / L1_base) * (180 / Math.PI);
  const angle2 = Math.asin(H2_base / L2_base) * (180 / Math.PI);
  
  const T1_base = (loadBase * D2Base * L1_base) / (H1_base * (D1Base + D2Base));
  const T2_base = (loadBase * D1Base * L2_base) / (H2_base * (D1Base + D2Base));
  
  // Convert computed values back to chosen units:
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