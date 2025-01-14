const express = require('express');
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);
const port = 5000;

let clients = {}; // Track connected clients
let activeChats = {}; // Track active chats

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// WebRTC signaling logic
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // When a client sets their name
    socket.on('set-name', (name) => {
        clients[socket.id] = { id: socket.id, name: name };
        io.emit('online-users', Object.values(clients)); // Emit updated online users
        console.log(`User set name: ${name} (${socket.id})`);
    });

    // Handle chat requests
    socket.on('request-chat', (toSocketId) => {
        if (clients[toSocketId]) {
            io.to(toSocketId).emit('chat-request', socket.id, clients[socket.id].name);
            console.log(`Chat request sent from ${socket.id} to ${toSocketId}`);
        }
    });

    // Handle chat responses
    socket.on('response-chat', (accepted, toSocketId) => {
        if (clients[toSocketId]) {
            if (accepted) {
                activeChats[socket.id] = toSocketId;
                activeChats[toSocketId] = socket.id;

                io.to(toSocketId).emit('chat-accepted', socket.id);
                io.to(socket.id).emit('chat-accepted', toSocketId);
                console.log(`Chat accepted between ${socket.id} and ${toSocketId}`);
            } else {
                io.to(toSocketId).emit('chat-declined', socket.id);
                console.log(`Chat declined by ${socket.id} for ${toSocketId}`);
            }
        }
    });

    // WebRTC signaling events
    socket.on('offer', (offer, toSocketId) => {
        if (clients[toSocketId]) {
            io.to(toSocketId).emit('offer', offer, socket.id);
            console.log(`Offer sent from ${socket.id} to ${toSocketId}`);
        }
    });

    socket.on('answer', (answer, toSocketId) => {
        if (clients[toSocketId]) {
            io.to(toSocketId).emit('answer', answer, socket.id);
            console.log(`Answer sent from ${socket.id} to ${toSocketId}`);
        }
    });

    socket.on('ice-candidate', (candidate, toSocketId) => {
        if (clients[toSocketId]) {
            io.to(toSocketId).emit('ice-candidate', candidate, socket.id);
            console.log(`ICE candidate sent from ${socket.id} to ${toSocketId}`);
        }
    });

    // Handle user leaving the chat
    socket.on('leave-chat', () => {
        const peerId = activeChats[socket.id];
        if (peerId) {
            delete activeChats[socket.id];
            delete activeChats[peerId];

            io.to(peerId).emit('return-to-lobby');
            io.to(socket.id).emit('return-to-lobby');
            console.log(`Chat ended between ${socket.id} and ${peerId}`);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);

        const peerId = activeChats[socket.id];
        if (peerId) {
            delete activeChats[socket.id];
            delete activeChats[peerId];

            io.to(peerId).emit('return-to-lobby');
            console.log(`Peer ${peerId} notified of disconnection`);
        }

        delete clients[socket.id];
        console.log(`Remaining clients: ${Object.keys(clients)}`); // Debug log
        io.emit('online-users', Object.values(clients)); // Update online users
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
