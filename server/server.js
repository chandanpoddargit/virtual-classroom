// Load required modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { PeerServer } = require('peer');

dotenv.config({ path: './.env' });
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const classroomSockets = require('./sockets/classroom');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
console.log("MONGO_URI:", process.env.MONGO_URI);
connectDB();

// CORS configuration
const corsOptions = {
    origin: ["brilliant-beijinho-2eb716.netlify.app"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Initialize Socket.io with CORS handling
const io = socketIo(server, {
    cors: {
        origin: "brilliant-beijinho-2eb716.netlify.app", 
        methods: ["GET", "POST"]
    }
});

classroomSockets(io);

// Initialize PeerServer for WebRTC
const peerServer = PeerServer({ port: 9000, path: '/peer' });


app.use('/api/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
