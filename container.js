function calculateBalance() {
  // 1) units & container size
  const wUnit = document.getElementById('weight-unit').value;
  const lUnit = document.getElementById('length-unit').value;
  const size  = parseFloat(document.getElementById('container-size').value) || 0;

  // 2) length & margin in chosen units
  let containerLen = size;
  if (lUnit === 'm') containerLen *= 0.3048;
  let margin = 8/12;
  if (lUnit === 'm') margin *= 0.3048;
  const center = containerLen / 2;
  const usable = containerLen - 2*margin;

  // 3) read inputs
  const weights = [...document.querySelectorAll('.weight')].map(i=>parseFloat(i.value)||0);
  const widths  = [...document.querySelectorAll('.width')]. map(i=>parseFloat(i.value)||0);
  const totalW     = weights.reduce((a,b)=>a+b,0);
  const totalWidth = widths.reduce((a,b)=>a+b,0);

  // 4) warning on over‑length
  let warn = '';
  if (totalWidth > usable) {
    warn = `⚠️ Total width (${totalWidth.toFixed(2)}) exceeds usable (${usable.toFixed(2)})`;
  }

  // 5) find active items
  const active = weights
    .map((w,i)=>w>0 && widths[i]>0 ? i : null)
    .filter(i=>i!==null);

  // prepare array
  let positions = Array(weights.length).fill(null);

  if (active.length === 2) {
    // Special 2‑item solver:
    const [i1, i2] = active;
    const w1 = weights[i1], w2 = weights[i2];
    const half1 = widths[i1]/2, half2 = widths[i2]/2;
    const min1 = margin + half1, max1 = containerLen - margin - half1;
    const min2 = margin + half2, max2 = containerLen - margin - half2;

    // clamp item1 to left margin
    let p1 = Math.min(Math.max(min1, center*0), max1); 
    // (actually just p1 = min1)
    p1 = min1;

    // solve p2 so CG = center
    let p2 = (center*totalW - w1*p1) / w2;

    // if p2 outside, clamp and recompute p1
    if (p2 > max2) {
      p2 = max2;
      p1 = (center*totalW - w2*p2)/w1;
      p1 = Math.min(Math.max(p1, min1), max1);
    }
    else if (p2 < min2) {
      p2 = min2;
      p1 = (center*totalW - w2*p2)/w1;
      p1 = Math.min(Math.max(p1, min1), max1);
    }

    positions[i1] = p1;
    positions[i2] = p2;
  }
  else {
    // Generic N‑item solver:
    // a) pack sequentially from left margin
    let cursor = margin;
    positions = widths.map(w => {
      const p = cursor + w/2;
      cursor += w;
      return p;
    });

    // b) shift to center CG
    const cgInit = positions.reduce((s,p,i)=>s + p*weights[i], 0)/(totalW||1);
    const shift  = center - cgInit;
    positions = positions.map(p=>p+shift);

    // c) clamp each
    let clamped = false;
    positions = positions.map((p,i) => {
      const half = widths[i]/2;
      const min = margin + half;
      const max = containerLen - margin - half;
      const cp = Math.min(Math.max(p, min), max);
      if (cp !== p) clamped = true;
      return cp;
    });
    if (clamped) {
      warn += (warn ? ' ' : '') + `⚠️ Some CGs were clamped into the 8″ margin`;
    }
  }

  // 6) render
  document.getElementById('total-weight').textContent =
    `${totalW.toFixed(2)} ${wUnit}`;
  document.getElementById('container-length-display').textContent =
    `${containerLen.toFixed(2)}`;
  document.getElementById('len-unit-label').textContent = lUnit;
  document.getElementById('warning').textContent = warn;

  const list = document.getElementById('positions-list');
  list.innerHTML = '';
  positions.forEach((p,i) => {
    if (p !== null) {
      const li = document.createElement('li');
      li.textContent = `Obj ${i+1}: CG at ${p.toFixed(2)} ${lUnit} from left`;
      list.appendChild(li);
    }
  });
}