const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const SEARCH_KEY = "search-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const textTitle = document.createElement("h3");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = author;

  const textYear = document.createElement("p");
  textYear.innerText = year;

  const action = document.createElement("div");
  action.classList.add("action");

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(textTitle, textAuthor, textYear, action);
  container.setAttribute("id", `book-${id}`);

  if (isComplete) {
    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.addEventListener("click", function () {
      showEditBook(id);
    });

    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(id);
    });

    action.append(editButton, undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", function () {
      addBookToCompleted(id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.addEventListener("click", function () {
      showEditBook(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      removeBookFromCompleted(id);
    });

    action.append(editButton, checkButton, trashButton);
  }

  return container;
}

function addBook() {
  const textTitle = document.getElementById("inputBookTitle").value;
  const textAuthor = document.getElementById("inputBookAuthor").value;
  const textYear = document.getElementById("inputBookYear").value;

  let isComplete = false;

  let checkboxes = document.querySelector('input[name="complete"]:checked');

  if (checkboxes) {
    isComplete = true;
  }

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, textTitle, textAuthor, textYear, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId) {
  showConfirmBox();
  const confirmButton = document.getElementById("confirm-true");

  confirmButton.addEventListener("click", function () {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    closeConfirmBox();
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  });
}
function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function searchBook(title) {
  for (const bookItem of books) {
    if (bookItem.title == title) {
      return bookItem;
    }
  }
  return null;
}

function searchBookSession() {
  const textSearch = document.getElementById("searchBookTitle").value;

  sessionStorage.setItem(SEARCH_KEY, textSearch);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function showModal(id) {
  var modal = document.getElementById("editModal");
  modal.style.display = "block";

  var span = document.getElementsByClassName("close")[0];

  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  const editForm = document.getElementById("editBook");
  const bookId = id;

  editForm.addEventListener("submit", function () {
    updateBook(bookId);
    modal.style.display = "none";
  });
}

function showEditBook(id) {
  const bookTarget = findBook(id);

  const textTitle = document.getElementById("editBookTitle");
  const textAuthor = document.getElementById("editBookAuthor");
  const textYear = document.getElementById("editBookYear");

  textTitle.value = bookTarget.title;
  textAuthor.value = bookTarget.author;
  textYear.value = bookTarget.year;

  showModal(id);
}

function updateBook(bookid) {
  const textTitle = document.getElementById("editBookTitle").value;
  const textAuthor = document.getElementById("editBookAuthor").value;
  const textYear = document.getElementById("editBookYear").value;

  const bookTarget = findBook(bookid);
  if (bookTarget == null) return;

  bookTarget.title = textTitle;
  bookTarget.author = textAuthor;
  bookTarget.year = textYear;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function showConfirmBox() {
  var modal = document.getElementById("deleteModal");
  modal.style.display = "block";

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}
function closeConfirmBox() {
  var modal = document.getElementById("deleteModal");
  modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  const searchForm = document.getElementById("searchBook");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBookSession();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log("Data berhasil di simpan.");
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById("incompleteBookshelfList");
  const listCompleted = document.getElementById("completeBookshelfList");
  const searchBookList = document.getElementById("searchBookshelfList");
  const search_key = sessionStorage.getItem(SEARCH_KEY);

  uncompletedBookList.innerHTML = "";
  listCompleted.innerHTML = "";
  searchBookList.innerHTML = "";

  if (search_key) {
    const bookTarget = searchBook(search_key);

    if (!bookTarget) {
      document.getElementById("search_book").hidden = false;
      searchBookList.innerHTML = "Not found.";
    } else {
      const bookTargetView = makeBook(bookTarget);
      searchBookList.append(bookTargetView);
      document.getElementById("search_book").hidden = false;
    }
  } else {
    document.getElementById("search_book").hidden = true;
  }

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      listCompleted.append(bookElement);
    } else {
      uncompletedBookList.append(bookElement);
    }
  }
});
