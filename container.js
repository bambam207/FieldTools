document.addEventListener('DOMContentLoaded', () => {
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
  // 1) Units & container size
  const wUnit = document.getElementById('weight-unit').value;
  const lUnit = document.getElementById('length-unit').value;
  const size  = parseFloat(document.getElementById('container-size').value) || 0;

  // 2) Container length & 8" margin in chosen unit
  let containerLen = size;       // ft base
  if (lUnit === 'm') containerLen *= 0.3048;

  let margin = 8/12;             // 8" in ft
  if (lUnit === 'm') margin *= 0.3048;

  // 3) Read inputs
  const weights = [...document.querySelectorAll('.weight')].map(i => parseFloat(i.value) || 0);
  const widths  = [...document.querySelectorAll('.width') ].map(i => parseFloat(i.value) || 0);

  const totalW     = weights.reduce((a,b) => a + b, 0);
  const totalWidth = widths.reduce((a,b) => a + b, 0);
  const center     = containerLen / 2;
  const usableSpan = containerLen - 2*margin;

  // 4) Identify active items
  const active = weights
    .map((w,i) => (w>0 && widths[i]>0) ? i : null)
    .filter(i => i !== null);

  let finalPos = new Array(weights.length).fill(null);
  let warning  = '';

  // Special case: exactly two items
  if (active.length === 2) {
    const [i0, i1] = active;
    const w1 = weights[i0], w2 = weights[i1];
    const min1 = margin + widths[i0]/2;
    const max1 = containerLen - margin - widths[i0]/2;
    const min2 = margin + widths[i1]/2;
    const max2 = containerLen - margin - widths[i1]/2;

    // Try p1 at its min, solve p2 for CG = center
    let p1 = min1;
    let p2 = (center*totalW - w1*p1) / w2;

    // Clamp p2 if outside, and recompute p1
    if (p2 > max2) {
      p2 = max2;
      p1 = (center*totalW - w2*p2) / w1;
      if (p1 < min1) p1 = min1;
      if (p1 > max1) p1 = max1;
    } else if (p2 < min2) {
      p2 = min2;
      p1 = (center*totalW - w2*p2) / w1;
      if (p1 < min1) p1 = min1;
      if (p1 > max1) p1 = max1;
    }

    finalPos[i0] = p1;
    finalPos[i1] = p2;

    // Warning if total width > usable or any clamp happened
    if (totalWidth > usableSpan) {
      warning = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${usableSpan.toFixed(2)})`;
    }
    if (p1 === min1 || p2 === min2 || p2 === max2 || p1 === max1) {
      warning += (warning ? ' ' : '') + `⚠️ CG clamped into 8″ margin`;
    }

  } else {
    // Fallback for 0,1,3+ items: pack, shift, clamp each
    if (totalWidth > usableSpan) {
      warning = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${usableSpan.toFixed(2)})`;
    }

    // 5) Initial pack & shift
    let cursor = margin;
    const initPos = widths.map(w => {
      const p = cursor + w/2;
      cursor += w;
      return p;
    });
    const cgInit = initPos.reduce((sum,p,i) => sum + p*weights[i], 0) / (totalW||1);
    const shift  = center - cgInit;

    // 6) Clamp per-item
    let clamped = false;
    finalPos = initPos.map((p,i) => {
      const raw    = p + shift;
      const minP   = margin + widths[i]/2;
      const maxP   = containerLen - margin - widths[i]/2;
      const cp     = Math.min(Math.max(raw, minP), maxP);
      if (cp !== raw) clamped = true;
      return cp;
    });
    if (clamped) {
      warning += (warning ? ' ' : '') + `⚠️ Some CGs were clamped into the 8″ margin`;
    }
  }

  // 7) Update UI
  document.getElementById('total-weight').textContent =
    `${totalW.toFixed(2)} ${wUnit}`;
  document.getElementById('container-length-display').textContent =
    `${containerLen.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent = lUnit;
  document.getElementById('warning').textContent = warning;

  const list = document.getElementById('positions-list');
  list.innerHTML = '';
  finalPos.forEach((p,i) => {
    if (p !== null) {
      const li = document.createElement('li');
      li.textContent = `Obj ${i+1}: CG at ${p.toFixed(2)} ${lUnit} from left`;
      list.appendChild(li);
    }
  });
}