// slingcalc.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("slingForm");
  const tbody = document.querySelector("#resultTable tbody");

  form.addEventListener("submit", e => {
    e.preventDefault();
    tbody.innerHTML = "";

    const wu = document.getElementById("weightUnit").value;
    const lu = document.getElementById("lengthUnit").value;
    const W  = parseFloat(document.getElementById("loadWeight").value);
    const d1 = parseFloat(document.getElementById("d1").value);
    const d2 = parseFloat(document.getElementById("d2").value);
    const H  = parseFloat(document.getElementById("height").value);

    if ([W,d1,d2,H].some(v => isNaN(v))) {
      alert("Please fill in all required fields.");
      return;
    }

    // leg lengths
    const L1 = Math.hypot(d1, H);
    const L2 = Math.hypot(d2, H);
    // sling angles (deg)
    const a1 = Math.atan2(H, d1);
    const a2 = Math.atan2(H, d2);
    const θ1 = a1 * 180/Math.PI;
    const θ2 = a2 * 180/Math.PI;
    // tensions by vector resolution
    const T1 = W * Math.sin(a2) / Math.sin(a1 + a2);
    const T2 = W * Math.sin(a1) / Math.sin(a1 + a2);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Calculated</td>
      <td>${L1.toFixed(2)} ${lu} &amp; ${θ1.toFixed(1)}°</td>
      <td>${L2.toFixed(2)} ${lu} &amp; ${θ2.toFixed(1)}°</td>
      <td>${T1.toFixed(2)} ${wu}</td>
      <td>${T2.toFixed(2)} ${wu}</td>
    `;
    tbody.appendChild(tr);
  });
});