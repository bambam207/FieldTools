// slingcalc.js
document.addEventListener("DOMContentLoaded", () => {
  const form  = document.getElementById("slingForm");
  const tbody = document.querySelector("#resultTable tbody");

  form.addEventListener("submit", e => {
    e.preventDefault();
    tbody.innerHTML = "";

    // grab inputs
    const wu    = document.getElementById("weightUnit").value;
    const lu    = document.getElementById("lengthUnit").value;
    const W     = parseFloat(document.getElementById("loadWeight").value);
    const d1    = parseFloat(document.getElementById("d1").value);
    const d2    = parseFloat(document.getElementById("d2").value);
    const H     = parseFloat(document.getElementById("height").value);
    const l1In  = parseFloat(document.getElementById("l1").value);
    const l2In  = parseFloat(document.getElementById("l2").value);

    if ([W,d1,d2,H].some(v => isNaN(v))) {
      alert("Please fill in all required fields (Load, D1, D2, H).");
      return;
    }

    let mode, L1, L2, θ1, θ2, T1, T2;

    if (!isNaN(l1In) && !isNaN(l2In)) {
      // ── Manual L₁/L₂ mode ──
      mode = "Manual";
      L1   = l1In;
      L2   = l2In;

      // angle from vertical: acos(H/L)
      const a1 = Math.acos(H / L1);
      const a2 = Math.acos(H / L2);
      θ1 = a1 * 180/Math.PI;
      θ2 = a2 * 180/Math.PI;

      // tensions by vector resolution
      T1 = W * Math.sin(a2) / Math.sin(a1 + a2);
      T2 = W * Math.sin(a1) / Math.sin(a1 + a2);

    } else {
      // ── Auto‑calc mode ──
      mode = "Calculated";
      // leg lengths
      L1 = Math.hypot(d1, H);
      L2 = Math.hypot(d2, H);

      // angles from horizontal: atan2(H, d)
      const a1 = Math.atan2(H, d1);
      const a2 = Math.atan2(H, d2);
      θ1 = a1 * 180/Math.PI;
      θ2 = a2 * 180/Math.PI;

      // tensions by vector resolution
      T1 = W * Math.sin(a2) / Math.sin(a1 + a2);
      T2 = W * Math.sin(a1) / Math.sin(a1 + a2);
    }

    // render results
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${mode}</td>
      <td>${L1.toFixed(2)} ${lu} &amp; ${θ1.toFixed(1)}°</td>
      <td>${L2.toFixed(2)} ${lu} &amp; ${θ2.toFixed(1)}°</td>
      <td>${T1.toFixed(2)} ${wu}</td>
      <td>${T2.toFixed(2)} ${wu}</td>
    `;
    tbody.appendChild(tr);
  });
});