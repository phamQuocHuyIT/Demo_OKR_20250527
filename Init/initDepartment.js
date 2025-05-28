// Sample data
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

// Storage management
class DepartmentStorage {
    static KEY = 'departments';

    static initData() {
        try {
            const stored = localStorage.getItem(this.KEY);
            if (!stored) {
                this.saveData(sampleDepartments);
                return sampleDepartments;
            }
            const data = JSON.parse(stored);
            // Convert dates back to Date objects
            Object.values(data).forEach(dept => {
                dept.createdDate = new Date(dept.createdDate);
            });
            console.log('Loaded departments:', data);
            return data;
        } catch (error) {
            console.error('Error initializing data:', error);
            return {};
        }
    }

    static saveData(departments) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(departments));
            console.log('Saved departments:', departments);
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    static clearData() {
        localStorage.removeItem(this.KEY);
    }
}

// Export for usage
window.DepartmentStorage = DepartmentStorage;
