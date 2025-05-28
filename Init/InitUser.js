// Dữ liệu mẫu cho người dùng
const sampleUsers = {
  U001: {
    code: "U001",
    name: "Nguyễn Văn A",
    gender: 1,
    birth: "1990-01-01",
    department: "IT",
    position: "Dev",
    role: "ADMIN",
  },
  U002: {
    code: "U002",
    name: "Trần Thị B",
    gender: 0,
    birth: "1992-05-10",
    department: "HR",
    position: "HR Manager",
    role: "USER",
  },
  U003: {
    code: "U003",
    name: "Lê Văn C",
    gender: 1,
    birth: "1988-12-20",
    department: "Finance",
    position: "Accountant",
    role: "USER",
  },
};

// Lưu trữ localStorage
class UserStorage {
  static KEY = "users";

  static initData() {
    if (!localStorage.getItem(this.KEY)) {
      localStorage.setItem(this.KEY, JSON.stringify(sampleUsers));
    }
    return this.getData();
  }

  static getData() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : {};
  }

  static saveData(users) {
    localStorage.setItem(this.KEY, JSON.stringify(users));
  }

  static clearData() {
    localStorage.removeItem(this.KEY);
  }
}

class UserManager {
  constructor() {
    this.users = UserStorage.initData();
  }

  getAll() {
    return Object.values(this.users);
  }

  get(code) {
    return this.users[code] || null;
  }

  add(user) {
    if (this.users[user.code]) return false;
    this.users[user.code] = { ...user };
    UserStorage.saveData(this.users);
    return true;
  }

  update(code, newUser) {
    if (!this.users[code]) return false;
    this.users[code] = { ...this.users[code], ...newUser };
    UserStorage.saveData(this.users);
    return true;
  }

  delete(code) {
    if (!this.users[code]) return false;
    delete this.users[code];
    UserStorage.saveData(this.users);
    return true;
  }
}

export default UserManager;
