const http = require('http');
const url = require('url');

let notes = [];

const responseWithJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const createNote = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { title, content } = JSON.parse(body);
        const created_at = new Date().toISOString();
        const updated_at = new Date().toISOString();
        if (title && content) {
        const newNote = {
            note_id: notes.length + 1,
            title,
            content,
            created_at,
            updated_at
        };
        notes.push(newNote);
        responseWithJSON(res, 201, { message: 'Catatan Berhasil Ditambahkan!', note_id: newNote.note_id });
      } else {
        responseWithJSON(res, 400, { message: 'Data Tidak Lengkap!' });
      }
    });
};

const readNotes = (res) => {
    responseWithJSON(res, 200, notes);
};

const readNotesById = (res, id) => {
    const note = notes.find(n => n.note_id === parseInt(id));
    if (note) {
        responseWithJSON(res, 200, note);
    } else {
        responseWithJSON(res, 404, { message: 'Catatan Tidak Ditemukan!' });
    }
};


const updateNote = (req, res, id) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { title, content } = JSON.parse(body);
        const noteIndex = notes.findIndex(n => n.note_id === parseInt(id));
        if (noteIndex !== -1) {
            notes[noteIndex] = {
                note_id: parseInt(id),
                title, 
                content, 
                created_at: notes[noteIndex].created_at,
                updated_at: new Date().toISOString()
            };
            responseWithJSON(res, 200, { message: 'Catatan Berhasil Diperbarui!' });
        } else {
            responseWithJSON(res, 404, { message: 'Catatan Tidak Ditemukan' });
        }
    });
};


const deleteNote = (res, id) => {
    const noteIndex = notes.findIndex(n => n.note_id === parseInt(id));
    if (noteIndex !== -1) {
        notes.splice(noteIndex, 1);
        responseWithJSON(res, 200, { message: 'Catatan Berhasil Dihapus!'})
    } else {
        responseWithJSON(res, 404, { message: 'Catatan Tidak Ditemukan!'});
    }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;


    if (req.method === 'POST' && pathname === '/api/notes') {
        createNote(req, res);
    } else if (req.method === 'GET' && pathname === '/api/notes') {
        readNotes(res);
    } else if (req.method === 'GET' && pathname.startsWith('/api/notes/')) {
        const id = pathname.split('/')[3];
        readNotesById(res, id);
    } else if (req.method === 'PUT' && pathname.startsWith('/api/notes/')) {
        const id = pathname.split('/')[3];
        updateNote(req, res, id);
    } else if (req.method === 'DELETE' && pathname.startsWith('/api/notes/')) {
        const id = pathname.split('/')[3];
        deleteNote(res, id);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
    }
});

server.listen(3000, () => {
    console.log('Server Berjalan di http://localhost:3000');
});