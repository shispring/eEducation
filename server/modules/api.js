const logger = require("./logger").get("es");
const fs = require("fs");
const path = require("path");
const max_image_limit = 100;

const Role = {
    Teacher: 0,
    Student: 1
}

const Api = (roomManager, recManager, app) => {
    app.use((req, res, next) => {
        logger.info(`incoming restful request: ${req.method}, ${req.url}, ${req.method === "GET" ? JSON.stringify(req.query) : JSON.stringify(req.body)}`);
        next();
    });

    app.post("/v1/room/join", (req, res) => {
        let body = req.body;
        let appid = body.appid || "";
        let channel = body.channel || "";
        let name = body.name || "";
        let token = body.token || "";
        let role = body.role;

        if(!appid || !channel || !name || role === undefined){
            res.status(500).json({err: "missing_info"});
            return;
        }

        if(role !== Role.Teacher && role !== Role.Student){
            res.status(500).json({err: "invalid_role"});
            return;
        }

        let room = roomManager.findRoom(appid, channel);
        if(!room){
            //room not exist
            if(role === Role.Teacher){
                //teacher request, we will create the room
                room = roomManager.createRoom(appid, channel, name);
                if(!room){
                    res.status(500).json({err: "room_create_failed"});
                } else {
                    res.status(200).json({
                        token: room.token,
                        appid: appid,
                        channel: channel
                    })
                }
            } else {
                //student request, return room not exist
                res.status(404).json({err: "room_not_exist"});
            }
        } else {
            //room exists
            if(room.users[name]){
                res.status(500).json({err: "username_exists"});
                return;
            }


            if(role === Role.Teacher){
                if(room.token === token){
                    res.status(200).json({
                        token: token,
                        appid: appid,
                        channel: channel
                    });
                } else {
                    res.status(400).json({err: "invalid_token"});
                }
            } else {
                res.status(200).json({
                    appid: appid,
                    channel: channel
                });
            }
        }
    });

    app.get("/v1/recording/status", (req, res) => {
        let query = req.query;
        let appid = query.appid || "";
        let channel = query.channel || "";

        if(!appid || !channel){
            res.status(500).json({err: "info_missing"});
            return;
        }

        let recorders = recManager.findRecorders(appid, channel);
        let recorder = recorders[0] || null;

        if(recorder) {
            res.status(200).json({appid: recorder.appid, channel: recorder.channel, sid: recorder.sid});
        } else {
            res.status(200).json({});
        }
    });

    app.post("/v1/recording/start", (req, res) => {
        let body = req.body;
        let appid = body.appid || "";
        let channel = body.channel || "";
        let key = body.key || undefined;

        if(!appid || !channel){
            res.status(500).json({err: "info_missing"});
            return;
        }

        let options = {
            "key": key,
            "uid": 0
        };

        let recorders = recManager.findRecorders(appid, channel);

        if(recorders.length >= 1){
            if(recorders.length > 1){
                logger.error(`multiple instance co-exists for ${appid} ${channel}`);
            }

            let recorder = recorders[0];

            if(!recorder.pid){
                res.status(500).json({err: "starting_instance"});
            } else {
                res.status(200).json({sid: recorder.sessionid, appid: recorder.appid, channel: recorder.channel});
            }

            return;
        }

        recManager.start(appid, channel, options).then(recorder => {
            res.status(200).json({sid: recorder.sessionid, appid: recorder.appid, channel: recorder.channel});
        }).catch(e => {
            logger.error(`request failed ${e}`);
            res.status(500).json({err: "start_failed"});
        });
    });

    app.post("/v1/recording/stop", (req, res) => {
        let body = req.body;
        let appid = body.appid || "";
        let channel = body.channel || "";

        if(!appid || !channel){
            res.status(500).json({err: "info_missing"});
            return;
        }

        let recorders = recManager.findRecorders(appid, channel);
        let recorder = recorders[0] || null;

        if(recorder) {
            recManager.stop(appid, channel, recorder.sessionid).then(() => {
                res.status(200).json({});
            }).catch(e => {
                res.status(500).json({err: e});
            });
        } else {
            res.status(500).json({err: "recorder_not_found"});
        }
    });
};

module.exports = Api;