const path = require('path');
const http = require('http');

const express = require('express');
const socketio = require('socket.io');

const formatMessage = require('./utils/messages');
const {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static Folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = '<spans style="color: red">MarkCord-Bot</span>';

// run when client connects
io.on('connection', socket => {
	/**
	 * socket.emit to current user
	 * socket.broadcast.emit to all users except the current user
	 * io.emit to everybody in general
	 */

	console.log('New WS Connection...');

	// Join Room and get data
	socket.on('joinRoom', ({ username, room }) => {
		const user = userJoin(socket.id, username, room);
		socket.join(user.room);

		// Welcome to the current user
		socket.emit('message', formatMessage(botName, 'Welcome to MarkCord'));

		// Broadcast when user connects
		socket.broadcast
			.to(user.room)
			.emit(
				'message',
				formatMessage(botName, `${username} has joined the chat!`)
			);

		// send users and room info
		io.to(user.room).emit('roomusers', {
			room: user.room,
			users: getRoomUsers(user.room)
		});
	});

	// Listen for Chat Message
	socket.on('chatMessage', msg => {
		const user = getCurrentUser(socket.id);
		io.to(user.room).emit('message', formatMessage(user.username, msg));
	});

	// Runs when client disconnects
	socket.on('disconnect', () => {
		const user = userLeave(socket.id);
		if (user) {
			io.to(user.room).emit(
				'message',
				formatMessage(botName, `${user.username} has left the chat!`)
			);

			// send users and room info
			io.to(user.room).emit('roomusers', {
				room: user.room,
				users: getRoomUsers(user.room)
			});
		}
	});
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Working on http://localhost:${PORT}`));
