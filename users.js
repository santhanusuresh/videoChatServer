const users = [];

const addUser = ({ id, bookingId }) => {
    const existingUser = users.find((user) => user.id === id);

    if (existingUser) return { error: 'User is already existing.' };

    const user = { id, bookingId };

    users.push(user);

    return { user, users };
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) return users.splice(index, 1)[0];
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsers = () => users;


module.exports = { addUser, removeUser, getUser, getUsers };