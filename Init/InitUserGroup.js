class UserGroup {
  constructor(code, name) {
    this.code = code;
    this.name = name;
  }
}

class UserGroupManager {
  constructor() {
    // Lấy dữ liệu từ localStorage hoặc khởi tạo dữ liệu mẫu
    this.groups = UserGroupStorage.initData();
  }

  getAll() {
    return Object.values(this.groups);
  }

  get(code) {
    return this.groups[code] || null;
  }

  add(code, name) {
    if (this.groups[code]) return false;
    this.groups[code] = new UserGroup(code, name);
    UserGroupStorage.saveData(this.groups);
    return true;
  }

  update(code, name) {
    if (!this.groups[code]) return false;
    this.groups[code].name = name;
    UserGroupStorage.saveData(this.groups);
    return true;
  }

  delete(code) {
    if (!this.groups[code]) return false;
    delete this.groups[code];
    UserGroupStorage.saveData(this.groups);
    return true;
  }
}

// Sample data for user groups
let sampleUserGroups = {
  ADMIN: { code: "ADMIN", name: "Nhóm quản trị" },
  USER: { code: "USER", name: "Nhóm người dùng" },
  MANAGER: { code: "MANAGER", name: "Nhóm quản lý" },
};

// Local Storage operations
class UserGroupStorage {
  static KEY = "userGroups";

  static initData() {
    if (!localStorage.getItem(this.KEY)) {
      localStorage.setItem(this.KEY, JSON.stringify(sampleUserGroups));
    }
    return this.getData();
  }

  static getData() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : {};
  }

  static saveData(groups) {
    localStorage.setItem(this.KEY, JSON.stringify(groups));
  }

  static clearData() {
    localStorage.removeItem(this.KEY);
  }
}

export default UserGroupManager;
