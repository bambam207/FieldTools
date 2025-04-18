// slingcalc.js
document.addEventListener("DOMContentLoaded", () => {
  const form  = document.getElementById("slingForm");
  const tbody = document.querySelector("#resultTable tbody");

  form.addEventListener("submit", e => {
    e.preventDefault();
    tbody.innerHTML = "";

    const wu = document.getElementById("weightUnit").value;
    const lu = document.getElementById("lengthUnit").value;
    const W  = parseFloat(document.getElementById("loadWeight").value);
    const C  = parseFloat(document.getElementById("cg").value);

    if (isNaN(W) || isNaN(C)) {
      alert("Please enter both Total Load and CG distance.");
      return;
    }

    // preset angles in degrees
    const angles = [60, 50, 45, 35];

    angles.forEach(angle => {
      const rad = angle * Math.PI/180;
      // leg length = C / cosθ
      const L = C / Math.cos(rad);
      // tension each = W / (2 * sinθ)
      const T = W / (2 * Math.sin(rad));

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>Preset ${angle}°</td>
        <td>${L.toFixed(2)} ${lu} & ${angle}°</td>
        <td>${L.toFixed(2)} ${lu} & ${angle}°</td>
        <td>${T.toFixed(2)} ${wu}</td>
      `;
      tbody.appendChild(tr);
    });
  });
});