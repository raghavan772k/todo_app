const API_BASE_URL = 'http://127.0.0.1:8000/api/tasks/';
const taskForm = document.getElementById('task-form');
const taskTitleInput = document.getElementById('task-title');
const taskDescriptionInput = document.getElementById('task-description');
const taskListDiv = document.getElementById('task-list');
const loadingMessage = document.getElementById('loading-message');

// --- Fetch and Display Tasks ---
async function fetchTasks() {
    loadingMessage.style.display = 'block';
    taskListDiv.innerHTML = ''; // Clear existing tasks
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tasks = await response.json();
        loadingMessage.style.display = 'none';

        if (tasks.length === 0) {
            taskListDiv.innerHTML = '<p>No tasks yet. Add one above!</p>';
        } else {
            tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskItem.setAttribute('data-id', task.id);

                taskItem.innerHTML = `
                    <h3>${task.title}</h3>
                    ${task.description ? `<p>${task.description}</p>` : ''}
                    <div class="task-actions">
                        <button class="toggle-complete-btn">${task.completed ? 'Mark Incomplete' : 'Mark Complete'}</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                `;
                taskListDiv.appendChild(taskItem);
            });
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        loadingMessage.textContent = 'Failed to load tasks. Please try again.';
        loadingMessage.style.color = 'red';
    }
}

// --- Add New Task ---
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    const description = taskDescriptionInput.value.trim();

    if (!title) {
        alert('Task title cannot be empty!');
        return;
    }

    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description, completed: false }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newTask = await response.json();
        console.log('Task added:', newTask);
        taskTitleInput.value = ''; // Clear form
        taskDescriptionInput.value = '';
        fetchTasks(); // Refresh list
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task.');
    }
});

// --- Handle Task Actions (Toggle Complete/Delete) ---
taskListDiv.addEventListener('click', async (e) => {
    const target = e.target;
    const taskItem = target.closest('.task-item'); // Find the closest task-item parent
    if (!taskItem) return;

    const taskId = taskItem.getAttribute('data-id');
    const currentTitle = taskItem.querySelector('h3').textContent;
    const currentDescription = taskItem.querySelector('p')?.textContent || ''; // Optional description

    if (target.classList.contains('toggle-complete-btn')) {
        const isCompleted = taskItem.classList.contains('completed');
        try {
            const response = await fetch(`${API_BASE_URL}${taskId}/`, {
                method: 'PATCH', // Use PATCH for partial update
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: currentTitle, // Include current title (DRF requires all fields even if only patching one)
                    description: currentDescription,
                    completed: !isCompleted // Toggle the completed status
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            fetchTasks(); // Refresh list to reflect change
        } catch (error) {
            console.error('Error toggling task status:', error);
            alert('Failed to update task status.');
        }
    } else if (target.classList.contains('delete-btn')) {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await fetch(`${API_BASE_URL}${taskId}/`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                console.log('Task deleted:', taskId);
                fetchTasks(); // Refresh list
            } catch (error) {
                console.error('Error deleting task:', error);
                alert('Failed to delete task.');
            }
        }
    }
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', fetchTasks);