
/* 
  client side
    template: static template
    logic(js): MVC(model, view, controller): used to server side technology, single page application
        model: prepare/manage data,
        view: manage view(DOM),
        controller: business logic, event bindind/handling

  server side
    json-server
    CRUD: create(post), read(get), update(put, patch), delete(delete)


*/

//read
/* fetch("http://localhost:3000/todos")
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    }); */

    const APIs = (() => {

        const createTodo = (newTodo) => {
            return fetch("http://localhost:3000/todos", {
                method: "POST",
                body: JSON.stringify(newTodo),
                headers: { "Content-Type": "application/json" },
            }).then((res) => res.json());
        };
    
        const deleteTodo = (id) => {
            return fetch("http://localhost:3000/todos/" + id, {
                method: "DELETE",
            }).then((res) => res.json());
        };
    
        const updateTodo = (id, newTodo) => {
            console.log("update id", id, "type of id:", typeof id);
            console.log("update newtodo", newTodo);
            return fetch("http://localhost:3000/todos/" + id, {
                method: "PATCH",
                body: JSON.stringify(newTodo),
                headers: { "Content-Type": "application/json" },
    });
        };
    
        const getTodos = () => {
            return fetch("http://localhost:3000/todos").then((res) => res.json());
        };
        return { createTodo, deleteTodo, getTodos, updateTodo };
    })();
    
    //IIFE
    //todos
    /* 
        hashMap: faster to search
        array: easier to iterate, has order
    
    
    */
    const Model = (() => {
        class State {
            #todos; //private field
            #completeTodos;
            #onChange; //function, will be called when setter function todos is called
            constructor() {
                this.#todos = [];
                this.#completeTodos = [];
            }
            get todos() {
                return this.#todos;
            }
    
            get completeTodos(){
                return this.#completeTodos;
            }
    
            set todos(newTodos) {
                // reassign value
                console.log("setter function");
                this.#todos = newTodos;
                this.#onChange?.(); // rendering
            }
    
            set completeTodos(newCompleteTodos){
                console.log("in complete todo setter");
                this.#completeTodos = newCompleteTodos;
                this.#onChange?.();
            }
    
            subscribe(callback) {
                //subscribe to the change of the state todos
                this.#onChange = callback;
            }
        }
        const { getTodos, createTodo, deleteTodo, updateTodo } = APIs;
        return {
            State,
            getTodos,
            createTodo,
            deleteTodo,
            updateTodo,
        };
    })();
    /* 
        todos = [
            {
                id:1,
                content:"eat lunch"
            },
            {
                id:2,
                content:"eat breakfast"
            }
        ]
    
    */
    const View = (() => {
        const todolistEl = document.querySelector(".todo-list");
        const submitBtnEl = document.querySelector(".submit-btn");
        const todolistCompleteEl = document.querySelector(".complete-todo-list");
        const inputEl = document.querySelector(".input");
        let temp_text = '';
    
        const renderTodos = (todos) => {
            let todosTemplate = "";
            let completeList = "";
            const todos_pending = todos.filter((todo) => {
                return !todo.complete;
            });
            const todos_complete = todos.filter((todo)=> {return todo.complete;});
            todos_pending.forEach((todo) => {
                const liTemplate = `<li>
                                        <span id="mayEdit">${todo.content}</span>
                                        <button class="delete-btn" id="${todo.id}">delete</button>
                                        <button class="update-btn" id="${todo.id}" name="update-btn">update</button>
                                        <button class="change-btn" id="${todo.id}">change</button>
                                    </li>`;
                todosTemplate += liTemplate;
            });
            if (todos.length === 0) {
                todosTemplate = "<h4>no task to display!</h4>";
            }
            todolistEl.innerHTML = todosTemplate;

            todos_complete.forEach((one) => {
                const liTemplate = `<li>
                                    <button class="change-button" id = "${todo.id}">change</button>
                                    <span id="cantEdit" contenteditable="false" >${todo.content}</span>
                                    <button class="delete-btn" id="${todo.id}">delete</button>
                                    <button class="update-btn" id="${todo.id}" name="update-btn">update</button>
                                    </li>`;
                completeList += liTemplate;
            });
            todolistCompleteEl.innerHTML = completeList;
        };

    
        const clearInput = () => {
            inputEl.value = "";
        };
    
        return { renderTodos, submitBtnEl, inputEl, clearInput, todolistEl,temp_text, todolistCompleteEl };
    })();
    
    const Controller = ((view, model) => {
        const state = new model.State();
        const init = () => {
            model.getTodos().then((todos) => {
                todos.reverse();
                state.todos = todos;
            });
        };
    
        const handleSubmit = () => {
            view.submitBtnEl.addEventListener("click", (event) => {
                /* 
                    1. read the value from input
                    2. post request
                    3. update view
                */
                const inputValue = view.inputEl.value;
                model.createTodo({ content: inputValue, complete_model: false }).then((data) => {
                    state.todos = [data, ...state.todos];
                    view.clearInput();
                });
            });
        };
    
        const handleDelete = () => {
            //event bubbling
            /* 
                1. get id
                2. make delete request
                3. update view, remove
            */
            view.todolistEl.addEventListener("click", (event) => {
                if (event.target.className === "delete-btn") {
                    const id = event.target.id;
                    console.log("id", typeof id);
                    model.deleteTodo(+id).then((data) => {
                        state.todos = state.todos.filter((todo) => todo.id !== +id);
                    });
                }
            });
        };

        const handleDelete_complete = () => {
            view.todolistCompleteEl.addEventListener("click", (event) => {
                if (event.target.className === "delete-btn") {
                    const id = event.target.id;
                    console.log("id", typeof id);
                    model.deleteTodo(+id).then((data) => {
                        state.todos = state.todos.filter((todo) => todo.id !== +id);
                    });
                }
            });
        };

    
        const handleUpdate = () => {
            // get id
            // make content editable
            // update view
            
            // if click update btn
            view.todolistEl.addEventListener("click", (event) =>{
                if(event.target.className === "update-btn"){
                    const id = event.target.id;
                    const edit = event.target.parentNode;
                    const checkflag = edit.getElementsByTagName('span')[0];

                    console.log("id is: ", id);
                    console.log("edit: ", edit);
                    
                    if (checkflag.contentEditable === "true") {
                        checkflag.contentEditable = "false";
                        model.updateTodo(+id, { content: checkflag.innerHTML }).then(() => {
                        });
                      } else {
                        checkflag.contentEditable = "true";
                      }
                }
            });
        };

        const handleUpdate_complete = () => {
            view.todolistCompleteEl.addEventListener("click", (event)=>{
                if(event.target.className === "update-btn"){
                    const checkflag = event.target.parentNode.getElementsByTagName('span')[0];
                    if(checkflag.contentEditable === "true"){
                        checkflag.contentEditable = "false";
                        model.updateTodo(+id, {content: checkflag.innerHTML}).then(()=>{});
                    }else{
                        checkflag.contentEditable = "true";
                    }
                }
            })
        }


        const handleChange = () => {
            console.log("in change function");
            view.todolistEl.addEventListener("click", (event) => {
                if(event.target.className === "change-button"){
                    const id = event.target.id;
                    const get_el = event.target.parentNode.getElementsByTagName('span')[0];
                    console.log("in handle change function id: ", id);
                    console.log("in handle change function, el:", get_el);
                    if(event.target.complete_model==="false"){
                        console.log("yes, change to do list to complete list");
                        model.updateTodo(+id, {complete_model:true}).then((data)=>{
                            state.todos = state.todos.map((todo)=> todo.id === data.id? data: todo);
                        });
                    }
                    state.todos = [...state.todos];
                }
            });
        };

        const handleChange_complete = () => {
            console.log("in complete change function");
            view.todolistCompleteEl.addEventListener("click", (event) => {
                if(event.target.className === "change-button"){
                    const id = event.target.id;
                    const get_el = event.target.parentNode.getElementsByTagName('span')[0];
                    if(event.target.complete_model==="true"){
                        console.log("yes, move to todo pending list");
                        model.updateTodo(+id, {complete_model:false}).then((data)=>{
                            state.todos = state.todos.map((todo)=> todo.id === data.id? data: todo);
                        });
                    }
                    state.todos = [...state.todos];
                }
            })
        }
    
        const bootstrap = () => {
            init();
            handleSubmit();
            handleDelete();
            handleUpdate();
            handleChange();
            handleDelete_complete(),
            handleUpdate_complete(),
            handleChange_complete(),
            state.subscribe(() => {
                view.renderTodos(state.todos);
            });
        };
        return {
            bootstrap,
        };
    })(View, Model); //ViewModel
    
    Controller.bootstrap();
    
