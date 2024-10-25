const http = require('http');
const url = require('url');

let finances = [];

const responseWithJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const createFinance = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const {  description, amount, type, date  } = JSON.parse(body);
        if(description && amount && type && date) {
            const newFinance = {
                finance_id: finances.length + 1,
                description,
                amount,
                type,
                date
            };
            finances.push(newFinance);
            responseWithJSON(res, 201, { message: 'Transaksi Berhasil Ditambahkan!', finance_id: newFinance.finance_id });
        } else {
            responseWithJSON(res, 400, { message: 'Data tidak lengkap!'});
        }
    });
};

const readFinances = (res) => {
    responseWithJSON(res, 200, finances);
};

const readFinancesById = (res, id) => {
    const finance = finances.find(f => f.finance_id === parseInt(id));
    if (finance) {
        responseWithJSON(res, 200, finance);
    } else {
        responseWithJSON(res, 404, { message: 'Transaksi tidak ditemukan!' });
    }
};

const updateFinance = (req, res, id) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const {  description, amount, type, date  } = JSON.parse(body);
        const financeIndex = finances.findIndex(f => f.finance_id === parseInt(id));
        if (financeIndex !== -1) {
            finances[financeIndex] = {
                finance_id: parseInt(id),
                description,
                amount,
                type,
                date
            };
            responseWithJSON(res, 200, { message: 'Transaksi berhasil diperbarui', finance_id: finances[financeIndex].finance_id });
        } else {
            responseWithJSON(res, 404, { message: 'Data tidak ditemukan!' });
        }
    });
};

const deleteFinance = (res, id) => {
    const financeIndex = finances.findIndex(f => f.finance_id === parseInt(id));
    if (financeIndex !== -1) {
        const deleteFinanceId = finances[financeIndex].finance_id;
        finances.splice(financeIndex, 1);
        responseWithJSON(res, 200, { message: 'Transaksi berhasil dihapus!', finance_id: deleteFinanceId })
    } else {
        responseWithJSON(res, 404, { message: 'Data tidak ditemukan!' });
    }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    if (req.method === 'POST' && pathname === '/api/finance') {
        createFinance(req, res);
    } else if (req.method === 'GET' && pathname === '/api/finance') {
        readFinances(res);
    } else if (req.method === 'GET' && pathname.startsWith('/api/finance/')) {
        const id = pathname.split('/')[3];
        readFinancesById(res, id);
    } else if (req.method === 'PUT' && pathname.startsWith('/api/finance/')) {
        const id = pathname.split('/')[3];
        updateFinance(req, res, id);
    } else if (req.method === 'DELETE' && pathname.startsWith('/api/finance/')) {
        const id = pathname.split('/')[3];
        deleteFinance(res, id);
    } else {
        // manual tanpa menggunakan responseWithJSON()
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
    }
});

server.listen(3000, () => {
    console.log('Server Berjalan di http://localhost:3000');
})