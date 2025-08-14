const { dialog } = require('electron/main')

const getDestinationFolder = async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.filePaths[0] || null
}

module.exports = getDestinationFolder