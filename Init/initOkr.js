// Dữ liệu mẫu cho OKR
const sampleOkrs = {
  OKR001: {
    id: 1,
    code: "OKR001",
    name: "Tăng trưởng doanh thu quý 3",
    startDate: "2025-07-01",
    endDate: "2025-09-30",
    status: 2, // Đang tiến hành
    users: ["U001", "U002"], // Tham chiếu mã user từ InitUser
    keyResults: [
      {
        id: 1,
        name: "Tăng doanh thu lên 20%",
        status: 3, // Đang tiến hành
      },
      {
        id: 2,
        name: "Mở rộng thị trường miền Trung",
        status: 2, // Đang lên kế hoạch
      },
    ],
  },
  OKR002: {
    id: 2,
    code: "OKR002",
    name: "Cải thiện chất lượng dịch vụ CSKH",
    startDate: "2025-06-01",
    endDate: "2025-12-31",
    status: 1, // Nháp
    users: ["U003"],
    keyResults: [
      {
        id: 1,
        name: "Đào tạo lại đội ngũ CSKH",
        status: 0, // Chưa bắt đầu
      },
    ],
  },
};

// Lưu trữ localStorage
class OkrStorage {
  static KEY = "okrs";

  static initData() {
    if (!localStorage.getItem(this.KEY)) {
      localStorage.setItem(this.KEY, JSON.stringify(sampleOkrs));
    }
    return this.getData();
  }

  static getData() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : {};
  }

  static saveData(okrs) {
    localStorage.setItem(this.KEY, JSON.stringify(okrs));
  }

  static clearData() {
    localStorage.removeItem(this.KEY);
  }
}

class OkrManager {
  constructor() {
    this.okrs = OkrStorage.initData();
  }

  getAll() {
    return Object.values(this.okrs);
  }

  get(code) {
    return this.okrs[code] || null;
  }

  add(okr) {
    if (this.okrs[okr.code]) return false;
    this.okrs[okr.code] = { ...okr };
    OkrStorage.saveData(this.okrs);
    return true;
  }

  update(code, newOkr) {
    if (!this.okrs[code]) return false;
    this.okrs[code] = { ...this.okrs[code], ...newOkr };
    OkrStorage.saveData(this.okrs);
    return true;
  }

  delete(code) {
    if (!this.okrs[code]) return false;
    delete this.okrs[code];
    OkrStorage.saveData(this.okrs);
    return true;
  }
}

export default OkrManager;
