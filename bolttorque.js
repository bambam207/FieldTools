// bolttorque.js
(() => {
  // Coarse UNC data (ft·lb at Class 8.8, dry, hex-head)
  const coarseImp = [
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
    ['3"-4',     4,4958]
  ];

  // Map coarse pitch -> UNF fine pitch
  const unfPitchMap = {
    '20': 28,
    '18': 24,
    '16': 24,
    '14': 20,
    '13': 20,
    '12': 18,
    '11': 18,
    '10': 16
  };

  // Generate fine UNF entries (~10% higher torque)
  const fineImp = coarseImp
    .map(([size, pitch, base]) => {
      const fp = unfPitchMap[pitch];
      if (!fp) return null;
      const newSize = size.replace(`-${pitch}`, `-${fp}`);
      return [ newSize, fp, base * 1.1 ];
    })
    .filter(Boolean);

  // Combine and sort by nominal diameter then pitch
  const allImp = [...coarseImp, ...fineImp].sort((a, b) => {
    const parse = s => {
      // parse '1-1/4' or '3/4' from size string
      const num = s.split('"')[0];
      if (num.includes('-')) {
        const [w,f] = num.split('-');
        const [n,d] = f.split('/');
        return parseInt(w) + (parseInt(n)/parseInt(d));
      }
      if (num.includes('/')) {
        const [n,d] = num.split('/');
        return parseInt(n)/parseInt(d);
      }
      return parseFloat(num);
    };
    const da = parse(a[0]), db = parse(b[0]);
    if (da !== db) return da - db;
    return a[1] - b[1];
  });

  // Class multipliers
  const classFactors = { '4.8': 0.5, '8.8': 1, '10.9': 1.25, '12.9': 1.41, '14.9': 1.6 };

  // Condition & head factors
  const condFactor = cond => cond === 'wet' ? 0.75 : 1;
  const headFactor = head => head === 'pancake'   ? 0.8
                         : head === 'countersunk' ? 0.6
                         : 1;

  const form = document.getElementById('boltForm');
  const tbody = document.querySelector('#resultTable tbody');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const sys   = form.sizeSys.value;       // 'imperial' or 'metric'
    const clazz = form.boltClass.value;     // e.g. '8.8'
    const head  = form.headType.value;
    const cond  = form.lubed.value;

    const cF = classFactors[clazz] || 1;
    const fF = condFactor(cond);
    const hF = headFactor(head);

    tbody.innerHTML = '';
    allImp.forEach(([size, pitch, base]) => {
      const ftlb = base * cF * fF * hF;
      const nm   = ftlb * 1.356;
      const tFt  = sys === 'imperial' ? ftlb.toFixed(1) : (nm * 0.7376).toFixed(1);
      const tNm  = sys === 'metric'   ? nm.toFixed(1)   : (ftlb * 1.356).toFixed(1);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${size}</td>
        <td>${pitch}</td>
        <td>${tFt}</td>
        <td>${tNm}</td>
      `;
      tbody.appendChild(tr);
    });
  });
})();