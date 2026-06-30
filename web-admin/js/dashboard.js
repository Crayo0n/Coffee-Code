// ==========================================
// SIMULADOR DE DATOS DE COFFEE-CODE
// ==========================================

// Colaboradores iniciales de Coffee-Code
let users = [
  { name: "Mauricio Rodríguez Molina", email: "mau@coffeecode.com", role: "ADMINISTRADOR", status: "activo", shift: "MATUTINO", password: "123", photo: "img/User - Mau.png" },
  { name: "Mauricio Rodríguez Molina", email: "mau@coffeecode.com", role: "COCINA", status: "activo", shift: "VESPERTINO", password: "123", photo: "img/User - Mau.png" },
  { name: "Mauricio Rodríguez Molina", email: "mau@coffeecode.com", role: "CAJA", status: "activo", shift: "MATUTINO", password: "123", photo: "img/User - Mau.png" },
  { name: "Mauricio Rodríguez Molina", email: "mau@coffeecode.com", role: "MESERO", status: "activo", shift: "VESPERTINO", password: "123", photo: "img/User - Mau.png" },
  { name: "Mauricio Rodríguez Molina", email: "mau@coffeecode.com", role: "COCINA", status: "activo", shift: "NOCTURNO", password: "123", photo: "img/User - Mau.png" },
  { name: "Mauricio Rodríguez Molina", email: "mau@coffeecode.com", role: "MESERO", status: "activo", shift: "MATUTINO", password: "123", photo: "img/User - Mau.png" },
  { name: "Mauricio Rodríguez Molina", email: "mau@coffeecode.com", role: "CAJA", status: "inactivo", shift: "VESPERTINO", password: "123", photo: "img/User - Mau.png" },
  { name: "Mauricio Rodríguez Molina", email: "mau@coffeecode.com", role: "MESERO", status: "activo", shift: "NOCTURNO", password: "123", photo: "img/User - Mau.png" }
];

let editingUserIndex = null;

// Catálogo de Productos Iniciales (Figma Style Mock)
let products = [
  { name: "Capuchino Italiano", price: 55.00, category: "BEBIDA_CALIENTE", status: "disponible", photo: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=150&auto=format&fit=crop&q=80" },
  { name: "Espresso Frío Cream", price: 50.00, category: "BEBIDA_FRIA", status: "disponible", photo: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=150&auto=format&fit=crop&q=80" },
  { name: "Macarrón de Café", price: 25.00, category: "REPOSTERIA", status: "disponible", photo: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=150&auto=format&fit=crop&q=80" },
  { name: "Muffin de Vainilla", price: 35.00, category: "REPOSTERIA", status: "no_disponible", photo: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=150&auto=format&fit=crop&q=80" }
];

// Alertas de Cocina (Figma Style: Una sola alerta duplicada/repetida 3 veces)
let notifications = [
  { title: "Notificación de Cocina", message: "Cocina reporta falta de producto 'Muffin de Vainilla'. Marcado temporalmente como Agotado.", time: "Hace 5 minutos" },
  { title: "Notificación de Cocina", message: "Cocina reporta falta de producto 'Muffin de Vainilla'. Marcado temporalmente como Agotado.", time: "Hace 5 minutos" },
  { title: "Notificación de Cocina", message: "Cocina reporta falta de producto 'Muffin de Vainilla'. Marcado temporalmente como Agotado.", time: "Hace 5 minutos" }
];

// Pedidos Activos de Coffee-Code (Simulado en tiempo real para Dashboard General)
let activeOrders = [
  { id: "101", table: "Mesa 4", items: "2 Capuchino Italiano, 1 Muffin de Vainilla", total: 145.00, status: "PREPARANDO" },
  { id: "102", table: "Mesa 2", items: "1 Espresso Intenso, 1 Macarrón de Café", total: 65.00, status: "PENDIENTE" },
  { id: "103", table: "Mesa 5", items: "1 Espresso Frío Cream, 2 Macarrón de Café", total: 100.00, status: "LISTO" },
  { id: "104", table: "Mesa 1", items: "2 Capuchino Italiano", total: 110.00, status: "POR_COBRAR" },
  { id: "105", table: "Mesa 3", items: "1 Espresso Intenso", total: 40.00, status: "PAGADO" }
];

let editingProductIndex = null;

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Vincular menú de navegación superior
  const navbarItems = document.querySelectorAll(".navbar-menu-item");
  navbarItems.forEach(item => {
    item.addEventListener("click", () => {
      const tabId = item.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Renderizados iniciales
  renderActiveOrders();
  updateMetrics();
  renderUsers();
  renderProducts();
  renderNotifications();
  
  // Sincronizar perfil del administrador actual en navbar
  syncNavbarProfile();
});

// ==========================================
// CONTROLADOR DE PESTAÑAS (SPA)
// ==========================================
function switchTab(tabId) {
  // Cambiar clases del navbar
  const navbarItems = document.querySelectorAll(".navbar-menu-item");
  navbarItems.forEach(item => {
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
// RENDERIZADO Y CONTROL DE PEDIDOS ACTIVOS
// ==========================================
function renderActiveOrders() {
  const tbody = document.querySelector("#activeOrdersTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (activeOrders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px; color: var(--color-muted);">No hay pedidos activos en este momento.</td></tr>`;
    return;
  }

  activeOrders.forEach(order => {
    let statusClass = "badge-order-pending";
    let statusLabel = "Pendiente";
    if (order.status === "PREPARANDO") {
      statusClass = "badge-order-preparing";
      statusLabel = "En Cocina";
    } else if (order.status === "LISTO") {
      statusClass = "badge-order-ready";
      statusLabel = "Listo / Servir";
    } else if (order.status === "POR_COBRAR") {
      statusClass = "badge-order-tobecharged";
      statusLabel = "Por Cobrar";
    } else if (order.status === "PAGADO") {
      statusClass = "badge-order-paid";
      statusLabel = "Pagado";
    }

    tbody.innerHTML += `
      <tr>
        <td style="font-weight: 700; color: var(--color-dark);">${order.table}</td>
        <td style="font-weight: 500; font-size: 0.88rem; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${order.items}">
          ${order.items}
        </td>
        <td style="font-weight: 700; color: var(--color-primary);">$${order.total.toFixed(2)}</td>
        <td>
          <span class="badge ${statusClass}">${statusLabel}</span>
        </td>
      </tr>
    `;
  });
}

// ==========================================
// ACTUALIZACIÓN DINÁMICA DE MÉTRICAS (INICIO)
// ==========================================
function updateMetrics() {
  const activeOrdersCountEl = document.getElementById("metricActiveOrders");
  const productsCountEl = document.getElementById("metricProductsCount");
  const usersCountEl = document.getElementById("metricUsersCount");

  if (activeOrdersCountEl) activeOrdersCountEl.innerText = activeOrders.length;
  if (productsCountEl) productsCountEl.innerText = products.length;
  if (usersCountEl) usersCountEl.innerText = users.length;
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
    const avatarContent = user.photo 
      ? `<img src="${user.photo}" alt="${user.name}">` 
      : initials;

    tbody.innerHTML += `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-cell-avatar" style="${(!user.photo && user.role === 'ADMINISTRADOR') ? 'background-color: var(--color-primary); color: white;' : ''}">
              ${avatarContent}
            </div>
            <div class="user-cell-info">
              <h4>${user.name}</h4>
              <p>${user.email || 'sin-correo@coffeecode.com'}</p>
            </div>
          </div>
        </td>
        <td style="font-weight: 500; font-size: 0.85rem;">${user.email || 'sin-correo@coffeecode.com'}</td>
        <td>
          <span class="badge badge-${user.role.toLowerCase()}">${user.role}</span>
        </td>
        <td>
          <span class="badge badge-turno-${(user.shift || 'MATUTINO').toLowerCase()}">${user.shift || 'MATUTINO'}</span>
        </td>
        <td>
          <span class="badge ${user.status === 'activo' ? 'badge-active' : 'badge-inactive'}">${user.status}</span>
        </td>
        <td style="text-align: right;">
          <button class="btn-icon" title="Editar Colaborador" onclick="editUser(${index})" style="color: var(--color-primary);">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
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
    updateMetrics();
    showToast(`Colaborador ${user.name} eliminado con éxito`);
  }
}

// ==========================================
// OPERACIONES DE VENTANA MODAL (USUARIOS)
// ==========================================
function previewUserPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const photoPreview = document.getElementById("userPhotoPreview");
    photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    document.getElementById("newUserPhotoData").value = e.target.result;
  };
  reader.readAsDataURL(file);
}

function openUserModal() {
  document.getElementById("userModalOverlay").classList.add("active");
}

function closeUserModal() {
  document.getElementById("userModalOverlay").classList.remove("active");
  document.getElementById("userRegisterForm").reset();
  editingUserIndex = null;
  document.getElementById("modalUserTitleText").innerText = "Registrar Nuevo Colaborador";
  
  // Reset foto preview
  const photoPreview = document.getElementById("userPhotoPreview");
  photoPreview.innerHTML = `<span id="userPhotoPlaceholder">CC</span>`;
  document.getElementById("newUserPhotoData").value = "";
  document.getElementById("newUserPhotoFile").value = "";
  
  document.getElementById("userPasswordLabel").innerText = "Contraseña Inicial";
  document.getElementById("newUserPassword").setAttribute("required", "required");
}

function editUser(index) {
  editingUserIndex = index;
  const user = users[index];
  
  document.getElementById("modalUserTitleText").innerText = "Editar Colaborador";
  document.getElementById("newUserName").value = user.name;
  document.getElementById("newUserEmail").value = user.email || "";
  document.getElementById("newUserRole").value = user.role;
  document.getElementById("newUserShift").value = user.shift || "MATUTINO";
  
  // Mostrar foto en preview si existe
  const photoPreview = document.getElementById("userPhotoPreview");
  if (user.photo) {
    photoPreview.innerHTML = `<img src="${user.photo}" alt="${user.name}">`;
    document.getElementById("newUserPhotoData").value = user.photo;
  } else {
    const initials = user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    photoPreview.innerHTML = `<span id="userPhotoPlaceholder">${initials}</span>`;
    document.getElementById("newUserPhotoData").value = "";
  }
  
  // Contraseña es opcional en edición
  document.getElementById("userPasswordLabel").innerText = "Cambiar Contraseña (Opcional)";
  document.getElementById("newUserPassword").removeAttribute("required");
  document.getElementById("newUserPassword").value = "";
  
  openUserModal();
}

function handleUserSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById("newUserName").value.trim();
  const email = document.getElementById("newUserEmail").value.trim();
  const role = document.getElementById("newUserRole").value;
  const shift = document.getElementById("newUserShift").value;
  const password = document.getElementById("newUserPassword").value;
  const photo = document.getElementById("newUserPhotoData").value;
  
  if (editingUserIndex !== null) {
    // Modo Edición
    users[editingUserIndex].name = name;
    users[editingUserIndex].email = email;
    users[editingUserIndex].role = role;
    users[editingUserIndex].shift = shift;
    users[editingUserIndex].photo = photo;
    
    if (password) {
      users[editingUserIndex].password = password;
    }
    
    showToast(`Colaborador ${name} actualizado con éxito`);
    
    // Si editamos al usuario actual (users[0]), sincronizar navbar!
    if (editingUserIndex === 0) {
      syncNavbarProfile();
    }
  } else {
    // Modo Registro
    users.push({
      name: name,
      email: email,
      role: role,
      shift: shift,
      password: password || "123",
      photo: photo || "",
      status: 'activo'
    });
    showToast(`¡Colaborador ${name} registrado con éxito!`);
  }
  
  renderUsers();
  updateMetrics();
  closeUserModal();
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
  showToast(`Actualizando tablas analíticas para: ${range}`);
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

// ==========================================
// BUSCADOR EN TIEMPO REAL Y PREVISUALIZADOR
// ==========================================

function filterStatsProducts() {
  const query = document.getElementById("statsProductSearch").value.toLowerCase();
  const rows = document.querySelectorAll("#statsProductsTable tbody tr");
  rows.forEach(row => {
    const name = row.getAttribute("data-name") || "";
    if (name.includes(query)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function openReportPreviewer(reportType) {
  const overlay = document.getElementById("reportPreviewModalOverlay");
  const sheet = document.getElementById("reportPreviewSheet");
  const modalTitle = document.getElementById("modalReportTitleText");
  const btnExport = document.getElementById("btnExportPDFFromModal");
  
  if (!overlay || !sheet) return;
  
  modalTitle.innerText = `Previsualización Oficial: ${reportType}`;
  btnExport.setAttribute("onclick", `triggerReportDownload('${reportType.replace(/ /g, "_")}', 'PDF')`);
  
  // Inyectar datos formales en base al tipo de reporte
  let contentHTML = "";
  const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const hourStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  
  if (reportType.includes("Financiero")) {
    contentHTML = `
      <div class="report-sheet-header">
        <div class="report-sheet-logo">
          <div class="report-sheet-logo-box">☕</div>
          <div style="text-align: left;">
            <h3 style="font-weight:800; font-size:1.1rem; line-height:1; color: var(--color-dark); margin: 0;">Coffee-Code</h3>
            <span style="font-size:0.6rem; text-transform:uppercase; color:var(--color-primary); font-weight:700; letter-spacing:1px; display: block; margin-top: 2px;">Web Admin System</span>
          </div>
        </div>
        <div class="report-sheet-meta">
          <strong>Código Doc:</strong> CC-REP-FIN-024<br>
          <strong>Fecha Emisión:</strong> ${dateStr}<br>
          <strong>Hora Emisión:</strong> ${hourStr}<br>
          <strong>Responsable:</strong> Administrador Directivo
        </div>
      </div>
      
      <div class="report-sheet-title-block">
        <h2>Reporte Financiero y Estado de Cuenta</h2>
        <p>Ejercicio Operativo Detallado - Trimestre en Curso 2026</p>
      </div>
      
      <div class="report-sheet-summary-grid">
        <div class="report-sheet-summary-item">
          <span>Ingresos Totales</span>
          <strong>$25,500.00</strong>
        </div>
        <div class="report-sheet-summary-item">
          <span>Egresos Operativos</span>
          <strong style="color:var(--color-danger);">$10,200.00</strong>
        </div>
        <div class="report-sheet-summary-item">
          <span>Utilidad Neta</span>
          <strong style="color:#4e6b62;">$15,300.00</strong>
        </div>
      </div>
      
      <h4 style="font-size:0.8rem; font-weight:800; text-transform:uppercase; border-bottom:1px solid var(--color-primary); padding-bottom:4px; margin-bottom:10px; text-align: left;">Desglose Detallado de Rubros</h4>
      <table class="dense-report-table" style="font-size:0.75rem; margin-bottom:20px; width: 100%;">
        <thead>
          <tr>
            <th style="text-align: left;">Periodo</th>
            <th style="text-align: left;">Ventas Brutas</th>
            <th style="text-align: left;">Costo de Venta (Insumos)</th>
            <th style="text-align: left;">Gastos Fijos</th>
            <th style="text-align: left;">Margen Operativo ($)</th>
            <th style="text-align: left;">Margen Operativo (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight:700;">Mayo (Semana 1-4)</td>
            <td style="font-weight:700; color:#4e6b62;">$25,500.00</td>
            <td>$10,200.00</td>
            <td>$3,200.00</td>
            <td style="font-weight:700; color:var(--color-primary);">$12,100.00</td>
            <td style="font-weight:700;">47.4% Margen</td>
          </tr>
          <tr>
            <td style="font-weight:700; color:var(--color-muted);">Abril 2026</td>
            <td style="color:var(--color-muted); font-weight:700;">$21,600.00</td>
            <td style="color:var(--color-muted);">$8,640.00</td>
            <td style="color:var(--color-muted);">$3,200.00</td>
            <td style="color:var(--color-muted); font-weight:700;">$9,760.00</td>
            <td style="color:var(--color-muted);">45.1% Margen</td>
          </tr>
          <tr>
            <td style="font-weight:700; color:var(--color-muted);">Marzo 2026</td>
            <td style="color:var(--color-muted); font-weight:700;">$14,400.00</td>
            <td style="color:var(--color-muted);">$5,760.00</td>
            <td style="color:var(--color-muted);">$3,200.00</td>
            <td style="color:var(--color-muted); font-weight:700;">$5,440.00</td>
            <td style="color:var(--color-muted);">37.7% Margen</td>
          </tr>
        </tbody>
      </table>
      
      <p style="font-size:0.7rem; color:var(--color-muted); font-style:italic; line-height:1.4; text-align: left;">
        *Este estado financiero consolida las transacciones cobradas por la pasarela de pago móvil y caja física de Coffee-Code. Los montos han sido auditados automáticamente por el motor de conciliación y se consideran válidos ante el departamento directivo.
      </p>
      
      <div class="report-sheet-signatures">
        <div class="signature-line">
          <div class="signature-line-mark"></div>
          <label>Firma Administrador</label>
        </div>
        <div class="signature-line">
          <div class="signature-line-mark" style="border-bottom:none; height:45px; display:flex; align-items:center; justify-content:center;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="30" height="30" style="color:#4e6b62; opacity:0.8;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <label>Sello Sistema Coffee-Code</label>
        </div>
      </div>
    `;
  } else if (reportType.includes("Ventas") || reportType.includes("Catálogo")) {
    contentHTML = `
      <div class="report-sheet-header">
        <div class="report-sheet-logo">
          <div class="report-sheet-logo-box">☕</div>
          <div style="text-align: left;">
            <h3 style="font-weight:800; font-size:1.1rem; line-height:1; color: var(--color-dark); margin: 0;">Coffee-Code</h3>
            <span style="font-size:0.6rem; text-transform:uppercase; color:var(--color-primary); font-weight:700; letter-spacing:1px; display: block; margin-top: 2px;">Web Admin System</span>
          </div>
        </div>
        <div class="report-sheet-meta">
          <strong>Código Doc:</strong> CC-REP-VTA-089<br>
          <strong>Fecha Emisión:</strong> ${dateStr}<br>
          <strong>Hora Emisión:</strong> ${hourStr}<br>
          <strong>Responsable:</strong> Administrador Directivo
        </div>
      </div>
      
      <div class="report-sheet-title-block">
        <h2>Reporte de Popularidad y Desplazamiento de Menú</h2>
        <p>Rendimiento por Producto del Catálogo - Acumulado Mayo 2026</p>
      </div>
      
      <div class="report-sheet-summary-grid">
        <div class="report-sheet-summary-item">
          <span>Producto Estrella</span>
          <strong>Capuchino Italiano</strong>
        </div>
        <div class="report-sheet-summary-item">
          <span>Total Unidades</span>
          <strong>799 Vendidas</strong>
        </div>
        <div class="report-sheet-summary-item">
          <span>Ticket Promedio</span>
          <strong>$118.50</strong>
        </div>
      </div>
      
      <h4 style="font-size:0.8rem; font-weight:800; text-transform:uppercase; border-bottom:1px solid var(--color-primary); padding-bottom:4px; margin-bottom:10px; text-align: left;">Consolidado de Catálogo de Productos</h4>
      <table class="dense-report-table" style="font-size:0.75rem; margin-bottom:20px; width: 100%;">
        <thead>
          <tr>
            <th style="text-align: left;">Producto</th>
            <th style="text-align: left;">Categoría</th>
            <th style="text-align: left;">Ventas (Uds)</th>
            <th style="text-align: left;">Ingresos ($)</th>
            <th style="text-align: left;">Costo Prom. ($)</th>
            <th style="text-align: left;">Margen Unitario ($)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight:700;">Capuchino Italiano</td>
            <td>Bebida Caliente</td>
            <td>382 uds</td>
            <td style="font-weight:700; color:#4e6b62;">$21,010.00</td>
            <td>$18.50</td>
            <td style="font-weight:700; color:var(--color-primary);">$36.50 (66.4%)</td>
          </tr>
          <tr>
            <td style="font-weight:700;">Espresso Frío Cream</td>
            <td>Bebida Fría</td>
            <td>254 uds</td>
            <td style="font-weight:700; color:#4e6b62;">$12,700.00</td>
            <td>$15.00</td>
            <td style="font-weight:700; color:var(--color-primary);">$35.00 (70.0%)</td>
          </tr>
          <tr>
            <td style="font-weight:700;">Espresso Intenso</td>
            <td>Bebida Caliente</td>
            <td>127 uds</td>
            <td style="font-weight:700; color:#4e6b62;">$5,080.00</td>
            <td>$10.00</td>
            <td style="font-weight:700; color:var(--color-primary);">$30.00 (75.0%)</td>
          </tr>
          <tr>
            <td style="font-weight:700;">Macarrón de Café</td>
            <td>Repostería</td>
            <td>50 uds</td>
            <td style="font-weight:700; color:#4e6b62;">$1,250.00</td>
            <td>$11.00</td>
            <td style="font-weight:700; color:var(--color-primary);">$14.00 (56.0%)</td>
          </tr>
          <tr>
            <td style="font-weight:700;">Muffin de Vainilla</td>
            <td>Repostería</td>
            <td>18 uds</td>
            <td style="font-weight:700; color:#4e6b62;">$630.00</td>
            <td>$14.00</td>
            <td style="font-weight:700; color:var(--color-primary);">$21.00 (60.0%)</td>
          </tr>
        </tbody>
      </table>
      
      <div class="report-sheet-signatures">
        <div class="signature-line">
          <div class="signature-line-mark"></div>
          <label>Firma Administrador</label>
        </div>
        <div class="signature-line">
          <div class="signature-line-mark" style="border-bottom:none; height:45px; display:flex; align-items:center; justify-content:center;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="30" height="30" style="color:#4e6b62; opacity:0.8;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <label>Sello Sistema Coffee-Code</label>
        </div>
      </div>
    `;
  } else {
    // Reporte de Operaciones General
    contentHTML = `
      <div class="report-sheet-header">
        <div class="report-sheet-logo">
          <div class="report-sheet-logo-box">☕</div>
          <div style="text-align: left;">
            <h3 style="font-weight:800; font-size:1.1rem; line-height:1; color: var(--color-dark); margin: 0;">Coffee-Code</h3>
            <span style="font-size:0.6rem; text-transform:uppercase; color:var(--color-primary); font-weight:700; letter-spacing:1px; display: block; margin-top: 2px;">Web Admin System</span>
          </div>
        </div>
        <div class="report-sheet-meta">
          <strong>Código Doc:</strong> CC-REP-OPE-007<br>
          <strong>Fecha Emisión:</strong> ${dateStr}<br>
          <strong>Hora Emisión:</strong> ${hourStr}<br>
          <strong>Responsable:</strong> Administrador Directivo
        </div>
      </div>
      
      <div class="report-sheet-title-block">
        <h2>Reporte Analítico Operacional de Flujo</h2>
        <p>Eficiencia en Servicio y Estadísticas Operativas de Coffee-Code</p>
      </div>
      
      <div class="report-sheet-summary-grid">
        <div class="report-sheet-summary-item">
          <span>Tiempo Prep. Promedio</span>
          <strong>7.98 minutos</strong>
        </div>
        <div class="report-sheet-summary-item">
          <span>Tráfico de Horas Pico</span>
          <strong>Mañana (7-10 AM)</strong>
        </div>
        <div class="report-sheet-summary-item">
          <span>Pedidos Totales</span>
          <strong>848 Procesados</strong>
        </div>
      </div>
      
      <h4 style="font-size:0.8rem; font-weight:800; text-transform:uppercase; border-bottom:1px solid var(--color-primary); padding-bottom:4px; margin-bottom:10px; text-align: left;">Eficiencia del Flujo de Cocina y Tráfico Horario</h4>
      <table class="dense-report-table" style="font-size:0.75rem; margin-bottom:20px; width: 100%;">
        <thead>
          <tr>
            <th style="text-align: left;">Bloque Horario</th>
            <th style="text-align: left;">Volumen Pedidos</th>
            <th style="text-align: left;">Ventas Totales ($)</th>
            <th style="text-align: left;">Tiempo Promedio Prep.</th>
            <th style="text-align: left;">Carga Operativa</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight:700;">07:00 AM - 10:00 AM</td>
            <td>284 pedidos</td>
            <td style="font-weight:700; color:#4e6b62;">$9,650.00</td>
            <td>7.4 min</td>
            <td><strong style="color:var(--color-danger);">Alta / Crítica</strong></td>
          </tr>
          <tr>
            <td style="font-weight:700;">10:00 AM - 01:00 PM</td>
            <td>104 pedidos</td>
            <td style="font-weight:700; color:#4e6b62;">$3,420.00</td>
            <td>6.2 min</td>
            <td><strong style="color:#4e6b62;">Baja / Estable</strong></td>
          </tr>
          <tr>
            <td style="font-weight:700;">01:00 PM - 04:00 PM</td>
            <td>164 pedidos</td>
            <td style="font-weight:700; color:#4e6b62;">$5,380.00</td>
            <td>9.8 min</td>
            <td style="color:var(--color-primary); font-weight:700;">Moderada</td>
          </tr>
          <tr>
            <td style="font-weight:700;">04:00 PM - 07:00 PM</td>
            <td>232 pedidos</td>
            <td style="font-weight:700; color:#4e6b62;">$7,050.00</td>
            <td>8.5 min</td>
            <td style="color:var(--color-primary); font-weight:700;">Elevada</td>
          </tr>
        </tbody>
      </table>
      
      <div class="report-sheet-signatures">
        <div class="signature-line">
          <div class="signature-line-mark"></div>
          <label>Firma Administrador</label>
        </div>
        <div class="signature-line">
          <div class="signature-line-mark" style="border-bottom:none; height:45px; display:flex; align-items:center; justify-content:center;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="30" height="30" style="color:#4e6b62; opacity:0.8;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <label>Sello Sistema Coffee-Code</label>
        </div>
      </div>
    `;
  }
  
  sheet.innerHTML = contentHTML;
  overlay.classList.add("active");
}

function closeReportPreviewer() {
  const overlay = document.getElementById("reportPreviewModalOverlay");
  if (overlay) overlay.classList.remove("active");
}

// ==========================================
// RENDERIZADO Y FILTRO DE INVENTARIO DE PRODUCTOS
// ==========================================
function renderProducts() {
  const tbody = document.querySelector("#productsTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  
  // Filtros aplicados
  const searchText = document.getElementById("productInputSearch").value.toLowerCase();
  const categoryFilter = document.getElementById("productCategoryFilter").value;

  products.forEach((product, index) => {
    // Aplicar filtros
    if (categoryFilter !== "ALL" && product.category !== categoryFilter) return;
    if (searchText && !product.name.toLowerCase().includes(searchText)) return;

    // Traducir categoría para el badge
    let categoryLabel = "Otros";
    if (product.category === "BEBIDA_CALIENTE") categoryLabel = "Bebida Caliente";
    else if (product.category === "BEBIDA_FRIA") categoryLabel = "Bebida Fría";
    else if (product.category === "REPOSTERIA") categoryLabel = "Repostería";
    else if (product.category === "OTROS") categoryLabel = "Otros";
    else {
      // Categorías personalizadas añadidas dinámicamente
      categoryLabel = product.category.replace(/_/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
    }

    const photoContent = product.photo
      ? `<img src="${product.photo}" class="product-thumb" alt="${product.name}">`
      : `<div class="product-thumb" style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.1rem;">☕</div>`;

    tbody.innerHTML += `
      <tr>
        <td>${photoContent}</td>
        <td style="font-weight: 700; color: var(--color-dark);">${product.name}</td>
        <td>
          <span class="badge badge-${product.category.toLowerCase()}">${categoryLabel}</span>
        </td>
        <td style="font-weight: 700; color: var(--color-primary);">$${product.price.toFixed(2)}</td>
        <td>
          <span class="badge ${product.status === 'disponible' ? 'badge-active' : 'badge-inactive'}">${product.status === 'disponible' ? 'Disponible' : 'Agotado'}</span>
        </td>
        <td style="text-align: right;">
          <button class="btn-icon" title="Editar Producto" onclick="editProduct(${index})" style="color: var(--color-primary);">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="btn-icon" title="Cambiar Disponibilidad" onclick="toggleProductStatus(${index})">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          <button class="btn-icon" style="color: var(--color-danger);" title="Eliminar Producto" onclick="deleteProduct(${index})">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </td>
      </tr>
    `;
  });
}

function filterProductsTable() {
  renderProducts();
}

function toggleProductStatus(index) {
  const prod = products[index];
  prod.status = prod.status === 'disponible' ? 'no_disponible' : 'disponible';
  renderProducts();
  showToast(`Estado de ${prod.name} cambiado a ${prod.status === 'disponible' ? 'DISPONIBLE' : 'AGOTADO'}`);
}

function deleteProduct(index) {
  const prod = products[index];
  if (confirm(`¿Estás seguro de que deseas eliminar ${prod.name} del catálogo?`)) {
    products.splice(index, 1);
    renderProducts();
    updateMetrics();
    showToast(`Producto ${prod.name} eliminado con éxito`);
  }
}

// ==========================================
// RENDERIZADO DE NOTIFICACIONES DE COCINA
// ==========================================
function renderNotifications() {
  const container = document.getElementById("kitchenNotifications");
  if (!container) return;

  container.innerHTML = "";
  if (notifications.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--color-muted); font-size: 0.85rem;">No hay alertas pendientes de cocina.</div>`;
    return;
  }

  notifications.forEach(notif => {
    container.innerHTML += `
      <div class="notification-item">
        <div class="notification-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="notification-content">
          <h4>${notif.title}</h4>
          <p>${notif.message}</p>
          <span class="notification-time">${notif.time}</span>
        </div>
      </div>
    `;
  });
}

// ==========================================
// OPERACIONES DE VENTANA MODAL (PRODUCTOS)
// ==========================================
function previewProductPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const photoPreview = document.getElementById("productPhotoPreview");
    photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    document.getElementById("newProductPhotoData").value = e.target.result;
  };
  reader.readAsDataURL(file);
}

function openProductModal() {
  document.getElementById("productModalOverlay").classList.add("active");
}

function closeProductModal() {
  document.getElementById("productModalOverlay").classList.remove("active");
  document.getElementById("productRegisterForm").reset();
  editingProductIndex = null;
  document.getElementById("modalProductTitleText").innerText = "Registrar Nuevo Producto";
  document.getElementById("customCategoryGroup").style.display = "none";
  document.getElementById("newProductCategoryCustom").removeAttribute("required");
  
  // Reset foto preview
  const photoPreview = document.getElementById("productPhotoPreview");
  photoPreview.innerHTML = `<span id="productPhotoPlaceholder">☕</span>`;
  document.getElementById("newProductPhotoData").value = "";
  document.getElementById("newProductPhotoFile").value = "";
}

function editProduct(index) {
  editingProductIndex = index;
  const prod = products[index];
  
  document.getElementById("modalProductTitleText").innerText = "Editar Producto";
  document.getElementById("newProductName").value = prod.name;
  document.getElementById("newProductPrice").value = prod.price;
  
  const categorySelect = document.getElementById("newProductCategory");
  const customGroup = document.getElementById("customCategoryGroup");
  const customInput = document.getElementById("newProductCategoryCustom");
  
  // Si la categoría no está en las opciones por defecto, marcar como NUEVA_CATEGORIA y rellenar input
  const isDefault = ["BEBIDA_CALIENTE", "BEBIDA_FRIA", "REPOSTERIA", "OTROS"].includes(prod.category);
  if (isDefault) {
    categorySelect.value = prod.category;
    customGroup.style.display = "none";
    customInput.value = "";
    customInput.removeAttribute("required");
  } else {
    categorySelect.value = "NUEVA_CATEGORIA";
    customGroup.style.display = "block";
    customInput.value = prod.category.replace(/_/g, " ");
    customInput.setAttribute("required", "required");
  }
  
  document.getElementById("newProductStatus").value = prod.status;
  
  // Mostrar foto en preview si existe
  const photoPreview = document.getElementById("productPhotoPreview");
  if (prod.photo) {
    photoPreview.innerHTML = `<img src="${prod.photo}" alt="${prod.name}">`;
    document.getElementById("newProductPhotoData").value = prod.photo;
  } else {
    photoPreview.innerHTML = `<span id="productPhotoPlaceholder">☕</span>`;
    document.getElementById("newProductPhotoData").value = "";
  }
  
  openProductModal();
}

function handleProductSubmit(event) {
  event.preventDefault();
  
  const name = document.getElementById("newProductName").value.trim();
  const price = parseFloat(document.getElementById("newProductPrice").value);
  let category = document.getElementById("newProductCategory").value;
  const status = document.getElementById("newProductStatus").value;
  const photo = document.getElementById("newProductPhotoData").value;
  
  if (category === "NUEVA_CATEGORIA") {
    const rawVal = document.getElementById("newProductCategoryCustom").value.trim();
    if (!rawVal) {
      showToast("Por favor especifica el nombre de la nueva categoría");
      return;
    }
    category = rawVal.toUpperCase().replace(/ /g, "_");
    
    // Agregar dinámicamente al filtro de búsqueda si no existe
    const filterSelect = document.getElementById("productCategoryFilter");
    const exists = Array.from(filterSelect.options).some(opt => opt.value === category);
    if (!exists) {
      const option = document.createElement("option");
      option.value = category;
      option.text = rawVal;
      filterSelect.appendChild(option);
    }
  }
  
  if (editingProductIndex !== null) {
    // Modo Edición
    products[editingProductIndex].name = name;
    products[editingProductIndex].price = price;
    products[editingProductIndex].category = category;
    products[editingProductIndex].status = status;
    products[editingProductIndex].photo = photo;
    showToast(`Producto ${name} actualizado con éxito`);
  } else {
    // Modo Registro
    products.push({
      name: name,
      price: price,
      category: category,
      status: status,
      photo: photo || ""
    });
    showToast(`¡Producto ${name} agregado con éxito al catálogo!`);
  }
  
  renderProducts();
  updateMetrics();
  closeProductModal();
}

// ==========================================
// CONTROLADOR DINÁMICO DE CATEGORÍAS PERSONALIZADAS
// ==========================================
function checkCustomCategory() {
  const select = document.getElementById("newProductCategory");
  const group = document.getElementById("customCategoryGroup");
  const input = document.getElementById("newProductCategoryCustom");
  
  if (select.value === "NUEVA_CATEGORIA") {
    group.style.display = "block";
    input.setAttribute("required", "required");
    input.focus();
  } else {
    group.style.display = "none";
    input.removeAttribute("required");
    input.value = "";
  }
}

// ==========================================
// FUNCIONES DE SINOPSIS Y AUTOSERVICIO DE "MI PERFIL"
// ==========================================
function syncNavbarProfile() {
  const activeUser = users[0]; // Mauricio Rodríguez Molina
  if (!activeUser) return;

  const avatarDiv = document.getElementById("navbarProfileAvatar");
  const nameH4 = document.getElementById("navbarProfileName");
  
  if (nameH4) nameH4.innerText = activeUser.name.split(" ").slice(0, 2).join(" "); // "Mauricio Rodríguez"
  
  if (avatarDiv) {
    if (activeUser.photo) {
      avatarDiv.innerHTML = `<img src="${activeUser.photo}" alt="${activeUser.name}">`;
    } else {
      const initials = activeUser.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
      avatarDiv.innerHTML = initials;
      avatarDiv.style.backgroundColor = "var(--color-secondary)";
      avatarDiv.style.color = "var(--color-dark)";
    }
  }
}

// Abrir Modal Mi Perfil
function openMyProfileModal() {
  const activeUser = users[0]; // Mauricio Rodríguez Molina
  if (!activeUser) return;
  
  // Rellenar información fija del usuario
  document.getElementById("myProfileNameLabel").innerText = activeUser.name;
  document.getElementById("myProfileEmailLabel").innerText = activeUser.email;
  document.getElementById("myProfileRoleBadge").innerText = activeUser.role;
  document.getElementById("myProfileShiftBadge").innerText = activeUser.shift || "MATUTINO";
  
  // Limpiar inputs
  document.getElementById("myProfileCurrentPassword").value = "";
  document.getElementById("myProfileNewPassword").value = "";
  document.getElementById("myProfileConfirmPassword").value = "";
  
  // Previsualizar foto
  const photoPreview = document.getElementById("myProfilePhotoPreview");
  if (activeUser.photo) {
    photoPreview.innerHTML = `<img src="${activeUser.photo}" alt="${activeUser.name}">`;
    document.getElementById("myProfilePhotoData").value = activeUser.photo;
  } else {
    const initials = activeUser.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    photoPreview.innerHTML = `<span id="myProfilePhotoPlaceholder">${initials}</span>`;
    document.getElementById("myProfilePhotoData").value = "";
  }
  
  document.getElementById("myProfileModalOverlay").classList.add("active");
}

// Cerrar Modal Mi Perfil
function closeMyProfileModal() {
  document.getElementById("myProfileModalOverlay").classList.remove("active");
  document.getElementById("myProfileForm").reset();
}

// Previsualizar foto de Mi Perfil
function previewMyProfilePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const photoPreview = document.getElementById("myProfilePhotoPreview");
    photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    document.getElementById("myProfilePhotoData").value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Guardar Cambios de Mi Perfil
function handleMyProfileSubmit(event) {
  event.preventDefault();
  
  const activeUser = users[0];
  if (!activeUser) return;
  
  const currentPasswordInput = document.getElementById("myProfileCurrentPassword").value;
  const newPasswordInput = document.getElementById("myProfileNewPassword").value;
  const confirmPasswordInput = document.getElementById("myProfileConfirmPassword").value;
  const photoData = document.getElementById("myProfilePhotoData").value;
  
  // 1. Validar Contraseña Actual
  if (currentPasswordInput !== activeUser.password) {
    showToast("❌ La contraseña actual es incorrecta");
    return;
  }
  
  // 2. Validar Nueva Contraseña
  if (newPasswordInput.length < 4) {
    showToast("❌ La nueva contraseña debe tener al menos 4 caracteres");
    return;
  }
  
  if (newPasswordInput !== confirmPasswordInput) {
    showToast("❌ Las contraseñas nuevas no coinciden");
    return;
  }
  
  // 3. Guardar cambios en bd local
  activeUser.password = newPasswordInput;
  activeUser.photo = photoData;
  
  // 4. Sincronizar UI de inmediato
  syncNavbarProfile();
  renderUsers(); // Para refrescar en la tabla si se muestra
  
  showToast("✓ ¡Perfil y contraseña actualizados con éxito!");
  closeMyProfileModal();
}
