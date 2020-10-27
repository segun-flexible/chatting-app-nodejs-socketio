const http = require("http");
const socketIO = require("socket.io");
const express = require("express");
const filter = require("bad-words");
const {generateMessage, generateUrl} = require("./utils/messages");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const app = express();
app.use(express.static("public"));
const server = http.createServer(app);


const io = socketIO(server);

io.on("connection",(socket)=>{

    //Room
    
    socket.on("join",({username,room},callBack)=>{
const {error,user} = addUser({id:socket.id,username,room});

if(error){
    return callBack(error)
}

//joining room
socket.join(user.room);
//Fetching All User
io.to(user.room).emit("roomData",{
    room: user.room,
    users:getUsersInRoom(user.room)
}) 
socket.emit("message",generateMessage("Welcome","Admin"))

socket.broadcast.to(user.room).emit("message",generateMessage(`${user.username} has joined!`,"Admin"))


socket.on("disconnect",()=>{
    const user = removeUser(socket.id);
    if(user){
        io.to(user.room).emit("roomData",{
    room: user.room,
    users:getUsersInRoom(user.room)
})
        io.to(user.room).emit("message",generateMessage(`${user.username} has left!`,"Admin"))
    }
    
})


    })

//Room ends




socket.on("send_location",(location,cb)=>{
    const currentUser = getUser(socket.id);

    const l = generateUrl(`https://www.google.com/maps?q=${location.lat},${location.log}`,currentUser.username);
    
    io.to(currentUser.room).emit("locationMessage",l);
    
    cb("Location Shared")
})



socket.on("send_message",(m,cb)=>{
    const currentUser = getUser(socket.id);
    const bad_word = new filter();
    if(bad_word.isProfane(m)){
      return  cb(generateMessage("Bad word found"))
    }
    io.to(currentUser.room).emit("message",generateMessage(m,currentUser.username))
    cb()
})

})




server.listen(3000)