const fs = require('fs')
const path = require('node:path')

function handleSaveFile(event, content, filename, filePath, ext) {
    const converted_filename = filename + "_converted"
    filePath = path.join(filePath, `${converted_filename}.${ext}`)

    fs.writeFile(filePath, content, (err) => {
        if (err) {
            console.error('Error saving file:', err)
            event.reply('save-file-response', { success: false, error: err.message })
        } else {
            console.log('File saved successfully:', filePath)
            event.reply('save-file-response', { success: true })
        }
    })
}

module.exports = handleSaveFile