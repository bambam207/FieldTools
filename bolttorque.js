// bolttorque.js
(() => {
  // Imperial UNC coarse data at Class 8.8 (ft·lb)
  const coarseImp = [
    ['1/4"-20', 20, 6],
    ['5/16"-18',18,17],
    ['3/8"-16', 16,35],
    ['7/16"-14',14,55],
    ['1/2"-13', 13,80],
    ['9/16"-12',12,110],
    ['5/8"-11', 11,180],
    ['3/4"-10', 10,245],
    ['7/8"-9',   9,350],
    ['1"-8',     8,454],
    ['1-1/8"-7', 7,607],
    ['1-1/4"-7', 7,796],
    ['1-3/8"-6', 6,876],
    ['1-1/2"-6', 6,1112],
    ['1-3/4"-5', 5,1538],
    ['2"-4.5',   4.5,2199],
    ['2-1/4"-4', 4,2829],
    ['2-1/2"-4', 4,3538],
    ['2-3/4"-4', 4,4248],
    ['3"-4',     4,4958],
  ];

  // Map UNC→UNF fine pitches
  const unfMap = { '20':28,'18':24,'16':24,'14':20,'13':20,'12':18,'11':18,'10':16 };

  // Generate fine UNF entries
  const fineImp = coarseImp
    .map(([size,pitch,base]) => {
      const fp = unfMap[pitch];
      if (!fp) return null;
      return [ size.replace(`-${pitch}`, `-${fp}`), fp, base * 1.1 ];
    })
    .filter(Boolean);

  const allImp = [...coarseImp, ...fineImp].sort((a,b) => {
    // parse diameter
    const parse = s => {
      const p = s.split('"')[0];
      if (p.includes('-')) {
        const [w,f] = p.split('-');
        const [n,d] = f.split('/');
        return parseInt(w) + parseInt(n)/parseInt(d);
      }
      if (p.includes('/')) {
        const [n,d] = p.split('/');
        return parseInt(n)/parseInt(d);
      }
      return parseFloat(p);
    };
    const da = parse(a[0]), db = parse(b[0]);
    if (da !== db) return da - db;
    return a[1] - b[1];
  });

  // Metric coarse at Class 8.8 (N·m)
  const coarseMet = [
    ['M6×1.0', 1.0, 10],
    ['M8×1.25',1.25,25],
    ['M10×1.5',1.5,50],
    ['M12×1.75',1.75,88],
    ['M16×2.0',2.0,218],
    ['M20×2.5',2.5,426],
    ['M24×3.0',3.0,610],
    ['M30×3.5',3.5,1000]
  ];
  // generate fine-pitch ~10% higher
  const fineMet = coarseMet.map(([size,pitch,nm]) => {
    const m = size.match(/M(\d+)/)[1];
    const finePitch = { '6':0.75,'8':1.0,'10':1.25,'12':1.5,'16':1.5,'20':2.0,'24':3.0,'30':4.0 }[m];
    if (!finePitch) return null;
    return [`M${m}×${finePitch}`, finePitch, nm * 1.1];
  }).filter(Boolean);

  const allMet = [...coarseMet, ...fineMet].sort((a,b) => {
    const da = parseFloat(a[0].slice(1)), db = parseFloat(b[0].slice(1));
    if (da !== db) return da - db;
    return a[1] - b[1];
  });

  const classFactors = {
    '4.8': 0.5,
    '8.8': 1,
    '10.9': 1.25,
    '12.9': 1.41,
    '14.9': 1.6,
    'Stainless': 0.6,
    'Aluminum Alloy': 0.5,
    'Delrin': 0.02
  };

  const condFactor = c => c === 'wet' ? 0.75 : 1;
  const headFactor = h => h === 'pancake'   ? 0.8
                     : h === 'countersunk' ? 0.6
                     : 1;

  const form = document.getElementById('boltForm');
  const tbody = document.querySelector('#resultTable tbody');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const sys   = form.sizeSys.value;       // 'imperial'|'metric'
    const clazz = form.boltClass.value;     // e.g. '10.9'
    const cond  = form.lubed.value;         // 'dry'|'wet'
    const head  = form.headType.value;

    const cF = classFactors[clazz] || 1;
    const fF = condFactor(cond);
    const hF = headFactor(head);

    const data = sys === 'imperial' ? allImp : allMet;
    tbody.innerHTML = '';
    data.forEach(([size, pitch, base]) => {
      // compute raw torque
      const raw = base * cF * fF * hF;
      // convert
      const tImp = sys === 'imperial' ? raw : raw * 0.7376;
      const tMet = sys === 'metric'   ? raw : raw * 1.356;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${size}</td>
        <td>${pitch}</td>
        <td>${tImp.toFixed(1)}</td>
        <td>${tMet.toFixed(1)}</td>
      `;
      tbody.appendChild(tr);
    });
  });
})();