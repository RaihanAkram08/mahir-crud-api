const http = require('http');
const url = require('url');

let todos = [];

const responseWithJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const createTodo = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { task, status, due_date } = JSON.parse(body);
        if (task && status && due_date) {
        const newTodo = {
            todo_id: todos.length + 1,
            task, 
            status, 
            due_date
        };
        todos.push(newTodo);
        responseWithJSON(res, 201, { message: 'Tugas berhasil ditambahkan!', todo_id: newTodo.todo_id });
      } else {
        responseWithJSON(res, 400, { message: 'Data Tidak Lengkap!' });
      }
    });
};

const readTodos = (res) => {
    responseWithJSON(res, 200, todos);
};

const readTodoById = (res, id) => {
    const todo = todos.find(t => t.todo_id === parseInt(id));
    if (todo) {
        responseWithJSON(res, 200, todo);
    } else {
        responseWithJSON(res, 404, { message: 'Tugas Tidak Ditemukan!' });
    }
};


const updateTodo = (req, res, id) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { task, status, due_date } = JSON.parse(body);
        const todoIndex = todos.findIndex(t => t.todo_id === parseInt(id));
        if (todoIndex !== -1) {
            todos[todoIndex] = {
                todo_id: parseInt(id),
                task, 
                status, 
                due_date
            };
            responseWithJSON(res, 200, { message: 'Tugas Berhasil Diperbarui!', todo_id: todos[todoIndex].todo_id });
        } else {
            responseWithJSON(res, 404, { message: 'Tugas Tidak Ditemukan' });
        }
    });
};


const deleteTodo = (res, id) => {
    const todoIndex = todos.findIndex(t => t.todo_id === parseInt(id));
    if (todoIndex !== -1) {
        const deleteTodoId = todos[todoIndex].todo_id
        todos.splice(todoIndex, 1);
        responseWithJSON(res, 200, { message: 'Tugas Berhasil Dihapus!', todo_id: deleteTodoId })
    } else {
        responseWithJSON(res, 404, { message: 'Tugas Tidak Ditemukan!'});
    }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;


    if (req.method === 'POST' && pathname === '/api/todo') {
        createTodo(req, res);
    } else if (req.method === 'GET' && pathname === '/api/todo') {
        readTodos(res);
    } else if (req.method === 'GET' && pathname.startsWith('/api/todo/')) {
        const id = pathname.split('/')[3];
        readTodoById(res, id);
    } else if (req.method === 'PUT' && pathname.startsWith('/api/todo/')) {
        const id = pathname.split('/')[3];
        updateTodo(req, res, id);
    } else if (req.method === 'DELETE' && pathname.startsWith('/api/todo/')) {
        const id = pathname.split('/')[3];
        deleteTodo(res, id);
    } else {
        // manual tanpa menggunakan responseWithJSON()
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
    }
});

server.listen(3000, () => {
    console.log('Server Berjalan di http://localhost:3000');
});