module.exports = (io) => {
    io.on('connection', socket => {
        socket.on('join-room', (roomId, userId) => {
            socket.join(roomId);
            socket.to(roomId).emit('user-connected', userId);

            socket.on('disconnect', () => {
                socket.to(roomId).emit('user-disconnected', userId);
            });

            socket.on('draw', data => socket.to(roomId).emit('draw', data));
            socket.on('clear-whiteboard', () => socket.to(roomId).emit('clear-whiteboard'));
            socket.on('message', message => io.to(roomId).emit('message', message));
            socket.on('file', file => io.to(roomId).emit('file', file));
            socket.on('share-screen', userId => socket.to(roomId).emit('share-screen', userId));
        });
    });
};