"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const ffprobe_static_1 = __importDefault(require("ffprobe-static"));
const electron_1 = require("electron");
const { fileCategories, supportedFileTypesToLabels } = require("../mappings/supportedFiles.json");
function hmsToSeconds(hms) {
    const [h, m, s] = hms.split(':');
    return Number(h) * 3600 + Number(m) * 60 + parseFloat(s);
}
function handleConvertFile(event, path, filename, destPath, ext, index, window, useGPU, currRun) {
    return new Promise((resolve, reject) => {
        const splittedPath = path.split(".");
        const inpExt = splittedPath[splittedPath.length - 1];
        const iPath = path;
        const oPath = (process.platform === 'win32') ? `${destPath}\\${filename}_converted.${ext}` : `${destPath}/${filename}_converted.${ext}`;
        let isImage = false;
        let isAudio = false;
        // const supported_image_types = ['jpg', 'png', 'bmp', 'webp']
        const supported_image_types = fileCategories.images.map(item => supportedFileTypesToLabels[item]);
        const supported_audio_types = fileCategories.audio.map(item => supportedFileTypesToLabels[item]);
        if (supported_image_types.find(type => { return type === inpExt; })) {
            isImage = true;
        }
        if (supported_audio_types.find(type => { return type === inpExt; })) {
            isAudio = true;
        }
        let args = undefined;
        if (useGPU === undefined || isImage || ext === 'gif' || isAudio) {
            args = [
                '-progress',
                'pipe:1',
                '-i', iPath, // input file
                '-y',
                oPath // output file
            ];
        }
        else {
            // GPU Encoder Map
            const encoderMap = {
                cuda: 'h264_nvenc',
                nvenc: 'h264_nvenc',
                qsv: 'h264_qsv',
                d3d11va: 'libx264',
                dxva2: 'libx264',
                nvdec: 'libx264' // decoder only, using software encoder
            };
            const encoder = encoderMap[useGPU] || 'libx264';
            args = [
                '-progress',
                'pipe:1',
                '-hwaccel', useGPU, // hardware acceleration type
                '-i', iPath, // input file
                '-c:v', encoder, // encoder
                '-y',
                oPath // output file
            ];
        }
        let ffmpeg = undefined;
        let progress = {
            total_duration_sec: undefined
        };
        try {
            if (!isImage) {
                // Try to find the total duration of the media file in seconds
                const ffprobeOut = (0, child_process_1.execSync)(`"${ffprobe_static_1.default.path}" -v error -show_entries format=duration -of default=nk=1:nw=1 "${iPath}"`, { encoding: 'utf-8' });
                // Create an object progress for calculating progress and store the total duration (found above) in it
                progress.total_duration_sec = ffprobeOut;
                fs_1.default.appendFile(`./logs/log-${currRun}.txt`, `ffprobe output: ${ffprobeOut}`, (error) => {
                    if (error) {
                        console.error('Error writing log file:', error);
                        return;
                    }
                });
            }
            // Start the main ffmpeg process
            if (ffmpeg_static_1.default) {
                ffmpeg = (0, child_process_1.spawn)(ffmpeg_static_1.default, args);
            }
            // Log details into a log file for every run
            fs_1.default.appendFile(`./logs/log-${currRun}.txt`, `Actual Command passed -> ffmpeg ${args.join(" ")}`, (error) => {
                if (error) {
                    console.error('Error writing log file:', error);
                    return;
                }
            });
        }
        catch (error) {
            reject(error);
            fs_1.default.appendFile(`./logs/log-${currRun}.txt`, `${error}`, (err) => {
                if (err) {
                    console.error('Error writing log file:', err);
                    return;
                }
            });
            return;
        }
        if (!ffmpeg) {
            return;
        }
        if (!progress.total_duration_sec && !isImage) {
            return;
        }
        ffmpeg.stdout.on('data', (data) => {
            // Log raw details to log file
            fs_1.default.appendFile(`./logs/log-${currRun}.txt`, `Ffmpeg stderr: ${data.toString()}`, (error) => {
                if (error) {
                    console.error('Error writing log file:', error);
                    return;
                }
            });
            if (!isImage) {
                const lines = data.toString().trim().split('\n');
                lines.forEach(line => {
                    const [key, value] = line.split('=');
                    if (key && value !== undefined) {
                        progress[key.trim()] = value.trim();
                        if (key.trim() === 'out_time') {
                            const elapsedSec = hmsToSeconds(value.trim());
                            if (progress.total_duration_sec) {
                                const pct = ((elapsedSec / +progress.total_duration_sec) * 100).toFixed(2);
                                window.webContents.send('update-progress', { progress: pct, idx: index });
                            }
                            else {
                                console.log(`Elapsed: ${elapsedSec.toFixed(2)}s`);
                            }
                        }
                    }
                });
            }
        });
        ffmpeg.stderr.on('data', data => {
            fs_1.default.appendFile(`./logs/log-${currRun}.txt`, `Ffmpeg stderr: ${data.toString()}`, (error) => {
                if (error) {
                    console.error('Error writing log file:', error);
                    return;
                }
            });
        });
        ffmpeg.on('close', code => {
            if (code === 0) {
                resolve(true);
                new electron_1.Notification({
                    title: "Media Converted Successfully",
                    body: `Media file ${filename} converted successfully to ${ext}`
                }).show();
            }
            else {
                resolve(false);
                new electron_1.Notification({
                    title: "Media Convertion Failed",
                    body: `Media file ${filename} failed to convert to ${ext} due to some unexpected error`
                }).show();
            }
        });
    });
}
exports.default = handleConvertFile;
//# sourceMappingURL=handleConvertFile.js.map