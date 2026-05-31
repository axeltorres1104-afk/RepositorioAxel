const API_URL = "http://localhost:3000/tasks";
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
let tasks = [];
let currentFilter = "all";
async function getTasks() {
  try {
    const response = await fetch(API_URL);
    tasks = await response.json();
    renderTasks();
  } catch (error) {
    console.error("Error al obtener tareas:", error);
  }
}
function renderTasks() {
  taskList.innerHTML = "";
  let filteredTasks = filterTasks(tasks);
  filteredTasks = searchTasks(filteredTasks);
  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <li class="list-group-item text-center text-muted">
        No hay tareas para mostrar
      </li>
    `;
    return;
  }
  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center task-item";
    const leftDiv = document.createElement("div");
    leftDiv.className = "d-flex align-items-center gap-2";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      toggleCompleted(task.id, task.completed);
    });
    const span = document.createElement("span");
    span.textContent = task.title;
    if (task.completed) {
      span.classList.add("completed");
    }
    leftDiv.appendChild(checkbox);
    leftDiv.appendChild(span);
    const rightDiv = document.createElement("div");
    const editButton = document.createElement("button");
    editButton.textContent = "Editar";
    editButton.className = "btn btn-sm btn-warning me-2";
    editButton.addEventListener("click", () => {
      editTask(task.id, task.title);
    });
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Eliminar";
    deleteButton.className = "btn btn-sm btn-danger";
    deleteButton.addEventListener("click", () => {
      deleteTask(task.id);
    });
    rightDiv.appendChild(editButton);
    rightDiv.appendChild(deleteButton);
    li.appendChild(leftDiv);
    li.appendChild(rightDiv);
    taskList.appendChild(li);
  });
}
taskForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (title === "") {
    alert("Debe ingresar una tarea");
    return;
  }
  const newTask = {
    title: title,
    completed: false,
  };
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });
    taskInput.value = "";
    getTasks();
  } catch (error) {
    console.error("Error al agregar tarea:", error);
  }
});
async function editTask(id, oldTitle) {
  const newTitle = prompt("Editar tarea:", oldTitle);
  if (newTitle === null || newTitle.trim() === "") {
    return;
  }
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTitle.trim(),
      }),
    });
    getTasks();
  } catch (error) {
    console.error("Error al editar tarea:", error);
  }
}
async function deleteTask(id) {
  const confirmDelete = confirm("¿Seguro que desea eliminar esta tarea?");
  if (!confirmDelete) {
    return;
  }
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    getTasks();
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
  }
}
async function toggleCompleted(id, completed) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: !completed,
      }),
    });
    getTasks();
  } catch (error) {
    console.error("Error al cambiar estado:", error);
  }
}
function filterTasks(tasksArray) {
  if (currentFilter === "completed") {
    return tasksArray.filter((task) => task.completed === true);
  }
  if (currentFilter === "pending") {
    return tasksArray.filter((task) => task.completed === false);
  }
  return tasksArray;
}
filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    currentFilter = this.dataset.filter;
    renderTasks();
  });
});
function searchTasks(tasksArray) {
  const searchText = searchInput.value.toLowerCase();

  return tasksArray.filter((task) =>
    task.title.toLowerCase().includes(searchText),
  );
}
searchInput.addEventListener("input", renderTasks);
getTasks();
