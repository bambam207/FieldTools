// Show the appropriate tool section based on the "TOOLS" dropdown.
function showToolSection() {
  const selection = document.getElementById('toolsMenu').value;
  if (selection === 'sling') {
    document.getElementById('slingSection').classList.remove('hidden');
    document.getElementById('containerSection').classList.add('hidden');
  } else if (selection === 'container') {
    document.getElementById('containerSection').classList.remove('hidden');
    document.getElementById('slingSection').classList.add('hidden');
  }
}

// ----------------- Sling Load Calculator -----------------
function calcSling() {
  const load = parseFloat(document.getElementById('load').value);
  const D1 = parseFloat(document.getElementById('d1').value);
  const D2 = parseFloat(document.getElementById('d2').value);
  const H = parseFloat(document.getElementById('height').value);
  let L1 = parseFloat(document.getElementById('l1').value);
  let L2 = parseFloat(document.getElementById('l2').value);
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = '';

  if (isNaN(load) || isNaN(D1) || isNaN(D2)) {
    tbody.innerHTML = '<tr><td colspan="5">Enter Load, D1 and D2.</td></tr>';
    return;
  }

  let mode = '';
  if (!isNaN(L1) && !isNaN(L2)) {
    mode = 'Manual Legs';
  } else if (!isNaN(H)) {
    L1 = Math.sqrt(D1 * D1 + H * H);
    L2 = Math.sqrt(D2 * D2 + H * H);
    mode = 'Auto Legs (from H)';
  } else {
    tbody.innerHTML = '<tr><td colspan="5">Enter either L1 & L2 or Vertical Hook Height (H).</td></tr>';
    return;
  }

  const H1 = Math.sqrt(L1 * L1 - D1 * D1);
  const H2 = Math.sqrt(L2 * L2 - D2 * D2);

  if (isNaN(H1) || isNaN(H2) || H1 <= 0 || H2 <= 0) {
    tbody.innerHTML = '<tr><td colspan="5">Invalid geometry: Ensure Lx > Dx.</td></tr>';
    return;
  }

  const angle1 = Math.asin(H1 / L1) * (180 / Math.PI);
  const angle2 = Math.asin(H2 / L2) * (180 / Math.PI);

  const T1 = (load * D2 * L1) / (H1 * (D1 + D2));
  const T2 = (load * D1 * L2) / (H2 * (D1 + D2));

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

// ----------------- Container Balance Calculator -----------------
// This function calculates overall CG position for the container
function calcContainerBalance() {
  // Get container length from dropdown (20ft or 40ft)
  const containerType = document.getElementById('containerType').value;
  const containerLength = parseFloat(containerType); // 20 or 40 ft

  // Calculate fixed positions for six fields: evenly distributed as (L/7)*i for i=1..6.
  let positions = [];
  for (let i = 1; i <= 6; i++) {
    positions.push((containerLength * i) / 7);
  }

  let totalLoad = 0;
  let totalMoment = 0;

  // For each of the six fields
  for (let i = 1; i <= 6; i++) {
    let loadVal = parseFloat(document.getElementById('cLoad' + i).value);
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

  const cg = totalMoment / totalLoad; // in ft
  const cgPercent = (cg / containerLength) * 100;

  resultDiv.innerHTML = `<p>Total Load: ${totalLoad.toFixed(2)} (in entered unit)</p>
  <p>Container Length: ${containerLength} ft</p>
  <p>Overall CG is at ${cg.toFixed(2)} ft from the left side 
      (${cgPercent.toFixed(1)}% of container length).</p>`;
}