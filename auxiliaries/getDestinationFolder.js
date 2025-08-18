const { dialog } = require('electron/main')
const fs = require('fs');

const getDestinationFolder = async (currRun) => {
  try{
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.filePaths[0] || null
  }
  catch(err){
    new Notification({
        title: "Failed to Open Folder Picker",
        body: `Fredia converter failed to open the folder picker due to some unexpected error`
    }).show()

    fs.appendFile(`./logs/log-${currRun}.txt`, err, (error) => {
        if (error) {
            console.error('Error writing log file:', error);
            return;
        }
    });
  }
}

module.exports = getDestinationFolder