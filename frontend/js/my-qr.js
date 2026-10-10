// My QR Code page.
// The QR graphic here is a static placeholder pattern — once the backend
// generates a real per-visitor code (see `qr_code` column on `visitors`),
// swap this for a real QR image, e.g. via a `qrcode` npm package endpoint
// like GET /api/visitor/qr which returns a PNG or SVG to drop into the <img>.

function loadVisitorInfo() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Visitor";

  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
  document.getElementById("visitorNameLabel").textContent = name;

  // Demo-only stable-ish code derived from the name; a real backend would
  // generate and store a unique code per visitor at signup.
  const codeSeed = name.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const code = String(100000 + (codeSeed * 137) % 900000);
  document.getElementById("visitorCode").textContent = `VISITOR-${code}`;
}

document.addEventListener("DOMContentLoaded", loadVisitorInfo);