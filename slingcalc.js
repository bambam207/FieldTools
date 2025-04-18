// slingcalc.js
document.addEventListener("DOMContentLoaded", () => {
  const form  = document.getElementById("slingForm");
  const tbody = document.querySelector("#resultTable tbody");

  form.addEventListener("submit", e => {
    e.preventDefault();
    tbody.innerHTML = "";  // clear old results

    // fetch inputs
    const W  = parseFloat(document.getElementById("loadWeight").value);
    const C  = parseFloat(document.getElementById("cg").value);
    const wu = document.getElementById("weightUnit").value;
    const lu = document.getElementById("lengthUnit").value;

    if (isNaN(W) || isNaN(C)) {
      alert("Enter both Total Load and CG distance.");
      return;
    }

    // preset sling angles
    [60, 50, 45, 35].forEach(angle => {
      const rad = angle * Math.PI / 180;
      const L   = C / Math.cos(rad);           // leg length
      const T   = W / (2 * Math.sin(rad));     // tension per leg

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>Preset ${angle}°</td>
        <td>${L.toFixed(2)} ${lu} & ${angle}°</td>
        <td>${L.toFixed(2)} ${lu} & ${angle}°</td>
        <td>${T.toFixed(2)} ${wu}</td>
      `;
      tbody.appendChild(tr);
    });
  });
});