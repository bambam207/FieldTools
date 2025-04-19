// bolttorque.js
(() => {
  // Standard imperial UNC coarse (Class 8.8 baseline) – ft·lb at dry, hex-head
  const coarseImp = [
    ['1/4"-20',20,6],
    ['5/16"-18',18,17],
    ['3/8"-16',16,35],
    ['7/16"-14',14,55],
    ['1/2"-13',13,80],
    ['9/16"-12',12,110],
    ['5/8"-11',11,180],
    ['3/4"-10',10,245],
    ['7/8"-9',9,350],
    ['1"-8',8,454],
    ['1-1/8"-7',7,607],
    ['1-1/4"-7',7,796],
    ['1-3/8"-6',6,876],
    ['1-1/2"-6',6,1112],
    ['1-3/4"-5',5,1538],
    ['2"-4.5',4.5,2199],
    ['2-1/4"-4',4,2829],
    ['2-1/2"-4',4,3538],
    ['2-3/4"-4',4,4248],
    ['3"-4',4,4958]
  ];

  // UNC→UNF fine-pitch map (≈10% higher torque)
  const unfMap = {'20':28,'18':24,'16':24,'14':20,'13':20,'12':18,'11':18,'10':16};
  const fineImp = coarseImp
    .map(([sz,p,base]) => {
      const fp = unfMap[p];
      if (!fp) return null;
      return [ sz.replace(`-${p}`,`-${fp}`), fp, base * 1.1 ];
    })
    .filter(Boolean);

  // Titanium imperial recommended (ft·lb) – grade‑5 Ti-6Al‑4V (w/ MoS₂ paste)  [oai_citation_attribution:0‡Smith Titanium](https://www.smithti.com/torque-recommendations-for-titanium-bolts/?utm_source=chatgpt.com)
  const titaniumImp = [
    ['1/4"-20',20,60],
    ['1/4"-28',28,72],
    ['5/16"-18',18,192],
    ['5/16"-24',24,204],
    ['3/8"-16',16,22],
    ['3/8"-24',24,26],
    ['7/16"-14',14,30],
    ['7/16"-20',20,34],
    ['1/2"-13',13,40],
    ['1/2"-20',20,42],
    ['5/8"-11',11,50],
    ['5/8"-18',18,54],
    ['3/4"-10',10,60],
    ['3/4"-16',16,66]
  ];

  // Metric coarse baseline Class 8.8 – N·m
  const coarseMet = [
    ['M6×1.0',1.0,10],
    ['M8×1.25',1.25,25],
    ['M10×1.5',1.5,50],
    ['M12×1.75',1.75,88],
    ['M16×2.0',2.0,218],
    ['M20×2.5',2.5,426],
    ['M24×3.0',3.0,610],
    ['M30×3.5',3.5,1000]
  ];
  // Metric fine-pitch (~10% higher)
  const fineMet = coarseMet.map(([sz,p,nm]) => {
    const m = sz.match(/M(\d+)/)[1];
    const fpMap = {'6':0.75,'8':1,'10':1.25,'12':1.5,'16':1.5,'20':2,'24':3,'30':4};
    const fp = fpMap[m];
    if (!fp) return null;
    return [`M${m}×${fp}`, fp, nm * 1.1];
  }).filter(Boolean);

  // Titanium metric (converted from imperial  [oai_citation_attribution:1‡ricky leddy](https://titan-x.com/about-titanium-3-w.asp?utm_source=chatgpt.com))
  const titaniumMet = titaniumImp.map(([sz,p,ft]) => {
    const nm = ft * 1.356;  // ft·lb → N·m
    return [sz.replace(/"-/, '×').replace(/"/,''), p, nm];
  });

  // Combined sorted lists
  const allImp = [...coarseImp, ...fineImp].sort((a,b) => {
    // parse diameter for sorting
    const parse = s => {
      const num = s.split('"')[0].replace(/-/,'+').replace(/×.*/,'');
      return Function(`return ${num}`)();
    };
    const da = parse(a[0]), db = parse(b[0]);
    if (da !== db) return da - db;
    return a[1] - b[1];
  });
  const allMet = [...coarseMet, ...fineMet].sort((a,b) => {
    const da = parseFloat(a[0].slice(1)), db = parseFloat(b[0].slice(1));
    if (da !== db) return da - db;
    return a[1] - b[1];
  });

  // Class / material multipliers
  const classFactors = {
    '4.8': 0.5, '8.8':1, '10.9':1.25, '12.9':1.41, '14.9':1.6,
    'Stainless':0.6, 'Aluminum Alloy':0.5, 'Delrin':0.02
  };

  const condFactor = c => c==='wet'?0.75:1;
  const headFactor = h => h==='pancake'?0.8:(h==='countersunk'?0.6:1);

  const form = document.getElementById('boltForm');
  const tbody = document.querySelector('#resultTable tbody');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const sys   = form.sizeSys.value;     // 'imperial'|'metric'
    const clazz = form.boltClass.value;   // '8.8','Titanium', etc.
    const cond  = form.lubed.value;       // 'dry'|'wet'
    const head  = form.headType.value;

    const cF = clazz==='Titanium'? 1 : classFactors[clazz]||1;
    const fF = condFactor(cond);
    const hF = headFactor(head);

    tbody.innerHTML = '';
    if (clazz==='Titanium') {
      const data = sys==='imperial'? titaniumImp : titaniumMet;
      data.forEach(([sz,p,base]) => {
        const raw = base * fF * hF;
        const tFt = sys==='imperial'? raw : raw*0.7376;
        const tNm = sys==='metric'  ? raw : raw*1.356;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${sz}</td><td>${p}</td>
          <td>${tFt.toFixed(1)}</td>
          <td>${tNm.toFixed(1)}</td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      const data = sys==='imperial'? allImp : allMet;
      data.forEach(([sz,p,base]) => {
        const raw = base * cF * fF * hF;
        const tFt = sys==='imperial'? raw : raw*0.7376;
        const tNm = sys==='metric'  ? raw : raw*1.356;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${sz}</td><td>${p}</td>
          <td>${tFt.toFixed(1)}</td>
          <td>${tNm.toFixed(1)}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  });
})();