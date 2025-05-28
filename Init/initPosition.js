// Sample data
const samplePositions = {
    'CV001': {
        id: 1,
        code: 'CV001',
        name: 'Giám đốc',
        representative: 'Nguyễn Văn A',
        representativeAge: 45,
        status: true,
        createdDate: new Date()
    },
    'CV002': {
        id: 2,
        code: 'CV002',
        name: 'Trưởng phòng',
        representative: 'Trần Thị B',
        representativeAge: 35,
        status: true,
        createdDate: new Date()
    }
};

// Storage management
class PositionStorage {
    static KEY = 'positions';

    static initData() {
        try {
            const stored = localStorage.getItem(this.KEY);
            if (!stored) {
                this.saveData(samplePositions);
                return samplePositions;
            }
            const data = JSON.parse(stored);
            // Convert dates back to Date objects
            Object.values(data).forEach(pos => {
                pos.createdDate = new Date(pos.createdDate);
            });
            console.log('Loaded positions:', data);
            return data;
        } catch (error) {
            console.error('Error initializing data:', error);
            return {};
        }
    }

    static saveData(data) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(data));
            console.log('Saved positions:', data);
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
window.PositionStorage = PositionStorage;
