class Department {
    constructor(id, code, name) {
        this.id = id;
        this.code = code;
        this.name = name;
    }
}

// Mảng chứa danh sách phòng ban
let departments = {};

// Thêm phòng ban mới
function addDepartment() {
    const code = document.getElementById('ma').value;
    const name = document.getElementById('ten').value;
    
    if (!code || !name) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    const id = Date.now(); // Tạo ID duy nhất
    const department = new Department(id, code, name);
    departments[code] = department;
    
    refreshTable();
    clearForm();
}

// Xóa phòng ban
function deleteDepartment(code) {
    delete departments[code];
    refreshTable();
}

// Sửa phòng ban
function editDepartment(code) {
    const dept = departments[code];
    if (dept) {
        document.getElementById('ma').value = dept.code;
        document.getElementById('ten').value = dept.name;
        
        // Lưu ID đang sửa để cập nhật sau
        document.getElementById('ma').dataset.editId = dept.id;
        
        // Đổi nút thêm thành nút cập nhật
        const addButton = document.querySelector('.header button');
        addButton.textContent = 'Cập nhật';
        addButton.onclick = () => updateDepartment();
    }
}

// Cập nhật phòng ban
function updateDepartment() {
    const id = parseInt(document.getElementById('ma').dataset.editId);
    const code = document.getElementById('ma').value;
    const name = document.getElementById('ten').value;
    
    if (!code || !name) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    const dept = departments[code];
    if (dept) {
        dept.code = code;
        dept.name = name;
        
        refreshTable();
        clearForm();
        
        // Đổi lại nút cập nhật thành nút thêm
        const addButton = document.querySelector('.header button');
        addButton.textContent = 'Thêm';
        addButton.onclick = () => addDepartment();
    }
}

// Tìm kiếm phòng ban
function searchDepartments() {
    const searchCode = document.getElementById('ma').value.toLowerCase();
    const searchName = document.getElementById('ten').value.toLowerCase();
    
    const filteredDepts = Object.values(departments).filter(dept => 
        dept.code.toLowerCase().includes(searchCode) &&
        dept.name.toLowerCase().includes(searchName)
    );
    
    refreshTable(filteredDepts);
}

// Làm mới bảng
function refreshTable(deptList = Object.values(departments)) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';
    
    deptList.forEach(dept => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <button onclick="editDepartment('${dept.code}')" class="btn btn-warning btn-sm">Sửa</button>
                <button onclick="deleteDepartment('${dept.code}')" class="btn btn-danger btn-sm">Xóa</button>
            </td>
            <td>${dept.code}</td>
            <td>${dept.name}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Xóa form
function clearForm() {
    document.getElementById('ma').value = '';
    document.getElementById('ten').value = '';
    document.getElementById('ma').dataset.editId = '';
}

// Khởi tạo các sự kiện khi trang load
window.onload = function() {
    // Gán sự kiện cho nút thêm
    document.querySelector('.header button').onclick = addDepartment;
    
    // Gán sự kiện cho nút tìm kiếm
    document.querySelector('.btn-primary').onclick = searchDepartments;
    
    // Load dữ liệu mẫu
    departments = DepartmentStorage.initData();
    refreshTable();
}

// Sample data for departments
const sampleDepartments = {
    'PB001': {
        id: 1,
        code: 'PB001',
        name: 'Phòng Kỹ thuật',
        createdDate: new Date('2025-05-27'),
        status: true
    },
    'PB002': {
        id: 2,
        code: 'PB002',
        name: 'Phòng Nhân sự',
        createdDate: new Date('2025-05-27'),
        status: true
    },
    'PB003': {
        id: 3,
        code: 'PB003',
        name: 'Phòng Kinh doanh',
        createdDate: new Date('2025-05-27'),
        status: true
    },
    'PB004': {
        id: 4,
        code: 'PB004',
        name: 'Phòng Marketing',
        createdDate: new Date('2025-05-27'),
        status: true
    },
    'PB005': {
        id: 5,
        code: 'PB005',
        name: 'Phòng Tài chính',
        createdDate: new Date('2025-05-27'),
        status: true
    }
};

// Local Storage operations
class DepartmentStorage {
    static KEY = 'departments';

    static initData() {
        if (!localStorage.getItem(this.KEY)) {
            localStorage.setItem(this.KEY, JSON.stringify(sampleDepartments));
        }
        return this.getData();
    }

    static getData() {
        const data = localStorage.getItem(this.KEY);
        return data ? JSON.parse(data) : {};
    }

    static saveData(departments) {
        localStorage.setItem(this.KEY, JSON.stringify(departments));
    }

    static clearData() {
        localStorage.removeItem(this.KEY);
    }
}

// Export for usage
window.DepartmentStorage = DepartmentStorage;