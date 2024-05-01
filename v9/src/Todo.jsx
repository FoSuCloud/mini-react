import React from '../core/React';

function Todos() {
    const [inputValue, setInputValue] = React.useState();
    const [todos, setTodos] = React.useState([
        {
            title: '吃饭',
            id: crypto.randomUUID(),
            status: 'active'
        },
        {
            title: '喝水',
            id: crypto.randomUUID(),
            status: 'active'
        },
        {
            title: '写代码',
            id: crypto.randomUUID(),
            status: 'done'
        }
    ])
    const [filter, setFilter] = React.useState("all");
    const [displayTodos, setDisplayTodos] = React.useState([]);

    // useEffect, 依赖为[], 表示为 mounted的时候会执行一次
    React.useEffect(() => {
        const rawTodos = localStorage.getItem("todos");
        if (rawTodos) {
            setTodos(JSON.parse(rawTodos))
        }
    }, []);
    React.useEffect(() => {
        if (filter === 'all') {
            setDisplayTodos(todos)
        } else if (filter === 'active') {
            const newTodos = todos.filter((todo) => {
                return todo.status === 'active'
            })
            setDisplayTodos(newTodos)
        } else if (filter === 'done') {
            const newTodos = todos.filter((todo) => {
                return todo.status === 'done'
            })
            setDisplayTodos(newTodos)
        }
    }, [todos, filter]);

    function handleAdd() {
        addTodo(inputValue);
        setInputValue("");
    }

    function createTodo(title) {
        return {title, id: crypto.randomUUID(), status: "active"}
    }

    function addTodo(title) {
        setTodos((todos) => [...todos,
                createTodo(title)
            ]
        )
    }

    function removeTodo(id) {
        const newTodos = todos.filter((todo) => {
            return id !== todo.id;
        })
        setTodos(newTodos)
    }

    function doneTodo(id) {
        const newTodos = todos.map((todo) => {
            if (id === todo.id) {
                return {...todo, status: 'done'}
            }
            return todo
        })
        setTodos(newTodos)
    }

    function cancelTodo(id) {
        const newTodos = todos.map((todo) => {
            if (id === todo.id) {
                return {...todo, status: 'active'}
            }
            return todo
        })
        setTodos(newTodos)
    }

    function saveTodo() {
        localStorage.setItem("todos", JSON.stringify(todos))
    }

    return <div>
        <h1>todos</h1>
        <div>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}/>
            <button onClick={handleAdd}>add</button>
        </div>
        <div>
            <button onClick={saveTodo}>save</button>
        </div>

        <div>
            <input type="radio" name={"filter"} id={"all"} checked={filter === 'all'}
                   onChange={() => setFilter("all")}/>
            <label htmlFor="all">all</label>

            <input type="radio" name={"filter"} id={"active"} checked={filter === 'active'}
                   onChange={() => setFilter("active")}/>
            <label htmlFor="active">active</label>

            <input type="radio" name={"filter"} id={"done"} checked={filter === 'done'}
                   onChange={() => setFilter("done")}/>
            <label htmlFor="done">done</label>
        </div>
        <ul>
            {
                ...displayTodos.map((todo) => {
                    return <TodoItem todo={todo}
                                     removeTodo={removeTodo}
                                     doneTodo={doneTodo}
                                     cancelTodo={cancelTodo}
                    >
                    </TodoItem>
                })
            }
        </ul>
    </div>
}

function TodoItem({todo, removeTodo, doneTodo, cancelTodo}) {
    return <li className={todo.status}>
        {todo.title}
        <button onClick={() => removeTodo(todo.id)}>remove</button>
        {todo.status === 'active' ?
            <button onClick={() => doneTodo(todo.id)}>done</button>
            :
            <button onClick={() => cancelTodo(todo.id)}>cancel</button>
        }
    </li>
}

export default Todos;

