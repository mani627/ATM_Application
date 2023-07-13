const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require('dotenv');
const bodyparser = require("body-parser");
const fileUpload = require('express-fileupload');
const { log } = require("console");


//serve static files
app.use('/Images', express.static(__dirname + '/Images'));

app.use(cors());
// Fileupload
app.use(fileUpload())
//database constant config .env
dotenv.config({
    path: "./.env"
})


// parsing requested 
app.use(bodyparser.json());




const server = http.createServer(app);

const port = process.env.PORT || 8080;

// console.log(port)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Login API
app.use("/", require('./login/Login_API'))

// test for initial connect
io.on("connection", (socket) => {
    console.log(socket.id)

    
    socket.emit("user_id",socket.id)

    // send mssg

    socket.on("join_group", (data) => {

        socket.join(data);
        
        const rooms = io.sockets.adapter.rooms.get(data);
      
        if (rooms) {
            const members = Array.from(rooms); // Convert the Set of sockets to an array
            console.log('Members in room:', members);
        }
        
    })


// remove one member from room
    socket.on('removeMember', ({ roomName, memberId }) => {
        // Remove the specified member from the room
        const room = io.sockets.adapter.rooms.get(roomName);
        if (room) {
          const socketId = Array.from(room).find(socketId => socketId === memberId);
          console.log({socketId});
          if (socketId) {
            io.sockets.sockets.get(socketId).leave(roomName);
            console.log(`Member ${socketId} removed from room ${roomName}`);
          } else {
            console.log(`Member ${memberId} is not found in room ${roomName}`);
          }
        } else {
          console.log(`Room ${roomName} does not exist`);
        }

        const rooms = io.sockets.adapter.rooms.get(roomName);
      
        if (rooms) {
            const members = Array.from(rooms); // Convert the Set of sockets to an array
            console.log('Members in room:', members);
        }
      });

    // typing
    socket.on("send_msg", (data) => {
       
        socket.broadcast.to('Room1').emit("recieve_msg", data)
    })

    // join group
    // socket.on("join_group", (data) => {
    //     // console.log(data)
    //     socket.join(data.room)



    //     console.log("joined")
    // })

    // click outside
    // socket.on("cancel_typing", () => {

    //     socket.broadcast.emit("toall_cancel_typing")
    // })

    // socket.on("disconnect", (data) => {
    //     console.log("user offline", data);
    // })

    // when user go back
    // socket.on("leave", (data) => {
    //     socket.broadcast.to(data.room).emit("toall_leave", data.user)
    // })

    socket.on("disconnectUser",()=>{
        socket.disconnect()
        console.log('User disconnected');
    })

})





// CONNECTION CHECK
//const con = require('../Chat_Server/Connection/Connection');
// con.connect((err) => {
//     if (err) {
//       console.log("Database Connection Failed !!!", err);
//     } else {
//       console.log("connected to Database");
//     }
// });






// check port name
// req.socket.localPort

// erro throw url
app.get("*", function (req, res) {
    res.sendStatus(404)
})

// erro throw url
app.post("*", function (req, res) {
    res.sendStatus(404)
})





server.listen(port, () => {
    console.log("connected")
})