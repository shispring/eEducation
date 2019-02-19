const logger = require("./logger").get("es");
const monitor_logger = require('./logger').get('monitor');
const path = require("path");
const Utils = require("./utils");
const exec = require("child_process").exec;
const monitor = require("./processMonitor");
const fs = require("fs");

class RecorderManager {
    constructor() {
        this.signal = null;
        this.recordings = {};
    }


    init() {
        let manager = this;
        return new Promise((resolve, reject) => {
            setInterval(() => {
                monitor.check(manager);
            }, 10 * 1000);
            resolve();
        });
    }


    findRecorders(appid, channel) {
        let manager = this;
        let recorders = [];
        Object.keys(this.recordings).forEach(sid => {
            let recorder = manager.recordings[sid];
            if (appid === recorder.appid && channel === recorder.channel) {
                recorders.push(recorder);
            }
        });
        return recorders;
    }

    findRecorderInstance(appid, channel, pid) {
        let manager = this;
        let keys = Object.keys(this.recordings);

        for (let i = 0; i < keys.length; i++) {
            let sid = keys[i];
            let recorder = manager.recordings[sid];
            if (recorder && recorder.appid === appid && recorder.channel === channel && recorder.pid === pid) {
                return recorder;
            }
        }

        return null;
    }

    validate(processes) {
        let manager = this;
        monitor_logger.info(`validating, ${processes.length} processes, ${Object.keys(this.recordings).length} recorders`);
        //bi-direction check
        //ps -> recording
        processes.forEach(process => {
            let appid = process.appId;
            let channel = process.channel;
            let pid = process.pid;

            let recorder = manager.findRecorderInstance(appid, channel, pid);

            if (recorder) {
                if (recorder.pid !== process.pid) {
                    logger.error(`pid not match, recorder: ${recorder.pid}, process: ${process.pid}`);
                }
            } else {
                logger.error(`find redundant process: ${JSON.stringify(process)}, killing..`);
                exec(`kill -s 2 ${process.pid}`);
            }
        });

        //recording -> ps
        Object.keys(this.recordings).forEach(sid => {
            let recorder = manager.recordings[sid];
            let appid = recorder.appid;
            let channel = recorder.channel;
            let pid = recorder.pid;

            let process = processes.filter(item => { return item.appId === appid && item.channel === channel && item.pid === pid })[0]

            if (process) {
                //ok
            } else {
                logger.error(`process not running: ${JSON.stringify(process)}, removing..`);
                this.onStopRecording(sid)
            }
        });
    }
    
    /** lifecycles */
    start(appid, channel, options) {
        let manager = this;

        return new Promise((resolve, reject) => {
            let key = options.key || undefined;
            let appliteDir = path.join(__dirname, "/rec/");
            let sessionid = Utils.rand(32);


            let script = `bash start_record_jsmpeg.sh -i ${appid} -c ${channel} -s ${sessionid}`;
            if (key) {
                script += ` -k ${key}`;
            }
            logger.info(script);

            let folder = path.join(__dirname, `../output/${appid}-${channel}-${sessionid}/`);
            let pid_file = path.join(__dirname, `../output/${appid}-${channel}-${sessionid}/pid`);
            logger.info(`pid file will be generated at ${pid_file}`);
            let ts = new Date();

            let recorder = {
                appid: appid,
                channel: channel,
                pid: null,
                sessionid: sessionid,
                ts: parseInt(ts.getTime() / 1000),
                path: folder
            };
            manager.recordings[sessionid] = recorder;

            exec(script, (error, stdout, stderr) => {
                fs.access(pid_file, fs.constants.R_OK, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        fs.readFile(pid_file, 'utf8', (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                let pid = data.replace("\n", "");
                                recorder.pid = pid;
                                logger.info(`recording started: ${JSON.stringify(recorder)}`);
                                resolve(recorder);
                            }
                        });
                    }
                });
            });
        });
    }
    stop(appid, channel, sid) {
        let recorder = this.recordings[sid];

        if (!recorder) {
            return Promise.reject("unrecognized_sid");
        }

        if (recorder.appid !== appid || recorder.channel !== channel) {
            return Promise.reject("not_match_appid_channel");
        }

        return new Promise((resolve, reject) => {
            logger.info(`stopping recording ${appid} ${channel} ${sid}`);
            var script = `bash stop_record_jsmpeg.sh -i ${appid} -c ${channel} -s ${sid}`;
            logger.info(script);
            exec(script, (error, stdout, stderr) => {
                this.onStopRecording(sid)
                resolve();
            })
        });
    }

    onStopRecording(sid) {
        let recorder = this.recordings[sid];
        logger.info(`service stopped: ${JSON.stringify(recorder)}`);
        this.convert(recorder.path)
        delete this.recordings[sid];
    }

    convert(folder) {
        let lockpath = path.resolve(folder, 'convert.lock')
        logger.info(`start converting video at ${folder}`)
        try {
            logger.info('check convert.lock');
            fs.accessSync(lockpath, fs.constants.R_OK);
            logger.info('lock exists, failed to acquire, skip');
        } catch (err) {
            // if lock file not exists
            logger.info(`acquire convert.lock`)
            fs.writeFile(lockpath, null, err => {
                logger.info(`convert.lock acquired`)
                var script = `cd ${path.resolve(__dirname, '../Agora_EDU_Recording_SDK_for_Linux/tools')} && python video_convert.py -f ${folder}`;
                logger.info(script);
                exec(script, (error, stdout, stderr) => {
                    logger.info(`convert done`)
                })
            })
        }
    }
}


module.exports = {
    RecorderManager: RecorderManager
};