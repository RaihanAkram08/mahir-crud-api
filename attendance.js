const http = require('http');
const url = require('url');

let attendances = [];

const responseWithJSON = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

const createAttendance = (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const {  student_name, date, status } = JSON.parse(body);
        if(student_name && date && status) {
            const newAttendance = {
                attendance_id: attendances.length + 1,
                student_name,
                date,
                status
            };
            attendances.push(newAttendance);
            responseWithJSON(res, 201, { message: 'Absensi Berhasil Ditambahkan!', attendance_id: newAttendance.attendance_id });
        } else {
            responseWithJSON(res, 400, { message: 'Data tidak lengkap!'});
        }
    });
};

const readAttendances = (res) => {
    responseWithJSON(res, 200, attendances);
};

const readAttendancesById = (res, id) => {
    const attendance = attendances.find(a => a.attendance_id === parseInt(id));
    if (attendance) {
        responseWithJSON(res, 200, attendance);
    } else {
        responseWithJSON(res, 404, { message: 'Absensi tidak ditemukan!' });
    }
};

const updateAttendance = (req, res, id) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const { student_name, date, status } = JSON.parse(body);
        const attendanceIndex = attendances.findIndex(a => a.attendance_id === parseInt(id));
        if (attendanceIndex !== -1) {
            attendances[attendanceIndex] = {
                attendance_id: parseInt(id),
                student_name,
                date,
                status
            };
            responseWithJSON(res, 200, { message: 'Absensi berhasil diperbarui' });
        } else {
            responseWithJSON(res, 404, { message: 'Absensi tidak ditemukan!' });
        }
    });
};

const deleteAttendance = (res, id) => {
    const attendanceIndex = attendances.findIndex(a => a.attendance_id === parseInt(id));
    if (attendanceIndex !== -1) {
        attendances.splice(attendanceIndex, 1);
        responseWithJSON(res, 200, { message: 'Absensi berhasil dihapus!' })
    } else {
        responseWithJSON(res, 404, { message: 'Absensi tidak ditemukan!' });
    }
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    if (req.method === 'POST' && pathname === '/api/attendance') {
        createAttendance(req, res);
    } else if (req.method === 'GET' && pathname === '/api/attendance') {
        readAttendances(res);
    } else if (req.method === 'GET' && pathname.startsWith('/api/attendance/')) {
        const id = pathname.split('/')[3];
        readAttendancesById(res, id);
    } else if (req.method === 'PUT' && pathname.startsWith('/api/attendance/')) {
        const id = pathname.split('/')[3];
        updateAttendance(req, res, id);
    } else if (req.method === 'DELETE' && pathname.startsWith('/api/attendance')) {
        const id = pathname.split('/')[3];
        deleteAttendance(res, id);
    } else {
        // manual tanpa menggunakan responseWithJSON()
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Rute tidak ditemukan!' }));
    }
});

server.listen(3000, () => {
    console.log('Server Berjalan di http://localhost:3000');
})