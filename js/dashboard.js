/**
 * Euodoo To Do List - Dashboard Script (js/dashboard.js)
 * Pure Vanilla JavaScript - Dynamic table, draggable task details modal,
 * inline editing, completion toggle, deletion, real-time search and filters.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ========================================================================
  // 1. Authentication Protection & User Info
  // ========================================================================
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn !== "true") {
    window.location.href = "index.html";
    return;
  }

  const userDisplayName = document.getElementById("user-display-name");
  const storedEmployeeId = localStorage.getItem("employeeId");
  if (userDisplayName && storedEmployeeId) {
    userDisplayName.textContent = storedEmployeeId;
  }

  // Logout Handler
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("employeeId");
    window.location.href = "index.html";
  });

  // ========================================================================
  // 2. Predefined Task Data (Exact 8 Tasks)
  // ========================================================================
  const defaultTasks = [
    {
      id: 1,
      title: "Submit weekly timesheet",
      department: "Finance",
      priority: "High",
      due: "Oct 7, 2026",
      status: "To do",
      completed: false,
      createdDate: "Oct 7, 2026",
      description: "",
    },
    {
      id: 2,
      title: "Review client proposal draft",
      department: "Sales",
      priority: "High",
      due: "Oct 8, 2026",
      status: "In progress",
      completed: false,
      createdDate: "Oct 7, 2026",
      description: "",
    },
    {
      id: 3,
      title: "Complete safety training module",
      department: "HR",
      priority: "Medium",
      due: "Oct 9, 2026",
      status: "In progress",
      completed: false,
      createdDate: "Oct 7, 2026",
      description: "",
    },
    {
      id: 4,
      title: "Update project status report",
      department: "Operations",
      priority: "Low",
      due: "Oct 12, 2026",
      status: "To do",
      completed: false,
      createdDate: "Oct 7, 2026",
      description: "",
    },
    {
      id: 5,
      title: "Prepare Q4 goals",
      department: "Planning",
      priority: "Medium",
      due: "Oct 15, 2026",
      status: "To do",
      completed: false,
      createdDate: "Oct 7, 2026",
      description: "",
    },
    {
      id: 6,
      title: "Team stand-up notes",
      department: "Operations",
      priority: "Low",
      due: "Oct 6, 2026",
      status: "Done",
      completed: false,
      createdDate: "Oct 1, 2026",
      description: "",
    },
    {
      id: 7,
      title: "Expense report for September",
      department: "Finance",
      priority: "Medium",
      due: "Oct 5, 2026",
      status: "Done",
      completed: false,
      createdDate: "Sep 30, 2026",
      description: "",
    },
    {
      id: 8,
      title: "Onboard new teammate",
      department: "HR",
      priority: "Medium",
      due: "Oct 3, 2026",
      status: "Done",
      completed: false,
      createdDate: "Sep 29, 2026",
      description: "",
    },
  ];

  // Load from localStorage or initialize
  let tasks = [];
  try {
    const saved = localStorage.getItem("euodoo_tasks_v2");
    tasks = saved ? JSON.parse(saved) : defaultTasks;
  } catch (err) {
    tasks = defaultTasks;
  }

  function saveTasks() {
    try {
      localStorage.setItem("euodoo_tasks_v2", JSON.stringify(tasks));
    } catch (e) {
      // ignore
    }
  }

  // State
  let currentFilter = "all"; // 'all' | 'todo' | 'inprogress' | 'done'
  let searchQuery = "";
  let selectedTaskId = null;

  // DOM Elements
  const taskListContainer = document.getElementById("task-list");
  const taskSearchInput = document.getElementById("task-search");
  const filterPills = document.querySelectorAll(".filter-pill");

  // Summary Stat Elements
  const statTotal = document.getElementById("stat-total");
  const statInProgress = document.getElementById("stat-inprogress");
  const statToday = document.getElementById("stat-today");
  const statCompleted = document.getElementById("stat-completed");

  // Filter Count Elements
  const countAll = document.getElementById("count-all");
  const countTodo = document.getElementById("count-todo");
  const countInProgress = document.getElementById("count-inprogress");
  const countDone = document.getElementById("count-done");

  // Modal Elements
  const modalOverlay = document.getElementById("task-details-overlay");
  const modalElement = document.getElementById("task-details-modal");
  const modalDragHeader = document.getElementById("modal-drag-header");
  const modalCloseBtn = document.getElementById("modal-close-btn");

  const modalViewMode = document.getElementById("modal-view-mode");
  const modalStatusBadge = document.getElementById("modal-status-badge");
  const modalPriorityBadge = document.getElementById("modal-priority-badge");
  const modalTaskTitle = document.getElementById("modal-task-title");
  const modalDepartment = document.getElementById("modal-department");
  const modalDue = document.getElementById("modal-due");
  const modalCreated = document.getElementById("modal-created");
  const modalPriorityText = document.getElementById("modal-priority-text");
  const modalStatusText = document.getElementById("modal-status-text");
  const modalTaskId = document.getElementById("modal-task-id");
  const modalDescText = document.getElementById("modal-description-text");

  const btnEditTask = document.getElementById("btn-edit-task");
  const btnToggleDone = document.getElementById("btn-toggle-done");
  const btnToggleDoneText = document.getElementById("btn-toggle-done-text");
  const btnDeleteTask = document.getElementById("btn-delete-task");

  // Edit Mode Elements
  const modalEditForm = document.getElementById("modal-edit-form");
  const editTaskTitle = document.getElementById("edit-task-title");
  const editTaskDepartment = document.getElementById("edit-task-department");
  const editTaskPriority = document.getElementById("edit-task-priority");
  const editTaskDue = document.getElementById("edit-task-due");
  const editTaskDesc = document.getElementById("edit-task-desc");
  const btnCancelEdit = document.getElementById("btn-cancel-edit");

  // Delete Confirmation Elements
  const deleteConfirmBanner = document.getElementById("delete-confirm-banner");
  const btnCancelDelete = document.getElementById("btn-cancel-delete");
  const btnConfirmDelete = document.getElementById("btn-confirm-delete");

  // Helper: check if a due date is today
  function isDueToday(dueStr) {
    if (!dueStr) return false;
    const lower = dueStr.toLowerCase().trim();
    return lower === "today" || lower === "oct 7, 2026" || lower === "oct 7";
  }

  // Format due date for dashboard table (display "Today" for Oct 7, 2026 / Today)
  function formatTableDue(dueStr) {
    if (isDueToday(dueStr)) return "Today";
    // Extract short month + day, e.g. "Oct 8" from "Oct 8, 2026"
    return dueStr.replace(/,?\s*\d{4}$/, "");
  }

  // ========================================================================
  // 3. Statistics & Filter Counts
  // ========================================================================
  function updateStatistics() {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === "In progress").length;
    const dueToday = tasks.filter((t) => isDueToday(t.due)).length;
    const completed = tasks.filter(
      (t) => t.completed || t.status === "Done",
    ).length;
    const todo = tasks.filter((t) => t.status === "To do").length;

    // Summary cards
    if (statTotal) statTotal.textContent = total;
    if (statInProgress) statInProgress.textContent = inProgress;
    if (statToday) statToday.textContent = dueToday;
    if (statCompleted) statCompleted.textContent = completed;

    // Filter pills counts
    if (countAll) countAll.textContent = total;
    if (countTodo) countTodo.textContent = todo;
    if (countInProgress) countInProgress.textContent = inProgress;
    if (countDone) countDone.textContent = completed;
  }

  // ========================================================================
  // 4. Render Dashboard Table Rows
  // ========================================================================
  function renderTasks() {
    updateStatistics();

    // Filter by active pill
    let filtered = tasks.filter((task) => {
      if (currentFilter === "todo") return task.status === "To do";
      if (currentFilter === "inprogress") return task.status === "In progress";
      if (currentFilter === "done")
        return task.completed || task.status === "Done";
      return true; // 'all'
    });

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(q),
      );
    }

    // Empty state
    if (filtered.length === 0) {
      taskListContainer.innerHTML = `
        <div class="empty-state">
          No tasks found.
        </div>
      `;
      return;
    }

    // Render table rows
    taskListContainer.innerHTML = filtered
      .map((task) => {
        const isDone = task.completed || task.status === "Done";
        const priorityClass = `priority-${task.priority.toLowerCase()}`;
        const statusSlug = task.status.toLowerCase().replace(/\s+/g, "");
        const statusClass = `status-${statusSlug}`;
        const isToday = isDueToday(task.due);
        const displayDue = formatTableDue(task.due);

        return `
          <div class="task-row ${isDone ? "completed" : ""}" data-id="${task.id}" role="listitem">
            <!-- Left: Checkbox + Title + Department -->
            <div class="task-left">
              <button
                type="button"
                class="task-checkbox-btn ${isDone ? "checked" : ""}"
                aria-label="${isDone ? "Mark as incomplete" : "Mark as completed"}"
                data-action="toggle"
              >
                <svg class="check-svg" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </button>
              <div class="task-text-group">
                <span class="task-title" title="${escapeHtml(task.title)}">${escapeHtml(task.title)}</span>
                <span class="task-category">${escapeHtml(task.department || "General")}</span>
              </div>
            </div>

            <!-- Priority Pill -->
            <div class="col-priority">
              <span class="priority-pill ${priorityClass}">${escapeHtml(task.priority)}</span>
            </div>

            <!-- Due Date -->
            <div class="col-due">
              <span class="task-due ${isToday ? "due-today" : ""}">${escapeHtml(displayDue)}</span>
            </div>

            <!-- Status Pill -->
            <div class="col-status">
              <span class="status-pill ${statusClass}">${escapeHtml(task.status)}</span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  // HTML escape helper
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ========================================================================
  // 5. Task Row Click & Checkbox Interactions
  // ========================================================================
  taskListContainer?.addEventListener("click", (e) => {
    // If clicked on checkbox button
    const checkboxBtn = e.target.closest('[data-action="toggle"]');
    if (checkboxBtn) {
      e.stopPropagation(); // Do not trigger modal!
      const row = checkboxBtn.closest(".task-row");
      if (!row) return;

      const taskId = parseInt(row.dataset.id, 10);
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      task.completed = !task.completed;
      task.status = task.completed ? "Done" : "To do";
      saveTasks();
      renderTasks();
      return;
    }

    // If clicked anywhere else on the task row -> Open Task Details Modal!
    const taskRow = e.target.closest(".task-row");
    if (taskRow) {
      const taskId = parseInt(taskRow.dataset.id, 10);
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        openTaskModal(task);
      }
    }
  });

  // ========================================================================
  // 6. Task Details Modal: Populate & Open
  // ========================================================================
  function populateModal(task) {
    selectedTaskId = task.id;

    // Status Badge
    modalStatusBadge.textContent = task.status;
    const statusSlug = task.status.toLowerCase().replace(/\s+/g, "");
    modalStatusBadge.className = `modal-badge status-${statusSlug}`;

    // Priority Badge
    modalPriorityBadge.textContent = `${task.priority} Priority`;
    modalPriorityBadge.className = `modal-badge priority-${task.priority.toLowerCase()}`;

    // Title
    modalTaskTitle.textContent = task.title;

    // Task Information Card
    modalDepartment.textContent = task.department || "General";
    modalDue.textContent = task.due || "—";
    modalCreated.textContent = task.createdDate || "Oct 7, 2026";
    modalPriorityText.textContent = task.priority;
    modalStatusText.textContent = task.status;
    modalTaskId.textContent = `#${task.id}`;

    // Description
    if (task.description && task.description.trim() !== "") {
      modalDescText.textContent = task.description;
      modalDescText.className = "desc-filled";
    } else {
      modalDescText.textContent = "No description added.";
      modalDescText.className = "desc-empty";
    }

    // Toggle Done Button Appearance
    const isDone = task.completed || task.status === "Done";
    if (isDone) {
      btnToggleDone.classList.add("is-completed");
      btnToggleDoneText.textContent = "✓ Completed";
    } else {
      btnToggleDone.classList.remove("is-completed");
      btnToggleDoneText.textContent = "Mark as Done";
    }

    // Reset view modes
    modalViewMode.style.display = "block";
    modalEditForm.style.display = "none";
    deleteConfirmBanner.style.display = "none";
  }

  function openTaskModal(task) {
    populateModal(task);

    // Reset draggable position to center initially
    modalElement.style.position = "";
    modalElement.style.left = "";
    modalElement.style.top = "";
    modalElement.style.transform = "";
    modalElement.style.margin = "";

    // Show modal & blur background
    modalOverlay.classList.add("open");
    modalOverlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-active");
  }

  function closeModal() {
    modalOverlay.classList.remove("open");
    modalOverlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-active");
    selectedTaskId = null;
  }

  // Close triggers
  modalCloseBtn?.addEventListener("click", closeModal);

  // Close when clicking dark overlay outside modal
  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Close with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay?.classList.contains("open")) {
      closeModal();
    }
  });

  // ========================================================================
  // 7. Draggable Modal Functionality
  // ========================================================================
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialModalX = 0;
  let initialModalY = 0;

  function onDragStart(e) {
    // If clicking close button or interactive child, don't drag
    if (e.target.closest("#modal-close-btn")) return;

    // Get client position (mouse or touch)
    const clientX = e.type.startsWith("touch")
      ? e.touches[0].clientX
      : e.clientX;
    const clientY = e.type.startsWith("touch")
      ? e.touches[0].clientY
      : e.clientY;

    isDragging = true;
    dragStartX = clientX;
    dragStartY = clientY;

    // Get current bounding rectangle of modal
    const rect = modalElement.getBoundingClientRect();
    initialModalX = rect.left;
    initialModalY = rect.top;

    // Fix position to absolute viewport coords
    modalElement.style.position = "fixed";
    modalElement.style.left = `${initialModalX}px`;
    modalElement.style.top = `${initialModalY}px`;
    modalElement.style.transform = "none";
    modalElement.style.margin = "0";

    modalDragHeader.classList.add("is-dragging");

    if (!e.type.startsWith("touch")) {
      e.preventDefault(); // prevent text selection
    }
  }

  function onDragMove(e) {
    if (!isDragging) return;

    const clientX = e.type.startsWith("touch")
      ? e.touches[0].clientX
      : e.clientX;
    const clientY = e.type.startsWith("touch")
      ? e.touches[0].clientY
      : e.clientY;

    const deltaX = clientX - dragStartX;
    const deltaY = clientY - dragStartY;

    let newX = initialModalX + deltaX;
    let newY = initialModalY + deltaY;

    // Boundary constraints: keep modal inside viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const modalWidth = modalElement.offsetWidth;
    const modalHeight = modalElement.offsetHeight;

    const minX = 8;
    const maxX = Math.max(minX, viewportWidth - modalWidth - 8);
    const minY = 8;
    const maxY = Math.max(minY, viewportHeight - modalHeight - 8);

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    modalElement.style.left = `${newX}px`;
    modalElement.style.top = `${newY}px`;
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    modalDragHeader.classList.remove("is-dragging");
  }

  // Mouse drag listeners
  modalDragHeader?.addEventListener("mousedown", onDragStart);
  document.addEventListener("mousemove", onDragMove);
  document.addEventListener("mouseup", onDragEnd);

  // Touch drag listeners (mobile / trackpad)
  modalDragHeader?.addEventListener("touchstart", onDragStart, {
    passive: true,
  });
  document.addEventListener("touchmove", onDragMove, { passive: true });
  document.addEventListener("touchend", onDragEnd);

  // ========================================================================
  // 8. Modal Actions: Toggle Done
  // ========================================================================
  btnToggleDone?.addEventListener("click", () => {
    if (!selectedTaskId) return;
    const task = tasks.find((t) => t.id === selectedTaskId);
    if (!task) return;

    task.completed = !task.completed;
    task.status = task.completed ? "Done" : "To do";

    saveTasks();
    populateModal(task);
    renderTasks();
  });

  // ========================================================================
  // 9. Modal Actions: Edit Task
  // ========================================================================
  btnEditTask?.addEventListener("click", () => {
    if (!selectedTaskId) return;
    const task = tasks.find((t) => t.id === selectedTaskId);
    if (!task) return;

    // Populate edit fields
    editTaskTitle.value = task.title;
    editTaskDepartment.value = task.department || "";
    editTaskPriority.value = task.priority;
    editTaskDue.value = task.due || "";
    editTaskDesc.value = task.description || "";

    // Toggle view
    modalViewMode.style.display = "none";
    deleteConfirmBanner.style.display = "none";
    modalEditForm.style.display = "flex";
    editTaskTitle.focus();
  });

  btnCancelEdit?.addEventListener("click", () => {
    modalEditForm.style.display = "none";
    modalViewMode.style.display = "block";
  });

  modalEditForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selectedTaskId) return;
    const task = tasks.find((t) => t.id === selectedTaskId);
    if (!task) return;

    const newTitle = editTaskTitle.value.trim();
    if (!newTitle) {
      editTaskTitle.focus();
      return;
    }

    task.title = newTitle;
    task.department = editTaskDepartment.value.trim() || "General";
    task.priority = editTaskPriority.value;
    task.due = editTaskDue.value.trim() || "Oct 7, 2026";
    task.description = editTaskDesc.value.trim();

    saveTasks();
    populateModal(task);
    renderTasks();
  });

  // ========================================================================
  // 10. Modal Actions: Delete Task
  // ========================================================================
  btnDeleteTask?.addEventListener("click", () => {
    deleteConfirmBanner.style.display = "block";
  });

  btnCancelDelete?.addEventListener("click", () => {
    deleteConfirmBanner.style.display = "none";
  });

  btnConfirmDelete?.addEventListener("click", () => {
    if (!selectedTaskId) return;
    tasks = tasks.filter((t) => t.id !== selectedTaskId);
    saveTasks();
    closeModal();
    renderTasks();
  });

  // ========================================================================
  // 11. Filters & Search Handlers
  // ========================================================================
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      currentFilter = pill.dataset.filter || "all";
      renderTasks();
    });
  });

  taskSearchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderTasks();
  });

  // Initial render
  renderTasks();
});
