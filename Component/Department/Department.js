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
function showToast(message, type = 'success') {
    const toast = new bootstrap.Toast(document.getElementById('successToast'));
    document.getElementById('toastText').textContent = message;
    
    const toastElement = document.getElementById('successToast');
    toastElement.classList.remove('bg-success', 'bg-danger', 'bg-warning');
    toastElement.classList.add(`bg-${type}`);
    
    toast.show();
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('vi-VN');
}

function getDepartmentsArray() {
    return Object.values(departments);
}

function showToast(message, type = 'success') {
    const toast = new bootstrap.Toast(document.getElementById('successToast'));
    document.getElementById('toastText').textContent = message;
    
    const toastElement = document.getElementById('successToast');
    toastElement.classList.remove('bg-success', 'bg-danger', 'bg-warning');
    toastElement.classList.add(`bg-${type}`);
    
    toast.show();
}

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
    const form = document.getElementById('departmentForm');
    const codeInput = document.getElementById('deptCode');
    
    // Reset form and validation states
    form.reset();
    form.classList.remove('was-validated');
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    
    // Set modal title based on mode
    modalTitle.textContent = isEdit ? 'Sửa phòng ban' : 'Thêm phòng ban mới';
    
    // Enable/disable code input based on mode
    if (!isEdit) {
        codeInput.disabled = false;
        currentDepartment = null;
    }
    
    departmentModal.show();
}

function editDepartment(code) {
    if (!code || !departments[code]) {
        showToast('Không tìm thấy phòng ban!', 'danger');
        return;
    }

    try {
        // Get department data
        currentDepartment = departments[code];
        
        // Show modal with edit mode
        showDepartmentModal(true);
        
        // Fill form with current values
        const form = document.getElementById('departmentForm');
        form.elements['deptCode'].value = currentDepartment.code;
        form.elements['deptCode'].disabled = true; // Disable code editing
        form.elements['deptName'].value = currentDepartment.name;
        form.elements['deptStatus'].checked = currentDepartment.status;
        
    } catch (error) {
        console.error('Lỗi khi sửa phòng ban:', error);
        showToast('Đã xảy ra lỗi khi sửa phòng ban!', 'danger');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    
    // Set toast classes and animation
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.style.transition = 'all 0.3s ease-in-out';
    
    // Set toast content with icon
    let icon = 'check-circle';
    switch (type) {
        case 'danger':
            icon = 'exclamation-triangle';
            break;
        case 'warning':
            icon = 'exclamation-circle';
            break;
        case 'info':
            icon = 'info-circle';
            break;
    }
    
    document.getElementById('toastText').innerHTML = `
        <i class="fas fa-${icon} me-2"></i>${message}
    `;
    
    // Create and show toast with custom options
    const bsToast = new bootstrap.Toast(toast, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    
    // Add fade-in animation
    toast.style.opacity = '0';
    bsToast.show();
    
    // Trigger reflow for animation
    toast.offsetHeight;
    toast.style.opacity = '1';
    
    // Add event listener for toast hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.style.opacity = '0';
    }, { once: true });
}

async function saveDepartment() {
    const saveBtn = document.getElementById('btnSaveDepartment');
    const form = document.getElementById('departmentForm');
    const fields = {
        code: document.getElementById('deptCode'),
        name: document.getElementById('deptName'),
        status: document.getElementById('deptStatus')
    };

    try {
        // Show loading state
        saveBtn.disabled = true;
        saveBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            <span class="ms-2">Đang lưu...</span>
        `;

        // Reset validation states
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        // Get and validate values
        const data = {
            code: fields.code.value.trim().toUpperCase(),
            name: fields.name.value.trim(),
            status: fields.status.checked
        };

        // Validate required fields
        let isValid = true;
        if (!data.code || !/^PB\d{3}$/.test(data.code)) {
            fields.code.classList.add('is-invalid');
            isValid = false;
        }

        if (!data.name || data.name.length < 3) {
            fields.name.classList.add('is-invalid');
            isValid = false;
        }

        if (!isValid) {
            showToast('Vui lòng điền đầy đủ thông tin!', 'danger');
            return false;
        }

        // Check for duplicate code when adding new
        if (!currentDepartment && departments[data.code]) {
            fields.code.classList.add('is-invalid');
            showToast('Mã phòng ban đã tồn tại!', 'danger');
            return false;
        }

        // Create or update department
        const departmentData = currentDepartment 
            ? {
                ...currentDepartment,
                name: data.name,
                status: data.status,
                updatedDate: new Date()
              }
            : new Department(Date.now(), data.code, data.name, data.status);

        // Save to departments object
        departments[departmentData.code] = departmentData;
        
        // Save to storage
        saveToStorage();
        
        // Update UI
        refreshTable();
        
        // Show success message
        showToast(currentDepartment ? 'Cập nhật phòng ban thành công!' : 'Thêm phòng ban thành công!', 'success');
        
        // Close modal and reset form
        departmentModal.hide();
        form.reset();
        currentDepartment = null;
        fields.code.disabled = false;
        
        return true;

    } catch (error) {
        console.error('Lỗi khi lưu phòng ban:', error);
        showToast('Đã xảy ra lỗi khi lưu phòng ban!', 'danger');
        return false;
    } finally {
        // Reset button state
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Lưu';
    }
}

async function deleteDepartment(code) {
    if (!code || !departments[code]) {
        showToast('Không tìm thấy phòng ban!', 'danger');
        return;
    }

    // Show confirmation dialog
    const dept = departments[code];
    if (!confirm(`Bạn có chắc chắn muốn xóa phòng ban "${dept.name}" (${dept.code})?`)) {
        return;
    }

    try {
        delete departments[code];
        saveToStorage();
        refreshTable();
        showToast('Xóa phòng ban thành công!', 'success');
    } catch (error) {
        console.error('Lỗi khi xóa phòng ban:', error);
        showToast('Đã xảy ra lỗi khi xóa phòng ban!', 'danger');
    }
}

function searchDepartments() {
    const searchCode = document.getElementById('ma').value.toLowerCase().trim();
    const searchName = document.getElementById('ten').value.toLowerCase().trim();
    
    if (!searchCode && !searchName) {
        refreshTable();
        return;
    }
    
    try {
        const filteredDepts = getDepartmentsArray().filter(dept => {
            const codeMatch = !searchCode || dept.code.toLowerCase().includes(searchCode);
            const nameMatch = !searchName || dept.name.toLowerCase().includes(searchName);
            return codeMatch && nameMatch;
        });
        
        if (filteredDepts.length === 0) {
            showToast('Không tìm thấy phòng ban nào', 'warning');
            const tbody = document.getElementById('departmentList');
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">Không tìm thấy phòng ban nào</td>
                </tr>
            `;
            document.getElementById('totalRecords').textContent = '0 phòng ban';
        } else {
            refreshTable(filteredDepts);
            showToast(`Tìm thấy ${filteredDepts.length} phòng ban`, 'success');
        }
    } catch (error) {
        console.error('Lỗi khi tìm kiếm phòng ban:', error);
        showToast('Đã xảy ra lỗi khi tìm kiếm!', 'danger');
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
    try {
        const success = DepartmentStorage.saveData(departments);
        if (!success) {
            throw new Error('Failed to save to storage');
        }
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        showToast('Đã xảy ra lỗi khi lưu dữ liệu!', 'danger');
        return false;
    }
}

function loadFromStorage() {
    try {
        const data = DepartmentStorage.getData();
        if (!data) {
            throw new Error('No data found in storage');
        }
        departments = data;
        return true;
    } catch (error) {
        console.error('Error loading from storage:', error);
        showToast('Đã xảy ra lỗi khi tải dữ liệu!', 'danger');
        return false;
    }
}

// Reset storage to initial state
function resetStorage() {
    try {
        DepartmentStorage.clearData();
        departments = DepartmentStorage.initData();
        refreshTable();
        showToast('Đã khôi phục dữ liệu mặc định!', 'success');
        return true;
    } catch (error) {
        console.error('Error resetting storage:', error);
        showToast('Đã xảy ra lỗi khi khôi phục dữ liệu!', 'danger');
        return false;
    }
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
    document.getElementById('btnSaveDepartment').onclick = saveDepartment;
    
    // Form validation
    const form = document.getElementById('departmentForm');
    
    // Code input validation
    const codeInput = document.getElementById('deptCode');
    codeInput.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
        const isValid = /^PB\d{0,3}$/.test(this.value);
        this.classList.toggle('is-invalid', !isValid);
        
        // Show specific validation message
        const feedback = this.nextElementSibling;
        if (!isValid) {
            feedback.textContent = 'Mã phòng ban phải có định dạng PBxxx (x là số)';
        }
    });

    // Name input validation
    const nameInput = document.getElementById('deptName');
    nameInput.addEventListener('input', function() {
        const isValid = this.value.trim().length >= 3;
        this.classList.toggle('is-invalid', !isValid);
        
        // Show specific validation message
        const feedback = this.nextElementSibling;
        if (!isValid) {
            feedback.textContent = 'Tên phòng ban phải có ít nhất 3 ký tự';
        }
    });

    // Search functionality
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            searchDepartments();
        });

        // Real-time search if needed
        const searchInputs = searchForm.querySelectorAll('input');
        searchInputs.forEach(input => {
            input.addEventListener('input', debounce(searchDepartments, 300));
        });
    }

    // Modal events
    document.getElementById('departmentModal').addEventListener('hidden.bs.modal', function() {
        form.reset();
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        currentDepartment = null;
        codeInput.disabled = false;
    });

    // Initialize typeahead
    initializeTypeahead();

    // Load initial data
    departments = DepartmentStorage.initData();
    refreshTable();
};

// Debounce helper function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}