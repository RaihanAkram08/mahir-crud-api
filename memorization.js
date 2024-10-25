const http = require('http');
const url = require('url');

let memorizations = [];

const responseWithJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json'});
    res.end(JSON.stringify(data));
};

const createMemorization = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { student_name, surah, ayah_from, ayah_to, date } = JSON.parse(body);
        if (student_name && surah && ayah_from && ayah_to && date) {
            const newMemorization = {
                memorization_id: memorizations.length + 1,
                student_name,
                surah,
                ayah_from,
                ayah_to,
                date
            };
            memorizations.push(newMemorization);
            responseWithJSON(res, 201, { message: 'Hafalan berhasil ditambahkan!', memorization_id: newMemorization.memorization_id });
        } else {
            responseWithJSON(res, 400, { message: 'Data tidak lengkap!'});
        }
    });
};

const readMemorizations = (res) => {
    responseWithJSON(res, 200, memorizations);
};

const readMemorizationsById = (res, id) => {
    const memorization = memorizations.find(m => m.memorization_id === id);
    if (memorization) {
        responseWithJSON(res, 200, memorization);
    } else {
        responseWithJSON(res, 404, { message: 'Data tidak ditemukan!'})
    }
};

const updateMemorization = (req, res, id) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { student_name, surah, ayah_from, ayah_to, date } = JSON.parse(body);
        const memorizationIndex = memorizations.findIndex(m => m.memorization_id === id)
        if (memorizationIndex !== -1) {
            memorizations[memorizationIndex] = {
                memorization_id: parseInt(id),
                student_name,
                surah,
                ayah_from,
                ayah_to,
                date
            };
            responseWithJSON(res, 200, { message: 'Hafalan berhasil diperbarui', memorization_id: memorizations[memorizationIndex].memorization_id });
        } else {
            responseWithJSON(res, 404, { message: 'Hafalan tidak ditemukan!' });
        }
    });
};

const deleteMemorization = (res, id) => {
    const memorizationIndex = memorizations.findIndex(m => m.memorization_id === parseInt(id));
    if (memorizationIndex !== -1) {
        const deleteMemorizationId = memorizations[memorizationIndex].memorization_id
        memorizations.splice(memorizationIndex, 1);
        responseWithJSON(res, 200, { message: 'Hafalan berhasil dihapus!', memorization_id: deleteMemorizationId });
    } else {
        responseWithJSON(res, 404, { message: 'Hafalan tidak ditemukan!' });
    }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    if (req.method === 'POST' && pathname === '/api/memorization') {
        createMemorization(req, res);
    } else if (req.method === 'GET' && pathname === '/api/memorization') {
        readMemorizations(res)
    } else if (req.method === 'GET' && pathname.startsWith('/api/memorization/')) {
        const id = pathname.split('/')[3];
        readMemorizationsById(res, id);
    } else if (req.method === 'PUT' && pathname.startsWith('/api/memorization/')) {
        const id = pathname.split('/')[3];
        updateMemorization(req, res, id)
    } else if (req.method === 'DELETE' && pathname.startsWith('/api/memorization/')) {
        const id = pathname.split('/')[3];
        deleteMemorization(res, id);
    } else {
        // manual tanpa menggunakan responseWithJSON()
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
    }
});

server.listen(3000, () => {
    console.log('Server Berjalan di http://localhost:3000');
})