// Handles the signup form's role-based conditional fields,
// plus login/signup submission and redirect-by-role.

function initRoleSelect() {
  const roleInputs = document.querySelectorAll('input[name="role"]');
  if (!roleInputs.length) return;

  roleInputs.forEach((input) => {
    input.addEventListener("change", () => {
      document.querySelectorAll(".conditional-fields").forEach((el) => {
        el.classList.remove("active");
      });
      const target = document.getElementById(`fields-${input.value}`);
      if (target) target.classList.add("active");
    });
  });

  // Trigger once for whichever is checked by default.
  const checked = document.querySelector('input[name="role"]:checked');
  if (checked) checked.dispatchEvent(new Event("change"));
}

function redirectForRole(role) {
  if (role === "organizer") window.location.href = "organizer/dashboard.html";
  else if (role === "exhibitor") window.location.href = "exhibitor/dashboard.html";
  else window.location.href = "visitor/dashboard.html";
}

function initSignupForm() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("formError");
    errorEl.classList.remove("active");

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating account...";

      const result = await apiCall("/auth/signup", "POST", payload);
      redirectForRole(payload.role);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("active");
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = "Create account";
    }
  });
}

function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("formError");
    errorEl.classList.remove("active");

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = "Signing in...";

      const result = await apiCall("/auth/login", "POST", payload);
      redirectForRole(result.role);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("active");
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign in";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initRoleSelect();
  initSignupForm();
  initLoginForm();
});