document.addEventListener('DOMContentLoaded', () => {
    const navBtns = document.querySelectorAll('.nav-btn');
    const screens = document.querySelectorAll('.screen');
    const form = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const errorEl = document.getElementById('form-error');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            screens.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.screen).classList.add('active');
        });
    });

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    form.addEventListener('submit', e => {
        e.preventDefault();
        errorEl.textContent = '';
        const title = document.getElementById('title').value.trim();
        const priority = document.getElementById('priority').value;

        if (title.length < 3) {
            errorEl.textContent = 'Название должно содержать минимум 3 символа';
            return;
        }

        const task = {
            id: Date.now(),
            title,
            priority,
            status: 'new',
            createdAt: new Date().toISOString()
        };

        tasks.push(task);
        saveTasks();
        form.reset();
        renderTasks();
        showNotification('✅ Задача успешно добавлена');
    });

    function renderTasks() {
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            taskList.innerHTML = '<li style="text-align:center;color:#64748b;padding:2rem">Задач пока нет</li>';
            updateStats();
            return;
        }

        tasks.forEach(t => {
            const li = document.createElement('li');
            const priorityBadge = getPriorityBadge(t.priority);
            li.innerHTML = `
                <div class="task-content">
                    <span><strong>${escapeHtml(t.title)}</strong> ${priorityBadge}</span>
                </div>
                <div class="task-actions">
                    <span class="status-badge status-${t.status}">${getStatusText(t.status)}</span>
                    <button class="delete-btn" data-id="${t.id}" aria-label="Удалить">🗑️</button>
                </div>
            `;
            taskList.appendChild(li);
        });
        updateStats();
    }

    taskList.addEventListener('click', e => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const taskId = Number(deleteBtn.dataset.id);
            if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
                tasks = tasks.filter(t => t.id !== taskId);
                saveTasks();
                renderTasks();
            }
        }
    });

    function updateStats() {
        document.getElementById('total-tasks').textContent = tasks.length;
        document.getElementById('in-progress').textContent = tasks.filter(t => t.status === 'new').length;
        document.getElementById('completed').textContent = tasks.filter(t => t.status === 'done').length;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function getPriorityBadge(priority) {
        const colors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
        const labels = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
        return `<small style="color:${colors[priority]}">● ${labels[priority]}</small>`;
    }

    function getStatusText(status) {
        return { new: 'Новая', 'in-progress': 'В работе', done: 'Завершено' }[status] || status;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(message) {
        console.log(message);
    }

    renderTasks();
});