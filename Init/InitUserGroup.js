class UserGroupManager {
  constructor() {
    this.groups = [];
  }

  // Thêm nhóm mới
  add(code, name) {
    const exists = this.groups.some((g) => g.code === code);
    if (exists) return false;
    this.groups.push({ code, name });
    return true;
  }

  // Lấy danh sách nhóm
  getAll() {
    return this.groups;
  }

  // Lấy nhóm theo code
  get(code) {
    return this.groups.find((g) => g.code === code) || null;
  }

  // Cập nhật nhóm
  update(code, newName) {
    const group = this.groups.find((g) => g.code === code);
    if (group) {
      group.name = newName;
      return true;
    }
    return false;
  }

  // Xóa nhóm
  delete(code) {
    const idx = this.groups.findIndex((g) => g.code === code);
    if (idx !== -1) {
      this.groups.splice(idx, 1);
      return true;
    }
    return false;
  }
}

// Ví dụ sử dụng:
const userGroupManager = new UserGroupManager();
userGroupManager.add("ADMIN", "Nhóm quản trị");
userGroupManager.add("USER", "Nhóm người dùng");
// userGroupManager.update("USER", "Nhóm nhân viên");
// userGroupManager.delete("ADMIN");
// console.log(userGroupManager.getAll());
export default UserGroupManager;
