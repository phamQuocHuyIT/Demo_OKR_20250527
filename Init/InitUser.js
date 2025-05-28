class UserManager {
  constructor() {
    this.users = [];
  }

  // Thêm người dùng mới
  add(user) {
    if (this.users.some((u) => u.code === user.code)) return false;
    this.users.push({ ...user });
    return true;
  }

  // Lấy danh sách tất cả người dùng
  getAll() {
    return this.users;
  }

  // Lấy người dùng theo mã
  get(code) {
    return this.users.find((u) => u.code === code) || null;
  }

  // Cập nhật thông tin người dùng
  update(code, newUser) {
    const user = this.users.find((u) => u.code === code);
    if (user) {
      user.name = newUser.name;
      user.gender = newUser.gender;
      user.birth = newUser.birth;
      user.department = newUser.department;
      user.position = newUser.position;
      user.role = newUser.role;
      return true;
    }
    return false;
  }

  // Xóa người dùng theo mã
  delete(code) {
    const idx = this.users.findIndex((u) => u.code === code);
    if (idx !== -1) {
      this.users.splice(idx, 1);
      return true;
    }
    return false;
  }
}

const userManager = new UserManager();
userManager.add({
  code: "U001",
  name: "Nguyễn Văn A",
  gender: 1,
  birth: "1990-01-01",
  department: "IT",
  position: "Dev",
  role: "ADMIN",
});
userManager.add({
  code: "U002",
  name: "Trần Thị B",
  gender: 0,
  birth: "1992-05-10",
  department: "HR",
  position: "HR Manager",
  role: "USER",
});
userManager.add({
  code: "U003",
  name: "Lê Văn C",
  gender: 1,
  birth: "1988-12-20",
  department: "Finance",
  position: "Accountant",
  role: "USER",
});

export default UserManager;
