import {execSync} from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import { Notification } from 'electron'
import { platform } from 'os'
import fs from "fs"

function getGPUInfoWindows(currRun) {
  try {
    const output = execSync('wmic path win32_VideoController get name', { encoding: 'utf-8' });

    if (output.split('\n').filter(line => line.trim() && (line.includes('nvidia')|| line.includes('NVIDIA')|| line.includes('Nvidia'))).length > 0) {
        return "nvidia"
    }
    else if(output.split('\n').filter(line => line.trim() && (line.includes('intel')|| line.includes('INTEL')|| line.includes('Intel'))).length > 0){
        return "intel"
    }
    else{
        new Notification({
            title: "GPU Supported not Detected",
            body: `Fredia converter failed to detect any GPU acceleration supported by your device and will use CPU only for conversion`
        }).show()

        return undefined
    }
  } catch (err) {
    new Notification({
      title: "GPU Support Check Failed",
      body: `Some unexpected error occured when Fredia Converter tried to check for GPU acceleration on your system`
    }).show()

    if (err instanceof Error) {
        fs.appendFile(`./logs/log-${currRun}.txt`, `Runtime-Error ${err.name}: ${err.message} \n ${err.stack}`, (error) => {
            if (error) {
                console.error('Error writing log file:', error);
                return;
            }
        });
    }
  }
}

function getGPUInfoLinux(currRun) {
  try {
    let output = execSync('lspci | grep -i nvidia', { encoding: 'utf-8' });
    const driverOutput = execSync('lsmod | grep -i nvidia', { encoding: 'utf-8' });

    if (output.split('\n').filter(line => line.trim() && (line.includes('nvidia')|| line.includes('NVIDIA')|| line.includes('Nvidia'))).length > 0) {
        if ((driverOutput.split('\n').filter(line => line.trim() && (line.includes('nvidia')|| line.includes('NVIDIA')|| line.includes('Nvidia'))).length > 0)) {
            return "nvidia"
        }
        else{
            // Nvidia GPU found but no relevant drivers installed

            new Notification({
                title: "An Nvidia GPU Found but no drivers installed",
                body: `Fredia converter will fallback to integrated gpus if any or cpu only`
            }).show()

            output = execSync('lspci | grep -i intel', { encoding: 'utf-8' });

            if(output.split('\n').filter(line => line.trim() && (line.includes('intel')|| line.includes('INTEL')|| line.includes('Intel'))).length > 0){
                return "intel"
            }
            else{
                new Notification({
                    title: "GPU Supported not Detected",
                    body: `Fredia converter failed to detect any GPU acceleration supported by your device and will use CPU only for conversion`
                }).show()

                return undefined
            }
        }
    }

    output = execSync('lspci | grep -i intel', { encoding: 'utf-8' });

    if(output.split('\n').filter(line => line.trim() && (line.includes('intel')|| line.includes('INTEL')|| line.includes('Intel'))).length > 0){
        return "intel"
    }
    else{
        new Notification({
            title: "GPU Supported not Detected",
            body: `Fredia converter failed to detect any GPU acceleration supported by your device and will use CPU only for conversion`
        }).show()

        return undefined
    }
  } catch (err) {
    new Notification({
      title: "GPU Support Check Failed",
      body: `Some unexpected error occured when Fredia Converter tried to check for GPU acceleration on your system`
    }).show()

    if (err instanceof Error) {
        fs.appendFile(`./logs/log-${currRun}.txt`, `Runtime-Error ${err.name}: ${err.message} \n ${err.stack}`, (error) => {
            if (error) {
                console.error('Error writing log file:', error);
                return;
            }
        });
    }
  }
}
 
function checkGPUSupport(currRun): {
    support: boolean;
    supportType: string | undefined;
} {
    // Check if the ffmpeg build supports gpu

    if(platform() === 'win32'){
        if(getGPUInfoWindows(currRun) === undefined){
            return {support: false, supportType: undefined}
        }
    }

    // Check if the device supports gpu
    try{
        const hwaccels = execSync(`"${ffmpegPath}" -hwaccels`, { encoding: 'utf-8' });
        const deviceGPUSupport = /cuda|nvenc|nvdec|d3d11va|dxva2|qsv/.test(hwaccels);


        let deviceGPUSupportType: string|undefined = undefined;

        if(deviceGPUSupport){

            if(platform() === 'win32'){
                if(hwaccels.includes('cuda') && getGPUInfoWindows(currRun) === 'nvidia'){
                    deviceGPUSupportType = 'cuda'
                }
                else if(hwaccels.includes('nvenc') && getGPUInfoWindows(currRun) === 'nvidia'){
                    deviceGPUSupportType = 'nvenc'
                }
                else if(hwaccels.includes('qsv') && getGPUInfoWindows(currRun) === 'intel'){
                    deviceGPUSupportType = 'qsv'
                }
                // else if(hwaccels.includes('d3d11va')){
                //     deviceGPUSupportType = 'd3d11va'
                // }
                // else if(hwaccels.includes('dxva2')){
                //     deviceGPUSupportType = 'dxva2'
                // }
                else if(hwaccels.includes('nvdec') && getGPUInfoWindows(currRun) === 'nvidia'){
                    deviceGPUSupportType = 'nvdec'
                }
                else{
                    deviceGPUSupportType = undefined
                }
            }

            else if(platform() === 'linux'){
                if(hwaccels.includes('cuda') && getGPUInfoLinux(currRun) === 'nvidia'){
                    deviceGPUSupportType = 'cuda'
                }
                else if(hwaccels.includes('nvenc') && getGPUInfoLinux(currRun) === 'nvidia'){
                    deviceGPUSupportType = 'nvenc'
                }
                else if(hwaccels.includes('qsv') && getGPUInfoLinux(currRun) === 'intel'){
                    deviceGPUSupportType = 'qsv'
                }
                // else if(hwaccels.includes('d3d11va')){
                //     deviceGPUSupportType = 'd3d11va'
                // }
                // else if(hwaccels.includes('dxva2')){
                //     deviceGPUSupportType = 'dxva2'
                // }
                else if(hwaccels.includes('nvdec') && getGPUInfoLinux(currRun) === 'nvidia'){
                    deviceGPUSupportType = 'nvdec'
                }
                else{
                    deviceGPUSupportType = undefined
                }
            }
            else{
                new Notification({
                    title: "GPU Currently not Supported",
                    body: `Fredia converter currently only supports GPU on windows and linux`
                }).show()

                return {support: false, supportType: undefined}
            }
        }

        if(deviceGPUSupport && deviceGPUSupportType !== undefined){
            new Notification({
                title: "GPU Support Detected",
                body: `Fredia converter detected that your device supports GPU acceleration and will use it for conversion`
            }).show()

            return {support:(deviceGPUSupport && (deviceGPUSupportType !== undefined)), supportType: deviceGPUSupportType};
        }

        else if(deviceGPUSupport && deviceGPUSupportType === undefined){
            new Notification({
                title: "GPU not Supported",
                body: `Fredia converter detected GPU acceleration supported by your device but the GPU is unknown so only CPU will be used for conversion`
            }).show()

            return {support:(deviceGPUSupport && (deviceGPUSupportType !== undefined)), supportType: deviceGPUSupportType};
        }

        else{
            new Notification({
                title: "GPU Supported not Detected",
                body: `Fredia converter failed to detect any GPU acceleration supported by your device and will use CPU only for conversion`
            }).show()

            return {support:(deviceGPUSupport && (deviceGPUSupportType !== undefined)), supportType: deviceGPUSupportType};
        }

    }
    catch(err){
        new Notification({
        title: "GPU Support Check Failed",
        body: `Some unexpected error occured when Fredia Converter tried to check for GPU acceleration on your system`
        }).show()

        fs.appendFile(`./logs/log-${currRun}.txt`, `${err}\n`, (error) => {
            if (error) {
                console.error('Error writing log file:', error);
            }
        });

        return {support: false, supportType: undefined}
    }
}

export default checkGPUSupport
