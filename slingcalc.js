// slingcalc.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("slingForm");
  const results = document.getElementById("results");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const weight = parseFloat(document.getElementById("loadWeight").value);
    const angle = parseFloat(document.getElementById("slingAngle").value);
    const legs = parseInt(document.getElementById("numLegs").value);

    if (isNaN(weight) || isNaN(angle) || isNaN(legs) || legs < 1) {
      results.innerHTML = "Please enter valid values.";
      return;
    }

    const angleRad = angle * (Math.PI / 180);
    const tension = (weight / legs) / Math.cos(angleRad);

    results.innerHTML = `
      <p>Total Load: <strong>${weight.toFixed(2)} lbs</strong></p>
      <p>Angle: <strong>${angle}°</strong></p>
      <p>Legs: <strong>${legs}</strong></p>
      <p>Line Tension per Leg: <strong>${tension.toFixed(2)} lbs</strong></p>
    `;
  });
});