class Department {
  constructor(id, code, name) {
    this.id = id;
    this.code = code;
    this.name = name;
  }
}

class DepartmentManager {
  constructor() {
    // Lấy dữ liệu từ localStorage hoặc khởi tạo dữ liệu mẫu
    this.departments = DepartmentStorage.initData();
  }

  getAll() {
    return Object.values(this.departments);
  }

  get(code) {
    return this.departments[code] || null;
  }

  add(code, name) {
    if (this.departments[code]) return false;
    const id = Date.now();
    this.departments[code] = new Department(id, code, name);
    DepartmentStorage.saveData(this.departments);
    return true;
  }

  update(code, name) {
    if (!this.departments[code]) return false;
    this.departments[code].name = name;
    DepartmentStorage.saveData(this.departments);
    return true;
  }

  delete(code) {
    if (!this.departments[code]) return false;
    delete this.departments[code];
    DepartmentStorage.saveData(this.departments);
    return true;
  }
}

// Sample data for departments
let sampleDepartments = {
  PB001: { id: 1, code: "PB001", name: "Phòng Kỹ thuật" },
  PB002: { id: 2, code: "PB002", name: "Phòng Nhân sự" },
  PB003: { id: 3, code: "PB003", name: "Phòng Kinh doanh" },
  PB004: { id: 4, code: "PB004", name: "Phòng Marketing" },
  PB005: { id: 5, code: "PB005", name: "Phòng Tài chính" },
  PB005: { id: 5, code: "PB005", name: "Phòng Tài chính 11" },
};

// Local Storage operations
class DepartmentStorage {
  static KEY = "departments";

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

export default DepartmentManager;
