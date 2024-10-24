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
}