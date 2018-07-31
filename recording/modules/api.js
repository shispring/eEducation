const logger = require("./logger").get("es");
const fs = require("fs");
const path = require("path");
const max_image_limit = 100;

const Api = (recManager, app) => {
    app.use((req, res, next) => {
        logger.info(`incoming restful request: ${req.method}, ${req.url}, ${req.method === "GET" ? JSON.stringify(req.query) : JSON.stringify(req.body)}`);
        next();
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