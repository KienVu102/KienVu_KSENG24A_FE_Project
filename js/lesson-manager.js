const tableElement = document.querySelector('.table-lessons tbody');
const statusSearchElement = document.querySelector('#statusSearch');
const exampleModal = document.getElementById('exampleModal');
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
let isNameAscending = true;

function generateId() {
    const randomNum = Math.floor(Math.random() * 10000);
    return randomNum;
}

let listLessons = JSON.parse(localStorage.getItem('listLessons')) || [
    { id: generateId(), name: "Session 01 - Tổng quan về HTML", time: "45", status: true },
    { id: generateId(), name: "Session 02 - Thẻ inline và Block", time: "60", status: false },
    { id: generateId(), name: "Session 03 - Form vs Table", time: "40", status: true },
    { id: generateId(), name: "Session 04 - CSS cơ bản", time: "45", status: false },
    { id: generateId(), name: "Session 05 - CSS", time: "60", status: false },
    { id: generateId(), name: "Session 06 - CSS Flex box", time: "45", status: false },
    { id: generateId(), name: "Session 12 - Cơn trở trong C", time: "45", status: true },
    { id: generateId(), name: "Session 15 - Đọc viết file", time: "60", status: false },
];

function saveLessonsToLocalStorage() {
    localStorage.setItem('listLessons', JSON.stringify(listLessons));
}

function getFilteredLessons() {
    return listLessons.filter(lesson => {
        const matchesSearch = lesson.name.toLowerCase().includes(searchKeyword.toLowerCase());
        const matchesStatus = statusSearchElement.value === 'all' ||
            (statusSearchElement.value === 'complete' ? lesson.status : !lesson.status);
        return matchesSearch && matchesStatus;
    });
}

function renderListLessons() {
    const filtered = getFilteredLessons();
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    const tableHtmls = paginated.map((value) => {
        return `<tr>
            <td><input type="checkbox" class="form-check-input" id="flexCheckDefault"></td>
            <td><p style="padding: 24px 26px 0">${value.name}</p></td>
            <td>${value.time}</td>
            <td>
                <div class="${value.status ? 'active' : 'inactive'}">
                <span><i class="bi bi-dot"></i></span>
                <span>${value.status ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</span>
                </div>
            </td>
            <td>
                <div class="d-flex gap-3">
                <i style="color: #e63946; cursor: pointer;" class="bi bi-trash3" onclick="deleteLesson('${value.id}')"></i>
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
    const totalPages = Math.ceil(getFilteredLessons().length / itemsPerPage);
    if (newPage < 1 || newPage > totalPages) return;
    currentPage = newPage;
    renderListLessons();
}

function sortLessonsByName() {
    isNameAscending = !isNameAscending;
    const sortIcon = document.getElementById('sortNameIcon');
    sortIcon.textContent = isNameAscending ? '⬇' : '⬆';

    listLessons.sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return isNameAscending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    saveLessonsToLocalStorage();
    renderListLessons();
}

searchInput.addEventListener('input', (e) => {
    searchKeyword = e.target.value;
    currentPage = 1;
    renderListLessons();
});

statusSearchElement.addEventListener('change', () => {
    currentPage = 1;
    renderListLessons();
});

saveCategoryButton.addEventListener('click', () => {
    const listLessonInput = document.querySelector('#listLesson').value;
    const nameLessonInput = document.querySelector('#nameLesson').value.trim();
    const timeLessonInput = document.querySelector('#timeLesson').value;
    const statusLessonInput = document.querySelector('input[name="statusLesson"]:checked').value === 'Đã hoàn thành';

    let isValid = true;
    if (!listLessonInput) {
        document.querySelector('#listLesson').classList.add('is-invalid');
        isValid = false;
    }
    if (!nameLessonInput) {
        document.querySelector('#nameLesson').classList.add('is-invalid');
        isValid = false;
    }
    if (!timeLessonInput) {
        document.querySelector('#timeLesson').classList.add('is-invalid');
        isValid = false;
    }
    if (!isValid) return;

    const newLesson = {
        id: isEditMode ? currentEditId : generateId(),
        name: nameLessonInput,
        time: timeLessonInput,
        status: statusLessonInput
    };

    if (isEditMode) {
        const lessonIndex = listLessons.findIndex(lesson => lesson.id === currentEditId);
        if (lessonIndex !== -1) {
            listLessons[lessonIndex] = newLesson;
            toastNotiChange.show();
        }
    } else {
        listLessons.push(newLesson);
        toastNotiChange.show();


        saveLessonsToLocalStorage();
        renderListLessons();
        bootstrap.Modal.getInstance(exampleModal).hide();
        resetForm();
    }
});

window.deleteLesson = function (id) {
    const lessonId = Number(id);
    const lessonToDelete = listLessons.find(lesson => lesson.id === lessonId);

    if (!lessonToDelete) {
        console.error(`Lesson with id ${lessonId} not found.`);
        return;
    }

    document.getElementById('deleteModalLabel').textContent =
        `Bạn có chắc muốn xóa bài học "${lessonToDelete.name}" khỏi hệ thống?`;

    document.getElementById('deleteLesson').onclick = () => {
        listLessons = listLessons.filter(lesson => lesson.id !== lessonId);
        saveLessonsToLocalStorage();
        renderListLessons();
        deleteModal.hide();
        toastNoti.show();
    };

    deleteModal.show();
};

window.openEditModal = function (id) {
    const lesson = listLessons.find(lesson => lesson.id === id);
    if (!lesson) return;

    isEditMode = true;
    currentEditId = id;
    document.querySelector('#nameLesson').value = lesson.name;
    document.querySelector('#timeLesson').value = lesson.time;
    document.querySelector(`input[name="statusLesson"][value="${lesson.status ? 'Đã hoàn thành' : 'Chưa hoàn thành'}"]`).checked = true;

    exampleModal.querySelector('.modal-title').textContent = 'Chỉnh sửa bài học';
    new bootstrap.Modal(exampleModal).show();
};

function resetForm() {
    document.querySelector('#listLesson').value = '';
    document.querySelector('#nameLesson').value = '';
    document.querySelector('#timeLesson').value = '';
    document.querySelector('input[name="statusLesson"][value="Đã hoàn thành"]').checked = true;
    document.querySelector('#listLesson').classList.remove('is-invalid');
    document.querySelector('#nameLesson').classList.remove('is-invalid');
    document.querySelector('#timeLesson').classList.remove('is-invalid');
    isEditMode = false;
    currentEditId = null;
    exampleModal.querySelector('.modal-title').textContent = 'Thêm mới bài học';
}

document.addEventListener('DOMContentLoaded', () => {
    renderListLessons();
});
