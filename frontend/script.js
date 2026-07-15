/* =========================================================
   API CONFIGURATION
   Keep all backend URLs here so they're easy to change later
   if the Django server address or routes change.
   ========================================================= */

const API_BASE_URL = "http://127.0.0.1:8000";

const API_URLS = {
  list: `${API_BASE_URL}/notes/`,
  detail: (id) => `${API_BASE_URL}/notes/${id}/`,
  create: `${API_BASE_URL}/notes/create/`,
  update: (id) => `${API_BASE_URL}/notes/${id}/update/`,
  delete: (id) => `${API_BASE_URL}/notes/${id}/delete/`,
};

/* =========================================================
   DOM ELEMENT REFERENCES
   Grabbing all the elements we'll need to work with, once,
   at the top of the file so they're easy to find.
   ========================================================= */

const noteForm = document.getElementById("note-form");
const formTitle = document.getElementById("form-title");

const noteIdInput = document.getElementById("note-id");
const noteTitleInput = document.getElementById("note-title");
const noteContentInput = document.getElementById("note-content");
const notePriorityInput = document.getElementById("note-priority");

const createBtn = document.getElementById("create-btn");
const updateBtn = document.getElementById("update-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

const notesContainer = document.getElementById("notes-container");
const messageBanner = document.getElementById("message-banner");

/* A lookup table for turning the numeric priority into a label. */
const PRIORITY_LABELS = {
  0: "Low",
  1: "Medium",
  2: "High",
};

const PRIORITY_CLASS_NAMES = {
  0: "priority-low",
  1: "priority-medium",
  2: "priority-high",
};

/* =========================================================
   MESSAGE BANNER HELPERS
   Shows a short success/error message at the top of the page.
   ========================================================= */

function showMessage(text, type) {
  // type should be "success" or "error"
  messageBanner.textContent = text;
  messageBanner.className = `message-banner ${type}`;
  messageBanner.classList.remove("hidden");

  // Automatically hide the message after a few seconds
  setTimeout(() => {
    messageBanner.classList.add("hidden");
  }, 3000);
}

/* =========================================================
   RENDERING NOTES
   ========================================================= */

// Builds the HTML for a single note card and returns it as an element.
function createNoteCard(note) {
  const card = document.createElement("article");
  card.className = `note-card ${PRIORITY_CLASS_NAMES[note.priority]}`;

  // Format the created_at date into something readable.
  const createdDate = new Date(note.created_at).toLocaleString();

  card.innerHTML = `
    <h3 class="note-title">${escapeHtml(note.title)}</h3>
    <p class="note-content">${escapeHtml(note.content)}</p>
    <p class="note-meta">
      <span class="priority-badge ${PRIORITY_CLASS_NAMES[note.priority]}">
        ${PRIORITY_LABELS[note.priority]}
      </span>
      Created: ${createdDate}
    </p>
    <div class="note-card-buttons">
      <button class="btn btn-edit" data-action="edit" data-id="${note.id}">Edit</button>
      <button class="btn btn-delete" data-action="delete" data-id="${note.id}">Delete</button>
    </div>
  `;

  return card;
}

// Escapes basic HTML special characters so note text can't break the page
// or inject markup (a simple safety measure for beginner projects).
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Takes an array of notes and displays them inside #notes-container.
function renderNotes(notes) {
  // Clear out whatever is currently shown
  notesContainer.innerHTML = "";

  if (notes.length === 0) {
    notesContainer.innerHTML = `
      <p class="empty-state">You don't have any notes yet. Create your first note above!</p>
    `;
    return;
  }

  notes.forEach((note) => {
    const card = createNoteCard(note);
    notesContainer.appendChild(card);
  });
}

/* =========================================================
   API FUNCTIONS
   Each function below does exactly one job: talk to the API
   and return the result. They don't touch the DOM directly.
   ========================================================= */

async function fetchNotes() {
  const response = await fetch(API_URLS.list);

  if (!response.ok) {
    throw new Error("Failed to load notes from the server.");
  }

  return response.json();
}

async function createNoteRequest(noteData) {
  const response = await fetch(API_URLS.create, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    throw new Error("Failed to create the note.");
  }

  return response.json();
}

async function updateNoteRequest(noteId, noteData) {
  const response = await fetch(API_URLS.update(noteId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(noteData),
  });

  if (!response.ok) {
    throw new Error("Failed to update the note.");
  }

  return response.json();
}

async function deleteNoteRequest(noteId) {
  const response = await fetch(API_URLS.delete(noteId), {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete the note.");
  }
}

/* =========================================================
   HIGH-LEVEL ACTIONS
   These functions combine the API calls above with UI updates
   (loading notes, showing messages, refreshing the list, etc.)
   ========================================================= */

// Loads all notes from the backend and displays them.
async function loadNotes() {
  try {
    const notes = await fetchNotes();
    renderNotes(notes);
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Reads the current form values and sends a "create note" request.
async function createNote(noteData) {
  try {
    await createNoteRequest(noteData);
    showMessage("Note created successfully!", "success");
    resetForm();
    await loadNotes();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Sends an "update note" request for the note currently being edited.
async function updateNote(noteId, noteData) {
  try {
    await updateNoteRequest(noteId, noteData);
    showMessage("Note updated successfully!", "success");
    resetForm();
    await loadNotes();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Deletes a note after asking the user to confirm.
async function deleteNote(noteId) {
  const confirmed = window.confirm("Are you sure you want to delete this note?");
  if (!confirmed) {
    return;
  }

  try {
    await deleteNoteRequest(noteId);
    showMessage("Note deleted.", "success");
    await loadNotes();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

/* =========================================================
   FORM HELPERS
   ========================================================= */

// Switches the form into "editing" mode and fills it with the note's data.
function startEditingNote(note) {
  noteIdInput.value = note.id;
  noteTitleInput.value = note.title;
  noteContentInput.value = note.content;
  notePriorityInput.value = note.priority;

  formTitle.textContent = "Edit Note";

  // Show the Update/Cancel buttons and hide the Create button
  createBtn.classList.add("hidden");
  updateBtn.classList.remove("hidden");
  cancelEditBtn.classList.remove("hidden");

  // Scroll up to the form so the user can see what they're editing
  noteForm.scrollIntoView({ behavior: "smooth" });
}

// Clears the form and puts it back into "create" mode.
function resetForm() {
  noteForm.reset();
  noteIdInput.value = "";

  formTitle.textContent = "Create a New Note";

  createBtn.classList.remove("hidden");
  updateBtn.classList.add("hidden");
  cancelEditBtn.classList.add("hidden");
}

/* =========================================================
   EVENT LISTENERS
   ========================================================= */

// Handles both "Create" and "Update" submissions, since they
// share the same form. We check whether note-id has a value
// to decide which action to perform.
noteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const noteData = {
    title: noteTitleInput.value.trim(),
    content: noteContentInput.value.trim(),
    priority: parseInt(notePriorityInput.value, 10),
  };

  const editingNoteId = noteIdInput.value;

  if (editingNoteId) {
    updateNote(editingNoteId, noteData);
  } else {
    createNote(noteData);
  }
});

cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

// Uses event delegation: one listener on the container handles
// clicks on any "Edit" or "Delete" button inside it, instead of
// attaching a separate listener to every single note card.
notesContainer.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const noteId = button.dataset.id;
  const action = button.dataset.action;

  if (action === "delete") {
    deleteNote(noteId);
  } else if (action === "edit") {
    try {
      const response = await fetch(API_URLS.detail(noteId));
      if (!response.ok) {
        throw new Error("Failed to load the note for editing.");
      }
      const note = await response.json();
      startEditingNote(note);
    } catch (error) {
      showMessage(error.message, "error");
    }
  }
});

/* =========================================================
   INITIAL LOAD
   ========================================================= */

loadNotes();
