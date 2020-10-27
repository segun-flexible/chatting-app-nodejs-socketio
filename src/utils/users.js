const users = [];

const addUser = ({id,username,room}) =>{
if(!username || !room){
    return {
        error: "Username and Room are required!"
    }
}

username = username.trim().toLowerCase();
room = room.trim().toLowerCase();


const existingUser = users.find(user => user.room === room && user.username === username);

//Validate
if(existingUser){
    return{
        error: "Username is in use!"
    }
};

//Stored new user
const user = {id,username,room};
users.push(user);
return{user}
}


//Removing User
const removeUser = (id) =>{
    const index = users.findIndex(user => user.id === id);

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

//Getting Single User
const getUser = (id) =>{
     return users.find(user => user.id === id);


}

//Get all users in room
const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase()
   return users.filter(user => user.room === room);
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}