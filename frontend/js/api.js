// Central place for all backend calls.
// Right now the backend isn't built yet, so this runs in DEMO MODE:
// it fakes a network delay and returns mock success responses.
// Once the Express API is ready, flip DEMO_MODE to false and set BASE_URL.

const DEMO_MODE = true;
const BASE_URL = "http://localhost:5000/api";

async function apiCall(endpoint, method = "GET", data = null) {
  if (DEMO_MODE) {
    return fakeApiCall(endpoint, method, data);
  }

  const token = localStorage.getItem("token");
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
  if (data) options.body = JSON.stringify(data);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

// Simulates network latency + basic validation so the UI can be
// built and demoed before the real backend exists.
function fakeApiCall(endpoint, method, data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (endpoint === "/auth/signup" && method === "POST") {
        if (!data.email || !data.password) {
          return reject(new Error("Email and password are required."));
        }
        localStorage.setItem("demoUser", JSON.stringify(data));
        return resolve({ message: "Account created", user: data });
      }
      if (endpoint === "/auth/login" && method === "POST") {
        if (!data.email || !data.password) {
          return reject(new Error("Email and password are required."));
        }
        const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
        const role = stored.role || "visitor";
        localStorage.setItem("token", "demo-token");
        localStorage.setItem("role", role);
        return resolve({ message: "Login successful", role });
      }
      resolve({ message: "OK (demo mode, no real backend yet)" });
    }, 500);
  });
}