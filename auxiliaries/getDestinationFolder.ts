import { dialog, Notification } from "electron";
import fs from "fs";

const getDestinationFolder = async (event, currRun) => {
  try{
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    // Issue with electron documentation, doesn't mention the correct return type
    const res = (result as unknown as {canceled:boolean, filePaths: Array<string>})

    if (res.canceled) {
      return null
    }
    else{
      return res.filePaths[0]
    }
  }
  catch(err){
    new Notification({
        title: "Failed to Open Folder Picker",
        body: `Fredia converter failed to open the folder picker due to some unexpected error`
    }).show()

    fs.appendFile(`./logs/log-${currRun}.txt`, `${err}`, (error) => {
        if (error) {
            console.error('Error writing log file:', error);
            return;
        }
    });

  }
}

export default getDestinationFolder