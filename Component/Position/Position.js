// Position class definition
class Position {
    constructor(id, code, name, representative, representativeAge, status = true) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.representative = representative;
        this.representativeAge = representativeAge;
        this.status = status;
        this.createdDate = new Date();
    }
}

// State management
let positions = {};
let currentPosition = null;

// Helper functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('vi-VN');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('successToast');
    
    // Set toast classes and animation
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.style.transition = 'all 0.3s ease-in-out';
    
    // Set toast content with icon
    let icon = 'check-circle';
    switch (type) {
        case 'danger':
            icon = 'exclamation-triangle';
            break;
        case 'warning':
            icon = 'exclamation-circle';
            break;
        case 'info':
            icon = 'info-circle';
            break;
    }
    
    document.getElementById('toastText').innerHTML = `
        <i class="fas fa-${icon} me-2"></i>${message}
    `;
    
    // Create and show toast with custom options
    const bsToast = new bootstrap.Toast(toast, {
        animation: true,
        autohide: true,
        delay: 3000
    });
    
    // Add fade-in animation
    toast.style.opacity = '0';
    bsToast.show();
    
    // Trigger reflow for animation
    toast.offsetHeight;
    toast.style.opacity = '1';
    
    // Add event listener for toast hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.style.opacity = '0';
    }, { once: true });
}

// Save function
function savePosition() {
    try {
        console.log('Saving position...');
        const form = document.getElementById('positionForm');
        const fields = {
            code: document.getElementById('posCode'),
            name: document.getElementById('posName'),
            representative: document.getElementById('posRepresentative'),
            representativeAge: document.getElementById('posRepresentativeAge'),
            status: document.getElementById('posStatus')
        };

        // Reset validation states
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        // Get and validate values
        const data = {
            code: fields.code.value.trim().toUpperCase(),
            name: fields.name.value.trim(),
            representative: fields.representative.value.trim(),
            representativeAge: parseInt(fields.representativeAge.value),
            status: fields.status.value === 'true'
        };

        console.log('Form data:', data);

        // Validate all fields
        let isValid = true;

        // Code validation
        if (!data.code || !/^CV\d{3}$/.test(data.code)) {
            fields.code.classList.add('is-invalid');
            showToast('Mã chức vụ không hợp lệ (CVxxx)', 'danger');
            isValid = false;
        }

        // Name validation
        if (!data.name || data.name.length < 3) {
            fields.name.classList.add('is-invalid');
            showToast('Tên chức vụ phải có ít nhất 3 ký tự', 'danger');
            isValid = false;
        }

        // Representative validation
        if (!data.representative || data.representative.length < 3) {
            fields.representative.classList.add('is-invalid');
            showToast('Tên người đại diện phải có ít nhất 3 ký tự', 'danger');
            isValid = false;
        }

        // Age validation
        if (!data.representativeAge || data.representativeAge < 18 || data.representativeAge > 65) {
            fields.representativeAge.classList.add('is-invalid');
            showToast('Tuổi người đại diện phải từ 18 đến 65', 'danger');
            isValid = false;
        }

        // Duplicate code validation
        if (!currentPosition && positions[data.code]) {
            fields.code.classList.add('is-invalid');
            showToast('Mã chức vụ đã tồn tại', 'danger');
            isValid = false;
        }

        if (!isValid) {
            console.log('Validation failed');
            return false;
        }        // Create or update position
        const position = {
            id: currentPosition ? currentPosition.id : Date.now(),
            ...data,
            createdDate: currentPosition ? currentPosition.createdDate : new Date()
        };

        try {
            // Save to storage
            positions[data.code] = position;
            console.log('Saving position:', position);
            
            // Attempt to save to storage
            if (PositionStorage.saveData(positions)) {
                // Refresh the table first
                refreshTable();
                
                // Close the modal using the global instance
                if (window.positionModal) {
                    window.positionModal.hide();
                }
                
                // Show success message after modal is hidden
                setTimeout(() => {
                    showToast(
                        currentPosition ? 'Cập nhật chức vụ thành công' : 'Thêm chức vụ mới thành công',
                        'success'
                    );
                }, 300);
                
                // Reset form and state
                form.reset();
                currentPosition = null;
                
                return true;
            } else {
                throw new Error('Lưu dữ liệu không thành công');
            }
        } catch (error) {
            console.error('Error saving to storage:', error);
            showToast('Có lỗi xảy ra khi lưu dữ liệu', 'danger');
            return false;
        }

    } catch (error) {
        console.error('Error saving position:', error);
        showToast('Có lỗi xảy ra khi lưu dữ liệu', 'danger');
        return false;
    }
}

// Table functions
function refreshTable() {
    console.log('Refreshing table');
    const tbody = document.getElementById('positionList');
    const totalRecordsElement = document.getElementById('totalRecords');
    
    // Clear table
    tbody.innerHTML = '';
    
    try {
        // Get and sort positions
        const positionArray = Object.values(positions);
        console.log('Total positions:', positionArray.length);
        
        // Handle empty state
        if (positionArray.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">
                        <i class="fas fa-info-circle me-2"></i>Không có dữ liệu
                    </td>
                </tr>`;
            totalRecordsElement.textContent = '0 chức vụ';
            return;
        }
        
        // Sort positions by code
        positionArray
            .sort((a, b) => a.code.localeCompare(b.code))
            .forEach(pos => {
                const tr = document.createElement('tr');
                // Use safe property access with optional chaining and nullish coalescing
                tr.innerHTML = `
                    <td class="text-center">
                        <div class="btn-group" role="group">
                            <button onclick="editPosition('${pos.code}')" 
                                    class="btn btn-warning btn-sm me-2" 
                                    title="Sửa chức vụ">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deletePosition('${pos.code}')" 
                                    class="btn btn-danger btn-sm" 
                                    title="Xóa chức vụ">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                    <td>${pos.code ?? ''}</td>
                    <td>${pos.name ?? ''}</td>
                    <td>${pos.representative ?? ''}</td>
                    <td class="text-center">${pos.representativeAge ?? ''}</td>
                    <td>${pos.createdDate ? formatDate(new Date(pos.createdDate)) : ''}</td>
                    <td class="text-center">
                        <span class="badge ${pos.status ? 'bg-success' : 'bg-danger'}">
                            ${pos.status ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        
        // Update total records
        totalRecordsElement.textContent = `${positionArray.length} chức vụ`;
        
    } catch (error) {
        console.error('Error refreshing table:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>Có lỗi xảy ra khi tải dữ liệu
                </td>
            </tr>`;
        totalRecordsElement.textContent = '0 chức vụ';
    }
}

// Modal functions
function showAddModal() {
    console.log('Opening add modal');
    currentPosition = null;
    const form = document.getElementById('positionForm');
    const codeInput = document.getElementById('posCode');
    
    // Reset form and validation states
    form.reset();
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    
    // Enable code field for new entries
    codeInput.disabled = false;
    codeInput.value = '';
    
    // Set modal title
    document.getElementById('modalTitle').textContent = 'Thêm chức vụ mới';
    
    // Show modal using the global instance
    if (window.positionModal) {
        window.positionModal.show();
    } else {
        console.warn('Modal instance not found, creating new instance');
        window.positionModal = new bootstrap.Modal(document.getElementById('positionModal'));
        window.positionModal.show();
    }
}

function editPosition(code) {
    console.log('Editing position:', code);
    const position = positions[code];
    
    if (position) {
        // Store current position for reference
        currentPosition = position;
        
        // Get form elements
        const form = document.getElementById('positionForm');
        const fields = {
            code: document.getElementById('posCode'),
            name: document.getElementById('posName'),
            representative: document.getElementById('posRepresentative'),
            representativeAge: document.getElementById('posRepresentativeAge'),
            status: document.getElementById('posStatus')
        };
        
        // Reset validation states
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        
        // Fill form with position data
        fields.code.value = position.code;
        fields.code.disabled = true; // Prevent code modification
        fields.name.value = position.name;
        fields.representative.value = position.representative;
        fields.representativeAge.value = position.representativeAge;
        fields.status.value = position.status.toString();
        
        // Update modal title
        document.getElementById('modalTitle').textContent = 'Sửa chức vụ';
        
        // Show modal using the global instance
        if (window.positionModal) {
            window.positionModal.show();
        } else {
            console.warn('Modal instance not found, creating new instance');
            window.positionModal = new bootstrap.Modal(document.getElementById('positionModal'));
            window.positionModal.show();
        }
    } else {
        console.error('Position not found:', code);
        showToast('Không tìm thấy chức vụ', 'danger');
    }
}

function deletePosition(code) {
    if (confirm('Bạn có chắc chắn muốn xóa chức vụ này không?')) {
        delete positions[code];
        PositionStorage.saveData(positions);
        refreshTable();
        showToast('Xóa chức vụ thành công');
    }
}

// Search function
function searchPositions() {
    const searchCode = document.getElementById('ma').value.toLowerCase();
    const searchName = document.getElementById('ten').value.toLowerCase();
    
    if (!searchCode && !searchName) {
        refreshTable();
        return;
    }

    const filteredArray = Object.values(positions).filter(pos => 
        pos.code.toLowerCase().includes(searchCode) &&
        pos.name.toLowerCase().includes(searchName)
    );
    
    const tbody = document.getElementById('positionList');
    tbody.innerHTML = '';

    if (filteredArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Không tìm thấy kết quả</td></tr>';
        showToast('Không tìm thấy kết quả', 'warning');
    } else {
        filteredArray.forEach(pos => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="text-center">
                    <button onclick="editPosition('${pos.code}')" class="btn btn-warning btn-sm me-2" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deletePosition('${pos.code}')" class="btn btn-danger btn-sm" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
                <td>${pos.code}</td>
                <td>${pos.name}</td>
                <td>${pos.representative}</td>
                <td class="text-center">${pos.representativeAge}</td>
                <td>${formatDate(new Date(pos.createdDate))}</td>
                <td class="text-center">
                    <span class="badge ${pos.status ? 'bg-success' : 'bg-danger'}">
                        ${pos.status ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
        showToast(`Tìm thấy ${filteredArray.length} kết quả`, 'success');
    }
    
    document.getElementById('totalRecords').textContent = `${filteredArray.length} chức vụ`;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('Initializing position management...');
        
        // Initialize modals
        const positionModal = new bootstrap.Modal(document.getElementById('positionModal'));
        window.positionModal = positionModal;
        
        // Load initial data
        positions = PositionStorage.initData() || {};
        console.log('Loaded positions:', positions);
        refreshTable();

        // Add event listeners
        document.getElementById('btnAdd').addEventListener('click', showAddModal);        document.getElementById('btnSavePosition').addEventListener('click', async function() {
            console.log('Save button clicked');
            
            // Get and store the save button
            const saveBtn = this;
            const originalText = saveBtn.textContent;
            const originalHtml = saveBtn.innerHTML;
            
            // Show loading state with animation
            saveBtn.disabled = true;
            saveBtn.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span class="ms-2">Đang lưu...</span>
            `;
            
            try {
                // Add a small delay to show the loading state
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Attempt to save
                if (savePosition()) {
                    // Success case handled in savePosition()
                    saveBtn.innerHTML = `
                        <i class="fas fa-check"></i>
                        <span class="ms-2">Đã lưu</span>
                    `;
                    saveBtn.classList.remove('btn-primary');
                    saveBtn.classList.add('btn-success');
                    
                    // Reset button after a delay
                    setTimeout(() => {
                        saveBtn.disabled = false;
                        saveBtn.innerHTML = originalHtml;
                        saveBtn.classList.remove('btn-success');
                        saveBtn.classList.add('btn-primary');
                    }, 1000);
                } else {
                    // Error case
                    saveBtn.innerHTML = `
                        <i class="fas fa-exclamation-triangle"></i>
                        <span class="ms-2">Lỗi</span>
                    `;
                    saveBtn.classList.remove('btn-primary');
                    saveBtn.classList.add('btn-danger');
                    
                    // Reset button after a delay
                    setTimeout(() => {
                        saveBtn.disabled = false;
                        saveBtn.innerHTML = originalHtml;
                        saveBtn.classList.remove('btn-danger');
                        saveBtn.classList.add('btn-primary');
                    }, 2000);
                }
            } catch (error) {
                console.error('Error in save button click handler:', error);
                showToast('Có lỗi xảy ra khi lưu dữ liệu', 'danger');
                
                // Reset button immediately on error
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalHtml;
            }
        });
        
        document.getElementById('btnSearch').addEventListener('click', searchPositions);
        document.getElementById('btnReset').addEventListener('click', function() {
            document.getElementById('ma').value = '';
            document.getElementById('ten').value = '';
            refreshTable();
        });

        // Form validation listeners
        ['posCode', 'posName', 'posRepresentative'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', function() {
                    this.classList.remove('is-invalid');
                    validateField(this);
                });
            }
        });

        document.getElementById('posRepresentativeAge').addEventListener('input', function() {
            const age = parseInt(this.value);
            this.classList.toggle('is-invalid', age < 18 || age > 65);
        });

        // Modal events
        document.getElementById('positionModal').addEventListener('hidden.bs.modal', function() {
            document.getElementById('positionForm').reset();
            document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            currentPosition = null;
        });

        console.log('Position management initialized successfully');
    } catch (error) {
        console.error('Error initializing position management:', error);
    }
});

// Field validation helper
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;

    switch (field.id) {
        case 'posCode':
            isValid = /^CV\d{3}$/.test(value);
            break;
        case 'posName':
        case 'posRepresentative':
            isValid = value.length >= 3;
            break;
        case 'posRepresentativeAge':
            const age = parseInt(value);
            isValid = age >= 18 && age <= 65;
            break;
    }

    field.classList.toggle('is-invalid', !isValid);
    return isValid;
}
