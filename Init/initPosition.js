class Position {
    constructor(code, name, status = true) {
        this.id = crypto.randomUUID();
        this.code = code;
        this.name = name;
        this.status = status;
        this.createdDate = new Date().toISOString();
    }

    static validate(code, name) {
        if (!code || !/^CV\d{3}$/.test(code)) {
            throw new Error('Mã chức vụ không hợp lệ (CVxxx)');
        }
        if (!name || name.length < 3) {
            throw new Error('Tên chức vụ phải có ít nhất 3 ký tự');
        }
        return true;
    }
}

class PositionManager {
    constructor() {
        // Lấy dữ liệu từ localStorage hoặc khởi tạo dữ liệu mẫu
        this.positions = PositionStorage.initData();
    }

    getAll() {
        return Object.values(this.positions);
    }

    get(code) {
        return this.positions[code] || null;
    }

    add(code, name, status = true) {
        try {
            Position.validate(code, name);
            if (this.positions[code]) {
                throw new Error('Mã chức vụ đã tồn tại');
            }
            this.positions[code] = new Position(code, name, status);
            PositionStorage.saveData(this.positions);
            return true;
        } catch (error) {
            console.error('Error adding position:', error);
            throw error;
        }
    }

    update(code, name, status) {
        try {
            Position.validate(code, name);
            if (!this.positions[code]) {
                throw new Error('Không tìm thấy chức vụ');
            }
            const position = this.positions[code];
            position.name = name;
            position.status = status;
            PositionStorage.saveData(this.positions);
            return true;
        } catch (error) {
            console.error('Error updating position:', error);
            throw error;
        }
    }

    delete(code) {
        if (!this.positions[code]) {
            throw new Error('Không tìm thấy chức vụ');
        }
        delete this.positions[code];
        PositionStorage.saveData(this.positions);
        return true;
    }

    search(searchText = '') {
        const query = searchText.toLowerCase();
        return this.getAll().filter(pos => 
            pos.code.toLowerCase().includes(query) ||
            pos.name.toLowerCase().includes(query)
        );
    }
}

// Sample data for positions
const samplePositions = {
    'CV001': new Position('CV001', 'Giám đốc'),
    'CV002': new Position('CV002', 'Trưởng phòng'),
    'CV003': new Position('CV003', 'Phó phòng'),
    'CV004': new Position('CV004', 'Nhân viên')
};

// Local Storage operations
class PositionStorage {
    static KEY = 'positions';

    static initData() {
        const stored = localStorage.getItem(this.KEY);
        if (!stored) {
            this.saveData(samplePositions);
            return samplePositions;
        }
        return JSON.parse(stored);
    }

    static getData() {
        const data = localStorage.getItem(this.KEY);
        return data ? JSON.parse(data) : {};
    }

    static saveData(positions) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(positions));
            return true;
        } catch (error) {
            console.error('Error saving positions:', error);
            throw error;
        }
    }

    static clearData() {
        localStorage.removeItem(this.KEY);
    }
}

// Create and export instance
window.positionManager = new PositionManager();