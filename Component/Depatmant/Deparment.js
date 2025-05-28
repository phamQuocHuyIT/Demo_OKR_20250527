import DepartmentManager from "../../Init/InitDepartment.js";

const departmentManager = new DepartmentManager();

let editMode = false;
let editCode = null;

// Render danh sách phòng ban
function renderDepartmentTable() {
  const tbody = document.getElementById("departmentList");
  tbody.innerHTML = "";
  const departments = departmentManager.getAll();
  departments.forEach((dep) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <button class="btn btn-sm btn-warning me-1 btn-edit" data-code="${dep.code}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger btn-delete" data-code="${dep.code}"><i class="bi bi-trash"></i></button>
      </td>
      <td>${dep.code}</td>
      <td>${dep.name}</td>
    `;
    tbody.appendChild(tr);
  });

  // Gán sự kiện sửa
  tbody.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.onclick = function () {
      const code = this.getAttribute("data-code");
      const dep = departmentManager.get(code);
      if (dep) {
        editMode = true;
        editCode = code;
        openDepartmentModal(dep);
      }
    };
  });

  // Gán sự kiện xóa
  tbody.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.onclick = function () {
      const code = this.getAttribute("data-code");
      if (confirm("Bạn có chắc muốn xóa phòng ban này?")) {
        departmentManager.delete(code);
        renderDepartmentTable();
      }
    };
  });
}

// Mở modal thêm/sửa phòng ban
function openDepartmentModal(dep = null) {
  document.getElementById("departmentModalLabel").innerText = editMode
    ? "Chỉnh sửa phòng ban"
    : "Thêm phòng ban";
  document.getElementById("departmentForm").reset();
  document.getElementById("modalError").style.display = "none";
  if (dep) {
    document.getElementById("departmentCode").value = dep.code;
    document.getElementById("departmentCode").disabled = true;
    document.getElementById("departmentName").value = dep.name;
  } else {
    document.getElementById("departmentCode").disabled = false;
    document.getElementById("departmentCode").value = "";
    document.getElementById("departmentName").value = "";
  }
  new bootstrap.Modal(document.getElementById("departmentModal")).show();
}

// Sự kiện nút Thêm mới
document.getElementById("btnAdd").onclick = function () {
  editMode = false;
  editCode = null;
  openDepartmentModal();
};

// Xử lý submit form
document.getElementById("departmentForm").onsubmit = function (e) {
  e.preventDefault();
  const code = document.getElementById("departmentCode").value.trim();
  const name = document.getElementById("departmentName").value.trim();
  const errorDiv = document.getElementById("modalError");
  errorDiv.style.display = "none";

  if (!code || !name) {
    errorDiv.innerText = "Vui lòng nhập đầy đủ thông tin!";
    errorDiv.style.display = "block";
    return;
  }

  if (editMode) {
    departmentManager.update(editCode, name);
  } else {
    if (!departmentManager.add(code, name)) {
      errorDiv.innerText = "Mã phòng đã tồn tại!";
      errorDiv.style.display = "block";
      return;
    }
  }

  bootstrap.Modal.getInstance(
    document.getElementById("departmentModal")
  ).hide();
  renderDepartmentTable();
};

// Render lần đầu
renderDepartmentTable();
