import OkrManager from "../../Init/initOkr.js";
import UserManager from "../../Init/InitUser.js";

const okrManager = new OkrManager();
const userManager = new UserManager();

let editMode = false;
let editCode = null;

// Trạng thái OKR
const okrStatusMap = [
  "Không hoàn thành",
  "Nháp",
  "Đang tiến hành",
  "Hoàn thành",
];

// Trạng thái KeyResult
const keyResultStatusMap = [
  "Chưa bắt đầu",
  "Đang chuẩn bị",
  "Đang lên kế hoạch",
  "Đang tiến hành",
  "Đã nghiệm thu",
];

// Render danh sách OKR
function renderOkrTable() {
  const tbody = document.getElementById("okrList");
  tbody.innerHTML = "";
  okrManager.getAll().forEach((okr) => {
    const users = (okr.users || [])
      .map((code) => {
        const user = userManager.get(code);
        return user ? user.name : code;
      })
      .join(", ");
    const keyResults = (okr.keyResults || [])
      .map(
        (kr) =>
          `<li>${kr.name} <span class="badge bg-info">${
            keyResultStatusMap[kr.status]
          }</span></li>`
      )
      .join("");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <button class="btn btn-warning btn-sm btn-edit" data-code="${okr.code}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-danger btn-sm btn-delete" data-code="${
          okr.code
        }">
          <i class="bi bi-trash"></i>
        </button>
      </td>
      <td>${okr.code}</td>
      <td>${okr.name}</td>
      <td>${okr.startDate || ""}</td>
      <td>${okr.endDate || ""}</td>
      <td><span class="badge bg-secondary">${
        okrStatusMap[okr.status] || ""
      }</span></td>
      <td>${users}</td>
      <td><ul class="mb-0">${keyResults}</ul></td>
    `;
    tbody.appendChild(tr);
  });

  // Sửa
  tbody.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.onclick = function () {
      const code = this.getAttribute("data-code");
      const okr = okrManager.get(code);
      if (okr) {
        editMode = true;
        editCode = code;
        openOkrModal(okr);
      }
    };
  });

  // Xóa
  tbody.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.onclick = function () {
      const code = this.getAttribute("data-code");
      if (confirm("Bạn có chắc muốn xóa OKR này?")) {
        okrManager.delete(code);
        renderOkrTable();
      }
    };
  });
}

// Render danh sách user vào select (dropdown) và KHÔNG gán lại onchange nhiều lần
function renderUserOptions(selected = []) {
  const select = document.getElementById("okrUsers");
  select.innerHTML = "";
  userManager.getAll().forEach((user) => {
    const option = document.createElement("option");
    option.value = user.code;
    option.textContent = user.name;
    if (selected.includes(user.code)) option.selected = true;
    select.appendChild(option);
  });
  updateSelectedUsersDisplay();
}

// Gán sự kiện onchange cho select chỉ 1 lần
function setupUserSelectEvent() {
  const select = document.getElementById("okrUsers");
  if (!select.dataset.hasEvent) {
    select.addEventListener("change", updateSelectedUsersDisplay);
    select.dataset.hasEvent = "1";
  }
}

// Hiển thị người dùng đã chọn
function updateSelectedUsersDisplay() {
  const select = document.getElementById("okrUsers");
  const selectedCodes = Array.from(select.selectedOptions).map(
    (opt) => opt.value
  );
  const users = userManager
    .getAll()
    .filter((u) => selectedCodes.includes(u.code));
  const div = document.getElementById("okrSelectedUsers");
  div.innerHTML = users
    .map((u) => `<span class="badge bg-info me-1">${u.name}</span>`)
    .join("");
}

// Render danh sách KeyResult trong modal
function renderKeyResultsList(keyResults = []) {
  const list = document.getElementById("keyResultsList");
  list.innerHTML = "";
  keyResults.forEach((kr, idx) => {
    const row = document.createElement("div");
    row.className = "row align-items-end mb-2";
    row.innerHTML = `
      <div class="col-md-6">
        <input type="text" class="form-control" placeholder="Tên Key Result" value="${
          kr.name || ""
        }" data-kr-idx="${idx}" data-kr-field="name" required />
      </div>
      <div class="col-md-4">
        <select class="form-select" data-kr-idx="${idx}" data-kr-field="status">
          ${keyResultStatusMap
            .map(
              (s, i) =>
                `<option value="${i}" ${
                  kr.status == i ? "selected" : ""
                }>${s}</option>`
            )
            .join("")}
        </select>
      </div>
      <div class="col-md-2">
        <button type="button" class="btn btn-danger btn-sm btn-remove-kr" data-kr-idx="${idx}">
          <i class="bi bi-x"></i>
        </button>
      </div>
    `;
    list.appendChild(row);
  });

  // Xóa KeyResult
  list.querySelectorAll(".btn-remove-kr").forEach((btn) => {
    btn.onclick = function () {
      const idx = +this.getAttribute("data-kr-idx");
      keyResults.splice(idx, 1);
      renderKeyResultsList(keyResults);
    };
  });

  // Sửa tên hoặc trạng thái KeyResult
  list
    .querySelectorAll("input[data-kr-field],select[data-kr-field]")
    .forEach((el) => {
      el.oninput = function () {
        const idx = +this.getAttribute("data-kr-idx");
        const field = this.getAttribute("data-kr-field");
        keyResults[idx][field] = field === "status" ? +this.value : this.value;
      };
    });
}

// Mở modal thêm/sửa OKR
function openOkrModal(okr = null) {
  document.getElementById("okrModalLabel").innerText = editMode
    ? "Chỉnh sửa OKR"
    : "Thêm OKR";
  document.getElementById("okrForm").reset();
  document.getElementById("okrModalError").style.display = "none";

  // KeyResults tạm cho modal
  let keyResults =
    okr && okr.keyResults ? JSON.parse(JSON.stringify(okr.keyResults)) : [];

  // Đổ dữ liệu nếu sửa
  if (okr) {
    document.getElementById("okrCode").value = okr.code;
    document.getElementById("okrCode").disabled = true;
    document.getElementById("okrName").value = okr.name;
    document.getElementById("okrStartDate").value = okr.startDate || "";
    document.getElementById("okrEndDate").value = okr.endDate || "";
    document.getElementById("okrStatus").value = okr.status;
    renderUserOptions(okr.users || []);
  } else {
    document.getElementById("okrCode").disabled = false;
    renderUserOptions([]);
  }

  setupUserSelectEvent();
  renderKeyResultsList(keyResults);

  // Thêm KeyResult
  document.getElementById("btnAddKeyResult").onclick = function () {
    keyResults.push({ name: "", status: 0 });
    renderKeyResultsList(keyResults);
  };

  // Xử lý submit form
  document.getElementById("okrForm").onsubmit = function (e) {
    e.preventDefault();
    const code = document.getElementById("okrCode").value.trim();
    const name = document.getElementById("okrName").value.trim();
    const startDate = document.getElementById("okrStartDate").value;
    const endDate = document.getElementById("okrEndDate").value;
    const status = +document.getElementById("okrStatus").value;
    const users = Array.from(
      document.getElementById("okrUsers").selectedOptions
    ).map((opt) => opt.value);
    const errorDiv = document.getElementById("okrModalError");

    // Validate
    if (!code || !name || !startDate || !endDate || users.length === 0) {
      errorDiv.innerText = "Vui lòng nhập đầy đủ thông tin!";
      errorDiv.style.display = "block";
      return;
    }
    if (keyResults.length === 0 || keyResults.some((kr) => !kr.name)) {
      errorDiv.innerText = "Vui lòng nhập đầy đủ Key Result!";
      errorDiv.style.display = "block";
      return;
    }

    if (editMode) {
      okrManager.update(editCode, {
        code,
        name,
        startDate,
        endDate,
        status,
        users,
        keyResults,
      });
    } else {
      if (
        !okrManager.add({
          code,
          name,
          startDate,
          endDate,
          status,
          users,
          keyResults,
        })
      ) {
        errorDiv.innerText = "Mã OKR đã tồn tại!";
        errorDiv.style.display = "block";
        return;
      }
    }

    bootstrap.Modal.getInstance(document.getElementById("okrModal")).hide();
    renderOkrTable();
  };

  // Hiện modal
  new bootstrap.Modal(document.getElementById("okrModal")).show();
}

// Sự kiện nút Thêm mới
document.getElementById("btnAddOkr").onclick = function () {
  editMode = false;
  editCode = null;
  openOkrModal();
};

// Render lần đầu
renderOkrTable();
