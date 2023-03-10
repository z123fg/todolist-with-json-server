
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
                method: "PUT",
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
        const todolistCompleteEl = document.querySelector(".todo-list-complete");
        const inputEl = document.querySelector(".input");
        let temp_text = '';
    
        const renderTodos = (todos) => {
            let todosTemplate = "";
            todos.forEach((todo) => {
                const liTemplate = `<li><span id="mayEdit" contenteditable="false" >${todo.content}</span><button class="delete-btn" id="${todo.id}">delete</button><button class="update-btn" id="${todo.id}" name="update-btn">update</button><button class="change-btn" id="${todo.id}">change</button></li>`;
                const completTemplet = `<li><button class="change-button" id = "${todo.id}">change</button><button class="update-btn" id="${todo.id}"><span id="mayEdit" contenteditable="false" >${todo.content}</span><button class="delete-btn" id="${todo.id}">delete</button><button class="update-btn" id="${todo.id}" name="update-btn">update</button></li>`;
                todosTemplate += liTemplate;
            });
            if (todos.length === 0) {
                todosTemplate = "<h4>no task to display!</h4>";
            }
            todolistEl.innerHTML = todosTemplate;
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
                model.createTodo({ content: inputValue }).then((data) => {
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
    
        const handleUpdate = () => {
            // get id
            // make content editable
            // update view
    
            // if click update btn
            view.todolistEl.addEventListener("click", (event)=>{
                const id = event.target.id;
                const edit = document.querySelector('#mayEdit');
                if(event.target.className === "update-btn"){
                    const temp = event.target.innerText;
                    console.log("update id: " , id , typeof id);
                    // if btn is content editable , change to cannot change
                    // update info
                    if(edit.contentEditable == "true"){
                        edit.contentEditable = "false";
    
                        console.log("temp_text: ", temp_text);
                        // update
                        model.updateTodo(+id, temp_text).then((data)=>{
                            console.log("data info: ", data);
                            state.todos = state.todos.forEach((id, temp_text)=>{
                                if(todo.id === id){
                                    todo.value = temp_text;
                                }
                            });
                        });
    
                        // after update, assign content to empty
                        temp_text = '';
                    }else{
                        edit.contentEditable = "true";
                    }
                }
                // console.log("new todos: ", model);
                // if content is editable, then if input, update content
                view.todolistEl.addEventListener("input", (event)=>{
                    if(edit.contentEditable == "true"){
                        temp_text = event.target.innerText;
                    }
                });  
            });

            view.todolistCompleteEl.addEventListener("click", (event)=>{
                const id = event.target.id;
                const edit = document.querySelector('#mayEdit');
                if(event.target.className === "update-btn"){
                    const temp = event.target.innerText;
                    console.log("update id: " , id , typeof id);
                    // if btn is content editable , change to cannot change
                    // update info
                    if(edit.contentEditable == "true"){
                        edit.contentEditable = "false";
    
                        console.log("temp_text: ", temp_text);
                        // update
                        model.updateTodo(+id, temp_text).then((data)=>{
                            console.log("data info: ", data);
                            state.todos = state.todos.forEach((id, temp_text)=>{
                                if(todo.id === id){
                                    todo.value = temp_text;
                                }
                            });
                        });
    
                        // after update, assign content to empty
                        temp_text = '';
                    }else{
                        edit.contentEditable = "true";
                    }
                }
                // console.log("new todos: ", model);
                // if content is editable, then if input, update content
                view.todolistCompleteEl.addEventListener("input", (event)=>{
                    if(edit.contentEditable == "true"){
                        temp_text = event.target.innerText;
                    }
                });  
            });
    
        }
    
        const bootstrap = () => {
            init();
            handleSubmit();
            handleDelete();
            handleUpdate();
            state.subscribe(() => {
                view.renderTodos(state.todos);
            });
        };
        return {
            bootstrap,
        };
    })(View, Model); //ViewModel
    
    Controller.bootstrap();
    
