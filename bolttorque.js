// bolttorque.js
(() => {
  // … [allImp and allMet arrays from before] …

  // multipliers for class/material
  const classFactors = {
    '4.8':0.5, '8.8':1, '10.9':1.25, '12.9':1.41, '14.9':1.6,
    'Stainless':0.6, 'Aluminum Alloy':0.5, 'Delrin':0.02, 'Titanium':0.75
  };

  // precise torque‐coefficients (Kt) from MechaniCalc
  const torqueCoeffs = {
    blackoxide: 0.30,
    zincplated: 0.25,
    cadmium:   0.20,
    oiled:     0.18,
    antiseize: 0.12
  };
  const baseKt = 0.20; // baseline Kt of the source tables

  const headFactors = {
    hex: 1,
    socket: 1,
    pancake: 0.8,
    countersunk: 0.6,
    flanged: 1
  };

  const form = document.getElementById('boltForm');
  const tbody = document.querySelector('#resultTable tbody');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const sys    = form.sizeSys.value;        // imperial|metric
    const finish = form.finishType.value;     // blackoxide, zincplated, …
    const clazz  = form.boltClass.value;      // e.g. 10.9 or Titanium
    const thread = form.threadMaterial.value; // matching, steel, …
    const head   = form.headType.value;       // hex, pancake, …

    const kF     = (torqueCoeffs[finish]||baseKt)/baseKt;
    const cF     = classFactors[clazz]||1;
    const hF     = headFactors[head]||1;

    const data   = sys==='imperial' ? allImp : allMet;
    tbody.innerHTML = '';

    data.forEach(([size,pitch,base]) => {
      // allow thread override if not matching
      const tFactor = thread==='matching' ? cF : (classFactors[thread]||cF);
      const raw     = base * tFactor * kF * hF;
      const imp     = sys==='imperial' ? raw : raw*0.7376;
      const met     = sys==='metric'   ? raw : raw*1.356;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${size}</td>
        <td>${pitch}</td>
        <td>${imp.toFixed(1)}</td>
        <td>${met.toFixed(1)}</td>
      `;
      tbody.appendChild(tr);
    });
  });
})();