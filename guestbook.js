const http = require('http');
const url = require('url');

let guestbooks = [];

const responseWithJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const createguestbook = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { name, purpose, visit_date } = JSON.parse(body);
        if (name && purpose && visit_date) {
        const newGuestbook = {
            guest_id: guestbooks.length + 1,
            name, 
            purpose,
            visit_date
        };
        todos.push(newTodo);
        responseWithJSON(res, 201, { message: 'Data tamu berhasil ditambahkan!', guest_id: newGuestbook.guest_id });
      } else {
        responseWithJSON(res, 400, { message: 'Data tamu Tidak Lengkap!' });
      }
    });
};

const readGuestbooks = (res) => {
    responseWithJSON(res, 200, guestbooks);
};

const readGuestbookById = (res, id) => {
    const guestbook = guestbooks.find(g => g.guest_id === parseInt(id));
    if (guestbook) {
        responseWithJSON(res, 200, guestbook);
    } else {
        responseWithJSON(res, 404, { message: 'Data tamu Tidak Ditemukan!' });
    }
};


const updateGuestbook = (req, res, id) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { name, purpose, visit_date } = JSON.parse(body);
        const guestbookIndex = guestbooks.findIndex(g => g.guest_id === parseInt(id));
        if (guestbookIndex !== -1) {
            guestbooks[guestbookIndex] = {
                guest_id: parseInt(id),
                name, 
                purpose, 
                visit_date
            };
            responseWithJSON(res, 200, { message: 'Data tamu berhasil diperbarui', guest_id: guestbooks[guestbookIndex].guest_id  });
        } else {
            responseWithJSON(res, 404, { message: 'Data tamu Tidak Ditemukan' });
        }
    });
};


const deleteGuestbook = (res, id) => {
    const guestbookIndex = guestbooks.findIndex(g => g.guest_id === parseInt(id));
    if (guestbookIndex !== -1) {
        const deleteGuestbookId = guestbooks[guestbookIndex].guest_id;
        guestbooks.splice(guestbookIndex, 1);
        responseWithJSON(res, 200, { message: 'Data tamu berhasil dihapus', guest_id: deleteGuestbookId })
    } else {
        responseWithJSON(res, 404, { message: 'Data tamu Tidak Ditemukan!'});
    }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;


    if (req.method === 'POST' && pathname === '/api/guestbook') {
        createguestbook(req, res);
    } else if (req.method === 'GET' && pathname === '/api/guestbook') {
        readGuestbooks(res);
    } else if (req.method === 'GET' && pathname.startsWith('/api/guestbook/')) {
        const id = pathname.split('/')[3];
        readGuestbookById(res, id);
    } else if (req.method === 'PUT' && pathname.startsWith('/api/guestbook/')) {
        const id = pathname.split('/')[3];
        updateGuestbook(req, res, id);
    } else if (req.method === 'DELETE' && pathname.startsWith('/api/guestbook/')) {
        const id = pathname.split('/')[3];
        deleteGuestbook(res, id);
    } else {
       // manual tanpa menggunakan responseWithJSON()
       res.writeHead(404, { 'Content-Type': 'application/json' });
       res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
    }
});

server.listen(3000, () => {
    console.log('Server Berjalan di http://localhost:3000');
});