const { spawn } = require('child_process');
const fs = require("fs")
const ffmpegPath = require('ffmpeg-static');

function getProgressByBytes(filePath, processedBytes) {
  const totalBytes = fs.statSync(filePath).size;
  return ((processedBytes / totalBytes) * 100).toFixed(2);
}

function handleConvertFile(event, path, filename, destPath, ext, index, window) {

    return new Promise(async (resolve, reject)=>{
        const iPath = path
        const oPath = (process.platform === 'win32') ? `${destPath}\\${filename}_converted.${ext}` : `${destPath}/${filename}_converted.${ext}`

        const args = [
            '-i', iPath,       // input file
            oPath             // output file
        ];

        let ffmpeg = undefined;

        try{
            ffmpeg = spawn(ffmpegPath, args);
        }
        catch(error){
            reject(error)
            return;
        }

        if(!ffmpeg){
            return;
        }
        
        let processedBytes = 0;

        ffmpeg.stderr.on('data', data => {
            processedBytes += data.length;
            window.webContents.send('update-progress', {progress: getProgressByBytes(path, processedBytes)*100, idx: index})
        });

        ffmpeg.on('close', code => {
            if (code === 0) {
                resolve(true)
            }
            else{
                resolve(false)
            }
        });
    })
}

module.exports = handleConvertFile