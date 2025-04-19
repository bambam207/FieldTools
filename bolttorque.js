// bolttorque.js
(() => {
  // Imperial torque data (ft·lb for dry, hex-head)
  const torqueDataImp = [
    // Grade 2
    { size:'1/4"-20', pitch:20, clazz:'4.8', ftlb:3 },  // class 4.8 ~ half of 8.8
    { size:'1/4"-20', pitch:20, clazz:'8.8', ftlb:6 },
    { size:'1/4"-20', pitch:20, clazz:'10.9', ftlb:9 },
    { size:'1/4"-20', pitch:20, clazz:'12.9', ftlb:11 },
    { size:'1/4"-20', pitch:20, clazz:'14.9', ftlb:13 },
    // ... repeat for all imperial sizes up to 3" (UNC pitches)
    { size:'3"-8', pitch:8, clazz:'8.8', ftlb:800 },   // example value; replace with accurate data
    // Stainless (~60% of class 8.8)
    { size:'1/4"-20', pitch:20, clazz:'Stainless', ftlb:3.6 },
    // Aluminum Alloy
    { size:'1/4"-20', pitch:20, clazz:'Aluminum Alloy', ftlb:4 },
    // Delrin (plastic)
    { size:'#10-32', pitch:32, clazz:'Delrin', ftlb:0.3 }
  ];

  // Metric torque data (N·m for dry, hex-head)
  const torqueDataMet = [
    // Class 4.8 (approx 50% of 8.8)
    { size:'M6×1.0', pitch:1.0, clazz:'4.8', nm:5 },
    { size:'M8×1.25', pitch:1.25, clazz:'4.8', nm:12.5 },
    { size:'M10×1.5', pitch:1.5, clazz:'4.8', nm:25 },
    // Class 8.8
    { size:'M6×1.0', pitch:1.0, clazz:'8.8', nm:10 },
    { size:'M8×1.25', pitch:1.25, clazz:'8.8', nm:25 },
    { size:'M10×1.5', pitch:1.5, clazz:'8.8', nm:50 },
    { size:'M12×1.75', pitch:1.75, clazz:'8.8', nm:88 },
    { size:'M16×2.0', pitch:2.0, clazz:'8.8', nm:218 },
    { size:'M20×2.5', pitch:2.5, clazz:'8.8', nm:426 },
    // Class 10.9
    { size:'M6×1.0', pitch:1.0, clazz:'10.9', nm:15 },
    { size:'M8×1.25', pitch:1.25, clazz:'10.9', nm:38 },
    { size:'M10×1.5', pitch:1.5, clazz:'10.9', nm:72 },
    { size:'M12×1.75', pitch:1.75, clazz:'10.9', nm:126 },
    { size:'M16×2.0', pitch:2.0, clazz:'10.9', nm:312 },
    { size:'M20×2.5', pitch:2.5, clazz:'10.9', nm:610 },
    // Class 12.9
    { size:'M6×1.0', pitch:1.0, clazz:'12.9', nm:18 },
    { size:'M8×1.25', pitch:1.25, clazz:'12.9', nm:43 },
    { size:'M10×1.5', pitch:1.5, clazz:'12.9', nm:84 },
    { size:'M12×1.75', pitch:1.75, clazz:'12.9', nm:146 },
    { size:'M16×2.0', pitch:2.0, clazz:'12.9', nm:365 },
    { size:'M20×2.5', pitch:2.5, clazz:'12.9', nm:712 },
    // Class 14.9 (~1.16×12.9)
    { size:'M6×1.0', pitch:1.0, clazz:'14.9', nm:21 },
    { size:'M8×1.25', pitch:1.25, clazz:'14.9', nm:50 },
    { size:'M10×1.5', pitch:1.5, clazz:'14.9', nm:97 },
    { size:'M12×1.75', pitch:1.75, clazz:'14.9', nm:169 },
    { size:'M16×2.0', pitch:2.0, clazz:'14.9', nm:424 },
    { size:'M20×2.5', pitch:2.5, clazz:'14.9', nm:825 },
    // Stainless
    { size:'M10×1.5', pitch:1.5, clazz:'Stainless', nm:42 },
    // Aluminum Alloy
    { size:'M10×1.5', pitch:1.5, clazz:'Aluminum Alloy', nm:15 },
    // Delrin
    { size:'M5×0.8', pitch:0.8, clazz:'Delrin', nm:0.3 }
  ];

  const form = document.getElementById('boltForm');
  const tbody = document.querySelector('#resultTable tbody');

  function lookupData() {
    const sys = form.sizeSys.value;
    const clazz = form.boltClass.value;
    const threadMat = form.threadMaterial.value;
    const head = form.headType.value;
    const cond = form.lubed.value;

    // choose dataset
    let data = sys === 'imperial' ? torqueDataImp : torqueDataMet;

    // override by threadMaterial if not matching
    if (threadMat !== 'matching') {
      if (threadMat === 'steel')      data = data.filter(d => d.clazz === '4.8');
      else if (threadMat === 'stainless') data = data.filter(d => d.clazz === 'Stainless');
      else if (threadMat === 'aluminum')  data = data.filter(d => d.clazz === 'Aluminum Alloy');
      else if (threadMat === 'delrin')    data = data.filter(d => d.clazz === 'Delrin');
    } else {
      data = data.filter(d => d.clazz === clazz);
    }

    return { data, head, cond };
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const { data, head, cond } = lookupData();

    const condFactor = cond === 'dry' ? 1 : 0.75;
    let headFactor = 1;
    if (head === 'pancake')    headFactor = 0.8;
    if (head === 'countersunk') headFactor = 0.6;

    tbody.innerHTML = '';
    data.forEach(d => {
      // compute final torque
      const ftlb = d.ftlb != null
        ? d.ftlb * condFactor * headFactor
        : (d.nm * 0.7376) * condFactor * headFactor;
      const nm = d.nm != null
        ? d.nm * condFactor * headFactor
        : (d.ftlb * 1.356) * condFactor * headFactor;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.size}</td>
        <td>${d.pitch}</td>
        <td>${ftlb.toFixed(1)}</td>
        <td>${nm.toFixed(1)}</td>
      `;
      tbody.appendChild(tr);
    });
  });
})();