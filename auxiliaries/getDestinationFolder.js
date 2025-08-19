"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const getDestinationFolder = async (event, currRun) => {
    try {
        const result = await electron_1.dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        // Issue with electron documentation, doesn't mention the correct return type
        const res = result;
        if (res.canceled) {
            return null;
        }
        else {
            return res.filePaths[0];
        }
    }
    catch (err) {
        new electron_1.Notification({
            title: "Failed to Open Folder Picker",
            body: `Fredia converter failed to open the folder picker due to some unexpected error`
        }).show();
        fs_1.default.appendFile(`./logs/log-${currRun}.txt`, `${err}`, (error) => {
            if (error) {
                console.error('Error writing log file:', error);
                return;
            }
        });
    }
};
exports.default = getDestinationFolder;
//# sourceMappingURL=getDestinationFolder.js.map