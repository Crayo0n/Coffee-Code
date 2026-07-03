// ==========================================
// SIMULADOR DE DATOS DE COFEE-CODE
// ==========================================

// Colaboradores iniciales
let users = [
  { name: "Gabriela Martínez Cruz", email: "gaby@cofeecode.com", role: "ADMINISTRADOR", status: "activo" },
  { name: "Mauricio Rodríguez Molina", email: "mau@cofeecode.com", role: "ADMINISTRADOR", status: "activo" },
  { name: "Diego Rivera Díaz", email: "diego@cofeecode.com", role: "COCINA", status: "activo" },
  { name: "Victor Osvaldo Rodríguez", email: "victor@cofeecode.com", role: "CAJA", status: "activo" },
  { name: "Axel Ramírez Ortiz", email: "axel@cofeecode.com", role: "MESERO", status: "activo" },
  { name: "Alondra Ivet Martínez", email: "alondra@cofeecode.com", role: "COCINA", status: "activo" },
  { name: "Saul Ongay Silva", email: "saul@cofeecode.com", role: "MESERO", status: "activo" },
  { name: "Manuel David Tovar", email: "manuel@cofeecode.com", role: "CAJA", status: "inactivo" }
];

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Fecha actual
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  const dateElement = document.getElementById("currentDateStr");
  if (dateElement) {
    dateElement.innerText = today.toLocaleDateString('es-ES', dateOptions);
  }

  // Renderizar usuarios si existe la tabla
  if (document.getElementById("usersTableBody")) {
    renderUsers();
  }
});

// ==========================================
// RENDERIZADO DE USUARIOS
// ==========================================
function renderUsers() {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;

  const searchText = document.getElementById("userInputSearch")?.value.toLowerCase() || "";
  const roleFilter = document.getElementById("userRoleFilter")?.value || "ALL";

  tbody.innerHTML = "";
  
  const filteredUsers = users.filter(user => {
    if (roleFilter !== "ALL" && user.role !== roleFilter) return false;
    if (searchText && !user.name.toLowerCase().includes(searchText) && !user.email.toLowerCase().includes(searchText)) return false;
    return true;
  });

  if (filteredUsers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-muted);">No hay usuarios registrados</td></tr>`;
    return;
  }

  filteredUsers.forEach((user, index) => {
    const initials = user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    const realIndex = users.indexOf(user);
    
    tbody.innerHTML += `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-cell-avatar" style="${user.role === 'ADMINISTRADOR' ? 'background-color: var(--color-primary); color: white;' : ''}">
              ${initials}
            </div>
            <div class="user-cell-info">
              <h4>${user.name}</h4>
              <p>${user.email}</p>
            </div>
          </div>
        </td>
        <td>${user.email}</td>
        <td>
          <span class="role-badge ${user.role.toLowerCase()}">${user.role}</span>
        </td>
        <td>
          <span class="status-badge ${user.status === 'activo' ? 'status-active' : 'status-inactive'}">${user.status}</span>
        </td>
        <td style="text-align: right;">
          <button class="btn-icon" title="Cambiar Estado" onclick="toggleUserStatus(${realIndex})">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          <button class="btn-icon" style="color: var(--color-danger);" title="Eliminar" onclick="deleteUser(${realIndex})">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </td>
      </tr>
    `;
  });
}

// ==========================================
// FUNCIONES DE USUARIOS
// ==========================================
function filterUsersTable() {
  renderUsers();
}

function toggleUserStatus(index) {
  const user = users[index];
  user.status = user.status === 'activo' ? 'inactivo' : 'activo';
  renderUsers();
  showToast(`Estado de ${user.name} cambiado a ${user.status.toUpperCase()}`);
}

function deleteUser(index) {
  const user = users[index];
  if (confirm(`¿Estás seguro de eliminar a ${user.name}?`)) {
    users.splice(index, 1);
    renderUsers();
    showToast(`Colaborador ${user.name} eliminado`);
  }
}

// ==========================================
// MODAL DE USUARIOS
// ==========================================
function openUserModal() {
  const overlay = document.getElementById("userModalOverlay");
  if (overlay) overlay.classList.add("active");
}

function closeUserModal() {
  const overlay = document.getElementById("userModalOverlay");
  if (overlay) overlay.classList.remove("active");
  const form = document.getElementById("userRegisterForm");
  if (form) form.reset();
}

function handleUserSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById("newUserName").value;
  const email = document.getElementById("newUserEmail").value;
  const password = document.getElementById("newUserPassword").value;
  const role = document.getElementById("newUserRole").value;
  
  if (!name || !email || !password || !role) {
    showToast("Completa todos los campos");
    return;
  }
  
  users.push({
    name: name,
    email: email,
    role: role,
    status: 'activo'
  });
  
  renderUsers();
  closeUserModal();
  showToast(`¡${name} registrado como ${role}!`);
}

// ==========================================
// REPORTES
// ==========================================
function triggerReportDownload(reportName, format) {
  showToast(`Generando ${reportName}.${format === 'PDF' ? 'pdf' : 'xlsx'}...`);
  setTimeout(() => {
    showToast(`✓ Descargado: ${reportName}.${format === 'PDF' ? 'pdf' : 'xlsx'}`);
  }, 1500);
}

// ==========================================
// INVENTARIO
// ==========================================
function filterInventario() {
  const search = document.getElementById("inventarioSearch")?.value.toLowerCase() || "";
  const categoria = document.getElementById("categoriaFilter")?.value || "ALL";
  const stock = document.getElementById("stockFilter")?.value || "ALL";
  
  const rows = document.querySelectorAll("#inventarioBody tr");
  rows.forEach(row => {
    const nombre = row.querySelector(".producto-nombre")?.textContent.toLowerCase() || "";
    const cat = row.dataset.categoria || "";
    const stockVal = parseInt(row.dataset.stock) || 0;
    
    let show = true;
    if (search && !nombre.includes(search)) show = false;
    if (categoria !== "ALL" && cat !== categoria) show = false;
    if (stock === "BAJO" && stockVal > 5) show = false;
    if (stock === "NORMAL" && stockVal <= 5) show = false;
    
    row.style.display = show ? "" : "none";
  });
}

// ==========================================
// TOAST
// ==========================================
function showToast(message) {
  const toast = document.getElementById("toastNotification");
  const toastMsg = document.getElementById("toastMessage");
  
  if (!toast || !toastMsg) return;
  
  toastMsg.innerText = message;
  toast.classList.add("active");
  
  setTimeout(() => {
    toast.classList.remove("active");
  }, 3500);
}

// ==========================================
// GRÁFICAS (ESTADÍSTICAS)
// ==========================================
function simulateChartUpdate() {
  const range = document.getElementById("statRange")?.value || "ESTEMES";
  const totalSalesEl = document.getElementById("totalSalesCount");
  
  let salesValue = 848;
  let incomeHeight = "85%";
  let expenseHeight = "34%";
  
  if (range === "ULTIMOSTRINTA") {
    salesValue = 972;
    incomeHeight = "95%";
    expenseHeight = "40%";
  } else if (range === "SEMANAL") {
    salesValue = 184;
    incomeHeight = "45%";
    expenseHeight = "18%";
  } else if (range === "ANUAL") {
    salesValue = 4850;
    incomeHeight = "100%";
    expenseHeight = "48%";
  }

  if (totalSalesEl) {
    totalSalesEl.style.transform = "scale(1.2)";
    setTimeout(() => {
      totalSalesEl.innerText = salesValue;
      totalSalesEl.style.transform = "scale(1)";
    }, 200);
  }

  const incomeBar = document.getElementById("mayIncomeBar");
  const expenseBar = document.getElementById("mayExpenseBar");
  
  if (incomeBar && expenseBar) {
    incomeBar.style.height = incomeHeight;
    expenseBar.style.height = expenseHeight;
  }

  showToast(`Actualizando analíticas para: ${range}`);
}