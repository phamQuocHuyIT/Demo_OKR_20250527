import DepartmentManager from "../../Init/InitDepartment.js";
import UserGroupManager from "../../Init/InitUserGroup.js";
import UserManager from "../../Init/InitUser.js";

// Khởi tạo các manager
const departmentManager = new DepartmentManager();
const userGroupManager = new UserGroupManager();
const userManager = new UserManager();

// Mảng chức vụ mẫu
const positions = [
  { code: "DEV", name: "Lập trình viên" },
  { code: "HR", name: "Nhân sự" },
  { code: "ACC", name: "Kế toán" },
];

// Hàm render bảng người dùng
function renderUserTable() {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = "";
  userManager.getAll().forEach((user) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.code}</td>
      <td>${user.name}</td>
      <td>${user.gender == 1 ? "Nam" : "Nữ"}</td>
      <td>${user.birth}</td>
      <td>${getPositionName(user.position)}</td>
      <td>${getDepartmentName(user.department)}</td>
      <td>${getRoleName(user.role)}</td>
      <td>
        <button class="btn btn-sm btn-warning btn-edit" data-code="${
          user.code
        }"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger btn-delete" data-code="${
          user.code
        }"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Gán sự kiện sửa
  tbody.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.onclick = function () {
      const code = this.getAttribute("data-code");
      const user = userManager.get(code);
      if (user) openUserModal(true, user);
    };
  });

  // Gán sự kiện xóa
  tbody.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.onclick = function () {
      const code = this.getAttribute("data-code");
      if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
        userManager.delete(code);
        renderUserTable();
      }
    };
  });
}

// Lấy tên phòng ban từ code
function getDepartmentName(code) {
  let dep = departmentManager.get(code);
  return dep ? dep.name : "";
}

// Lấy tên chức vụ từ code
function getPositionName(code) {
  const pos = positions.find((p) => p.code === code);
  return pos ? pos.name : "";
}

// Lấy tên vai trò từ code
function getRoleName(code) {
  const role = userGroupManager.get(code);
  return role ? role.name : "";
}

// Hàm mở modal thêm/sửa người dùng
function openUserModal(editMode = false, userData = null) {
  document.getElementById("userModalLabel").innerText = editMode
    ? "Chỉnh sửa người dùng"
    : "Thêm người dùng";
  document.getElementById("userForm").reset();
  document.getElementById("userModalError").style.display = "none";

  // Đổ dữ liệu nếu là sửa
  if (editMode && userData) {
    document.getElementById("userCode").value = userData.code;
    document.getElementById("userCode").disabled = true;
    document.getElementById("userName").value = userData.name;
    document.getElementById("userGender").value = userData.gender;
    document.getElementById("userBirth").value = userData.birth;
    document.getElementById("userPosition").value = userData.position;
    document.getElementById("userDepartment").value = userData.department;
    document.getElementById("userRole").value = userData.role;
  } else {
    document.getElementById("userCode").disabled = false;
  }

  // Đổ dữ liệu phòng ban
  const depSelect = document.getElementById("userDepartment");
  depSelect.innerHTML = "";
  departmentManager.getAll().forEach((dep) => {
    depSelect.innerHTML += `<option value="${dep.code}">${dep.name}</option>`;
  });

  // Đổ dữ liệu chức vụ
  const posSelect = document.getElementById("userPosition");
  posSelect.innerHTML = "";
  positions.forEach((pos) => {
    posSelect.innerHTML += `<option value="${pos.code}">${pos.name}</option>`;
  });

  // Đổ dữ liệu vai trò
  const roleSelect = document.getElementById("userRole");
  roleSelect.innerHTML = "";
  userGroupManager.getAll().forEach((role) => {
    roleSelect.innerHTML += `<option value="${role.code}">${role.name}</option>`;
  });

  // Hiện modal
  new bootstrap.Modal(document.getElementById("userModal")).show();
}

// Sự kiện nút thêm mới
document.getElementById("btnAddUser").onclick = function () {
  openUserModal(false);
};

// Xử lý submit form
document.getElementById("userForm").onsubmit = function (e) {
  e.preventDefault();
  const code = document.getElementById("userCode").value.trim();
  const name = document.getElementById("userName").value.trim();
  const gender = document.getElementById("userGender").value;
  const birth = document.getElementById("userBirth").value;
  const position = document.getElementById("userPosition").value;
  const department = document.getElementById("userDepartment").value;
  const role = document.getElementById("userRole").value;
  const errorDiv = document.getElementById("userModalError");

  if (!code || !name || !birth || !position || !department || !role) {
    errorDiv.innerText = "Vui lòng nhập đầy đủ thông tin!";
    errorDiv.style.display = "block";
    return;
  }

  if (document.getElementById("userCode").disabled) {
    // Chỉnh sửa
    userManager.update(code, {
      name,
      gender,
      birth,
      position,
      department,
      role,
    });
  } else {
    // Thêm mới
    if (
      !userManager.add({
        code,
        name,
        gender,
        birth,
        position,
        department,
        role,
      })
    ) {
      errorDiv.innerText = "Mã người dùng đã tồn tại!";
      errorDiv.style.display = "block";
      return;
    }
  }

  bootstrap.Modal.getInstance(document.getElementById("userModal")).hide();
  renderUserTable();
};

// Gọi khi trang load
renderUserTable();
