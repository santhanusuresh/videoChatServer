const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const users = {};
io.on('connect', socket => {
    if (!users[socket.id]) users[socket.id] = socket.id;
    socket.emit("myId", socket.id);
    socket.on('resetMyId', ({ bookingId }) => {
        users[bookingId] = socket.id;
        io.emit("users", users);
    });
    socket.on('disconnect', () => {
        delete users[socket.id];
        const relatedId = Object.keys(users).find(u => users[u] === socket.id);
        if (users[relatedId]) delete users[relatedId];
        io.emit("users", users);
    });
    socket.on('disconnectCall', ({ to }, cb) => {
        io.to(to).emit('callDisconnected');
        cb();
    });
    socket.on("offer", ({ signal, from, to }) => io.to(to).emit('incomingCall', { signal, from }))
    socket.on("answer", ({ signal, to }) => io.to(to).emit('callAccepted', signal))
    socket.on("message", ({ msg, from, to }) => io.to(to).send({ msg, from, to }))
    socket.on("declined", ({ to }) => io.to(to).emit('callDeclined', `Call declined`))
});

// io.on('connect', (socket) => {
//     socket.on('join', ({ bookingId, isClientJoined = false }, callback) => {
//         const { error, user, users } = addUser({ id: socket.id, bookingId });
//         if (error) return callback(error);
//         socket.join(user.bookingId);
//         const usersInThisRoom = users.filter(usr => usr.bookingId === bookingId);
//         !isClientJoined && io.emit(`joinwith${bookingId}`, { user, users: usersInThisRoom }); //  to all the connected clients of all the rooms
//         // socket.broadcast.to(user.bookingId).emit(`joined`, { user, users: usersInThisRoom }); // ALL OTHER  CLIENTS IN THIS ROOM EXCEPT  sender
//         socket.emit('joined', { user, users: usersInThisRoom }); // ONLY TO YOU
//         isClientJoined && io.in(user.bookingId).emit('both-joined', { user, users: usersInThisRoom }); // ALL OF THEM IN THE ROOM
//         callback();
//         socket.on('error', (error) => {
//             console.log("socket error",error);
//           });
//     });

//     socket.on('sendMessage', ({ from = ``, to = ``, data }, callback) => {
//         console.log("sendMessage from-to", from, to, data);
//         socket.to(to).emit(`message${to}`, { data, from });
//         callback();
//     });
//     socket.on('replyMessage', ({ from = ``, to = ``, data }, callback) => {
//         console.log("replyMessage from-to", from, to, data);
//         socket.to(from).emit(`message${to}`, { data, from });
//         callback();
//     });
//     socket.on('video-chat-offer', ({ from = ``, to = ``, data }) => {
//         console.log("video-chat-offer from-to", from, to);
//         socket.to(to).emit(`video-chat-accept${to}`, { data, from });
//     });
//     socket.on('video-chat-accepted', ({ to = `` , from = ``, data }) => {
//         console.log("video-chat-accepted from-to", from, to);
//         socket.to(from).emit(`video-chat-accept${to}`, { data, from });
//     });
//     socket.on('sendStream', ({ to = `` , from = ``, data }) => {
//         console.log("sendStream from-to", from, to);
//         // socket.to(from).emit(`video-chat-accept${to}`, { data, from });
//     });

// socket.on('disconnect', () => {
//     const user = removeUser(socket.id);

//     if (user) {
//         io.to(user.bookingId).emit('message', { user, data: `${user.bookingId} has left.` });
//     }
// })
// });

server.listen(process.env.PORT || 5001, () => console.log(`Server has started.`));