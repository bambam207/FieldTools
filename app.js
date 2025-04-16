// Sling Load Calculator function
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