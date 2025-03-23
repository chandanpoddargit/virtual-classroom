const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('./routes/auth');
const classroomSockets = require('./sockets/classroom');
const { PeerServer } = require('peer');
const connectDB = require('../server/config/db');

dotenv.config();
dotenv.config({
    path: './.env'
})
console.log("MONGO_URI:", process.env.MONGO_URI)
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

app.use('/api/auth', authRoutes);

classroomSockets(io);

const peerServer = PeerServer({ port: 9000, path: '/peer' });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));