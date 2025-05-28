import UserGroupManager from "../../Init/InitUserGroup.js";
const userGroupManager = new UserGroupManager();
userGroupManager.add("ADMIN", "Nhóm quản trị");
userGroupManager.add("USER", "Nhóm người dùng");

let editMode = false;
let editCode = null;

function renderUserGroupTable() {
  const tbody = document.querySelector("#userGroupTable tbody");
  tbody.innerHTML = "";
  userGroupManager.getAll().forEach((group) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <button class="btn btn-sm btn-warning me-1 btn-edit" data-code="${group.code}"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-sm btn-danger btn-delete" data-code="${group.code}"><i class="bi bi-trash"></i></button>
      </td>
      <td>${group.code}</td>
      <td>${group.name}</td>
    `;
    tbody.appendChild(tr);
  });

  // Gán sự kiện sửa
  tbody.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.onclick = function () {
      const code = this.getAttribute("data-code");
      const group = userGroupManager.get(code);
      if (group) {
        editMode = true;
        editCode = code;
        document.getElementById("userGroupModalLabel").innerText =
          "Chỉnh sửa nhóm";
        document.getElementById("groupCode").value = group.code;
        document.getElementById("groupCode").disabled = true;
        document.getElementById("groupName").value = group.name;
        document.getElementById("modalError").style.display = "none";
        new bootstrap.Modal(document.getElementById("userGroupModal")).show();
      }
    };
  });

  // Gán sự kiện xóa (nếu muốn)
  tbody.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.onclick = function () {
      const code = this.getAttribute("data-code");
      userGroupManager.delete(code);
      renderUserGroupTable();
    };
  });
}

// Xử lý nút Thêm
document.getElementById("btnAdd").onclick = function () {
  editMode = false;
  editCode = null;
  document.getElementById("userGroupModalLabel").innerText = "Thêm nhóm";
  document.getElementById("groupCode").value = "";
  document.getElementById("groupCode").disabled = false;
  document.getElementById("groupName").value = "";
  document.getElementById("modalError").style.display = "none";
  new bootstrap.Modal(document.getElementById("userGroupModal")).show();
};

// Xử lý submit form
document.getElementById("userGroupForm").onsubmit = function (e) {
  e.preventDefault();
  const code = document.getElementById("groupCode").value.trim();
  const name = document.getElementById("groupName").value.trim();
  const errorDiv = document.getElementById("modalError");
  errorDiv.style.display = "none";
  if (!code || !name) {
    errorDiv.innerText = "Vui lòng nhập đầy đủ thông tin!";
    errorDiv.style.display = "block";
    return;
  }
  if (editMode) {
    userGroupManager.update(editCode, name);
  } else {
    if (!userGroupManager.add(code, name)) {
      errorDiv.innerText = "Mã nhóm đã tồn tại!";
      errorDiv.style.display = "block";
      return;
    }
  }
  bootstrap.Modal.getInstance(document.getElementById("userGroupModal")).hide();
  renderUserGroupTable();
};

renderUserGroupTable();
