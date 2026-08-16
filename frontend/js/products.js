// Products page — full CRUD (Create, Read, Update, Delete) for this
// exhibitor's product catalog, backed by localStorage for now.

const PRODUCTS_KEY = "demoProducts";

const SEED_PRODUCTS = [
  { id: 1, product_name: "Smart Water Purifier", category: "Home Appliances", price: 4999, status: "active" },
  { id: 2, product_name: "Solar Charging Panel", category: "Electronics", price: 2499, status: "active" },
  { id: 3, product_name: "Industrial Air Filter", category: "Industrial", price: 12999, status: "inactive" },
];

function loadProducts() {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS));
  return SEED_PRODUCTS;
}

function saveProducts(list) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
}

function loadExhibitorUserChip() {
  const stored = JSON.parse(localStorage.getItem("demoUser") || "{}");
  const name = stored.company_name || stored.name || "Exhibitor";
  document.getElementById("userName").textContent = name;
  document.getElementById("userInitial").textContent = name.charAt(0).toUpperCase();
}

function formatPrice(price) {
  if (price === undefined || price === null || price === "") return "—";
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function renderTable() {
  const tbody = document.getElementById("productsBody");
  const list = loadProducts();

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-state">No products listed yet. Add your first one.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(p => `
    <tr>
      <td>${p.product_name}</td>
      <td>${p.category || "—"}</td>
      <td>${formatPrice(p.price)}</td>
      <td><span class="badge ${p.status}">${p.status}</span></td>
      <td>
        <div class="row-actions">
          <a href="#" onclick="editProduct(${p.id}); return false;">Edit</a>
          <button class="danger" onclick="deleteProduct(${p.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  saveProducts(loadProducts().filter(p => p.id !== id));
  renderTable();
}

function editProduct(id) {
  const product = loadProducts().find(p => p.id === id);
  if (!product) return;

  document.getElementById("modalTitle").textContent = "Edit Product";
  document.getElementById("submitBtn").textContent = "Save Changes";
  document.getElementById("product_id").value = product.id;
  document.getElementById("product_name").value = product.product_name;
  document.getElementById("category").value = product.category || "";
  document.getElementById("price").value = product.price || "";
  document.getElementById("description").value = product.description || "";
  document.getElementById("status").value = product.status;

  document.getElementById("createModal").classList.add("active");
}

function initModal() {
  const overlay = document.getElementById("createModal");
  const openBtn = document.getElementById("openCreateModal");
  const closeBtn = document.getElementById("closeCreateModal");
  const cancelBtn = document.getElementById("cancelCreate");
  const form = document.getElementById("productForm");

  const resetToCreateMode = () => {
    form.reset();
    document.getElementById("modalTitle").textContent = "Add Product";
    document.getElementById("submitBtn").textContent = "Add Product";
    document.getElementById("product_id").value = "";
    document.getElementById("formError").classList.remove("active");
  };

  const open = () => { resetToCreateMode(); overlay.classList.add("active"); };
  const close = () => { overlay.classList.remove("active"); resetToCreateMode(); };

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  cancelBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.product_name.trim()) {
      document.getElementById("formError").textContent = "Product name is required.";
      document.getElementById("formError").classList.add("active");
      return;
    }

    const list = loadProducts();

    if (data.product_id) {
      // Editing an existing product.
      const idx = list.findIndex(p => String(p.id) === data.product_id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data, id: list[idx].id, price: data.price ? Number(data.price) : null };
      }
    } else {
      // Creating a new product.
      list.unshift({
        id: Date.now(),
        product_name: data.product_name,
        category: data.category,
        price: data.price ? Number(data.price) : null,
        description: data.description,
        status: data.status || "active",
      });
    }

    saveProducts(list);
    close();
    renderTable();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadExhibitorUserChip();
  renderTable();
  initModal();
});