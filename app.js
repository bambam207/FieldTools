// SECTION SWITCHING (if you integrate more tools later)
function showSection(id) {
  document.querySelectorAll('.tool').forEach(el => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ADVANCED SLING CALCULATOR
function calcSling() {
  // Parse required inputs:
  const load = parseFloat(document.getElementById('load').value);
  const D1 = parseFloat(document.getElementById('d1').value);
  const D2 = parseFloat(document.getElementById('d2').value);
  
  // Optional inputs:
  let H = parseFloat(document.getElementById('height').value);
  let L1 = parseFloat(document.getElementById('l1').value);
  let L2 = parseFloat(document.getElementById('l2').value);
  
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = '';
  
  // Validate required fields
  if (isNaN(load) || isNaN(D1) || isNaN(D2)) {
    tbody.innerHTML = '<tr><td colspan="5">Please enter valid values for Load, D1, and D2.</td></tr>';
    return;
  }
  
  let mode = '';
  // Case 1: Manual leg entry provided for both
  if (!isNaN(L1) && !isNaN(L2)) {
    mode = 'Manual Legs';
  }
  // Case 2: If legs are not provided but hook height is, calculate legs
  else if (!isNaN(H)) {
    L1 = Math.sqrt(D1 * D1 + H * H);
    L2 = Math.sqrt(D2 * D2 + H * H);
    mode = 'Auto Legs (from H)';
  }
  // Otherwise, error out
  else {
    tbody.innerHTML = '<tr><td colspan="5">Enter either both leg lengths (L1 & L2) or Vertical Hook Height (H).</td></tr>';
    return;
  }
  
  // Compute the vertical component for each leg.
  // If L is computed from H then vertical component Hx = H,
  // but if L is entered manually, we calculate Hx = √(L² - D²)
  const H1 = (isNaN(H)) ? Math.sqrt(L1 * L1 - D1 * D1) : H;
  const H2 = (isNaN(H)) ? Math.sqrt(L2 * L2 - D2 * D2) : H;
  
  // Ensure geometry is valid
  if (isNaN(H1) || isNaN(H2) || H1 <= 0 || H2 <= 0) {
    tbody.innerHTML = '<tr><td colspan="5">Invalid geometry: Ensure L1 > D1 and L2 > D2 (or valid H provided).</td></tr>';
    return;
  }
  
  // Calculate angles for each leg (in degrees)
  const angle1 = Math.asin(H1 / L1) * (180 / Math.PI);
  const angle2 = Math.asin(H2 / L2) * (180 / Math.PI);
  
  // Calculate tensions using the formula:
  // T1 = (load * D2 * L1) / (H1 * (D1 + D2))
  // T2 = (load * D1 * L2) / (H2 * (D1 + D2))
  const T1 = (load * D2 * L1) / (H1 * (D1 + D2));
  const T2 = (load * D1 * L2) / (H2 * (D1 + D2));
  
  // Render results in table:
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${mode}</td>
    <td>${L1.toFixed(2)} ft<br>${angle1.toFixed(1)}°</td>
    <td>${L2.toFixed(2)} ft<br>${angle2.toFixed(1)}°</td>
    <td>${T1.toFixed(2)} lbs</td>
    <td>${T2.toFixed(2)} lbs</td>
  `;
  tbody.appendChild(row);
}