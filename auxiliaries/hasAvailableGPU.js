"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const electron_1 = require("electron");
const os_1 = require("os");
const fs_1 = __importDefault(require("fs"));
function getGPUInfoWindows(currRun) {
    try {
        const output = (0, child_process_1.execSync)('wmic path win32_VideoController get name', { encoding: 'utf-8' });
        if (output.split('\n').filter(line => line.trim() && (line.includes('nvidia') || line.includes('NVIDIA') || line.includes('Nvidia'))).length > 0) {
            return "nvidia";
        }
        else if (output.split('\n').filter(line => line.trim() && (line.includes('intel') || line.includes('INTEL') || line.includes('Intel'))).length > 0) {
            return "intel";
        }
        else {
            new electron_1.Notification({
                title: "GPU Supported not Detected",
                body: `Fredia converter failed to detect any GPU acceleration supported by your device and will use CPU only for conversion`
            }).show();
            return undefined;
        }
    }
    catch (err) {
        new electron_1.Notification({
            title: "GPU Support Check Failed",
            body: `Some unexpected error occured when Fredia Converter tried to check for GPU acceleration on your system`
        }).show();
        if (err instanceof Error) {
            fs_1.default.appendFile(`./logs/log-${currRun}.txt`, `Runtime-Error ${err.name}: ${err.message} \n ${err.stack}`, (error) => {
                if (error) {
                    console.error('Error writing log file:', error);
                    return;
                }
            });
        }
    }
}
function checkGPUSupport(currRun) {
    // Check if the ffmpeg build supports gpu
    if ((0, os_1.platform)() === 'win32') {
        if (getGPUInfoWindows(currRun) === undefined) {
            return { support: false, supportType: undefined };
        }
    }
    // Check if the device supports gpu
    try {
        const hwaccels = (0, child_process_1.execSync)(`"${ffmpeg_static_1.default}" -hwaccels`, { encoding: 'utf-8' });
        const deviceGPUSupport = /cuda|nvenc|nvdec|d3d11va|dxva2|qsv/.test(hwaccels);
        let deviceGPUSupportType = undefined;
        if (deviceGPUSupport) {
            if ((0, os_1.platform)() === 'win32') {
                if (hwaccels.includes('cuda') && getGPUInfoWindows(currRun) === 'nvidia') {
                    deviceGPUSupportType = 'cuda';
                }
                else if (hwaccels.includes('nvenc') && getGPUInfoWindows(currRun) === 'nvidia') {
                    deviceGPUSupportType = 'nvenc';
                }
                else if (hwaccels.includes('qsv') && getGPUInfoWindows(currRun) === 'intel') {
                    deviceGPUSupportType = 'qsv';
                }
                // else if(hwaccels.includes('d3d11va')){
                //     deviceGPUSupportType = 'd3d11va'
                // }
                // else if(hwaccels.includes('dxva2')){
                //     deviceGPUSupportType = 'dxva2'
                // }
                else if (hwaccels.includes('nvdec') && getGPUInfoWindows(currRun) === 'nvidia') {
                    deviceGPUSupportType = 'nvdec';
                }
                else {
                    deviceGPUSupportType = undefined;
                }
            }
            else {
                new electron_1.Notification({
                    title: "GPU Currently not Supported",
                    body: `Fredia converter currently only supports GPU on windows`
                }).show();
                return { support: false, supportType: undefined };
            }
        }
        if (deviceGPUSupport && deviceGPUSupportType !== undefined) {
            new electron_1.Notification({
                title: "GPU Support Detected",
                body: `Fredia converter detected that your device supports GPU acceleration and will use it for conversion`
            }).show();
            return { support: (deviceGPUSupport && (deviceGPUSupportType !== undefined)), supportType: deviceGPUSupportType };
        }
        else if (deviceGPUSupport && deviceGPUSupportType === undefined) {
            new electron_1.Notification({
                title: "GPU not Supported",
                body: `Fredia converter detected GPU acceleration supported by your device but the GPU is unknown so only CPU will be used for conversion`
            }).show();
            return { support: (deviceGPUSupport && (deviceGPUSupportType !== undefined)), supportType: deviceGPUSupportType };
        }
        else {
            new electron_1.Notification({
                title: "GPU Supported not Detected",
                body: `Fredia converter failed to detect any GPU acceleration supported by your device and will use CPU only for conversion`
            }).show();
            return { support: (deviceGPUSupport && (deviceGPUSupportType !== undefined)), supportType: deviceGPUSupportType };
        }
    }
    catch (err) {
        new electron_1.Notification({
            title: "GPU Support Check Failed",
            body: `Some unexpected error occured when Fredia Converter tried to check for GPU acceleration on your system`
        }).show();
        fs_1.default.appendFile(`./logs/log-${currRun}.txt`, `${err}\n`, (error) => {
            if (error) {
                console.error('Error writing log file:', error);
            }
        });
        return { support: false, supportType: undefined };
    }
}
exports.default = checkGPUSupport;
//# sourceMappingURL=hasAvailableGPU.js.map