
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
function tempConvert(from) {
  let f = parseFloat(document.getElementById('f').value) || 0;
  let c = parseFloat(document.getElementById('c').value) || 0;
  let k = parseFloat(document.getElementById('k').value) || 0;
  if (from === 'f') {
    c = (f - 32) * 5/9;
    k = c + 273.15;
  } else if (from === 'c') {
    f = (c * 9/5) + 32;
    k = c + 273.15;
  } else if (from === 'k') {
    c = k - 273.15;
    f = (c * 9/5) + 32;
  }
  document.getElementById('f').value = f.toFixed(1);
  document.getElementById('c').value = c.toFixed(1);
  document.getElementById('k').value = k.toFixed(1);
}
function showSection(id) {
  document.querySelectorAll('.tool').forEach(el => el.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}
