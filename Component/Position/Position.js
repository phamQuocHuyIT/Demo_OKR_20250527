import positionManager from '../../Init/initPosition.js';

class PositionUI {
    constructor() {
        console.log('PositionUI initializing...'); // Debug log
        this.positionManager = positionManager;
        this.editMode = false;
        this.editCode = null;
        
        // Initialize after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('PositionUI init...'); // Debug log
        this.initializeEventListeners();
        this.renderPositionTable();
    }

    initializeEventListeners() {
        console.log('Initializing event listeners...'); // Debug log
        
        // Add button handler
        const btnAdd = document.getElementById('btnAdd');
        if (btnAdd) {
            console.log('Add button found'); // Debug log
            btnAdd.onclick = (e) => {
                e.preventDefault();
                console.log('Add button clicked'); // Debug log
                this.showAddModal();
            };
        }

        // Form submit handler
        const form = document.getElementById('positionForm');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                if (!form.checkValidity()) {
                    e.stopPropagation();
                    form.classList.add('was-validated');
                    return;
                }
                this.handleFormSubmit(e);
            };
        }

        // Code input handler - convert to uppercase and validate format
        const codeInput = document.getElementById('positionCode');
        if (codeInput) {
            codeInput.addEventListener('input', (e) => {
                let value = e.target.value.toUpperCase();
                // Ensure the CV prefix
                if (value.length >= 2 && value.substring(0, 2) !== 'CV') {
                    value = 'CV' + value.replace(/\D/g, '');
                } else {
                    value = 'CV' + value.substring(2).replace(/\D/g, '');
                }
                // Limit to 5 characters (CVxxx)
                if (value.length > 5) {
                    value = value.substring(0, 5);
                }
                e.target.value = value;

                // Update validation state
                const isValid = /^CV\d{3}$/.test(value);
                e.target.classList.toggle('is-invalid', !isValid && value.length > 0);
                e.target.classList.toggle('is-valid', isValid);
            });
        }

        // Name input handler - validate length
        const nameInput = document.getElementById('positionName');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                const value = e.target.value.trim();
                const isValid = value.length >= 3;
                e.target.classList.toggle('is-invalid', !isValid && value.length > 0);
                e.target.classList.toggle('is-valid', isValid);
            });
        }

        // Modal reset handler
        const modalEl = document.getElementById('positionModal');
        if (modalEl) {
            modalEl.addEventListener('hidden.bs.modal', () => {
                this.resetForm();
            });
        }
    }

    resetForm() {
        const form = document.getElementById('positionForm');
        if (form) {
            form.reset();
            form.classList.remove('was-validated');
            form.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
                el.classList.remove('is-invalid', 'is-valid');
            });
        }
        document.getElementById('modalError').style.display = 'none';
    }

    renderPositionTable() {
        const tbody = document.querySelector("#positionTable tbody");
        if (!tbody) return;

        tbody.innerHTML = "";
        const positions = this.positionManager.getAll().sort((a, b) => a.code.localeCompare(b.code));
        
        if (positions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted">
                        <i class="bi bi-info-circle me-2"></i>Không có dữ liệu
                    </td>
                </tr>`;
            return;
        }

        positions.forEach((position) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="text-center">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-warning btn-edit" data-code="${position.code}" title="Sửa">
                            <i class="bi bi-pencil-fill"></i> Sửa
                        </button>
                        <button class="btn btn-danger btn-delete" data-code="${position.code}" title="Xóa">
                            <i class="bi bi-trash-fill"></i> Xóa
                        </button>
                    </div>
                </td>
                <td>${position.code}</td>
                <td>${position.name}</td>
            `;
            tbody.appendChild(tr);
        });

        this.attachTableEventHandlers();
    }

    attachTableEventHandlers() {
        const tbody = document.querySelector("#positionTable tbody");
        if (!tbody) return;

        // Edit buttons
        tbody.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const code = btn.getAttribute('data-code');
                this.handleEdit(code);
            });
        });

        // Delete buttons
        tbody.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const code = btn.getAttribute('data-code');
                this.handleDelete(code);
            });
        });
    }

    handleEdit(code) {
        console.log('Editing position:', code);
        const position = this.positionManager.get(code);
        if (!position) {
            console.error('Position not found:', code);
            return;
        }

        this.editMode = true;
        this.editCode = code;

        const modalEl = document.getElementById('positionModal');
        if (!modalEl) {
            console.error('Modal element not found');
            return;
        }

        // Reset form first
        this.resetForm();

        // Set form values
        document.getElementById('positionModalLabel').textContent = 'Sửa chức vụ';
        const codeInput = document.getElementById('positionCode');
        codeInput.value = position.code;
        codeInput.disabled = true;
        document.getElementById('positionName').value = position.name;

        // Show modal
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        console.log('Edit modal shown for position:', position);
    }

    showAddModal() {
        console.log('Showing add modal...'); // Debug log
        const modalEl = document.getElementById('positionModal');
        if (!modalEl) {
            console.error('Modal element not found');
            return;
        }

        // Reset form
        this.resetForm();

        // Reset fields
        this.editMode = false;
        this.editCode = null;
        document.getElementById('positionModalLabel').textContent = 'Thêm chức vụ';
        const codeInput = document.getElementById('positionCode');
        codeInput.disabled = false;
        codeInput.value = 'CV';

        // Show modal
        try {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
            codeInput.focus();
            console.log('Modal shown successfully'); // Debug log
        } catch (error) {
            console.error('Error showing modal:', error);
        }
    }

    async handleDelete(code) {
        if (confirm("Bạn có chắc chắn muốn xóa chức vụ này không?")) {
            try {
                await this.positionManager.delete(code);
                this.renderPositionTable();
                this.showToast("Xóa chức vụ thành công!", "success");
            } catch (error) {
                this.showToast(error.message, "danger");
            }
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        console.log('Form submitted, editMode:', this.editMode);
        
        // Get form values
        const codeInput = document.getElementById('positionCode');
        const nameInput = document.getElementById('positionName');
        const code = codeInput.value.trim().toUpperCase();
        const name = nameInput.value.trim();
        
        // Get elements
        const errorDiv = document.getElementById('modalError');
        const modalEl = document.getElementById('positionModal');
        errorDiv.style.display = 'none';

        try {
            // Add or update position
            if (this.editMode) {
                if (!this.editCode) throw new Error('Mã chức vụ không hợp lệ');
                console.log('Updating position:', this.editCode);
                this.positionManager.update(this.editCode, name);
                this.showToast('Cập nhật chức vụ thành công!', 'success');
            } else {
                console.log('Adding new position:', code);
                this.positionManager.add(code, name);
                this.showToast('Thêm chức vụ mới thành công!', 'success');
            }
            
            // Close modal and refresh table
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) {
                modal.hide();
            }
            this.renderPositionTable();
        } catch (error) {
            console.error('Form error:', error);
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement("div");
        toast.className = `toast align-items-center text-white bg-${type} border-0 position-fixed bottom-0 end-0 m-3`;
        toast.setAttribute("role", "alert");
        toast.setAttribute("aria-live", "assertive");
        toast.setAttribute("aria-atomic", "true");
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${type === "success" ? "bi-check-circle" : "bi-exclamation-triangle"}"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toast);
        });
    }
}

// Initialize UI
const ui = new PositionUI();
