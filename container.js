document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('objects-table')) return;
  initContainerTool();
});

function initContainerTool() {
  const tbody = document.querySelector('#objects-table tbody');
  // inject six rows
  for (let i = 1; i <= 6; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i}</td>
      <td><input type="number" class="weight" min="0" step="any" placeholder="0"/></td>
      <td><input type="number" class="width"  min="0" step="any" placeholder="0"/></td>
      <td><input type="number" class="pos"    min="0" step="any" placeholder=""/></td>
    `;
    tbody.appendChild(tr);
  }

  document.getElementById('calc-btn')
          .addEventListener('click', calculateBalance);
}

function calculateBalance() {
  const length = parseFloat(
    document.getElementById('container-length').value
  ) || 0;
  const unit = document.getElementById('unit-select').value;

  const weights   = [...document.querySelectorAll('.weight')]
                    .map(i => parseFloat(i.value) || 0);
  const widths    = [...document.querySelectorAll('.width')]
                    .map(i => parseFloat(i.value) || 0);
  const positions = [...document.querySelectorAll('.pos')]
                    .map(i => i.value !== '' ? parseFloat(i.value) : null);

  const totalW = weights.reduce((a,b) => a + b, 0);

  // auto‑pack if no pos given
  let cursor = 0;
  const finalPos = widths.map((w,i) => {
    const p = positions[i] !== null
      ? positions[i]
      : cursor + w/2;
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

  const wtU = unit === 'metric' ? 'kg' : 'lb';
  const lenU = unit === 'metric' ? 'm'  : 'in';

  document.getElementById('total-weight')
          .textContent = `${totalW.toFixed(2)} ${wtU}`;
  document.getElementById('cg-pos')
          .textContent = `${cg.toFixed(2)} ${lenU} from front`;
}