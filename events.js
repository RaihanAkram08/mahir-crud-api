const http = require('http');
const url = require('url');

let events = [];

const responseWithJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const createEvent = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { name, date, location, description } = JSON.parse(body);
        if (name && date && location && description) {
        const newEvent = {
            event_id: events.length + 1,
            name, 
            date, 
            location, 
            description
        };
        events.push(newEvent);
        responseWithJSON(res, 201, { message: 'Agenda kegiatan berhasil ditambahkan!', event_id: newEvent.event_id });
      } else {
        responseWithJSON(res, 400, { message: 'Data Tidak Lengkap!' });
      }
    });
};

const readEvents = (res) => {
    responseWithJSON(res, 200, events);
};

const readEventById = (res, id) => {
    const event = events.find(e => e.event_id === parseInt(id));
    if (event) {
        responseWithJSON(res, 200, event);
    } else {
        responseWithJSON(res, 404, { message: 'Agenda kegiatan Tidak Ditemukan!' });
    }
};


const updateEvent = (req, res, id) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { name, date, location, description } = JSON.parse(body);
        const eventIndex = events.findIndex(e => e.event_id === parseInt(id));
        if (eventIndex !== -1) {
            events[eventIndex] = {
                event_id: parseInt(id),
                name, 
                date, 
                location, 
                description
            };
            responseWithJSON(res, 200, { message: 'Agenda kegiatan berhasil diperbarui!', event_id: events[eventIndex].event_id });
        } else {
            responseWithJSON(res, 404, { message: 'Agenda Kegiatan Tidak Ditemukan' });
        }
    });
};


const deleteEvent = (res, id) => {
    const eventIndex = events.findIndex(e => e.event_id === parseInt(id));
    if (eventIndex !== -1) {
        const deleteEventId = events[eventIndex].event_id;
        todos.splice(eventIndex, 1);
        responseWithJSON(res, 200, { message: 'Agenda Kegiatan Berhasil Dihapus!', event_id: deleteEventId })
    } else {
        responseWithJSON(res, 404, { message: 'Agenda Kegiatan Tidak Ditemukan!'});
    }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;


    if (req.method === 'POST' && pathname === '/api/events') {
        createEvent(req, res);
    } else if (req.method === 'GET' && pathname === '/api/events') {
        readEvents(res);
    } else if (req.method === 'GET' && pathname.startsWith('/api/events/')) {
        const id = pathname.split('/')[3];
        readEventById(res, id);
    } else if (req.method === 'PUT' && pathname.startsWith('/api/events/')) {
        const id = pathname.split('/')[3];
        updateEvent(req, res, id);
    } else if (req.method === 'DELETE' && pathname.startsWith('/api/events/')) {
        const id = pathname.split('/')[3];
        deleteEvent(res, id);
    } else {
        // manual tanpa menggunakan responseWithJSON()
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
    }
});

server.listen(3000, () => {
    console.log('Server Berjalan di http://localhost:3000');
});