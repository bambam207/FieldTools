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
  const wUnit = document.getElementById('weight-unit').value;
  const lUnit = document.getElementById('length-unit').value;
  const size  = parseFloat(document.getElementById('container-size').value) || 0;

  let containerLen = size;             // in ft
  if (lUnit === 'm') containerLen *= 0.3048;

  let margin = 8/12;                   // 8" in ft
  if (lUnit === 'm') margin *= 0.3048;

  const weights = [...document.querySelectorAll('.weight')]
    .map(i => parseFloat(i.value) || 0);
  const widths  = [...document.querySelectorAll('.width')]
    .map(i => parseFloat(i.value) || 0);

  const totalW     = weights.reduce((a,b) => a + b, 0);
  const totalWidth = widths.reduce((a,b) => a + b, 0);
  const usableSpan = containerLen - 2*margin;

  let warn = '';
  if (totalWidth > usableSpan) {
    warn = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${usableSpan.toFixed(2)})`;
  }

  let cursor = margin;
  const initPos = widths.map(w => {
    const p = cursor + w/2;
    cursor += w;
    return p;
  });

  const cgInit = initPos.reduce((sum,p,i) => sum + p * weights[i], 0)
               / ( totalW || 1 );
  const shift  = (containerLen/2) - cgInit;

  let clamped = false;
  const finalPos = initPos.map((p,i) => {
    const raw    = p + shift;
    const minPos = margin + widths[i]/2;
    const maxPos = containerLen - margin - widths[i]/2;
    const cp     = Math.min(Math.max(raw, minPos), maxPos);
    if (cp !== raw) clamped = true;
    return cp;
  });
  if (clamped) {
    warn += (warn ? ' ' : '') + `⚠️ Some CGs were clamped into the 8″ margin.`;
  }

  document.getElementById('total-weight').textContent =
    `${totalW.toFixed(2)} ${wUnit}`;
  document.getElementById('container-length-display').textContent =
    `${containerLen.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent = lUnit;
  document.getElementById('warning').textContent = warn;

  const posList = document.getElementById('positions-list');
  posList.innerHTML = '';
  finalPos.forEach((p,i) => {
    if (weights[i] > 0 && widths[i] > 0) {
      const li = document.createElement('li');
      li.textContent = `Obj ${i+1}: CG at ${p.toFixed(2)} ${lUnit} from left`;
      posList.appendChild(li);
    }
  });
}