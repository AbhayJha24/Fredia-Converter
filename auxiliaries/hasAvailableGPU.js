const {execSync} = require('child_process');
const ffmpegPath = require('ffmpeg-static');
const { Notification } = require('electron/main')
const { platform } = require('os')
const fs = require('fs');

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

    fs.appendFile(`./logs/log-${currRun}.txt`, err, (error) => {
        if (error) {
            console.error('Error writing log file:', error);
            return;
        }
    });
  }
}
 
function checkGPUSupport() {
    // Check if the ffmpeg build supports gpu

    if(platform() === 'win32'){
        if(getGPUInfoWindows() === undefined){
            return {support: false, supportType: undefined}
        }
    }

    // Check if the device supports gpu
    try{
        const hwaccels = execSync(`"${ffmpegPath}" -hwaccels`, { encoding: 'utf-8' });
        const deviceGPUSupport = /cuda|nvenc|nvdec|d3d11va|dxva2|qsv/.test(hwaccels);


        let deviceGPUSupportType = undefined;

        if(deviceGPUSupport){

            if(platform() === 'win32'){
                if(hwaccels.includes('cuda') && getGPUInfoWindows() === 'nvidia'){
                    deviceGPUSupportType = 'cuda'
                }
                else if(hwaccels.includes('nvenc') && getGPUInfoWindows() === 'nvidia'){
                    deviceGPUSupportType = 'nvenc'
                }
                else if(hwaccels.includes('qsv') && getGPUInfoWindows() === 'intel'){
                    deviceGPUSupportType = 'qsv'
                }
                // else if(hwaccels.includes('d3d11va')){
                //     deviceGPUSupportType = 'd3d11va'
                // }
                // else if(hwaccels.includes('dxva2')){
                //     deviceGPUSupportType = 'dxva2'
                // }
                else if(hwaccels.includes('nvdec') && getGPUInfoWindows() === 'nvidia'){
                    deviceGPUSupportType = 'nvdec'
                }
                else{
                    deviceGPUSupportType = undefined
                }
            }
            else{
                new Notification({
                    title: "GPU Currently not Supported",
                    body: `Fredia converter currently only supports GPU on windows`
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

        fs.appendFile(`./logs/log-${currRun}.txt`, err, (error) => {
            if (error) {
                console.error('Error writing log file:', error);
                return;
            }
        });
    }
}

module.exports = checkGPUSupport
