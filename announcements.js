const http = require('http');
const url = require('url');

let announcements = [];

const responseWithJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const createAnnouncement = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { title, content, date } = JSON.parse(body);
        if ( title && content && date) {
        const newAnnouncement = {
            announcement_id: announcements.length + 1,
            title, 
            content, 
            date
        };
        announcements.push(newAnnouncement);
        responseWithJSON(res, 201, { message: 'Pengumuman berhasil ditambahkan!', announcement_id: newAnnouncement.announcement_id });
      } else {
        responseWithJSON(res, 400, { message: 'Data Tidak Lengkap!' });
      }
    });
};

const readAnnouncements = (res) => {
    responseWithJSON(res, 200, announcements);
};

const readAnnouncementById = (res, id) => {
    const announcement = announcements.find(a => a.announcement_id === parseInt(id));
    if (announcement) {
        responseWithJSON(res, 200, announcement);
    } else {
        responseWithJSON(res, 404, { message: 'Pengumuman Tidak Ditemukan!' });
    }
};


const updateAnnouncement = (req, res, id) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { title, content, date } = JSON.parse(body);
        const announcementIndex = announcements.findIndex(a => a.announcement_id === parseInt(id));
        if (announcementIndex !== -1) {
            announcements[announcementIndex] = {
                announcement_id: parseInt(id),
                title, 
                content, 
                date
            };
            responseWithJSON(res, 200, { message: 'Pengumuman Berhasil Diperbarui!', announcement_id: announcements[announcementIndex].announcement_id });
        } else {
            responseWithJSON(res, 404, { message: 'Pengumuman Tidak Ditemukan' });
        }
    });
};


const deleteAnnouncement = (res, id) => {
    const announcementIndex = announcements.findIndex(a => a.announcement_id === parseInt(id));
    if (announcementIndex !== -1) {
        const deleteAnnouncementId = announcements[announcementIndex].announcement_id;
        comments.splice(commentIndex, 1);
        responseWithJSON(res, 200, { message: 'Pengumuman Berhasil Dihapus!', comment_id: deleteAnnouncementId })
    } else {
        responseWithJSON(res, 404, { message: 'Pengumuman Tidak Ditemukan!'});
    }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;


    if (req.method === 'POST' && pathname === '/api/announcements') {
        createAnnouncement(req, res);
    } else if (req.method === 'GET' && pathname === '/api/announcements') {
        readAnnouncements(res);
    } else if (req.method === 'GET' && pathname.startsWith('/api/announcements/')) {
        const id = pathname.split('/')[3];
        readAnnouncementById(res, id);
    } else if (req.method === 'PUT' && pathname.startsWith('/api/announcements/')) {
        const id = pathname.split('/')[3];
        updateAnnouncement(req, res, id);
    } else if (req.method === 'DELETE' && pathname.startsWith('/api/announcements/')) {
        const id = pathname.split('/')[3];
        deleteAnnouncement(res, id);
    } else {
        // manual tanpa menggunakan responseWithJSON()
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
    }
});

server.listen(3000, () => {
    console.log('Server Berjalan di http://localhost:3000');
});