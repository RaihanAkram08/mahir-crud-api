const http = require('http');
const url = require('url');

let comments = [];

const responseWithJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const createComment = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { content, author, created_at } = JSON.parse(body);
        if (content && author && created_at) {
        const newComment = {
            comment_id: comments.length + 1,
            content, 
            author, 
            created_at
        };
        comments.push(newComment);
        responseWithJSON(res, 201, { message: 'Komentar berhasil ditambahkan!', comment_id: newComment.comment_id });
      } else {
        responseWithJSON(res, 400, { message: 'Data Tidak Lengkap!' });
      }
    });
};

const readComments = (res) => {
    responseWithJSON(res, 200, comments);
};

const readCommentById = (res, id) => {
    const comment = comments.find(c => c.comment_id === parseInt(id));
    if (comment) {
        responseWithJSON(res, 200, comment);
    } else {
        responseWithJSON(res, 404, { message: 'Komentar Tidak Ditemukan!' });
    }
};


const updateComment = (req, res, id) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { content, author, created_at } = JSON.parse(body);
        const commentIndex = comments.findIndex(c => c.comment_id === parseInt(id));
        if (commentIndex !== -1) {
            comments[commentIndex] = {
                comment_id: parseInt(id),
                content, 
                author, 
                created_at
            };
            responseWithJSON(res, 200, { message: 'Komentar Berhasil Diperbarui!', comment_id: comments[commentIndex].comment_id });
        } else {
            responseWithJSON(res, 404, { message: 'Komentar Tidak Ditemukan' });
        }
    });
};


const deleteComment = (res, id) => {
    const commentIndex = comments.findIndex(c => c.comment_id === parseInt(id));
    if (commentIndex !== -1) {
        const deleteCommentId = comments[commentIndex].comment_id;
        comments.splice(commentIndex, 1);
        responseWithJSON(res, 200, { message: 'Komentar Berhasil Dihapus!', comment_id: deleteCommentId })
    } else {
        responseWithJSON(res, 404, { message: 'Komentar Tidak Ditemukan!'});
    }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;


    if (req.method === 'POST' && pathname === '/api/comments') {
        createComment(req, res);
    } else if (req.method === 'GET' && pathname === '/api/comments') {
        readComments(res);
    } else if (req.method === 'GET' && pathname.startsWith('/api/comments/')) {
        const id = pathname.split('/')[3];
        readCommentById(res, id);
    } else if (req.method === 'PUT' && pathname.startsWith('/api/comments/')) {
        const id = pathname.split('/')[3];
        updateComment(req, res, id);
    } else if (req.method === 'DELETE' && pathname.startsWith('/api/comments/')) {
        const id = pathname.split('/')[3];
        deleteComment(res, id);
    } else {
        // manual tanpa menggunakan responseWithJSON()
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
    }
});

server.listen(3000, () => {
    console.log('Server Berjalan di http://localhost:3000');
});