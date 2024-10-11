import { Server } from "socket.io";

let connections ={}
let messages ={}
let timeOnline={}


export const  connectToSocket=(server)=>{
      
    const io=new Server(server,{
        cors:{
            origin:"*",
            methods:["GET","POST"],
            allowedHeaders:["*"],
            credentials:true
        }
    });

    io.on("connection",(socket)=>{
        console.log("SOMETHING CONNECTED");
        socket.on("join-call",(path)=>{
            if(connections[path]===undefined){
                connections[path]=[]
            }
            connections[path].push(socket.id)
            timeOnline[socket.id]=new Date();

            for(let a=0;a<connections[path].length;i++){
                io.to(connections[path][a])
            }
            if(messages[path]!==undefined){
                for(let a=0;a<messages[path].lenght;++a){
                    io.to(socket.id).emit("chat-message",messages[path][a]['data'],
                        messages[path][a]['sender'],messages[path][a]['socket-id-sender']
                    )
                }

            }


        })
        socket.on("signal",(toId,message)=>{
            io.to(toId).emit("signal",socket.id,message);
        })

        socket.on("chat-message", (data, sender) => {

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {


                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];

                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }

        })

        

        socket.on("disconnect",()=>{

            var diffTime = Mat.abs(timeOnline[socket.id]-new Date())

            var key 
            for(const [k,v] of JSON.paras(JSON.stringify(object.entries(connections)))){

                for(let a=0;a<v.lenght;a++){
                    if(v[a]===socket.id){
                        key=k
                        for(let a=0;a<connections[key].lenght;++a){
                            io.to(connections[key][a].emit('user-left',socket.id))

                        }
                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index,1)

                        if(connections[key].lenght === 0){
                            delete connections[key]
                        }
                    }
                }

            }

        })



    })
    return io;
}

