// SECTION SWITCHING (for multi-tool integration)
function showSection(id) {
  document.querySelectorAll('.tool').forEach(el => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ADVANCED SLING CALCULATOR
function calcSling() {
  // Parse required fields
  const load = parseFloat(document.getElementById('load').value);
  const D1 = parseFloat(document.getElementById('d1').value);
  const D2 = parseFloat(document.getElementById('d2').value);
  
  // Optional fields from input (as strings)
  const H_input = document.getElementById('height').value;
  const L1_input = document.getElementById('l1').value;
  const L2_input = document.getElementById('l2').value;
  
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = '';

  // Validate required fields
  if (isNaN(load) || isNaN(D1) || isNaN(D2)) {
    tbody.innerHTML = '<tr><td colspan="5">Please enter valid values for Load, D1, and D2.</td></tr>';
    return;
  }

  // Determine if optional values are provided
  const hasHeight = !(H_input === '' || isNaN(parseFloat(H_input)));
  const hasLegs = !(L1_input === '' || isNaN(parseFloat(L1_input))) && !(L2_input === '' || isNaN(parseFloat(L2_input)));

  // If no height or leg lengths are provided, output preset rows for each preset angle
  if (!hasHeight && !hasLegs) {
    const presets = [60, 50, 45, 35];
    presets.forEach(thetaDeg => {
      const thetaRad = thetaDeg * Math.PI / 180;
      // For a given preset angle, assume the leg forms this angle with the horizontal.
      // Then the leg length is L = D / cos(theta) and vertical component is H = L * sin(theta) = D * tan(theta).
      const L1_calc = D1 / Math.cos(thetaRad);
      const L2_calc = D2 / Math.cos(thetaRad);
      const H1_calc = D1 * Math.tan(thetaRad); // vertical component for left leg
      const H2_calc = D2 * Math.tan(thetaRad); // for right leg
      
      // Calculate tensions using the same formula as before:
      // T1 = (load * D2 * L1) / (H1 * (D1+D2)) and similarly T2.
      const T1 = (load * D2 * L1_calc) / ((H1_calc) * (D1 + D2));
      const T2 = (load * D1 * L2_calc) / ((H2_calc) * (D1 + D2));
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>Preset ${thetaDeg}°</td>
        <td>${L1_calc.toFixed(2)} ft<br>${thetaDeg.toFixed(1)}°</td>
        <td>${L2_calc.toFixed(2)} ft<br>${thetaDeg.toFixed(1)}°</td>
        <td>${T1.toFixed(2)} lbs</td>
        <td>${T2.toFixed(2)} lbs</td>
      `;
      tbody.appendChild(row);
    });
    return;
  }

  // Otherwise, use provided height or leg lengths
  let mode = '';
  let L1_val, L2_val;
  if (hasLegs) {
    L1_val = parseFloat(L1_input);
    L2_val = parseFloat(L2_input);
    mode = 'Manual Legs';
  } else if (hasHeight) {
    const H_val = parseFloat(H_input);
    L1_val = Math.sqrt(D1 * D1 + H_val * H_val);
    L2_val = Math.sqrt(D2 * D2 + H_val * H_val);
    mode = 'Auto Legs (from H)';
  } else {
    tbody.innerHTML = '<tr><td colspan="5">Unexpected error: Missing inputs.</td></tr>';
    return;
  }

  // Compute vertical components from each leg length
  const H1 = Math.sqrt(L1_val * L1_val - D1 * D1);
  const H2 = Math.sqrt(L2_val * L2_val - D2 * D2);

  if (isNaN(H1) || isNaN(H2) || H1 <= 0 || H2 <= 0) {
    tbody.innerHTML = '<tr><td colspan="5">Invalid geometry: Check that L1 > D1 and L2 > D2 (or provide valid H).</td></tr>';
    return;
  }

  // Calculate leg angles (in degrees) from horizontal: angle = asin(vertical / leg)
  const angle1 = Math.asin(H1 / L1_val) * (180 / Math.PI);
  const angle2 = Math.asin(H2 / L2_val) * (180 / Math.PI);

  // Calculate tensions:
  // T1 = (load * D2 * L1) / (H1 * (D1 + D2))
  // T2 = (load * D1 * L2) / (H2 * (D1 + D2))
  const T1 = (load * D2 * L1_val) / (H1 * (D1 + D2));
  const T2 = (load * D1 * L2_val) / (H2 * (D1 + D2));

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${mode}</td>
    <td>${L1_val.toFixed(2)} ft<br>${angle1.toFixed(1)}°</td>
    <td>${L2_val.toFixed(2)} ft<br>${angle2.toFixed(1)}°</td>
    <td>${T1.toFixed(2)} lbs</td>
    <td>${T2.toFixed(2)} lbs</td>
  `;
  tbody.appendChild(row);
}