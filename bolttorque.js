// bolttorque.js
document.addEventListener('DOMContentLoaded', () => {
  // … [allImp & allMet data setup unchanged] …

  // Multipliers
  const classFactors = {
    '4.8':0.5,'8.8':1,'10.9':1.25,'12.9':1.41,'14.9':1.6,
    'Stainless':0.6,'Aluminum Alloy':0.5,'Delrin':0.02,'Titanium':0.75
  };
  const torqueCoeffs = {
    none:0.35, blackoxide:0.30, zincplated:0.25,
    cadmium:0.20, oiled:0.18, antiseize:0.12
  };
  const baseKt = 0.20;
  const headFactors = { hex:1, socket:1, pancake:0.8, countersunk:0.6, flanged:1 };

  // Map threadMaterial to a classFactor key
  const threadMap = {
    matching:      null,
    'nut-grade2':  '4.8',
    'nut-grade5':  '8.8',
    'nut-grade8':  '10.9',
    'stainless-nut':'Stainless',
    'aluminum-nut':'Aluminum Alloy',
    'delrin-nut':  'Delrin',
    'titanium-nut':'Titanium'
  };

  // DOM refs
  const sizeSys        = document.getElementById('sizeSys');
  const finishType     = document.getElementById('finishType');
  const boltClass      = document.getElementById('boltClass');
  const threadMaterial = document.getElementById('threadMaterial');
  const headType       = document.getElementById('headType');
  const tbody          = document.querySelector('#resultTable tbody');

  // render function
  function render() {
    const sys    = sizeSys.value;
    const finish = finishType.value;
    const clazz  = boltClass.value;
    const thread = threadMaterial.value;
    const head   = headType.value;

    const kF = (torqueCoeffs[finish] || baseKt) / baseKt;
    const cF = classFactors[clazz] || 1;
    const hF = headFactors[head] || 1;

    // pick correct dataset
    const data = sys === 'imperial' ? allImp : allMet;

    tbody.innerHTML = '';
    data.forEach(([sz,p,base]) => {
      // override bolt class if threadMaterial specifies a different nut
      const tmKey = threadMap[thread];
      const tF = tmKey ? (classFactors[tmKey]||cF) : cF;

      const raw = base * tF * kF * hF;
      const outFt = sys === 'imperial' ? raw : raw * 0.7376;
      const outNm = sys === 'metric'   ? raw : raw * 1.356;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${sz}</td>
        <td>${p}</td>
        <td>${outFt.toFixed(1)}</td>
        <td>${outNm.toFixed(1)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // attach listeners
  [sizeSys, finishType, boltClass, threadMaterial, headType]
    .forEach(el => el.addEventListener('change', render));

  // initial render
  render();
});