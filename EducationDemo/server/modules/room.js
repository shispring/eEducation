const logger = require("./logger").get("es");
const agent = require("./logger").get("monitor");
const Utils = require("./utils");
const socketio = require('socket.io');

class RoomManager {
    constructor(http_server) {
        let manager = this;
        this.rooms = {}
        let io = socketio(http_server);
        io.on('connection', client => {
            manager.subscribe(client);
        });
    }

    subscribe(client){
        let manager = this;
        let handshake = client.handshake;
        let query = handshake.query;
        let appid = query.appid || "";
        let channel = query.channel || "";
        let name = query.name || "";

        logger.info(`incoming socketio conn: ${handshake.url}`);

        if(!appid || !channel || !name){
            logger.error(`reject: ${appid} ${channel} ${name} missing params`);

            client.disconnect(true);
            return;
        }

        //check when initial connect
        let room = manager.findRoom(appid, channel);
        if(!room){
            logger.error(`reject: ${appid} ${channel} room not found`);
            client.disconnect(true);
        } else {
            room.users[name] = {
                ts: parseInt(new Date().getTime() / 1000),
                socket: client
            }
        }

        client.on('agora-ping', () => {
            agent.info(`agora-ping`)
            let room = manager.findRoom(appid, channel);
            if(!room){
                logger.error(`reject: ${appid} ${channel} room not found`);
                client.disconnect(true);
            } else {
                let ts = parseInt(new Date().getTime() / 1000);
                room.users[name].ts = ts;
                let users = [];
                Object.keys(room.users).forEach(n => {
                    let user = room.users[n];
                    if(ts - user.ts > 15 * 1000){
                        logger.info(`disconnect: ${appid} ${channel} ${n} for no ping in 15 sec`);
                        room.users[n].socket.disconnect(true);
                    } else {
                        users.push(n)
                    }
                });
                agent.info(`agora-pong ${channel} ${JSON.stringify(users)}`)
                client.emit('agora-pong', {
                    users: users
                });
            }
            
        });
        client.on('disconnect', () => {
            logger.info(`${name} disconnected`);
            if(name === room.owner){
                //owner disconnected
                Object.keys(room.users).forEach(n => {
                    let user = room.users[n];
                    user.socket.emit("owner-disconnect");
                });
                delete manager.rooms[`${appid}-${channel}`];
            } else {
                //user disconnected
                delete room.users[name];
            }
        });
    }

    findRoom(appid, channel) {
        let room = this.rooms[`${appid}-${channel}`];
        return room;
    }

    createRoom(appid, channel, owner) {
        let room = this.rooms[`${appid}-${channel}`];
        if (room) {
            logger.error(`try to create room ${appid}-${channel} while room already exists`);
            return null;
        } else {
            room = {
                appid: appid,
                channel: channel,
                token: Utils.rand(32),
                users: {},
                owner: owner
            };
            this.rooms[`${appid}-${channel}`] = room;
            return room;
        }
    }
}


module.exports = {
    RoomManager: RoomManager
}