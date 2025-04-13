const tableElement = document.querySelector('.table-subjects tbody');
const statusSearchElement = document.querySelector('#statusSearch');
const exampleModal = document.getElementById('exampleModal');
const nameSubjectsInput = document.getElementById('nameCategory');
const saveCategoryButton = document.getElementById('saveCategory');
const searchInput = document.getElementById('search');
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
const deleteModalLabel = document.getElementById('deleteModalLabel');
const toastNoti = new bootstrap.Toast(document.getElementById('toastNoti'));
const toastNotiChange = new bootstrap.Toast(document.getElementById('toastNotiChange'));

let currentPage = 1;
const itemsPerPage = 5;
let searchKeyword = '';
let isEditMode = false;
let currentEditId = null;
let isAscending = true;

function generateId() {
    const randomNum = Math.floor(Math.random() * 10000);
    return randomNum;
}

let listSubjects = JSON.parse(localStorage.getItem('subjects')) || [
    { id: generateId(), name: "Lập trình C", status: true },
    { id: generateId(), name: "Lập trình Fronted và JS", status: false },
    { id: generateId(), name: "Lập trình Backend và Spring boot", status: false },
];

function saveSubjectsToLocalStorage() {
    localStorage.setItem('subjects', JSON.stringify(listSubjects));
}

function getFilteredSubjects() {
    return listSubjects.filter(subject => {
        const matchesSearch = subject.name.toLowerCase().includes(searchKeyword.toLowerCase());
        const matchesStatus = statusSearchElement.value === 'all' ||
            (statusSearchElement.value === 'active' ? subject.status : !subject.status);
        return matchesSearch && matchesStatus;
    });
}

function renderListSubjects() {
    const filtered = getFilteredSubjects();
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    const tableHtmls = paginated.map((value) => {
        return `<tr>
            <td><p style="padding: 24px 26px 0">${value.name}</p></td>
            <td>
                <div class="${value.status ? 'active' : 'inactive'}">
                <span><i class="bi bi-dot"></i></span>
                <span>${value.status ? 'Đang hoạt động' : 'Không hoạt động'}</span>
                </div>
            </td>
            <td>
                <div class="d-flex gap-3">
                <i style="color: #e63946; cursor: pointer;" class="bi bi-trash3" onclick="deleteCategory('${value.id}')"></i>
                <i style="color: #ffa500; cursor: pointer;" class="bi bi-pencil-square" onclick="openEditModal('${value.id}')"></i>
                </div>
            </td>
        </tr>`;
    });

    tableElement.innerHTML = tableHtmls.join('');
    updatePagination(filtered.length);
}

function updatePagination(totalItems) {
    const pageCount = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    let html = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})" aria-label="Previous">
                <span aria-hidden="true">«</span>
            </a>
        </li>`;

    for (let i = 1; i <= pageCount; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
            </li>`;
    }

    html += `
        <li class="page-item ${currentPage === pageCount ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})" aria-label="Next">
                <span aria-hidden="true">»</span>
            </a>
        </li>`;

    pagination.innerHTML = html;
}

function changePage(newPage) {
    const totalPages = Math.ceil(getFilteredSubjects().length / itemsPerPage);
    if (newPage < 1 || newPage > totalPages) return;
    currentPage = newPage;
    renderListSubjects();
}

function sortSubjects() {
    isAscending = !isAscending;
    const sortIcon = document.getElementById('sortIcon');
    sortIcon.textContent = isAscending ? '⬇' : '⬆';

    let subjects = [...listSubjects];
    for (let i = 0; i < subjects.length - 1; i++) {
        for (let j = 0; j < subjects.length - 1 - i; j++) {
            const nameA = subjects[j].name.toLowerCase();
            const nameB = subjects[j + 1].name.toLowerCase();
            let shouldSwap;
            if (isAscending) {
                shouldSwap = nameA.localeCompare(nameB) > 0;
            } else {
                shouldSwap = nameB.localeCompare(nameA) > 0;
            }
            if (shouldSwap) {
                let temp = subjects[j];
                subjects[j] = subjects[j + 1];
                subjects[j + 1] = temp;
            }
        }
    }
    listSubjects = subjects;
    saveSubjectsToLocalStorage();
    renderListSubjects();
}

searchInput.addEventListener('input', (e) => {
    searchKeyword = e.target.value;
    currentPage = 1;
    renderListSubjects();
});

statusSearchElement.addEventListener('change', () => {
    currentPage = 1;
    renderListSubjects();
});

saveCategoryButton.addEventListener('click', (e) => {
    e.preventDefault();
    const nameInput = nameSubjectsInput.value.trim();
    const nameError = document.getElementById('nameError');
    nameSubjectsInput.classList.remove('is-invalid');
    nameError.textContent = '';

    let isValid = true;

    if (!nameInput) {
        nameSubjectsInput.classList.add('is-invalid');
        nameError.textContent = 'Vui lòng nhập tên môn học';
        isValid = false;
    } else if (isNameDuplicate(nameInput, isEditMode ? currentEditId : null)) {
        nameSubjectsInput.classList.add('is-invalid');
        nameError.textContent = 'Tên môn học đã tồn tại';
        isValid = false;
    }

    if (!isValid) return;

    const newSubject = {
        id: isEditMode ? currentEditId : generateId(),
        name: nameInput,
        status: document.querySelector('input[name="status"]:checked').value === 'Đang hoạt động'
    };

    if (isEditMode) {
        const index = listSubjects.findIndex(sub => sub.id === currentEditId);
        listSubjects[index] = newSubject;
        toastNotiChange.show();
    } else {
        listSubjects.push(newSubject);
        toastNotiChange.show();
    }

    saveSubjectsToLocalStorage();
    renderListSubjects();
    bootstrap.Modal.getInstance(exampleModal).hide();
    resetForm();
});

window.deleteCategory = function (id) {
    const subjectToDelete = listSubjects.find(sub => sub.id === id);
    document.getElementById('deleteModalLabel').textContent =
        `Bạn có chắc muốn xóa môn học "${subjectToDelete.name}" khỏi hệ thống?`;

    document.getElementById('deleteSubject').onclick = () => {
        listSubjects = listSubjects.filter(sub => sub.id !== id);
        saveSubjectsToLocalStorage();
        renderListSubjects();
        deleteModal.hide();
        toastNoti.show();
    };

    deleteModal.show();
};

window.openEditModal = function (id) {
    const subject = listSubjects.find(sub => sub.id === id);
    if (!subject) return;

    isEditMode = true;
    currentEditId = id;
    nameSubjectsInput.value = subject.name;
    document.querySelector(`input[name="status"][value="${subject.status ? 'Đang hoạt động' : 'Không hoạt động'}"]`).checked = true;

    exampleModal.querySelector('.modal-title').textContent = 'Chỉnh sửa môn học';
    new bootstrap.Modal(exampleModal).show();
};

function resetForm() {
    nameSubjectsInput.value = '';
    document.querySelector('input[name="status"][value="Đang hoạt động"]').checked = true;
    nameSubjectsInput.classList.remove('is-invalid');
    isEditMode = false;
    currentEditId = null;
    exampleModal.querySelector('.modal-title').textContent = 'Thêm mới môn học';
}

function isNameDuplicate(name, currentId = null) {
    return listSubjects.some(subject =>
        subject.name.toLowerCase() === name.toLowerCase() &&
        subject.id !== currentId
    );
}

document.addEventListener('DOMContentLoaded', () => {
    renderListSubjects();
});