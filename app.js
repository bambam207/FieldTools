// Function to show the selected tool page from the drop-down menu.
function showToolPage() {
  const selected = document.getElementById('toolsMenu').value;
  // Hide all sections.
  const sections = document.querySelectorAll('.tool');
  sections.forEach(section => {
    section.classList.add('hidden');
  });
  // Show the selected section.
  document.getElementById(selected).classList.remove('hidden');
}

// If you want to set a default page when the page loads:
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('toolsMenu').value = 'sling';
  showToolPage();
});

// ----------------- Sling Load Calculator -----------------
// This function calculates the sling load based on user-provided inputs.
function calcSling() {
  // Get conversion factors from separate weight and length selectors.
  const { weightFactor, lengthFactor, weightDisplayUnit, lengthDisplayUnit } = getConversionFactors();

  // Retrieve required inputs and convert to base units: lbs for weight, ft for lengths.
  const loadInput = parseFloat(document.getElementById('load').value);
  const D1Input = parseFloat(document.getElementById('d1').value);
  const D2Input = parseFloat(document.getElementById('d2').value);
  
  const loadBase = loadInput * weightFactor;
  const D1Base = D1Input * lengthFactor;
  const D2Base = D2Input * lengthFactor;
  
  // Optional inputs
  const H_input = document.getElementById('height').value;
  const L1_input = document.getElementById('l1').value;
  const L2_input = document.getElementById('l2').value;
  
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = '';
  
  // Validate required inputs.
  if (isNaN(loadBase) || isNaN(D1Base) || isNaN(D2Base)) {
    tbody.innerHTML = '<tr><td colspan="5">Please enter valid values for Load, D1, and D2.</td></tr>';
    return;
  }
  
  // Case 1: Preset Mode – if neither hook height nor manual legs are provided.
  const hasHeight = !(H_input === '' || isNaN(parseFloat(H_input)));
  const hasLegs = (L1_input !== '' && L2_input !== '' && !isNaN(parseFloat(L1_input)) && !isNaN(parseFloat(L2_input)));
  
  if (!hasHeight && !hasLegs) {
    const presets = [60, 50, 45, 35];
    presets.forEach(thetaDeg => {
      const thetaRad = thetaDeg * Math.PI / 180;
      // Leg lengths based on preset angle: L = D / cos(theta)
      const L1_calcBase = D1Base / Math.cos(thetaRad);
      const L2_calcBase = D2Base / Math.cos(thetaRad);
      
      // Vertical components: H = D * tan(theta)
      const H1_calcBase = D1Base * Math.tan(thetaRad);
      const H2_calcBase = D2Base * Math.tan(thetaRad);
      
      // Calculate tensions.
      const T1_base = (loadBase * D2Base * L1_calcBase) / (H1_calcBase * (D1Base + D2Base));
      const T2_base = (loadBase * D1Base * L2_calcBase) / (H2_calcBase * (D1Base + D2Base));
      
      // Convert outputs back to chosen units.
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
  
  // Case 2: Either hook height is provided or manual legs are provided.
  let mode = '';
  let L1_base, L2_base;
  if (hasLegs) {
    L1_base = parseFloat(L1_input) * lengthFactor;
    L2_base = parseFloat(L2_input) * lengthFactor;
    mode = 'Manual Legs';
  } else if (hasHeight) {
    const H_valBase = parseFloat(H_input) * lengthFactor;
    L1_base = Math.sqrt(D1Base * D1Base + H_valBase * H_valBase);
    L2_base = Math.sqrt(D2Base * D2Base + H_valBase * H_valBase);
    mode = 'Auto Legs (from H)';
  } else {
    tbody.innerHTML = '<tr><td colspan="5">Enter either both leg lengths (L1 & L2) or Vertical Hook Height (H).</td></tr>';
    return;
  }
  
  // Compute vertical component for each leg.
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

// ----------------- Unit Conversion Helper -----------------
// Returns conversion factors for weight and length based on separate selectors.
function getConversionFactors() {
  // For Weight
  const weightUnit = document.getElementById('weightUnit').value;
  let weightFactor = 1;
  let weightDisplayUnit = "lbs";
  if (weightUnit === "lbs") {
    weightFactor = 1;
    weightDisplayUnit = "lbs";
  } else if (weightUnit === "us_ton") {
    weightFactor = 2000;
    weightDisplayUnit = "US tons";
  } else if (weightUnit === "kg") {
    weightFactor = 2.20462;
    weightDisplayUnit = "kg";
  } else if (weightUnit === "metric_ton") {
    weightFactor = 2204.62;
    weightDisplayUnit = "metric tons";
  }
  
  // For Length
  const lengthUnit = document.getElementById('lengthUnit').value;
  let lengthFactor = 1;
  let lengthDisplayUnit = "ft";
  if (lengthUnit === "ft") {
    lengthFactor = 1;
    lengthDisplayUnit = "ft";
  } else if (lengthUnit === "m") {
    lengthFactor = 3.28084;
    lengthDisplayUnit = "m";
  }
  
  return { weightFactor, lengthFactor, weightDisplayUnit, lengthDisplayUnit };
}

// ----------------- Container Balance Calculator -----------------
// This function computes the overall CG of loads across a container.
function calcContainerBalance() {
  // Get container type: 20ft or 40ft
  const containerType = document.getElementById('containerType').value;
  const containerLength = parseFloat(containerType);  // in ft
  
  // Assume fixed positions along the container:
  // Positions: containerLength/7, 2*containerLength/7, ..., 6*containerLength/7
  let positions = [];
  for (let i = 1; i <= 6; i++) {
    positions.push((containerLength * i) / 7);
  }
  
  let totalLoad = 0;
  let totalMoment = 0;
  
  for (let i = 1; i <= 6; i++) {
    const loadVal = parseFloat(document.getElementById('cLoad' + i).value);
    if (!isNaN(loadVal)) {
      totalLoad += loadVal;
      totalMoment += loadVal * positions[i - 1];
    }
  }
  
  const resultDiv = document.getElementById('containerResult');
  if (totalLoad === 0) {
    resultDiv.innerHTML = "<p>No loads entered.</p>";
    return;
  }
  
  const cg = totalMoment / totalLoad;
  const cgPercent = (cg / containerLength) * 100;
  
  resultDiv.innerHTML = `
    <p>Total Load: ${totalLoad.toFixed(2)}</p>
    <p>Container Length: ${containerLength} ft</p>
    <p>Overall CG is at ${cg.toFixed(2)} ft from the left side 
    (${cgPercent.toFixed(1)}% of container length).</p>
  `;
}