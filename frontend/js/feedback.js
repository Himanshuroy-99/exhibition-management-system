// Feedback page — star rating form + list of past feedback.
// Maps to the `feedback` table (visitor_id, exhibition_id, rating, review).

const EXHIBITIONS_KEY = "demoExhibitions";
const FEEDBACK_KEY = "demoFeedback";

const FALLBACK_EXHIBITIONS = [
  { id: 1, title: "TechXpo Indore 2026" },
  { id: 3, title: "AutoParts Expo" },
];

const SEED_FEEDBACK = [
  { id: 1, exhibition_title: "AutoParts Expo", rating: 4, review: "Great variety of vendors, well organized.", date: "2026-05-12" },
];

function getExhibitions() {
  const stored = localStorage.getItem(EXHIBITIONS_KEY);
  return stored ? JSON.parse(stored) : FALLBACK_EXHIBITIONS;
}

function loadFeedback() {
  const stored = localStorage.getItem(FEEDBACK_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(SEED_FEEDBACK));
  return SEED_FEEDBACK;
}

function saveFeedback(list) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list));
}

function loadVisitorUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.name || "Visitor";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function populateExhibitionSelect() {
  const select = document.getElementById("exhibition_select");
  select.innerHTML = getExhibitions().map(ex => `<option value="${ex.id}" data-title="${ex.title}">${ex.title}</option>`).join("");
}

function initStarInput() {
  const stars = document.querySelectorAll("#starInput span");
  const ratingInput = document.getElementById("rating");

  stars.forEach(star => {
    star.addEventListener("click", () => {
      const value = Number(star.dataset.value);
      ratingInput.value = value;
      stars.forEach(s => s.classList.toggle("active", Number(s.dataset.value) <= value));
    });
  });
}

function renderFeedbackTable() {
  const tbody = document.getElementById("feedbackBody");
  const list = loadFeedback();

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state">You haven't left any feedback yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(f => `
    <tr>
      <td>${f.exhibition_title}</td>
      <td>${"★".repeat(f.rating)}${"☆".repeat(5 - f.rating)}</td>
      <td>${f.review || "—"}</td>
      <td>${new Date(f.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
    </tr>
  `).join("");
}

function initForm() {
  document.getElementById("feedbackForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("feedbackError");
    errorEl.classList.remove("active");

    const rating = Number(document.getElementById("rating").value);
    if (!rating) {
      errorEl.textContent = "Please select a star rating.";
      errorEl.classList.add("active");
      return;
    }

    const select = document.getElementById("exhibition_select");
    const title = select.options[select.selectedIndex].dataset.title;
    const review = document.getElementById("review").value;

    const list = loadFeedback();
    list.unshift({
      id: Date.now(),
      exhibition_title: title,
      rating,
      review,
      date: new Date().toISOString().slice(0, 10),
    });
    saveFeedback(list);

    e.target.reset();
    document.getElementById("rating").value = 0;
    document.querySelectorAll("#starInput span").forEach(s => s.classList.remove("active"));

    renderFeedbackTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadVisitorUserChip();
  populateExhibitionSelect();
  initStarInput();
  renderFeedbackTable();
  initForm();
});