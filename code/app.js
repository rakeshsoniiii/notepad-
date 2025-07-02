
// DOM Elements
const notesContainer = document.getElementById('notesContainer');
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');
const noteForm = document.getElementById('noteForm');
const noteDialog = document.getElementById('noteDialog');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// State Management
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentNoteId = null;

// Initialize the app
function init() {
  renderNotes();
  renderTodos();
  setupEventListeners();
  applySavedTheme();
}

// Set up all event listeners
function setupEventListeners() {
  // Todo functionality
  addTodoBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
  
  // Note functionality
  noteForm.addEventListener('submit', saveNote);
  
  // Theme toggle
  themeToggleBtn.addEventListener('click', toggleTheme);
  
  // Search functionality
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
}

/**
 * NOTES FUNCTIONALITY
 */

// Open note dialog for creating/editing
function openNoteDialog(noteId = null) {
  currentNoteId = noteId;
  
  if (noteId) {
    // Edit existing note
    const note = notes.find(n => n.id === noteId);
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    document.querySelector('.dialog-title').textContent = 'Edit Note';
  } else {
    // Create new note
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.querySelector('.dialog-title').textContent = 'Add New Note';
  }
  
  noteDialog.showModal();
}

// Close note dialog
function closeNoteDialog() {
  noteDialog.close();
}

// Save note (create or update)
function saveNote(e) {
  e.preventDefault();
  
  const title = document.getElementById('noteTitle').value;
  const content = document.getElementById('noteContent').value;
  
  if (currentNoteId) {
    // Update existing note
    const noteIndex = notes.findIndex(n => n.id === currentNoteId);
    notes[noteIndex] = { id: currentNoteId, title, content };
  } else {
    // Create new note
    notes.push({ id: Date.now().toString(), title, content });
  }
  
  saveToLocalStorage('notes', notes);
  renderNotes();
  closeNoteDialog();
}

// Delete a note
function deleteNote(noteId) {
  notes = notes.filter(note => note.id !== noteId);
  saveToLocalStorage('notes', notes);
  renderNotes();
}

// Render all notes
function renderNotes(filteredNotes = null) {
  const notesToRender = filteredNotes || notes;
  
  notesContainer.innerHTML = notesToRender.length > 0 
    ? notesToRender.map(note => `
        <div class="note-card" data-id="${note.id}">
          <h3 class="note-title">${note.title}</h3>
          <p class="note-content">${note.content}</p>
          <div class="note-actions">
            <button class="edit-btn" onclick="openNoteDialog('${note.id}')">✏️</button>
            <button class="delete-btn" onclick="deleteNote('${note.id}')">🗑️</button>
          </div>
        </div>
      `).join('')
    : '<div class="empty-state"><p>No notes found</p></div>';
}

/**
 * TODO FUNCTIONALITY
 */

// Add new todo
function addTodo() {
  const todoText = todoInput.value.trim();
  if (!todoText) return;
  
  todos.push({ id: Date.now().toString(), text: todoText, completed: false });
  saveToLocalStorage('todos', todos);
  renderTodos();
  todoInput.value = '';
}

// Toggle todo completion status
function toggleTodo(todoId) {
  todos = todos.map(todo => 
    todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
  );
  saveToLocalStorage('todos', todos);
  renderTodos();
}

// Delete a todo
function deleteTodo(todoId) {
  todos = todos.filter(todo => todo.id !== todoId);
  saveToLocalStorage('todos', todos);
  renderTodos();
}

// Render all todos
function renderTodos(filteredTodos = null) {
  const todosToRender = filteredTodos || todos;
  
  todoList.innerHTML = todosToRender.length > 0
    ? todosToRender.map(todo => `
        <li class="${todo.completed ? 'checked' : ''}" data-id="${todo.id}">
          ${todo.text}
          <span class="delete-todo" onclick="deleteTodo('${todo.id}')">×</span>
        </li>
      `).join('')
    : '<div class="empty-state"><p>No tasks yet</p></div>';
  
  // Add click event to todos
  document.querySelectorAll('#todo-list li').forEach(li => {
    li.addEventListener('click', function() {
      toggleTodo(this.dataset.id);
    });
  });
}

/**
 * SEARCH FUNCTIONALITY
 */

// Perform search across notes and todos
function performSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  if (!searchTerm) {
    renderNotes();
    renderTodos();
    return;
  }
  
  // Search notes
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm) || 
    note.content.toLowerCase().includes(searchTerm)
  );
  
  // Search todos
  const filteredTodos = todos.filter(todo => 
    todo.text.toLowerCase().includes(searchTerm)
  );
  
  renderNotes(filteredNotes);
  renderTodos(filteredTodos);
}

/**
 * THEME MANAGEMENT
 */

// Toggle between light/dark theme
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('darkTheme', isDark);
  themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
}

// Apply saved theme preference
function applySavedTheme() {
  const darkTheme = localStorage.getItem('darkTheme') === 'true';
  if (darkTheme) {
    document.body.classList.add('dark-theme');
    themeToggleBtn.textContent = '☀️';
  }
}

/**
 * UTILITY FUNCTIONS
 */

// Save data to localStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
