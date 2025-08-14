// Import FFMPEG and fetchFile from the ffmpeg library
import {FFmpeg} from "@ffmpeg/ffmpeg";
import { fetchFile} from "@ffmpeg/util";

// Import the mapping of supported file types
import mapping from "../mappings/supportedFiles.json";

// Import the FileDisplay and SupportedFileType types
import { FileDisplay, SupportedFileType } from "../Types/Types";



// This auxiliary function calls FFMPEG wasm to convert media files

export default function convert(fileDisplay: FileDisplay, setProgress: (fileDisplay:FileDisplay, progress: number) => void): Promise<Blob> {

    // Initialize FFMPEG instance
    const ffmpeg = new FFmpeg();

    // Store the actual file from the FileDisplay (metadata) object
    const file = fileDisplay.file;

    // Return a promise that resolves to a Blob of the converted file
    return new Promise(async (resolve, reject) => {
        try{

            // Load the wasm module
            await ffmpeg.load();


            // Write the file to the FFMPEG filesystem
            ffmpeg.writeFile(file.name, await fetchFile(file));


            // Update the progress by calling the setProgress function received though the parameters
            ffmpeg.on("progress", ({progress}) => {
                setProgress(fileDisplay, progress * 100);
            });


            // Execute the conversion command with the appropriate output format as per the file metadata object received through the parameters
            await ffmpeg.exec(["-i", file.name, `output.${mapping.supportedFileTypesToLabels[fileDisplay.toType as SupportedFileType]}`]);


            // Read the output file from the FFMPEG filesystem
            const data = await ffmpeg.readFile(`output.${mapping.supportedFileTypesToLabels[fileDisplay.toType as SupportedFileType]}`);

            
            // Define a Blob
            let blob: Blob;

            
            // Check if the data is a string or a Uint8Array<ArrayBufferLike> and convert it accordingly to a Blob and set it to the blob variable defined above

            if (typeof data === "string") {
                // Convert string -> bytes (8-bit)
                const bytes = new Uint8Array(data.length);
                for (let i = 0; i < data.length; i++) bytes[i] = data.charCodeAt(i) & 0xff;
                blob = new Blob([bytes.buffer], { type: fileDisplay.toType });
            } else {
                // data is Uint8Array<ArrayBufferLike> (possibly backed by SharedArrayBuffer)
                // Make a copy onto a fresh ArrayBuffer
                const copy = new Uint8Array(data.byteLength);
                copy.set(data);
                blob = new Blob([copy.buffer], { type: fileDisplay.toType });
            }


            // Resolve the promise with the blob
            resolve(blob);
        }
        catch(e) {

            // If any error occurs, reject the promise with the error
            reject(e);
            return;
        }
    });
    
}