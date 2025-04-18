// slingcalc.js
document.addEventListener("DOMContentLoaded", () => {
  const form  = document.getElementById("slingForm");
  const tbody = document.querySelector("#resultTable tbody");

  form.addEventListener("submit", e => {
    e.preventDefault();
    tbody.innerHTML = "";

    const W  = parseFloat(document.getElementById("loadWeight").value);
    const C  = parseFloat(document.getElementById("cg").value);
    const H  = parseFloat(document.getElementById("hookHeight").value);
    const L1i = parseFloat(document.getElementById("l1").value);
    const L2i = parseFloat(document.getElementById("l2").value);
    const wu = document.getElementById("weightUnit").value;
    const lu = document.getElementById("lengthUnit").value;

    if (isNaN(W) || isNaN(C)) {
      alert("Please enter both Total Load and Horizontal CG.");
      return;
    }

    // 1) Manual mode if user provided H, L1 & L2
    if (!isNaN(H) && !isNaN(L1i) && !isNaN(L2i)) {
      const a1 = Math.acos(H / L1i);
      const a2 = Math.acos(H / L2i);
      const θ1 = a1 * 180/Math.PI;
      const θ2 = a2 * 180/Math.PI;
      const T1 = W * Math.sin(a2) / Math.sin(a1 + a2);
      const T2 = W * Math.sin(a1) / Math.sin(a1 + a2);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>Manual</td>
        <td>${L1i.toFixed(2)} ${lu} & ${θ1.toFixed(1)}°</td>
        <td>${L2i.toFixed(2)} ${lu} & ${θ2.toFixed(1)}°</td>
        <td>${T1.toFixed(2)} ${wu}</td>
        <td>${T2.toFixed(2)} ${wu}</td>
      `;
      tbody.appendChild(tr);
      return;
    }

    // 2) Preset angles mode
    [60, 50, 45, 35].forEach(angle => {
      const rad = angle * Math.PI/180;
      const L   = C / Math.cos(rad);
      const T   = W / (2 * Math.sin(rad));

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>Preset ${angle}°</td>
        <td>${L.toFixed(2)} ${lu} & ${angle}°</td>
        <td>${L.toFixed(2)} ${lu} & ${angle}°</td>
        <td>${T.toFixed(2)} ${wu}</td>
        <td>${T.toFixed(2)} ${wu}</td>
      `;
      tbody.appendChild(tr);
    });
  });
});