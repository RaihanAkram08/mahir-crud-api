const http = require('http');
const url = require('url');

let elections = [];

const responseWithJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const createElection = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const {  candidate_name, votes } = JSON.parse(body);
        if (candidate_name && votes) {
        const newElection = {
            election_id: elections.length + 1,
            candidate_name, 
            votes
        };
        elections.push(newElection)
        responseWithJSON(res, 201, { message: 'Kandidat berhasil ditambahkan!', election_id: newElection.election_id });
      } else {
        responseWithJSON(res, 400, { message: 'Data Tidak Lengkap!' });
      }
    });
};

const readElections = (res) => {
    responseWithJSON(res, 200, elections);
};

const readElectionById = (res, id) => {
    const election = elections.find(e => e.election_id === parseInt(id));
    if (election) {
        responseWithJSON(res, 200, election);
    } else {
        responseWithJSON(res, 404, { message: 'Kandidat Tidak Ditemukan!' });
    }
};


const updateElection = (req, res, id) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const {  candidate_name, votes } = JSON.parse(body);
        const electionIndex = elections.findIndex(e => e.election_id === parseInt(id));
        if (electionIndex !== -1) {
            elections[electionIndex] = {
                election_id: parseInt(id),
                candidate_name, 
                votes
            };
            responseWithJSON(res, 200, { message: 'Informasi kandidat berhasil diperbarui', election_id: elections[electionIndex].election_id });
        } else {
            responseWithJSON(res, 404, { message: 'Informasi kandidat Tidak Ditemukan' });
        }
    });
};


const deleteElection = (res, id) => {
    const electionIndex = elections.findIndex(e => e.election_id === parseInt(id));
    if (electionIndex !== -1) {
        const deleteElectionId = elections[electionIndex].election_id;
        elections.splice(electionIndex, 1);
        responseWithJSON(res, 200, { message: 'Kandidat Berhasil Dihapus!', election_id: deleteElectionId })
    } else {
        responseWithJSON(res, 404, { message: 'Kandidat Tidak Ditemukan!'});
    }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;


    if (req.method === 'POST' && pathname === '/api/election') {
        createElection(req, res);
    } else if (req.method === 'GET' && pathname === '/api/election') {
        readElections(res);
    } else if (req.method === 'GET' && pathname.startsWith('/api/election')) {
        const id = pathname.split('/')[3];
        readElectionById(res, id);
    } else if (req.method === 'PUT' && pathname.startsWith('/api/election/')) {
        const id = pathname.split('/')[3];
        updateElection(req, res, id);
    } else if (req.method === 'DELETE' && pathname.startsWith('/api/election/')) {
        const id = pathname.split('/')[3];
        deleteElection(res, id);
    } else {
        // manual tanpa menggunakan responseWithJSON()
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
    }
});

server.listen(3000, () => {
    console.log('Server Berjalan di http://localhost:3000');
});