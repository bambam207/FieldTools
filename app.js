// -------------------- SECTION SWITCHING --------------------
function showSection(id) {
  document.querySelectorAll('.tool').forEach(el => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// -------------------- ANGLE CONVERTER --------------------
function angleConvert(from) {
  let deg = parseFloat(document.getElementById('deg').value) || 0;
  let rad = parseFloat(document.getElementById('rad').value) || 0;
  let pct = parseFloat(document.getElementById('pct').value) || 0;

  if (from === 'deg') {
    rad = deg * (Math.PI / 180);
    pct = Math.tan(rad) * 100;
  } else if (from === 'rad') {
    deg = rad * (180 / Math.PI);
    pct = Math.tan(rad) * 100;
  } else if (from === 'pct') {
    rad = Math.atan(pct / 100);
    deg = rad * (180 / Math.PI);
  }

  document.getElementById('deg').value = deg.toFixed(2);
  document.getElementById('rad').value = rad.toFixed(4);
  document.getElementById('pct').value = pct.toFixed(2);
}

// -------------------- LOAD BALANCER --------------------
function calcLoad() {
  const total = parseFloat(document.getElementById('totalWeight').value) || 0;
  const supports = parseInt(document.getElementById('numSupports').value) || 1;
  const per = (total / supports).toFixed(2);
  const output = document.getElementById('loadOutput');
  output.innerHTML = '';
  for (let i = 1; i <= supports; i++) {
    const li = document.createElement('li');
    li.textContent = `Support ${i}: ${per} lbs`;
    output.appendChild(li);
  }
}

// -------------------- WEIGHT CONVERTER --------------------
function convertWeight() {
  const value = parseFloat(document.getElementById('weightInput').value) || 0;
  const unit = document.getElementById('weightUnit').value;
  let lb = 0;

  if (unit === 'lb') lb = value;
  else if (unit === 'kg') lb = value * 2.20462;
  else if (unit === 'ton') lb = value * 2000;
  else if (unit === 'kn') lb = value * 224.809;

  const output = document.getElementById('weightOutput');
  output.innerHTML = `
    <li>${lb.toFixed(2)} lb</li>
    <li>${(lb / 2.20462).toFixed(2)} kg</li>
    <li>${(lb / 2000).toFixed(2)} US tons</li>
    <li>${(lb / 224.809).toFixed(2)} kN</li>
  `;
}

// -------------------- TEMPERATURE CONVERTER --------------------
function tempConvert(from) {
  let f = parseFloat(document.getElementById('f').value) || 0;
  let c = parseFloat(document.getElementById('c').value) || 0;
  let k = parseFloat(document.getElementById('k').value) || 0;

  if (from === 'f') {
    c = (f - 32) * 5 / 9;
    k = c + 273.15;
  } else if (from === 'c') {
    f = (c * 9 / 5) + 32;
    k = c + 273.15;
  } else if (from === 'k') {
    c = k - 273.15;
    f = (c * 9 / 5) + 32;
  }

  document.getElementById('f').value = f.toFixed(1);
  document.getElementById('c').value = c.toFixed(1);
  document.getElementById('k').value = k.toFixed(1);
}

// -------------------- ADVANCED SLING CALCULATOR --------------------
function calcSling() {
  const angles = [60, 50, 45, 35];

  const load = parseFloat(document.getElementById('load').value) || 0;
  const D1 = parseFloat(document.getElementById('d1').value) || 0;
  const D2 = parseFloat(document.getElementById('d2').value) || 0;
  const H = parseFloat(document.getElementById('height').value) || 0;
  let L1 = parseFloat(document.getElementById('l1').value);
  let L2 = parseFloat(document.getElementById('l2').value);

  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = '';

  if (load <= 0 || D1 <= 0 || D2 <= 0 || H <= 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="5">Please enter Load, D1, D2, and Height.</td>`;
    tbody.appendChild(row);
    return;
  }

  if (isNaN(L1)) L1 = Math.sqrt(D1 * D1 + H * H);
  if (isNaN(L2)) L2 = Math.sqrt(D2 * D2 + H * H);

  const angle1 = Math.acos(H / L1) * (180 / Math.PI);
  const angle2 = Math.acos(H / L2) * (180 / Math.PI);

  const T1 = (load * D2 * L1) / (H * (D1 + D2));
  const T2 = (load * D1 * L2) / (H * (D1 + D2));

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>Auto</td>
    <td>${L1.toFixed(2)} ft</td>
    <td>${L2.toFixed(2)} ft</td>
    <td>${T1.toFixed(2)} lbs<br>${angle1.toFixed(1)}°</td>
    <td>${T2.toFixed(2)} lbs<br>${angle2.toFixed(1)}°</td>
  `;
  tbody.appendChild(row);

  // Optional: show calculated version for known standard angles
  angles.forEach(angle => {
    const angleRad = angle * Math.PI / 180;
    const l1 = H / Math.cos(angleRad);
    const l2 = H / Math.cos(angleRad);
    const t1 = (load * D2 * l1) / (H * (D1 + D2));
    const t2 = (load * D1 * l2) / (H * (D1 + D2));

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${angle}°</td>
      <td>${l1.toFixed(2)} ft</td>
      <td>${l2.toFixed(2)} ft</td>
      <td>${t1.toFixed(2)} lbs</td>
      <td>${t2.toFixed(2)} lbs</td>
    `;
    tbody.appendChild(row);
  });
}