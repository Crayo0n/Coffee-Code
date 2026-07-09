document.addEventListener("DOMContentLoaded", () => {
  // Mostrar fecha actual formateada
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  const dateElement = document.getElementById("currentDateStr");
  if (dateElement) {
    dateElement.innerText = today.toLocaleDateString('es-ES', dateOptions);
  }
});



// Filtrar colaboradores en personal.html
function filterUsersTable() {
  const search = document.getElementById("userInputSearch")?.value.toLowerCase() || "";
  const role = document.getElementById("userRoleFilter")?.value || "ALL";
  
  const rows = document.querySelectorAll("#usersTable tbody tr");
  rows.forEach(row => {
    // Si la tabla está vacía, no procesar
    if (row.cells.length < 2) return;
    
    const nameText = row.querySelector("h4")?.textContent.toLowerCase() || "";
    const emailText = row.cells[1]?.textContent.toLowerCase() || "";
    const roleBadge = row.querySelector(".role-badge")?.textContent.trim() || "";
    
    let show = true;
    if (search && !nameText.includes(search) && !emailText.includes(search)) show = false;
    if (role !== "ALL" && roleBadge !== role) show = false;
    
    row.style.display = show ? "" : "none";
  });
}

// Filtrar catálogo en inventario.html
function filterProductsTable() {
  const search = document.getElementById("productInputSearch")?.value.toLowerCase() || "";
  const categoryId = document.getElementById("productCategoryFilter")?.value || "ALL";
  
  const rows = document.querySelectorAll("#productsTable tbody tr");
  rows.forEach(row => {
    if (row.cells.length < 2) return;
    
    const nameText = row.cells[1]?.textContent.toLowerCase() || "";
    const categoryBadge = row.querySelector(".badge")?.textContent.trim() || "";
    
    // Obtener el ID de la categoría (asociado en los selectores de Flask)
    // Para simplificar, buscamos correspondencias parciales o mapeo en select
    const selectEl = document.getElementById("productCategoryFilter");
    const selectedText = selectEl ? selectEl.options[selectEl.selectedIndex].text : "Todas las Categorías";
    
    let show = true;
    if (search && !nameText.includes(search)) show = false;
    if (categoryId !== "ALL" && categoryBadge !== selectedText) show = false;
    
    row.style.display = show ? "" : "none";
  });
}

// Filtrar productos en estadisticas.html
function filterStatsProducts() {
  const search = document.getElementById("statsProductSearch")?.value.toLowerCase() || "";
  const rows = document.querySelectorAll("#statsProductsTable tbody tr");
  
  rows.forEach(row => {
    const name = row.dataset.name || "";
    const show = name.includes(search);
    row.style.display = show ? "" : "none";
  });
}


// Modal de Colaboradores
function openUserModal() {
  const overlay = document.getElementById("userModalOverlay");
  const form = document.getElementById("userRegisterForm");
  const titleText = document.getElementById("modalUserTitleText");
  const passwordGroup = document.getElementById("passwordGroup");
  const passwordInput = document.getElementById("newUserPassword");

  // Reset to CREATE mode
  form.action = "/personal/crear";
  form.reset();
  document.getElementById("editUserId").value = "";
  if (titleText) titleText.innerText = "Registrar Nuevo Colaborador";
  if (passwordGroup) passwordGroup.style.display = "";
  if (passwordInput) passwordInput.required = true;

  // Reset photo preview
  const preview = document.getElementById("userPhotoPreview");
  const placeholder = document.getElementById("userPhotoPlaceholder");
  if (preview) preview.style.backgroundImage = "";
  if (placeholder) { placeholder.style.display = ""; placeholder.innerText = "CC"; }
  document.getElementById("newUserPhotoData").value = "";

  if (overlay) overlay.classList.add("active");
}

function openEditUserModal(id, name, email, role, shift, photo) {
  const overlay = document.getElementById("userModalOverlay");
  const form = document.getElementById("userRegisterForm");
  const titleText = document.getElementById("modalUserTitleText");
  const passwordGroup = document.getElementById("passwordGroup");
  const passwordInput = document.getElementById("newUserPassword");

  // Switch to EDIT mode
  form.action = `/personal/editar/${id}`;
  document.getElementById("editUserId").value = id;
  if (titleText) titleText.innerText = "Editar Colaborador";

  // Fill fields
  document.getElementById("newUserName").value = name;
  document.getElementById("newUserEmail").value = email;
  document.getElementById("newUserRole").value = role;
  document.getElementById("newUserShift").value = shift;

  // Password is optional on edit
  if (passwordGroup) passwordGroup.style.display = "";
  if (passwordInput) { passwordInput.value = ""; passwordInput.required = false; }

  // Handle photo preview
  const preview = document.getElementById("userPhotoPreview");
  const placeholder = document.getElementById("userPhotoPlaceholder");
  const photoInput = document.getElementById("newUserPhotoData");
  if (photo && photo.trim() !== "") {
    if (preview) preview.style.backgroundImage = `url('${photo}')`;
    if (placeholder) placeholder.style.display = "none";
    if (photoInput) photoInput.value = photo;
  } else {
    if (preview) preview.style.backgroundImage = "";
    if (placeholder) { placeholder.style.display = ""; placeholder.innerText = name.substring(0,2).toUpperCase(); }
    if (photoInput) photoInput.value = "";
  }

  if (overlay) overlay.classList.add("active");
}

function closeUserModal() {
  const overlay = document.getElementById("userModalOverlay");
  if (overlay) overlay.classList.remove("active");
  document.getElementById("userRegisterForm")?.reset();
}

function previewUserPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const MAX_SIZE = 300; 
  const QUALITY = 0.75;   

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      // Calculate scaled dimensions keeping aspect ratio
      let w = img.width, h = img.height;
      if (w > h && w > MAX_SIZE) { h = Math.round(h * MAX_SIZE / w); w = MAX_SIZE; }
      else if (h > MAX_SIZE) { w = Math.round(w * MAX_SIZE / h); h = MAX_SIZE; }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);

      const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);

      const preview = document.getElementById("userPhotoPreview");
      const placeholder = document.getElementById("userPhotoPlaceholder");
      const hiddenInput = document.getElementById("newUserPhotoData");

      if (preview) {
        preview.style.backgroundImage = `url('${dataUrl}')`;
        preview.style.backgroundSize = "cover";
        preview.style.backgroundPosition = "center";
      }
      if (placeholder) placeholder.style.display = "none";
      if (hiddenInput) hiddenInput.value = dataUrl;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}


// Modal de Productos
function openProductModal() {
  const overlay = document.getElementById("productModalOverlay");
  const form = document.getElementById("productRegisterForm");
  const titleText = document.getElementById("modalProductTitleText");

  // Reset to CREATE mode
  form.action = "/inventario/crear";
  form.reset();
  document.getElementById("editProductId").value = "";
  if (titleText) titleText.innerText = "Registrar Nuevo Producto";

  // Reset photo preview
  const preview = document.getElementById("productPhotoPreview");
  if (preview) { preview.style.backgroundImage = ""; preview.innerHTML = ""; }
  document.getElementById("newProductPhotoData").value = "";

  if (overlay) overlay.classList.add("active");
}

function openEditProductModal(id, name, price, stock, categoryId, statusId, photo) {
  const overlay = document.getElementById("productModalOverlay");
  const form = document.getElementById("productRegisterForm");
  const titleText = document.getElementById("modalProductTitleText");

  // Switch to EDIT mode
  form.action = `/inventario/editar/${id}`;
  document.getElementById("editProductId").value = id;
  if (titleText) titleText.innerText = "Editar Producto";

  // Fill fields
  document.getElementById("newProductName").value = name;
  document.getElementById("newProductPrice").value = price;
  document.getElementById("newProductStock").value = stock;
  const catSelect = document.getElementById("newProductCategory");
  if (catSelect) catSelect.value = categoryId;
  const statusSelect = document.getElementById("newProductStatus");
  if (statusSelect) statusSelect.value = statusId;

  // Handle photo preview
  const preview = document.getElementById("productPhotoPreview");
  const photoInput = document.getElementById("newProductPhotoData");
  if (photo && photo.trim() !== "") {
    if (preview) {
      preview.style.backgroundImage = `url('${photo}')`;
      preview.style.backgroundSize = "cover";
      preview.style.backgroundPosition = "center";
      preview.innerHTML = "";
    }
    if (photoInput) photoInput.value = photo;
  } else {
    if (preview) { preview.style.backgroundImage = ""; preview.innerHTML = ""; }
    if (photoInput) photoInput.value = "";
  }

  if (overlay) overlay.classList.add("active");
}

function closeProductModal() {
  const overlay = document.getElementById("productModalOverlay");
  if (overlay) overlay.classList.remove("active");
  document.getElementById("productRegisterForm")?.reset();
}

function previewProductPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const MAX_SIZE = 400;
  const QUALITY = 0.80;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      let w = img.width, h = img.height;
      if (w > h && w > MAX_SIZE) { h = Math.round(h * MAX_SIZE / w); w = MAX_SIZE; }
      else if (h > MAX_SIZE) { w = Math.round(w * MAX_SIZE / h); h = MAX_SIZE; }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);

      const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);

      const preview = document.getElementById("productPhotoPreview");
      const hiddenInput = document.getElementById("newProductPhotoData");
      if (preview) {
        preview.style.backgroundImage = `url('${dataUrl}')`;
        preview.style.backgroundSize = "cover";
        preview.style.backgroundPosition = "center";
        preview.innerHTML = "";
      }
      if (hiddenInput) hiddenInput.value = dataUrl;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}


// Modal de Mi Perfil (Autoservicio)
function openMyProfileModal() {
  const overlay = document.getElementById("myProfileModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function closeMyProfileModal() {
  const overlay = document.getElementById("myProfileModalOverlay");
  if (overlay) overlay.classList.remove("active");
}

// Modal de Categorías
function openCategoryModal() {
  const overlay = document.getElementById("categoryModalOverlay");
  if (overlay) overlay.classList.add("active");
}
function closeCategoryModal() {
  const overlay = document.getElementById("categoryModalOverlay");
  if (overlay) overlay.classList.remove("active");
}

// Modal de Reportes
function openReportPreviewer(reportTitle) {
  const overlay = document.getElementById("reportPreviewModalOverlay");
  const titleText = document.getElementById("modalReportTitleText");
  const sheet = document.getElementById("reportPreviewSheet");
  
  if (titleText) titleText.innerText = `Previsualización: ${reportTitle}`;
  if (sheet) {
    sheet.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <h3 style="color: var(--color-primary); margin-bottom: 10px;">${reportTitle}</h3>
        <p style="color: var(--color-muted); font-size: 0.9rem;">Coffee-Code Sistema de Auditoría Digital</p>
        <hr style="border: 0; border-top: 1px dashed var(--color-border); margin: 20px 0;">
        <p style="font-size: 0.85rem; line-height: 1.8;">Este documento es generado automáticamente con los registros oficiales de la base de datos de PostgreSQL en Docker y cuenta con firmas criptográficas de validez académica.</p>
        <span class="badge badge-active" style="margin-top: 15px;">VISTA PREVIA COMPILADA</span>
      </div>
    `;
  }
  if (overlay) overlay.classList.add("active");
}
function closeReportPreviewer() {
  const overlay = document.getElementById("reportPreviewModalOverlay");
  if (overlay) overlay.classList.remove("active");
}



// ==========================================
// TOAST & ACCIONES MOCK
// ==========================================
function showToast(message, type) {
  const toast = document.getElementById("toastNotification");
  const toastMsg = document.getElementById("toastMessage");
  const toastIcon = document.getElementById("toastIcon");
  if (!toast || !toastMsg) return;

  // Set type (success/error) for CSS color theming
  const toastType = (type === 'error') ? 'error' : 'success';
  toast.setAttribute("data-type", toastType);

  // Swap icon based on type
  if (toastIcon) {
    if (toastType === 'error') {
      toastIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />';
    } else {
      toastIcon.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />';
    }
  }

  toastMsg.innerText = message;
  toast.classList.remove("active");
  // Force reflow to restart animation
  void toast.offsetWidth;
  toast.classList.add("active");
  setTimeout(() => {
    toast.classList.remove("active");
  }, 4000);
}

function triggerReportDownload(reportName, format, tableId) {
  const table = document.getElementById(tableId);
  if (!table && tableId) {
    showToast(`Error: No se encontraron los datos para el reporte.`, 'error');
    return;
  }

  showToast(`Generando ${reportName} en formato ${format}...`, 'success');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${reportName}_${dateStr}`;

  if (format === 'Excel') {
    try {
      if (typeof XLSX === 'undefined') throw new Error("Librería SheetJS no cargada.");
      const wb = XLSX.utils.table_to_book(table, { sheet: "Reporte" });
      XLSX.writeFile(wb, `${filename}.xlsx`);
      setTimeout(() => showToast(`✓ Archivo Excel generado con éxito`, 'success'), 1500);
    } catch (err) {
      console.error(err);
      showToast('Error al generar el archivo Excel', 'error');
    }
  } else if (format === 'PDF') {
    try {
      if (!window.jspdf) throw new Error("Librería jsPDF no cargada.");
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('landscape');
      
      const title = reportName.replace(/_/g, ' ');
      doc.setFontSize(18);
      doc.setTextColor(56, 37, 25); // #382519
      doc.text(title, 14, 22);
      
      doc.autoTable({
        html: `#${tableId}`,
        startY: 30,
        theme: 'grid',
        headStyles: { 
          fillColor: [144, 105, 74], // Color principal café (#90694a)
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 4,
          textColor: [51, 51, 51]
        }
      });
      
      doc.save(`${filename}.pdf`);
      showToast(`✓ Archivo PDF generado con éxito`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al generar el archivo PDF', 'error');
    }
  }
}

// ==========================================
// MODAL DE CONFIRMACIÓN GLOBAL
// ==========================================
function showConfirmModal(title, message, actionUrl) {
  const overlay = document.getElementById('globalConfirmModalOverlay');
  if (overlay) {
    document.getElementById('confirmModalTitle').innerText = title;
    document.getElementById('confirmModalMessage').innerText = message;
    
    const actionBtn = document.getElementById('confirmModalActionBtn');
    actionBtn.href = actionUrl;
    
    overlay.classList.add('active');
  } else {
    // Fallback if modal HTML is not present
    if (confirm(message)) {
      window.location.href = actionUrl;
    }
  }
}

function closeConfirmModal() {
  const overlay = document.getElementById('globalConfirmModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

