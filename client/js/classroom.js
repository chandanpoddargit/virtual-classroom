document.addEventListener('DOMContentLoaded', () => {
    const socket = io('https://virtual-classroom-app-m5a6.onrender.com', {
        transports: ['websocket'],  
        withCredentials: true 
    });
    const videoGrid = document.getElementById('video-grid');
    const whiteboard = document.getElementById('whiteboard');
    const ctx = whiteboard.getContext('2d');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const fileDrop = document.getElementById('file-drop');

    let peer = new Peer();
    let myStream;
    let drawing = false;
    let tool = 'pen';
    let color = '#000000';

    // WebRTC Setup
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        myStream = stream;
        addVideoStream(myStream, peer.id);

        peer.on('call', call => {
            call.answer(stream);
            call.on('stream', userStream => addVideoStream(userStream, call.peer));
        });

        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream);
        });
    });

    peer.on('open', id => {
        socket.emit('join-room', 'classroom', id);
    });

    function addVideoStream(stream, id) {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.dataset.id = id;
        video.addEventListener('loadedmetadata', () => video.play());
        videoGrid.append(video);
    }

    function connectToNewUser(userId, stream) {
        const call = peer.call(userId, stream);
        call.on('stream', userStream => addVideoStream(userStream, userId));
    }

    // Video Controls
    document.getElementById('mute-btn').addEventListener('click', () => {
        myStream.getAudioTracks()[0].enabled = !myStream.getAudioTracks()[0].enabled;
    });

    document.getElementById('video-btn').addEventListener('click', () => {
        myStream.getVideoTracks()[0].enabled = !myStream.getVideoTracks()[0].enabled;
    });

    document.getElementById('share-screen-btn').addEventListener('click', () => {
        navigator.mediaDevices.getDisplayMedia({ video: true }).then(screenStream => {
            myStream.getVideoTracks().forEach(track => track.stop());
            myStream = screenStream;
            socket.emit('share-screen', peer.id);
        });
    });

    // Whiteboard
    document.getElementById('pen-btn').addEventListener('click', () => (tool = 'pen'));
    document.getElementById('eraser-btn').addEventListener('click', () => (tool = 'eraser'));
    document.getElementById('clear-btn').addEventListener('click', () => {
        ctx.clearRect(0, 0, whiteboard.width, whiteboard.height);
        socket.emit('clear-whiteboard');
    });
    document.getElementById('color-picker').addEventListener('change', e => (color = e.target.value));

    whiteboard.addEventListener('mousedown', e => (drawing = true));
    whiteboard.addEventListener('mouseup', () => (drawing = false));
    whiteboard.addEventListener('mousemove', e => {
        if (!drawing) return;
        const rect = whiteboard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = tool === 'eraser' ? 10 : 2;
        ctx.strokeStyle = tool === 'eraser' ? '#fff' : color;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);

        socket.emit('draw', { x, y, tool, color });
    });

    socket.on('draw', data => {
        ctx.lineWidth = data.tool === 'eraser' ? 10 : 2;
        ctx.strokeStyle = data.tool === 'eraser' ? '#fff' : data.color;
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
    });

    socket.on('clear-whiteboard', () => ctx.clearRect(0, 0, whiteboard.width, whiteboard.height));

    // Chat and File Sharing
    chatInput.addEventListener('keypress', e => {
        if (e.key === 'Enter' && chatInput.value) {
            socket.emit('message', chatInput.value);
            chatInput.value = '';
        }
    });

    socket.on('message', message => {
        const msgDiv = document.createElement('div');
        msgDiv.textContent = message;
        chatMessages.append(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    fileDrop.addEventListener('dragover', e => {
        e.preventDefault();
        fileDrop.classList.add('dragover');
    });

    fileDrop.addEventListener('dragleave', () => fileDrop.classList.remove('dragover'));

    fileDrop.addEventListener('drop', e => {
        e.preventDefault();
        fileDrop.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = () => socket.emit('file', { name: file.name, data: reader.result });
        reader.readAsDataURL(file);
    });

    socket.on('file', file => {
        const link = document.createElement('a');
        link.href = file.data;
        link.textContent = `File: ${file.name}`;
        link.download = file.name;
        chatMessages.append(link);
        chatMessages.append(document.createElement('br'));
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });

    // Logout
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});



