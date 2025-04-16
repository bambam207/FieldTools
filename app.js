// ----------------- Sling Load Calculator Helpers -----------------
function getConversionFactors() {
  const wU = document.getElementById('weightUnit')?.value || 'lbs';
  const lU = document.getElementById('lengthUnit')?.value || 'ft';
  let wF=1, wD='lbs';
  if (wU==='us_ton')      { wF=2000;    wD='US tons'; }
  else if(wU==='kg')      { wF=2.20462; wD='kg';      }
  else if(wU==='metric_ton') { wF=2204.62; wD='metric tons'; }
  let lF=1, lD='ft';
  if (lU==='m') { lF=3.28084; lD='m'; }
  return { wF,lF,wD,lD };
}

function calcSling() {
  const { wF,lF,wD,lD } = getConversionFactors();
  const load = parseFloat(document.getElementById('load').value)*wF;
  const D1   = parseFloat(document.getElementById('d1').value)*lF;
  const D2   = parseFloat(document.getElementById('d2').value)*lF;
  const H    = parseFloat(document.getElementById('height').value)*lF;
  const L1i  = parseFloat(document.getElementById('l1').value)*lF;
  const L2i  = parseFloat(document.getElementById('l2').value)*lF;
  const tbody = document.querySelector('#resultTable tbody');
  tbody.innerHTML='';

  if (isNaN(load)||isNaN(D1)||isNaN(D2)) {
    tbody.innerHTML='<tr><td colspan=5>Please enter Load, D1 & D2.</td></tr>';
    return;
  }
  const useAngles = (isNaN(H) && (isNaN(L1i)||isNaN(L2i)));

  if (useAngles) {
    [60,50,45,35].forEach(θdeg=>{
      const θ=θdeg*Math.PI/180;
      const L1b=D1/Math.cos(θ), L2b=D2/Math.cos(θ);
      const H1b=D1*Math.tan(θ),   H2b=D2*Math.tan(θ);
      const T1b=(load*D2*L1b)/(H1b*(D1+D2));
      const T2b=(load*D1*L2b)/(H2b*(D1+D2));
      const L1=(L1b/lF).toFixed(2), L2=(L2b/lF).toFixed(2);
      const T1=(T1b/wF).toFixed(2),T2=(T2b/wF).toFixed(2);
      const tr=document.createElement('tr');
      tr.innerHTML=`
        <td>Preset ${θdeg}°</td>
        <td>${L1} ${lD}<br>${θdeg}°</td>
        <td>${L2} ${lD}<br>${θdeg}°</td>
        <td>${T1} ${wD}</td>
        <td>${T2} ${wD}</td>`;
      tbody.appendChild(tr);
    });
    return;
  }

  // Manual or auto legs:
  let mode, L1b, L2b;
  if (!isNaN(L1i)&&!isNaN(L2i)) {
    L1b=L1i; L2b=L2i; mode='Manual Legs';
  } else {
    L1b=Math.hypot(D1,H); L2b=Math.hypot(D2,H); mode='Auto Legs(fromH)';
  }
  const H1b=Math.sqrt(L1b*L1b-D1*D1),
        H2b=Math.sqrt(L2b*L2b-D2*D2);
  if (H1b<=0||H2b<=0) {
    tbody.innerHTML='<tr><td colspan=5>Invalid: L must exceed D.</td></tr>';
    return;
  }
  const a1=(Math.asin(H1b/L1b)*180/Math.PI).toFixed(1),
        a2=(Math.asin(H2b/L2b)*180/Math.PI).toFixed(1);
  const T1b=(load*D2*L1b)/(H1b*(D1+D2)),
        T2b=(load*D1*L2b)/(H2b*(D1+D2));
  const L1=(L1b/lF).toFixed(2), L2=(L2b/lF).toFixed(2);
  const T1=(T1b/wF).toFixed(2), T2=(T2b/wF).toFixed(2);
  const tr=document.createElement('tr');
  tr.innerHTML=`
    <td>${mode}</td>
    <td>${L1} ${lD}<br>${a1}°</td>
    <td>${L2} ${lD}<br>${a2}°</td>
    <td>${T1} ${wD}</td>
    <td>${T2} ${wD}</td>`;
  tbody.appendChild(tr);
}

// ----------------- Container Balance Calculator -----------------
function calcContainer() {
  // 1) units & rack
  const wU = document.getElementById('cbWeightUnit').value;
  const lU = document.getElementById('cbLengthUnit').value;
  const L  = parseFloat(document.getElementById('cbContainerType').value); // ft
  const m  = 8/12;    // margin in ft
  const C  = L/2;     // desired CG

  // 2) converters
  const toFt = v => lU==='m' ? v/0.3048 : v;
  const toLbs = v => {
    if (wU==='kg') return v*2.20462;
    if (wU==='us_ton') return v*2000;
    if (wU==='metric_ton') return v*2204.62;
    return v;
  };
  const fromLbs = (v) => {
    if (wU==='kg') return (v/2.20462).toFixed(2);
    if (wU==='us_ton') return (v/2000).toFixed(2);
    if (wU==='metric_ton') return (v/2204.62).toFixed(2);
    return v.toFixed(2);
  };

  // 3) gather objects
  let objs=[];
  for(let i=1;i<=6;i++){
    const wR=parseFloat(document.getElementById(`cbLoad${i}W`).value);
    const dR=parseFloat(document.getElementById(`cbLoad${i}D`).value);
    if(isNaN(wR)||isNaN(dR)) continue;
    const wL=toLbs(wR);
    const dF=toFt(dR);
    objs.push({i,wR,dR,wL,dF});
  }
  if(!objs.length){
    document.getElementById('containerResult').textContent='Enter at least one object.';
    return;
  }

  // 4) prefix centers CIP[i] and sum w*CIP
  let S=0, sumWC=0;
  let prefix=0;
  objs.forEach(o=>{
    const CIP = m + prefix + o.dF/2;
    S += o.wL;
    sumWC += o.wL * CIP;
    o.CIP = CIP;
    prefix += o.dF;
  });

  // 5) compute shift g to satisfy leveling: g=(S*C - sumWC)/S
  const bandW = prefix;               // sum all widths
  const maxG  = L - 2*m - bandW;      // max breathing
  let g = (S*C - sumWC)/S;
  if (g<0) g=0;
  if (g>maxG) g=maxG;

  // 6) final positions x = CIP + g
  objs.forEach(o=>{
    o.xF = o.CIP + g;
  });

  // 7) render
  const tbody=document.querySelector('#containerTable tbody');
  tbody.innerHTML='';
  objs.forEach(o=>{
    const wDisp=fromLbs(o.wL);
    const dDisp=(lU==='m'? (o.dF*0.3048).toFixed(2): o.dF.toFixed(2));
    const xDisp=(lU==='m'? (o.xF*0.3048).toFixed(2): o.xF.toFixed(2));
    const tr=document.createElement('tr');
    tr.innerHTML=`
      <td style="border:1px solid #ccc;padding:8px">Obj ${o.i}</td>
      <td style="border:1px solid #ccc;padding:8px">${wDisp} ${wU}</td>
      <td style="border:1px solid #ccc;padding:8px">${dDisp} ${lU}</td>
      <td style="border:1px solid #ccc;padding:8px">${xDisp} ${lU}</td>`;
    tbody.appendChild(tr);
  });

  // 8) summary
  document.getElementById('containerResult').textContent =
    `Block leveled (CG=${C.toFixed(2)} ft), breathing gaps = ${g.toFixed(2)} ft.`;
}