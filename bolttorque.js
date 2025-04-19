// bolttorque.js
(() => {
  // Imperial UNC coarse data at Class 8.8 baseline (ft·lb)
  const coarseImp = [
    ['1/4"-20',20,6], ['5/16"-18',18,17], ['3/8"-16',16,35], ['7/16"-14',14,55],
    ['1/2"-13',13,80], ['9/16"-12',12,110], ['5/8"-11',11,180], ['3/4"-10',10,245],
    ['7/8"-9',9,350], ['1"-8',8,454], ['1-1/8"-7',7,607], ['1-1/4"-7',7,796],
    ['1-3/8"-6',6,876], ['1-1/2"-6',6,1112], ['1-3/4"-5',5,1538],
    ['2"-4.5',4.5,2199], ['2-1/4"-4',4,2829], ['2-1/2"-4',4,3538],
    ['2-3/4"-4',4,4248], ['3"-4',4,4958],
  ];

  // Map UNC→UNF fine pitches (≈10% higher torque)
  const unfMap = { '20':28,'18':24,'16':24,'14':20,'13':20,'12':18,'11':18,'10':16 };
  const fineImp = coarseImp
    .map(([sz,p,base]) => {
      const fp = unfMap[p]; if (!fp) return null;
      return [ sz.replace(`-${p}`,`-${fp}`), fp, base * 1.1 ];
    })
    .filter(Boolean);

  // Combined imperial dataset, sorted by diameter then pitch
  const allImp = [...coarseImp, ...fineImp].sort((a,b) => {
    const parse = s => { 
      const part = s.split('"')[0];
      if (part.includes('-')) {
        const [w,f] = part.split('-'), [n,d] = f.split('/');
        return +w + (+n)/(+d);
      }
      if (part.includes('/')) {
        const [n,d] = part.split('/');
        return (+n)/(+d);
      }
      return +part;
    };
    const da = parse(a[0]), db = parse(b[0]);
    return da === db ? a[1] - b[1] : da - db;
  });

  // Metric coarse baseline Class 8.8 (N·m)
  const coarseMet = [
    ['M6×1.0',1.0,10], ['M8×1.25',1.25,25], ['M10×1.5',1.5,50],
    ['M12×1.75',1.75,88], ['M16×2.0',2.0,218], ['M20×2.5',2.5,426],
    ['M24×3.0',3.0,610], ['M30×3.5',3.5,1000]
  ];
  const fineMet = coarseMet.map(([sz,p,nm]) => {
    const m = sz.match(/M(\d+)/)[1];
    const map = { '6':0.75,'8':1,'10':1.25,'12':1.5,'16':1.5,'20':2,'24':3,'30':4 };
    const fp = map[m]; if (!fp) return null;
    return [`M${m}×${fp}`, fp, nm * 1.1];
  }).filter(Boolean);

  const allMet = [...coarseMet, ...fineMet].sort((a,b) => {
    const da = parseFloat(a[0].slice(1)), db = parseFloat(b[0].slice(1));
    return da === db ? a[1] - b[1] : da - db;
  });

  // Multipliers for classes/materials
  const classFactors = {
    '4.8': 0.5,
    '8.8': 1,
    '10.9': 1.25,
    '12.9': 1.41,
    '14.9': 1.6,
    'Stainless': 0.6,
    'Aluminum Alloy': 0.5,
    'Delrin': 0.02,
    'Titanium': 0.75  // approx. 75% of steel 8.8
  };

  const condFactor = c => c === 'wet' ? 0.75 : 1;
  const headFactor = h => h === 'pancake' ? 0.8 : (h === 'countersunk' ? 0.6 : 1);

  const form = document.getElementById('boltForm');
  const tbody = document.querySelector('#resultTable tbody');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const sys   = form.sizeSys.value;      // 'imperial' or 'metric'
    const clazz = form.boltClass.value;    // '8.8', 'Titanium', etc.
    const cond  = form.lubed.value;        // 'dry' or 'wet'
    const head  = form.headType.value;

    const cF = classFactors[clazz] || 1;
    const fF = condFactor(cond);
    const hF = headFactor(head);

    const data = sys === 'imperial' ? allImp : allMet;
    tbody.innerHTML = '';
    data.forEach(([size,pitch,base]) => {
      const raw = base * cF * fF * hF;
      const torqueImp = sys === 'imperial' ? raw : raw * 0.7376;
      const torqueMet = sys === 'metric'   ? raw : raw * 1.356;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${size}</td>
        <td>${pitch}</td>
        <td>${torqueImp.toFixed(1)}</td>
        <td>${torqueMet.toFixed(1)}</td>
      `;
      tbody.appendChild(tr);
    });
  });
})();