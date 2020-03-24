const socket = io();

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL (queries)
const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true
});

// change title of page
document.title = `MarkCord | ${room}`;

// Join Chat Room
socket.emit('joinRoom', { username, room });

// Get room and users info
socket.on('roomusers', ({ room, users }) => {
	console.log(room);
	outputRoomName(room);
	outputUsers(users);
});

// Handle Messages from server
socket.on('message', message => {
	console.log(message);
	outputMessage(message);

	// Scroll Down to Last Message
	chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Submit Message
chatForm.addEventListener('submit', e => {
	e.preventDefault();

	const msg = e.target.elements.msg.value;

	// Emit Mesage to Server
	socket.emit('chatMessage', msg);

	// Clear Input
	e.target.elements.msg.value = '';
	e.target.elements.msg.focus();
});

// Output Message to DOM
function outputMessage(message) {
	const div = document.createElement('div');
	div.classList.add('message');
	div.innerHTML = `
    <p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.content}
    </p>
  `;
	chatMessages.appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
	roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
	userList.innerHTML = `
		${users.map(user => `<li>${user.username}</li>`).join('')}
	`;
}
