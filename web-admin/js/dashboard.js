// ==========================================
// SIMULADOR DE DATOS DE COFEE-CODE
// ==========================================

// Pedidos en tiempo real (Caja / Cocina / Mesero)
let recentOrders = [
  { id: 1025, customer: "Mesa 4 (Mesero Axel)", items: "1x Capuchino, 1x Macarrón Café", total: 95.00, status: "recibido" },
  { id: 1024, customer: "Mesa 2 (Mesero Diego)", items: "2x Capuchino, 1x Macarrón Café", total: 155.00, status: "preparando" },
  { id: 1023, customer: "Para Llevar (Caja)", items: "1x Espresso Frío, 1x Panqué de Plátano", total: 90.00, status: "entregado" },
  { id: 1022, customer: "Mesa 7 (Mesero Axel)", items: "3x Espresso, 2x Macarrón Café", total: 185.00, status: "entregado" },
  { id: 1021, customer: "Mesa 1 (Mesero Víctor)", items: "1x Latte Frío", total: 55.00, status: "cancelado" }
];

// Colaboradores iniciales de Cofee-Code
let users = [
  { name: "Gabriela Martínez Cruz", email: "gaby@cofeecode.com", role: "ADMINISTRADOR", status: "activo" },
  { name: "Mauricio Rodríguez Molina", email: "mau@cofeecode.com", role: "ADMINISTRADOR", status: "activo" },
  { name: "Diego Rivera Díaz", email: "diego@cofeecode.com", role: "COCINA", status: "activo" },
  { name: "Victor Osvaldo Rodríguez", email: "victor@cofeecode.com", role: "CAJA", status: "activo" },
  { name: "Axel Ramírez Ortiz", email: "axel@cofeecode.com", role: "MESERO", status: "activo" },
  { name: "Alondra Ivet Martínez", fill: "alondra@cofeecode.com", role: "COCINA", status: "activo" },
  { name: "Saul Ongay Silva", email: "saul@cofeecode.com", role: "MESERO", status: "activo" },
  { name: "Manuel David Tovar", email: "manuel@cofeecode.com", role: "CAJA", status: "inactivo" }
];

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Cargar fecha actual elegante
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  document.getElementById("currentDateStr").innerText = today.toLocaleDateString('es-ES', dateOptions);

  // Vincular menú lateral
  const sidebarItems = document.querySelectorAll(".sidebar-menu-item");
  sidebarItems.forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Renderizados iniciales
  renderOrders();
  renderUsers();
});

// ==========================================
// CONTROLADOR DE PESTAÑAS (SPA)
// ==========================================
function switchTab(tabId) {
  // Cambiar clases del sidebar
  const sidebarItems = document.querySelectorAll(".sidebar-menu-item");
  sidebarItems.forEach(item => {
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Cambiar vistas de contenido
  const contents = document.querySelectorAll(".dashboard-tab-content");
  contents.forEach(content => {
    if (content.id === tabId) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });
}

// ==========================================
// RENDERIZADO DE PEDIDOS RECIENTES
// ==========================================
function renderOrders() {
  const tbody = document.querySelector("#recentOrdersTable tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  recentOrders.forEach(order => {
    tbody.innerHTML += `
      <tr>
        <td style="font-weight: 700; color: var(--color-primary);">#${order.id}</td>
        <td style="font-weight: 500;">${order.customer}</td>
        <td>
          <div class="order-items-summary" title="${order.items}">${order.items}</div>
        </td>
        <td style="font-weight: 700; color: var(--color-dark);">$${order.total.toFixed(2)}</td>
        <td>
          <span class="order-status status-${order.status}">${order.status}</span>
        </td>
      </tr>
    `;
  });
}

// ==========================================
// RENDERIZADO Y FILTRO DE PERSONAL
// ==========================================
function renderUsers() {
  const tbody = document.querySelector("#usersTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  
  // Filtros aplicados
  const searchText = document.getElementById("userInputSearch").value.toLowerCase();
  const roleFilter = document.getElementById("userRoleFilter").value;

  users.forEach((user, index) => {
    // Aplicar filtros de rol y búsqueda
    if (roleFilter !== "ALL" && user.role !== roleFilter) return;
    if (searchText && !user.name.toLowerCase().includes(searchText) && !user.email.toLowerCase().includes(searchText)) return;

    // Obtener iniciales para el avatar
    const initials = user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

    tbody.innerHTML += `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-cell-avatar" style="${user.role === 'ADMINISTRADOR' ? 'background-color: var(--color-primary); color: white;' : ''}">
              ${initials}
            </div>
            <div class="user-cell-info">
              <h4>${user.name}</h4>
              <p>${user.email || 'sin-correo@cofeecode.com'}</p>
            </div>
          </div>
        </td>
        <td style="font-weight: 500; font-size: 0.85rem;">${user.email || 'sin-correo@cofeecode.com'}</td>
        <td>
          <span class="badge badge-${user.role.toLowerCase()}">${user.role}</span>
        </td>
        <td>
          <span class="badge ${user.status === 'activo' ? 'badge-active' : 'badge-inactive'}">${user.status}</span>
        </td>
        <td style="text-align: right;">
          <button class="btn-icon" title="Cambiar Estado Activo/Inactivo" onclick="toggleUserStatus(${index})">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          <button class="btn-icon" style="color: var(--color-danger);" title="Eliminar Colaborador" onclick="deleteUser(${index})">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </td>
      </tr>
    `;
  });
}

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
  if (confirm(`¿Estás seguro de que deseas eliminar a ${user.name} del sistema?`)) {
    users.splice(index, 1);
    renderUsers();
    showToast(`Colaborador ${user.name} eliminado con éxito`);
  }
}

// ==========================================
// OPERACIONES DE VENTANA MODAL (USUARIOS)
// ==========================================
function openUserModal() {
  document.getElementById("userModalOverlay").classList.add("active");
}

function closeUserModal() {
  document.getElementById("userModalOverlay").classList.remove("active");
  document.getElementById("userRegisterForm").reset();
}

function handleUserSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById("newUserName").value;
  const email = document.getElementById("newUserEmail").value;
  const role = document.getElementById("newUserRole").value;
  
  // Agregar al arreglo simulado
  users.push({
    name: name,
    email: email,
    role: role,
    status: 'activo'
  });
  
  renderUsers();
  closeUserModal();
  showToast(`¡Colaborador ${name} registrado con rol ${role}!`);
}

// ==========================================
// SIMULADOR DE DESCARGA DE REPORTES
// ==========================================
function triggerReportDownload(reportName, format) {
  showToast(`Generando ${reportName}.${format === 'PDF' ? 'pdf' : 'xlsx'}...`);
  
  setTimeout(() => {
    showToast(`✓ Descargado con éxito: ${reportName}.${format === 'PDF' ? 'pdf' : 'xlsx'} (Simulado)`);
  }, 2000);
}

// ==========================================
// INTERACTIVIDAD DE GRÁFICOS (SIMULADOS)
// ==========================================
function simulateChartUpdate() {
  const range = document.getElementById("statRange").value;
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

  // Animación del número de ventas
  totalSalesEl.style.transform = "scale(1.2)";
  totalSalesEl.style.transition = "transform 0.2s ease";
  setTimeout(() => {
    totalSalesEl.innerText = salesValue;
    totalSalesEl.style.transform = "scale(1)";
  }, 200);

  // Animación de barras
  const incomeBar = document.getElementById("mayIncomeBar");
  const expenseBar = document.getElementById("mayExpenseBar");
  
  if (incomeBar && expenseBar) {
    incomeBar.style.height = incomeHeight;
    expenseBar.style.height = expenseHeight;
    incomeBar.setAttribute("data-value", `$${Math.round(parseFloat(incomeHeight) * 300)}`);
    expenseBar.setAttribute("data-value", `$${Math.round(parseFloat(expenseHeight) * 300)}`);
  }

  showToast(`Actualizando analíticas para: ${range}`);
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message) {
  const toast = document.getElementById("toastNotification");
  const toastMsg = document.getElementById("toastMessage");
  
  toastMsg.innerText = message;
  toast.classList.add("active");
  
  setTimeout(() => {
    toast.classList.remove("active");
  }, 3500);
}
