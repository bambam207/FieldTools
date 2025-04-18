// container.js
document.addEventListener('DOMContentLoaded', () => {
  if (!document.querySelector('#objects-table')) return;
  initContainerTool();
});

function initContainerTool() {
  const tbody = document.querySelector('#objects-table tbody');
  // inject 6 rows
  for (let i = 1; i <= 6; i++) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i}</td>
      <td><input type="number" class="weight" min="0" step="any" placeholder="0"/></td>
      <td><input type="number" class="width"  min="0" step="any" placeholder="0"/></td>
      <td><input type="number" class="pos"    min="0" step="any" placeholder="—"/></td>
    `;
    tbody.appendChild(row);
  }
  document.getElementById('calc-btn').addEventListener('click', calculateBalance);
}

function calculateBalance() {
  const length = parseFloat(document.getElementById('container-length').value) || 0;
  const unit = document.getElementById('unit-select').value;
  const weights   = [...document.querySelectorAll('.weight')].map(el => parseFloat(el.value)||0);
  const widths    = [...document.querySelectorAll('.width')]. map(el => parseFloat(el.value)||0);
  const positions = [...document.querySelectorAll('.pos')].  map(el => el.value!=='' ? parseFloat(el.value) : null);

  const totalW = weights.reduce((a,b) => a + b, 0);
  // assign positions: use user value if given; else pack sequentially
  let cursor = 0;
  const finalPos = widths.map((w,i) => {
    const p = positions[i] !== null ? positions[i] : cursor + w/2;
    cursor += w;
    return p;
  });

  const cg = totalW
    ? weights.reduce((sum,w,i) => sum + w * finalPos[i], 0) / totalW
    : 0;

  const totalWidth = widths.reduce((a,b) => a + b, 0);
  const warnEl = document.getElementById('warning');
  if (length > 0 && totalWidth > length) {
    warnEl.textContent = '⚠️ Total widths exceed container length!';
  } else {
    warnEl.textContent = '';
  }

  const wtUnit = unit === 'metric' ? 'kg' : 'lb';
  const lenUnit = unit === 'metric' ? 'm' : 'in';
  document.getElementById('total-weight').textContent = totalW.toFixed(2) + ' ' + wtUnit;
  document.getElementById('cg-pos').       textContent = cg.toFixed(2)  + ' ' + lenUnit + ' from front';
}