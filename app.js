// Angle Conversion
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

// Load Balancer
function calcLoad() {
  const total = parseFloat(document.getElementById('totalWeight').value) || 0;
  const supports = parseInt(document.getElementById('numSupports').value) || 1;
  const perSupport = (total / supports).toFixed(2);
  const output = document.getElementById('loadOutput');
  output.innerHTML = '';
  for (let i = 1; i <= supports; i++) {
    const li = document.createElement('li');
    li.textContent = `Support ${i}: ${perSupport} lbs`;
    output.appendChild(li);
  }
}

// Weight Converter
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

// Temperature Converter
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

// Sling Load Calculator
function calcSlingLoad() {
  const load = parseFloat(document.getElementById('slingLoad').value) || 0;
  let L1 = parseFloat(document.getElementById('slingL1').value);
  let L2 = parseFloat(document.getElementById('slingL2').value);
  const D1 = parseFloat(document.getElementById('slingD1').value) || 0;
  const D2 = parseFloat(document.getElementById('slingD2').value) || 0;
  let H = parseFloat(document.getElementById('slingH').value);

  const output = document.getElementById('slingOutput');
  output.innerHTML = '';

  if ((isNaN(L1) || isNaN(L2)) && isNaN(H)) {
    output.innerHTML = '<li>Please enter either both sling lengths or vertical height.</li>';
    return;
  }

  // Auto-calculate height
  if (!isNaN(L1) && !isNaN(L2) && isNaN(H)) {
    const h1 = Math.sqrt(Math.max(L1 * L1 - D1 * D1, 0));
    const h2 = Math.sqrt(Math.max(L2 * L2 - D2 * D2, 0));
    H = (h1 + h2) / 2;
  }

  // Auto-calculate missing L1/L2
  if (!isNaN(H) && (isNaN(L1) || isNaN(L2))) {
    if (!isNaN(D1) && !isNaN(D2)) {
      if (isNaN(L1)) L1 = Math.sqrt(H * H + D1 * D1);
      if (isNaN(L2)) L2 = Math.sqrt(H * H + D2 * D2);
    } else {
      output.innerHTML = '<li>Need D1 and D2 to calculate missing sling lengths from height.</li>';
      return;
    }
  }

  if (isNaN(L1) || isNaN(L2) || isNaN(H) || H === 0 || D1 + D2 === 0) {
    output.innerHTML = '<li>Invalid input. Make sure all dimensions are valid numbers.</li>';
    return;
  }

  const T1 = (load * D2 * L1) / (H * (D1 + D2));
  const T2 = (load * D1 * L2) / (H * (D1 + D2));
  const angle1 = Math.acos(H / L1) * (180 / Math.PI);
  const angle2 = Math.acos(H / L2) * (180 / Math.PI);

  output.innerHTML = `
    <li>Left Sling Tension: ${T1.toFixed(2)} lbs</li>
    <li>Right Sling Tension: ${T2.toFixed(2)} lbs</li>
    <li>Left Sling Angle: ${angle1.toFixed(1)}°</li>
    <li>Right Sling Angle: ${angle2.toFixed(1)}°</li>
    <li>Vertical Height Used: ${H.toFixed(2)}</li>
  `;
}

// PDF Export
function downloadSlingPDF() {
  const output = document.getElementById('slingOutput');
  const filenameInput = document.getElementById('pdfFilename');
  let filename = filenameInput?.value.trim() || "sling-load";

  if (!output || output.innerHTML.trim() === '') {
    alert("Calculate first, you lazy bastard.");
    return;
  }

  const win = window.open('', '', 'width=800,height=600');
  win.document.write(`
    <html>
      <head>
        <title>${filename}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h2 { margin-top: 0; }
        </style>
      </head>
      <body>
        <h2>Sling Load Calculator Results</h2>
        <ul>${output.innerHTML}</ul>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}

// Tab switching
function showSection(id) {
  document.querySelectorAll('.tool').forEach(el => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}