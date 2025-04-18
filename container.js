document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('objects-table')) return;
  initContainerTool();
});

function initContainerTool() {
  const tbody = document.querySelector('#objects-table tbody');
  for (let i = 1; i <= 6; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td><input type="number" class="weight" min="0" step="any" placeholder="0"/></td>
      <td><input type="number" class="width"  min="0" step="any" placeholder="0"/></td>
    `;
    tbody.appendChild(tr);
  }
  document.getElementById('calc-btn')
          .addEventListener('click', calculateBalance);
}

function calculateBalance() {
  // Units & container size
  const wUnit = document.getElementById('weight-unit').value;
  const lUnit = document.getElementById('length-unit').value;
  const size  = parseFloat(document.getElementById('container-size').value) || 0;

  // Container length in feet (base), convert to meters if needed
  let containerLen = size; // ft
  if (lUnit === 'm') containerLen *= 0.3048;

  // 8" margin in feet, convert to meters if needed
  let margin = 8/12; // ft
  if (lUnit === 'm') margin *= 0.3048;

  // Grab data
  const weights = [...document.querySelectorAll('.weight')]
    .map(el => parseFloat(el.value) || 0);
  const widths  = [...document.querySelectorAll('.width')]
    .map(el => parseFloat(el.value) || 0);

  const totalW = weights.reduce((a,b) => a + b, 0);
  const totalWidth = widths.reduce((a,b) => a + b, 0);

  // Warn if total widths exceed usable span
  const usableSpan = containerLen - 2*margin;
  const warnEl = document.getElementById('warning');
  warnEl.textContent = '';
  if (totalWidth > usableSpan) {
    warnEl.textContent = 
      `⚠️ Total object width (${totalWidth.toFixed(2)}) exceeds usable length (${usableSpan.toFixed(2)})`;
  }

  // Initial CG positions: pack sequentially from left margin
  let cursor = margin;
  const initPos = widths.map(w => {
    const p = cursor + w/2;
    cursor += w;
    return p;
  });

  // Compute group CG shift
  const cgInit = initPos.reduce((sum,p,i) => sum + p * weights[i], 0) 
               / (totalW || 1);
  const shift = (containerLen/2) - cgInit;

  // Now clamp each object's CG into [margin + w/2, containerLen - margin - w/2]
  let clampWarning = false;
  const finalPos = initPos.map((p,i) => {
    const raw = p + shift;
    const minPos = margin + widths[i]/2;
    const maxPos = containerLen - margin - widths[i]/2;
    const clamped = Math.min(Math.max(raw, minPos), maxPos);
    if (clamped !== raw) clampWarning = true;
    return clamped;
  });

  if (clampWarning) {
    warnEl.textContent += 
      (warnEl.textContent ? ' ' : '') +
      '⚠️ Some CGs were clamped outside the 8″ margin.';
  }

  // Update totals & labels
  document.getElementById('total-weight').textContent =
    `${totalW.toFixed(2)} ${wUnit}`;
  document.getElementById('container-length-display').textContent =
    `${containerLen.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent = lUnit;

  // List each CG
  const posList = document.getElementById('positions-list');
  posList.innerHTML = '';
  finalPos.forEach((p,i) => {
    if (weights[i] > 0 && widths[i] > 0) {
      const li = document.createElement('li');
      li.textContent = 
        `Obj ${i+1}: CG at ${p.toFixed(2)} ${lUnit} from left`;
      posList.appendChild(li);
    }
  });
}