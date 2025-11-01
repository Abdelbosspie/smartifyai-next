// public/script.js
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("ping");
    if (btn) btn.addEventListener("click", () => console.log("User clicked!"));
  });
})();
