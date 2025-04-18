// nav.js
document.addEventListener("DOMContentLoaded", () => {
  fetch('tools.json')
    .then(res => res.json())
    .then(tools => {
      const nav = document.getElementById('toolsMenu');
      const current = window.location.pathname.split("/").pop();

      tools.forEach(tool => {
        const opt = document.createElement('option');
        opt.value = tool.file;
        opt.textContent = tool.name;
        if (tool.file === current) opt.selected = true;
        nav.appendChild(opt);
      });

      nav.addEventListener('change', () => {
        window.location = nav.value;
      });
    })
    .catch(err => {
      console.error("Failed to load tools.json:", err);
    });
});