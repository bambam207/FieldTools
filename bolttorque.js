// bolttorque.js
(() => {
  // Base torque (ft·lb) for UNC coarse & UNF fine threads at Class 8.8
  const baseImp = [
    // UNC Coarse  –  size, pitch, base ftlb @ Class 8.8
    ['1/4"-20', 20, 6],
    ['5/16"-18',18, 17],
    ['3/8"-16', 16, 35],
    ['7/16"-14',14, 55],
    ['1/2"-13', 13, 80],
    ['9/16"-12',12, 110],
    ['5/8"-11', 11, 180],
    ['3/4"-10', 10, 245],
    ['7/8"-9',   9, 350],
    ['1"-8',     8, 454],
    ['1-1/8"-7', 7, 607],
    ['1-1/4"-7', 7, 796],
    ['1-3/8"-6', 6, 876],
    ['1-1/2"-6', 6,1112],
    ['1-3/4"-5', 5,1538],
    ['2"-4.5',   4.5,2199],
    ['2-1/4"-4', 4,2829],
    ['2-1/2"-4', 4,3538],
    ['2-3/4"-4', 4,4248],
    ['3"-4',     4,4958],
    // UNF Fine – roughly 10–15% higher torque than coarse
    ['1/4"-28', 28, 6 * 1.1],
    ['5/16"-24',24,17 * 1.1],
    ['3/8"-24', 24,35 * 1.1],
    ['7/16"-20',20,55 * 1.1],
    ['1/2"-20', 20,80 * 1.1],
    ['9/16"-18',18,110 * 1.1],
    ['5/8"-18', 18,180 * 1.1],
    ['3/4"-16', 16,245 * 1.1],
    ['7/8"-14', 14,350 * 1.1],
    ['1"-14',   14,454 * 1.1]
  ];

  // Class multipliers
  const classFactors = {
    '4.8': 0.5,
    '8.8': 1,
    '10.9': 1.25,
    '12.9': 1.41,
    '14.9': 1.6
  };

  // Condition & head factors
  const condFactor = fs => fs === 'wet' ? 0.75 : 1;
  const headFactor = ht => ht === 'pancake'   ? 0.8
                     : ht === 'countersunk' ? 0.6
                     : 1;

  const form = document.getElementById('boltForm');
  const tbody = document.querySelector('#resultTable tbody');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const sys = form.sizeSys.value;
    const clazz = form.boltClass.value;
    const threadMat = form.threadMaterial.value;
    const head = form.headType.value;
    const cond = form.lubed.value;

    const cFactor = condFactor(cond);
    const hFactor = headFactor(head);
    const cf = classFactors[clazz] || 1;

    tbody.innerHTML = '';
    if (sys === 'imperial') {
      baseImp.forEach(([size,pitch,base]) => {
        // skip if thread material overrides
        if (threadMat!=='matching') {
          const map = { steel:'8.8', stainless:'8.8', aluminum:'8.8', delrin:'8.8' };
          if (threadMat !== 'steel' && threadMat!=='matching') return;
        }
        const ftlb = base * cf * cFactor * hFactor;
        const nm   = ftlb * 1.356;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${size}</td>
          <td>${pitch}</td>
          <td>${ftlb.toFixed(1)}</td>
          <td>${nm.toFixed(1)}</td>
        `;
        tbody.appendChild(tr);
      });
    }
    // Metric support would be similar, using ISO tables...
  });
})();