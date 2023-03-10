const APIs = (() => {
  // Implementation of myFetch, due to time constaint, it's returning JSON straight away, instead of another promise to
  //convert it to json after
  const myFetch = (url, options) => {
    return new Promise((res, rej) => {
      const xhr = new XMLHttpRequest();
      xhr.open(options?.method || "GET", url);
      xhr.responseType = "json";
      for ([key, value] of Object.entries(options?.headers || {}))
        xhr.setRequestHeader(key, value);
      xhr.onload = function () {
        res(xhr.response);
      };
      xhr.onerror = function () {
        rej(xhr.response);
      };
      xhr.send(options?.body);
    });
  };
  // Creates a new todo
  const createTodo = (newTodo) => {
    return myFetch("http://localhost:3000/todos", {
      method: "POST",
      body: JSON.stringify(newTodo),
      headers: { "Content-Type": "application/json" },
    });
  };
  // Edits a todo
  // (Using patch since we are only really editing specific parts and not the whole todo)
  const editTodo = (id, editedFields) => {
    return myFetch(`http://localhost:3000/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(editedFields),
      headers: { "Content-Type": "application/json" },
    });
  };

  // DELETE a todo
  const deleteTodo = (id) => {
    return myFetch("http://localhost:3000/todos/" + id, {
      method: "DELETE",
    });
  };

  // Get all todos
  const getTodos = () => {
    return myFetch("http://localhost:3000/todos");
  };
  return { createTodo, deleteTodo, getTodos, editTodo };
})();

/*
    todo: {
        content: string,
        completed: boolean,
        id: number
    }
*/
// I added a new field to each todo state called editing to see if we should render the input or the span (this is not sent to server)
const Model = (() => {
  class State {
    #todos;
    #onChange;
    constructor() {
      this.#todos = [];
    }
    get todos() {
      return this.#todos;
    }
    set todos(newTodos) {
      this.#todos = newTodos;
      this.#onChange?.();
    }

    subscribe(callback) {
      this.#onChange = callback;
    }
  }
  const { getTodos, createTodo, deleteTodo, editTodo } = APIs;
  return {
    State,
    getTodos,
    createTodo,
    deleteTodo,
    editTodo,
  };
})();

const View = (() => {
  const todolistsContainer = document.querySelector(".todo-lists__container");
  // We now have two lists instead of one
  const todolistPendingEl = document.querySelector(".todo-list-pending");
  const todolistCompletedEl = document.querySelector(".todo-list-completed");
  const submitBtnEl = document.querySelector(".submit-btn"); // Main button to add todo (same as before)
  const inputEl = document.querySelector(".input"); // Main input element to add todo(same as before)
  // The todo action icons
  const editIcon = `<svg class="edit-btn" focusable="false" aria-hidden="true" viewBox="0 0 24 24"  aria-label="fontSize small"><path class="edit-btn" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>`;
  const deleteIcon = `<svg class="delete-btn" focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small"><path class="delete-btn" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>`;
  const arrowLeftIcon = `<svg class="status-btn" focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small"><path class="status-btn" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>`;
  const arrowRightIcon = `<svg class="status-btn" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIcon" aria-label="fontSize small"><path class="status-btn" d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg>`;

  const renderTodos = (todos) => {
    /*
        I decided to create each todo using javascript instead of using a string that gets parsed
        Even though this is more code, I believe it's less prone to errors
    */
    let todosPendingFragment = document.createDocumentFragment();
    let todosCompletedFragment = document.createDocumentFragment();

    /*
        I could have filter the state twice and do a forEach for returning array from the filter
        I decided to just do it in one for each since it will save space and due to time constaints for this project
        In this for each more logic was added. For example, we need to check if is in editingState, so we know if we have to render
        an input or span
        We also need to know the status since the order that the elements get appended would be different
        I removed the id from the delete button since we now have more buttons and ids are supposed to be unique, the parent li is
        now the one that has the id attribute
    */
    todos.forEach((todo) => {
      const liEl = document.createElement("li");
      liEl.setAttribute("id", todo.id);
      liEl.classList.add("todo");

      let mainEle;
      if (!todo.editing) {
        mainEle = document.createElement("span");
        mainEle.textContent = todo.content;
      } else {
        mainEle = document.createElement("input");
        mainEle.setAttribute("value", todo.content);
      }

      const editButton = document.createElement("button");
      editButton.innerHTML = editIcon;
      editButton.classList.add("edit-btn");

      const statusButton = document.createElement("button");
      statusButton.innerHTML = todo.completed ? arrowLeftIcon : arrowRightIcon;
      statusButton.classList.add("status-btn");

      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = deleteIcon;
      deleteButton.classList.add("delete-btn");

      if (todo.completed) {
        liEl.append(statusButton, mainEle, editButton, deleteButton);
        todosCompletedFragment.appendChild(liEl);
      } else {
        liEl.append(mainEle, editButton, deleteButton, statusButton);
        todosPendingFragment.appendChild(liEl);
      }
    });

    if (todosPendingFragment.children.length === 0) {
      todosPendingFragment.textContent = "No task to display!";
    }
    if (todosCompletedFragment.children.length === 0) {
      todosCompletedFragment.textContent = "No task to display!";
    }
    todolistPendingEl.textContent = "";
    todolistCompletedEl.textContent = "";
    todolistPendingEl.appendChild(todosPendingFragment);
    todolistCompletedEl.appendChild(todosCompletedFragment);
  };

  const clearInput = () => {
    inputEl.value = "";
  };

  return {
    renderTodos,
    submitBtnEl,
    inputEl,
    clearInput,
    todolistPendingEl,
    todolistCompletedEl,
    todolistsContainer,
  };
})();

const Controller = ((view, model) => {
  const state = new model.State();
  const init = () => {
    model.getTodos().then((todos) => {
      todos.reverse();
      state.todos = todos.map((todo) => ({ ...todo, editing: false }));
    });
  };

  const handleSubmit = () => {
    view.submitBtnEl.addEventListener("click", (event) => {
      const inputValue = view.inputEl.value;
      model
        .createTodo({ content: inputValue, completed: false })
        .then((data) => {
          state.todos = [{ ...data, editing: false }, ...state.todos];
          view.clearInput();
        });
    });
  };

  // For most event handling, I had to get the id of the task by first getting the parentElement since that's the li with the id attribute
  const handleDelete = (event) => {
    const id = event.target.parentElement.id;
    model.deleteTodo(+id).then((_) => {
      state.todos = state.todos.filter((todo) => todo.id !== +id);
    });
  };
  const handleStatusChange = (event) => {
    const id = +event.target.parentElement.id;
    const todo = state.todos.find((curr) => curr.id === id);
    model.editTodo(id, { completed: !todo.completed }).then((data) => {
      state.todos = state.todos.map((curr) =>
        curr.id === data.id ? { ...data, editing: false } : curr
      );
    });
  };
  const handleNameChange = (event) => {
    const todoLiEl = event.target.parentElement;
    const id = +todoLiEl.id;
    const todo = state.todos.find((todo) => todo.id === id);
    const mainChildrenPlace = todo.completed ? 1 : 0; // It's the first index if completed or zero index if pending
    if (todoLiEl.children[mainChildrenPlace].nodeName === "SPAN") {
      state.todos = state.todos.map((curr) =>
        curr.id === id ? { ...curr, editing: true } : curr
      );
    } else {
      const newTextValue = todoLiEl.children[mainChildrenPlace].value;
      model.editTodo(id, { content: newTextValue }).then((data) => {
        state.todos = state.todos.map((todo) =>
          todo.id !== data.id ? todo : { ...data, editing: false }
        );
      });
    }
  };
  // This will handle all the clicking in the event
  const todoClickBinding = () => {
    view.todolistsContainer.addEventListener("click", (event) => {
      console.log(event.target.className);
      if (event.target.className === "delete-btn") handleDelete(event);
      if (event.target.className === "status-btn") handleStatusChange(event);
      if (event.target.className === "edit-btn") handleNameChange(event);
    });
  };

  const bootstrap = () => {
    init();
    handleSubmit();
    todoClickBinding();
    state.subscribe(() => {
      view.renderTodos(state.todos);
    });
  };
  return {
    bootstrap,
  };
})(View, Model);

Controller.bootstrap();
