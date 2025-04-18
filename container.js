document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('objects-table')) return;
  initContainerTool();
});

function initContainerTool() {
  const tbody = document.querySelector('#objects-table tbody');
  // inject six blank rows
  for (let i = 1; i <= 6; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td>
        <input type="number" class="weight" min="0" step="any" placeholder="0"/>
      </td>
      <td>
        <input type="number" class="width"  min="0" step="any" placeholder="0"/>
      </td>
    `;
    tbody.appendChild(tr);
  }

  document.getElementById('calc-btn')
          .addEventListener('click', calculateBalance);
}

function calculateBalance() {
  // grab units & container size
  const wUnit = document.getElementById('weight-unit').value;
  const lUnit = document.getElementById('length-unit').value;
  const size  = parseFloat(document.getElementById('container-size').value) || 0;

  // compute container length in chosen unit
  // original sizes are in feet
  let containerLen = size; // in ft
  if (lUnit === 'm') containerLen = size * 0.3048; 

  // 8" margin = 8/12 ft => convert if meters
  let margin = 8/12; // ft
  if (lUnit === 'm') margin = (8/12) * 0.3048;

  const midPoint = containerLen / 2;

  // collect inputs
  const weights = [...document.querySelectorAll('.weight')]
    .map(i => parseFloat(i.value) || 0);
  const widths  = [...document.querySelectorAll('.width')]
    .map(i => parseFloat(i.value) || 0);

  const totalW = weights.reduce((a,b) => a + b, 0);
  const totalWidth = widths.reduce((a,b) => a + b, 0);

  // warn if combined widths > available span
  const availSpan = containerLen - 2 * margin;
  const warnEl = document.getElementById('warning');
  if (totalWidth > availSpan) {
    warnEl.textContent = `⚠️ Objects total width (${totalWidth.toFixed(2)}) exceeds usable length (${availSpan.toFixed(2)})`;
  } else {
    warnEl.textContent = '';
  }

  // initial CG positions: pack sequentially from left margin
  let cursor = margin;
  const initPos = widths.map(w => {
    const p = cursor + w/2;
    cursor += w;
    return p;
  });

  // compute group CG
  const cgInit = initPos.reduce((sum,p,i) => sum + p * weights[i], 0) / (totalW || 1);
  const delta = midPoint - cgInit;

  // final positions
  const finalPos = initPos.map(p => p + delta);

  // update displays
  document.getElementById('total-weight').textContent =
    `${totalW.toFixed(2)} ${wUnit}`;
  document.getElementById('container-length-display').textContent =
    `${containerLen.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent =
    lUnit;

  // list each object's CG
  const posList = document.getElementById('positions-list');
  posList.innerHTML = '';
  finalPos.forEach((p,i) => {
    // skip zero‑weight items
    if (weights[i] <= 0 || widths[i] <= 0) return;
    const li = document.createElement('li');
    li.textContent = `Obj ${i+1}: CG at ${p.toFixed(2)} ${lUnit} from left`;
    posList.appendChild(li);
  });
}