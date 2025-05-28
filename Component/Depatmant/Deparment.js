// Department class definition
class Department {
    constructor(id, code, name, status = true) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.status = status;
        this.createdDate = new Date();
    }
}

// State management
let departments = {};
let currentDepartment = null;
let departmentModal = null;

// Helpers
function showAlert(message, isSuccess = true) {
    const alert = document.getElementById('alertMessage');
    alert.className = `alert ${isSuccess ? 'alert-success' : 'alert-error'}`;
    alert.style.display = 'block';
    document.getElementById('alertText').textContent = message;
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('vi-VN');
}

function getDepartmentsArray() {
    return Object.values(departments);
}

// Modal Operations
function showDepartmentModal(isEdit = false) {
    if (!departmentModal) {
        departmentModal = new bootstrap.Modal(document.getElementById('departmentModal'));
    }
    
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.textContent = isEdit ? 'Sửa phòng ban' : 'Thêm phòng ban mới';
    
    if (!isEdit) {
        document.getElementById('deptCode').disabled = false;
        document.getElementById('departmentForm').reset();
    }
    
    departmentModal.show();
}

function editDepartment(code) {
    currentDepartment = departments[code];
    if (currentDepartment) {
        // Reset form validation
        const form = document.getElementById('departmentForm');
        form.classList.remove('was-validated');

        // Điền thông tin vào form
        document.getElementById('deptCode').value = currentDepartment.code;
        document.getElementById('deptCode').disabled = true; // Không cho phép sửa mã
        document.getElementById('deptName').value = currentDepartment.name;
        document.getElementById('deptStatus').value = currentDepartment.status.toString();
        
        showDepartmentModal(true);
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    document.getElementById('toastText').textContent = message;
    
    const bsToast = new bootstrap.Toast(toast, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    bsToast.show();
}

function saveDepartment() {
    const form = document.getElementById('departmentForm');
    const codeInput = document.getElementById('deptCode');
    const nameInput = document.getElementById('deptName');
    const statusInput = document.getElementById('deptStatus');
    
    const code = codeInput.value.trim();
    const name = nameInput.value.trim();
    const status = statusInput.value === 'true';
    
    // Validate inputs
    let isValid = true;
    
    if (!code || !/^PB\d{3}$/.test(code)) {
        codeInput.classList.add('is-invalid');
        showToast('Vui lòng nhập mã phòng ban đúng định dạng PBxxx', 'danger');
        isValid = false;
    } else {
        codeInput.classList.remove('is-invalid');
    }
    
    if (!name || name.length < 3) {
        nameInput.classList.add('is-invalid');
        showToast('Tên phòng ban phải có ít nhất 3 ký tự', 'danger');
        isValid = false;
    } else {
        nameInput.classList.remove('is-invalid');
    }
    
    if (!currentDepartment && departments[code]) {
        showToast('Mã phòng ban đã tồn tại!', 'danger');
        codeInput.classList.add('is-invalid');
        isValid = false;
    }
    
    if (!isValid) {
        return false;
    }
    
    try {
        // Prepare department data
        const departmentData = currentDepartment 
            ? {
                ...currentDepartment,
                name,
                status,
                updatedDate: new Date()
              }
            : new Department(Date.now(), code, name, status);
            
        // Save to departments object
        departments[code] = departmentData;
        
        // Save to storage
        saveToStorage();
        
        // Update UI
        refreshTable();
        
        // Reset form and state
        form.reset();
        currentDepartment = null;
        codeInput.disabled = false;
        
        return true;
        
    } catch (error) {
        console.error('Lỗi khi lưu phòng ban:', error);
        showToast('Đã xảy ra lỗi khi lưu phòng ban!', 'danger');
        return false;
    }
}

function deleteDepartment(code) {
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
      document.getElementById('confirmDelete').onclick = () => {
        delete departments[code];
        deleteModal.hide();
        showToast('Xóa phòng ban thành công!', 'success');
        saveToStorage();
        refreshTable();
    };
}

function searchDepartments() {
    const searchCode = document.getElementById('ma').value.toLowerCase().trim();
    const searchName = document.getElementById('ten').value.toLowerCase().trim();
    
    if (!searchCode && !searchName) {
        refreshTable();
        return;
    }
    
    const filteredDepts = getDepartmentsArray().filter(dept => 
        (!searchCode || dept.code.toLowerCase().includes(searchCode)) &&
        (!searchName || dept.name.toLowerCase().includes(searchName))
    );
      if (filteredDepts.length === 0) {
        showToast('Không tìm thấy phòng ban nào', 'warning');
        const tbody = document.getElementById('departmentList');
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Không tìm thấy phòng ban nào</td>
            </tr>
        `;
        document.getElementById('totalRecords').textContent = '0 phòng ban';} else {
        showToast(`Tìm thấy ${filteredDepts.length} phòng ban`, 'success');
        refreshTable(filteredDepts);
    }
}

function validateInput(code, name) {
    if (!code || !name) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'danger');
        return false;
    }
    return true;
}

function refreshTable(deptList = getDepartmentsArray()) {
    const tbody = document.getElementById('departmentList');
    tbody.innerHTML = '';
    
    deptList.forEach(dept => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="action-buttons">
                <button onclick="editDepartment('${dept.code}')" class="btn btn-warning btn-sm btn-edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteDepartment('${dept.code}')" class="btn btn-danger btn-sm btn-delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
            <td>${dept.code}</td>
            <td>${dept.name}</td>
            <td>${formatDate(dept.createdDate)}</td>
            <td>
                <span class="badge ${dept.status ? 'bg-success' : 'bg-danger'}">
                    ${dept.status ? 'Hoạt động' : 'Không hoạt động'}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('totalRecords').textContent = `${deptList.length} phòng ban`;
}

// Storage Operations
function saveToStorage() {
    DepartmentStorage.saveData(departments);
}

// Typeahead configuration
function initializeTypeahead() {
    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    $('#ma').typeahead({
        source: function(query, process) {
            return getDepartmentsArray().filter(dept => 
                dept.code.toLowerCase().includes(query.toLowerCase()) ||
                dept.name.toLowerCase().includes(query.toLowerCase())
            );
        },
        displayText: function(item) {
            return item.code;
        },
        afterSelect: function(item) {
            $('#ten').val(item.name);
            searchDepartments();
        },
        highlighter: function(item) {
            const dept = typeof item === 'string' ? { code: item } : item;
            const query = this.query;
            return `
                <div class="department-suggestion">
                    <div>
                        <div>${highlightText(dept.code, query)}</div>
                        <small class="text-muted">${highlightText(dept.name, query)}</small>
                    </div>
                    <span class="badge ${dept.status ? 'bg-success' : 'bg-danger'}">
                        ${dept.status ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                </div>
            `;
        },
        minLength: 1,
        items: 'all',
        fitToElement: true,
        autoSelect: false
    });

    $('#ten').typeahead({
        source: function(query, process) {
            return getDepartmentsArray().filter(dept => 
                dept.name.toLowerCase().includes(query.toLowerCase()) ||
                dept.code.toLowerCase().includes(query.toLowerCase())
            );
        },
        displayText: function(item) {
            return item.name;
        },
        afterSelect: function(item) {
            $('#ma').val(item.code);
            searchDepartments();
        },
        highlighter: function(item) {
            const dept = typeof item === 'string' ? { name: item } : item;
            const query = this.query;
            return `
                <div class="department-suggestion">
                    <div>
                        <div>${highlightText(dept.name, query)}</div>
                        <small class="text-muted">${highlightText(dept.code, query)}</small>
                    </div>
                    <span class="badge ${dept.status ? 'bg-success' : 'bg-danger'}">
                        ${dept.status ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                </div>
            `;
        },
        minLength: 1,
        items: 'all',
        fitToElement: true,
        autoSelect: false
    });
}

// Event Listeners
window.onload = function() {
    // Initialize modals
    departmentModal = new bootstrap.Modal(document.getElementById('departmentModal'));
    
    // Button event listeners
    document.getElementById('btnAdd').onclick = () => showDepartmentModal(false);
    document.getElementById('btnSaveDepartment').onclick = () => {
        // Show loading state
        const saveBtn = document.getElementById('btnSaveDepartment');
        const originalText = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        
        // Attempt to save
        if (saveDepartment()) {
            departmentModal.hide();
            showToast('Đã lưu phòng ban thành công!', 'success');
        }
        
        // Reset button state
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    };
    document.getElementById('btnSearch').onclick = searchDepartments;
    document.getElementById('btnReset').onclick = () => {
        document.getElementById('ma').value = '';
        document.getElementById('ten').value = '';
        refreshTable();
    };

    // Load initial data
    departments = DepartmentStorage.initData();
    refreshTable();

    // Initialize typeahead
    initializeTypeahead();
    
    // Modal events
    document.getElementById('departmentModal').addEventListener('hidden.bs.modal', function() {
        document.getElementById('departmentForm').reset();
        document.getElementById('deptCode').classList.remove('is-invalid');
        document.getElementById('deptName').classList.remove('is-invalid');
    });

    // Form validation
    document.getElementById('deptCode').addEventListener('input', function() {
        this.value = this.value.toUpperCase();
        if (!/^PB\d{0,3}$/.test(this.value)) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });

    document.getElementById('deptName').addEventListener('input', function() {
        if (this.value.trim().length < 3) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });
};