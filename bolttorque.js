// bolttorque.js
document.addEventListener('DOMContentLoaded', () => {
  // ——— Data sets ———
  const coarseImp = [
    ['1/4"-20',20,6],['5/16"-18',18,17],['3/8"-16',16,35],['7/16"-14',14,55],
    ['1/2"-13',13,80],['9/16"-12',12,110],['5/8"-11',11,180],['3/4"-10',10,245],
    ['7/8"-9',9,350],['1"-8',8,454],['1-1/8"-7',7,607],['1-1/4"-7',7,796],
    ['1-3/8"-6',6,876],['1-1/2"-6',6,1112],['1-3/4"-5',5,1538],
    ['2"-4.5',4.5,2199],['2-1/4"-4',4,2829],['2-1/2"-4',4,3538],
    ['2-3/4"-4',4,4248],['3"-4',4,4958]
  ];
  const unfMap = {'20':28,'18':24,'16':24,'14':20,'13':20,'12':18,'11':18,'10':16};
  const fineImp = coarseImp
    .map(([sz,p,base]) => {
      const fp = unfMap[p];
      return fp ? [sz.replace(`-${p}`,`-${fp}`), fp, base * 1.1] : null;
    })
    .filter(Boolean);
  const allImp = [...coarseImp, ...fineImp].sort((a,b) => {
    const parse = s => {
      const val = s.split('"')[0].replace('-', '+');
      try { return Function(`return ${val}`)(); }
      catch { return 0; }
    };
    const da = parse(a[0]), db = parse(b[0]);
    return da === db ? a[1] - b[1] : da - db;
  });

  const coarseMet = [
    ['M6×1.0',1.0,10],['M8×1.25',1.25,25],['M10×1.5',1.5,50],
    ['M12×1.75',1.75,88],['M16×2.0',2.0,218],['M20×2.5',2.5,426],
    ['M24×3.0',3.0,610],['M30×3.5',3.5,1000]
  ];
  const fineMet = coarseMet.map(([sz,p,nm]) => {
    const m = sz.match(/M(\d+)/)[1];
    const mp = {'6':0.75,'8':1,'10':1.25,'12':1.5,'16':1.5,'20':2,'24':3,'30':4}[m];
    return mp ? [`M${m}×${mp}`, mp, nm * 1.1] : null;
  }).filter(Boolean);
  const allMet = [...coarseMet, ...fineMet].sort((a,b) => {
    const da = parseFloat(a[0].slice(1)), db = parseFloat(b[0].slice(1));
    return da === db ? a[1] - b[1] : da - db;
  });

  // ——— Multipliers ———
  const classFactors = {
    '4.8':0.5,'8.8':1,'10.9':1.25,'12.9':1.41,'14.9':1.6,
    'Stainless':0.6,'Aluminum Alloy':0.5,'Delrin':0.02,'Titanium':0.75
  };
  const torqueCoeffs = {
    blackoxide:0.30, zincplated:0.25, cadmium:0.20,
    oiled:0.18, antiseize:0.12
  };
  const baseKt = 0.20;
  const headFactors = {
    hex:1, socket:1, pancake:0.8, countersunk:0.6, flanged:1
  };

  // ——— Grab elements ———
  const ids = ['sizeSys','finishType','boltClass','threadMaterial','headType'];
  const selects = ids.reduce((o,id) => {
    const el = document.getElementById(id);
    if (!el) console.error(`Missing #${id}`);
    o[id] = el;
    return o;
  }, {});
  const tbody = document.querySelector('#resultTable tbody');
  if (!tbody) console.error('Missing <tbody>');

  // ——— Render table ———
  function render() {
    const sizeSys       = selects.sizeSys.value;
    const finish        = selects.finishType.value;
    const boltClass     = selects.boltClass.value;
    const threadMat     = selects.threadMaterial.value;
    const headType      = selects.headType.value;

    const kF = (torqueCoeffs[finish]||baseKt) / baseKt;
    const cF = classFactors[boltClass] || 1;
    const hF = headFactors[headType] || 1;
    const data = sizeSys === 'imperial' ? allImp : allMet;

    tbody.innerHTML = '';
    data.forEach(([sz,p,base]) => {
      const tF = threadMat === 'matching'
        ? cF
        : (classFactors[threadMat] || cF);
      const raw = base * tF * kF * hF;
      const outFt = sizeSys==='imperial' ? raw : raw * 0.7376;
      const outNm = sizeSys==='metric'   ? raw : raw * 1.356;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${sz}</td><td>${p}</td><td>${outFt.toFixed(1)}</td><td>${outNm.toFixed(1)}</td>`;
      tbody.appendChild(tr);
    });
  }

  // ——— React to changes ———
  Object.values(selects).forEach(el => el.addEventListener('change', render));

  // initial
  render();
});