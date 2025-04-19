// bolttorque.js
(() => {
  // Base torque data (ft·lb for dry, hex-head conditions)
  const torqueData = [
    { size: '1/4"-20', pitch: 20, material: 'Grade 2', ftlb: 6 },
    { size: '5/16"-18', pitch: 18, material: 'Grade 2', ftlb: 12 },
    { size: '3/8"-16', pitch: 16, material: 'Grade 2', ftlb: 22 },
    { size: '7/16"-14', pitch: 14, material: 'Grade 2', ftlb: 35 },
    { size: '1/2"-13', pitch: 13, material: 'Grade 2', ftlb: 50 },
    { size: '5/8"-11', pitch: 11, material: 'Grade 2', ftlb: 110 },
    { size: '3/4"-10', pitch: 10, material: 'Grade 2', ftlb: 150 },
    { size: '1/4"-20', pitch: 20, material: 'Grade 5', ftlb: 10 },
    { size: '5/16"-18', pitch: 18, material: 'Grade 5', ftlb: 21 },
    { size: '3/8"-16', pitch: 16, material: 'Grade 5', ftlb: 35 },
    { size: '7/16"-14', pitch: 14, material: 'Grade 5', ftlb: 55 },
    { size: '1/2"-13', pitch: 13, material: 'Grade 5', ftlb: 80 },
    { size: '5/8"-11', pitch: 11, material: 'Grade 5', ftlb: 180 },
    { size: '3/4"-10', pitch: 10, material: 'Grade 5', ftlb: 245 },
    { size: '1/4"-20', pitch: 20, material: 'Grade 8', ftlb: 14 },
    { size: '5/16"-18', pitch: 18, material: 'Grade 8', ftlb: 29 },
    { size: '3/8"-16', pitch: 16, material: 'Grade 8', ftlb: 50 },
    { size: '7/16"-14', pitch: 14, material: 'Grade 8', ftlb: 80 },
    { size: '1/2"-13', pitch: 13, material: 'Grade 8', ftlb: 115 },
    { size: '5/8"-11', pitch: 11, material: 'Grade 8', ftlb: 260 },
    { size: '3/4"-10', pitch: 10, material: 'Grade 8', ftlb: 350 },
    { size: '1/4"-20', pitch: 20, material: 'Stainless', ftlb: 6 },
    { size: '5/16"-18', pitch: 18, material: 'Stainless', ftlb: 12.6 },
    { size: '3/8"-16', pitch: 16, material: 'Stainless', ftlb: 21 },
    { size: '7/16"-14', pitch: 14, material: 'Stainless', ftlb: 33 },
    { size: '1/2"-13', pitch: 13, material: 'Stainless', ftlb: 48 },
    { size: '5/8"-11', pitch: 11, material: 'Stainless', ftlb: 108 },
    { size: '3/4"-10', pitch: 10, material: 'Stainless', ftlb: 147 },
    { size: '5/16"-18', pitch: 18, material: 'Aluminum Alloy', ftlb: 8 },
    { size: '3/8"-16', pitch: 16, material: 'Aluminum Alloy', ftlb: 11.2 },
    { size: '1/2"-13', pitch: 13, material: 'Aluminum Alloy', ftlb: 20 },
    { size: '5/8"-11', pitch: 11, material: 'Aluminum Alloy', ftlb: 32 },
    { size: '3/4"-10', pitch: 10, material: 'Aluminum Alloy', ftlb: 48 },
    { size: '#10-32', pitch: 32, material: 'Delrin', ftlb: 0.25 },
    { size: '7/16"-14', pitch: 14, material: 'Delrin', ftlb: 1.67 }
  ];

  const form = document.getElementById('boltForm');
  const tbody = document.querySelector('#resultTable tbody');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const boltMat = form.boltMaterial.value;
    const threadMat = form.threadMaterial.value;
    const head = form.headType.value;
    const cond = form.lubed.value;
    const unit = form.unitSys.value;

    let materialForCalc;
    switch (threadMat) {
      case 'matching':  materialForCalc = boltMat;       break;
      case 'steel':     materialForCalc = 'Grade 2';    break;
      case 'aluminum':  materialForCalc = 'Aluminum Alloy'; break;
      case 'stainless': materialForCalc = 'Stainless';   break;
      case 'delrin':    materialForCalc = 'Delrin';      break;
    }

    const condFactor = cond === 'dry' ? 1 : 0.75;
    let headFactor = 1;
    if (head === 'pancake') headFactor = 0.8;
    if (head === 'countersunk') headFactor = 0.6;

    const filtered = torqueData.filter(d => d.material === materialForCalc);
    renderTable(filtered, condFactor, headFactor, unit);
  });

  function renderTable(data, condFactor, headFactor, unit) {
    tbody.innerHTML = '';
    data.forEach(({ size, pitch, ftlb }) => {
      const finalFtlb = ftlb * condFactor * headFactor;
      const finalNm = finalFtlb * 1.356;
      const displayImperial = unit === 'imperial'
        ? finalFtlb.toFixed(1)
        : (finalNm * 0.7376).toFixed(1);
      const displayMetric = unit === 'metric'
        ? finalNm.toFixed(1)
        : (finalFtlb * 1.356).toFixed(1);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${size}</td>
        <td>${pitch}</td>
        <td>${displayImperial}</td>
        <td>${displayMetric}</td>
      `;
      tbody.appendChild(tr);
    });
  }
})();