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
  const unfMap = { '20':28,'18':24,'16':24,'14':20,'13':20,'12':18,'11':18,'10':16 };
  const fineImp = coarseImp
    .map(([sz,p,base]) => {
      const fp = unfMap[p];
      return fp ? [ sz.replace(`-${p}`, `-${fp}`), fp, base * 1.1 ] : null;
    })
    .filter(Boolean);

  function parseImperialSize(sz) {
    const raw = sz.split('"')[0];
    if (raw.includes('-')) {
      const [maj, frac] = raw.split('-');
      const [n, d] = frac.split('/');
      return parseInt(maj) + (parseInt(n)/parseInt(d));
    }
    if (raw.includes('/')) {
      const [n, d] = raw.split('/');
      return parseInt(n)/parseInt(d);
    }
    return parseFloat(raw) || 0;
  }

  const allImp = [...coarseImp, ...fineImp].sort((a, b) => {
    const da = parseImperialSize(a[0]);
    const db = parseImperialSize(b[0]);
    if (da !== db) return da - db;
    return a[1] - b[1];
  });

  const coarseMet = [
    ['M6×1.0',1.0,10],['M8×1.25',1.25,25],['M10×1.5',1.5,50],
    ['M12×1.75',1.75,88],['M16×2.0',2.0,218],['M20×2.5',2.5,426],
    ['M24×3.0',3.0,610],['M30×3.5',3.5,1000]
  ];
  const fineMet = coarseMet.map(([sz,p,nm]) => {
    const m = sz.match(/M(\d+)/)[1];
    const map = { '6':0.75,'8':1,'10':1.25,'12':1.5,'16':1.5,'20':2,'24':3,'30':4 };
    const fp = map[m];
    return fp ? [`M${m}×${fp}`, fp, nm * 1.1] : null;
  }).filter(Boolean);

  function parseMetricSize(sz) {
    return parseFloat(sz.slice(1, sz.indexOf('×'))) || 0;
  }

  const allMet = [...coarseMet, ...fineMet].sort((a, b) => {
    const da = parseMetricSize(a[0]);
    const db = parseMetricSize(b[0]);
    if (da !== db) return da - db;
    return a[1] - b[1];
  });

  // ——— Multipliers ———
  const classFactors = {
    '4.8':0.5, '8.8':1, '10.9':1.25, '12.9':1.41, '14.9':1.6,
    'Stainless':0.6, 'Aluminum Alloy':0.5, 'Delrin':0.02, 'Titanium':0.75
  };
  const torqueCoeffs = {
    none: