import { useContext, useEffect } from "react";
import { CSS, Theme } from "../Contexts";
import mapping from "../mappings/supportedFiles.json";
import { FileDisplay, SupportedFileType } from "../Types/Types";


// Define the type for the props of this component

type FilesProps = {
    filesControls: {
        files: FileDisplay[];
        setFiles: React.Dispatch<React.SetStateAction<FileDisplay[]>>;
    };
}


// Main component for displaying the list of files and their conversion options

export default function Files({filesControls}: FilesProps) {

    const styles = useContext(CSS);
    const theme = useContext(Theme);

    useEffect(() => {
      window.nodeAPI.onUpdateProgress((e, {progress, idx})=>{
        handleProgress(idx, progress)
    })
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Function to handle the change of progress of the conversion

    function handleProgress(index: number, progress: number) {

        // Update the progress of the file convertion in the state for displaying it in the UI
        filesControls.setFiles(pf => {
            return pf.map(file => {
                if (file.index === index) {
                    return {
                        ...file,
                        progress: progress
                    };
                }
                return file;
            }
            );
        });
    }

    // Function to handle the click of choose destination directory button

    async function handleDestinationDirectoryChange(e: React.MouseEvent<HTMLButtonElement>, index: number) {

        // Prevent the default action of the button click
        e.preventDefault();


        // Call the chooseFolder function from the Electron IPC API to ask the main node process to spin up a dialog to choose a destination directory for the converted file
        const nodeResponse = await window.nodeAPI.chooseFolder();

        
        // Set the destination directory of the file in the state for displaying it in the UI
        filesControls.setFiles(pf => {
            return pf.map(file => {
                if (file.index === index) {
                    return {
                        ...file,
                        destination: nodeResponse??""
                    };
                }
                return file;
            });
        });
    }


    // Function to handle the delete button click event

    function handleDelete(file: FileDisplay) {
        filesControls.setFiles(pf => {
            return pf.filter(f => f.index !== file.index);
        });
    }


    // Function to handle the change event of the convertTo select element

    function handleconvertToChange(e: React.ChangeEvent<HTMLSelectElement>, file: FileDisplay) {

        // Get the new type to which the file is to be converted to from the select element value
        const newType = e.target.value


        // If the new type is empty, set the toType of the file to undefined
        if (newType === "") {
            filesControls.setFiles(pf => {
                return pf.map(f => {
                    if (f.index === file.index) {
                        return {
                            ...f,
                            toType: undefined
                        };
                    }
                    return f;
                });
            });
        }


        // If the new type is not empty, set the toType of the file to the new type
        else{
            filesControls.setFiles(pf => {
                return pf.map(f => {
                    if (f.index === file.index) {
                        return {
                            ...f,
                            toType: newType as SupportedFileType
                        };
                    }
                    return f;
                });
            });
        }
    }


    // Function to handle the click event of the convert button

    async function handleConvert(file: FileDisplay, setProgress: (index:number, progress: number) => void, e: React.MouseEvent<HTMLButtonElement>) {
        

        // Check if the destination directory and file type are set, if not, alert the user and return false
        if (file.destination === "") {
            alert("Please specify a destination directory for the converted file.");
            return false; 
        }

        
        // Check if the file type is set, if not, alert the user and return false
        if (file.toType === undefined) {
            alert("Please select a file type to convert to.");
            return false; 
        }


        // Disable the convert button to prevent multiple clicks once the conversion starts
        e.currentTarget.disabled = true;


        // Define a Blob variable to store the converted file
        let conv = undefined;


        // Try to convert the file using the convert function and catch any errors that may occur
        try{

            filesControls.setFiles(pf => {
                return pf.map(f => {
                    if (f.index === file.index) {
                        return {
                            ...f,
                            converted: "converting"
                        };
                    }
                    return f;
                });
            });

            // blob = await convert(file, setProgress);
            const fileName = file.fileName.substring(0, file.fileName.lastIndexOf("."));
            conv = await window.nodeAPI.convertFile(file.path, fileName, file.destination, mapping.supportedFileTypesToLabels[file.toType], file.index)
        }
        catch (error) {
            console.error("Error during conversion:", error);

            filesControls.setFiles(pf => {
                return pf.map(f => {
                    if (f.index === file.index) {
                        return {
                            ...f,
                            converted: "error"
                        };
                    }
                    return f;
                });
            });
            
            return false;
        }

        if(conv){
            filesControls.setFiles(pf => {
                return pf.map(f => {
                    if (f.index === file.index) {
                        return {
                            ...f,
                            converted: "converted"
                        };
                    }
                    return f;
                });
            });

            handleProgress(file.index, 100)
        }
        else{
            filesControls.setFiles(pf => {
                return pf.map(f => {
                    if (f.index === file.index) {
                        return {
                            ...f,
                            converted: "error"
                        };
                    }
                    return f;
                });
            });
        }
    }


    return (
        <section className={styles.filesSection}>
            <h2 className={styles.filesHeader}>Task Area {filesControls.files.length === 0 ? "(No Tasks)" : filesControls.files.length === 1 ? `(${filesControls.files.length} task)` : `(${filesControls.files.length} tasks)`}</h2>

            {/* Unordered list to display the files and their conversion options */}

            <ul className={styles.filesList}>

                {/* Get the files added and their metadata from the state and render li elements according to that */}

                {filesControls.files.map((file, index) => {

                    // Remove the file extension from the file name for display purposes
                    const fileName = file.fileName.substring(0, file.fileName.lastIndexOf("."));

                    // Individual li element for each file with its details and conversion options
                    return (

                        <li key={index} className={styles.fileItem}>


                            {/* File name for individual li element*/}

                            <span className={styles.fileName}>
                                {fileName}
                            </span>


                            {/* File size for individual li element*/}

                            <span className={styles.fileSize}>
                                {file.fileSize}
                            </span>


                            {/* File type for individual li element*/}

                            <span className={styles.fileType}>{mapping.supportedFileTypesToLabels[file.fileType] || "Unknown"}</span>


                            {/* Output file format select element for individual li element with options based on the file type */}

                            <span className={styles.convertTo}>

                                <p>Convert To: </p>

                                <select className={styles.convertToSelect} onChange={e => {handleconvertToChange(e, file)}} value={file.toType}>

                                    {/* Default Option where output file format is undefined */}
                                    <option value="">Select file type</option>

                                    {/* Check if the input file is an image, video, gif or audio file and provide output file format choices accordingly */}

                                    {
                                        (file.fileType.startsWith("image") && file.fileType!== "image/gif") ? mapping.fileCategories.images.filter(type=> type!== file.fileType).map((type, i) => (
                                            <option key={i} value={type}>{mapping.supportedFileTypesToLabels[type as SupportedFileType]}</option>
                                        )):

                                        file.fileType.startsWith("audio") ? mapping.fileCategories.audio.filter(type=> type!== file.fileType).map((type, i) => (
                                            <option key={i} value={type}>{mapping.supportedFileTypesToLabels[type as SupportedFileType]}</option>
                                        )) :

                                        file.fileType.startsWith("video") ? mapping.fileCategories.video.filter(type=> type!== file.fileType).map((type, i) => (
                                            <option key={i} value={type}>{mapping.supportedFileTypesToLabels[type as SupportedFileType]}</option>
                                        )) : 

                                        file.fileType === "image/gif" ? mapping.fileCategories.video.filter(type=> type!== file.fileType).map((type, i) => (
                                            <option key={i} value={type}>{mapping.supportedFileTypesToLabels[type as SupportedFileType]}</option>
                                        ))
                                        : null
                                    }
                                </select>
                            </span>


                            {/* File converted status */}

                            <span className={file.converted === "converted" ? styles.fileConverted : file.converted === "not converted" ? styles.fileNotConverted : file.converted === "converting" ? styles.fileConverting : styles.fileError}>
                                {file.converted === "converted" ? "Converted" : file.converted === "converting" ? "Converting" : file.converted === "error" ? "Error": "Not Converted"}
                            </span>


                            {/* Destination directory for individual li element with a button to choose the destination directory */}

                            <span className={styles.fileDestination}>
                                <span className={styles.fileDestinationText}>{file.destination === "" ? "Destination not choosen" : file.destination}</span>
                                <button type="button" className={styles.chooseDestinationFolderBtn} onClick={e=>handleDestinationDirectoryChange(e,file.index)}>Choose Destination</button>
                            </span>


                            {/* Progress Bar for Individual li element */}

                            <progress id={index.toString()} max="100" value={file.progress} className={styles.progressBar}></progress>


                            {/* Convert button for individual li element to start the conversion process */}

                            <button type="button" className={styles.convertButton} onClick={e=>{handleConvert(file,handleProgress, e)}}>Convert</button>


                            {/* Delete button for individual li element to remove the file from the list */}
                            <span>
                                <svg fill={theme === "light" ? "#000000": "#ffffff"} width="20px" height="20px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" onClick={() => {handleDelete(file)}} className={styles.deleteIcon}>
                                    <path d="M0 16q0 3.264 1.28 6.208t3.392 5.12 5.12 3.424 6.208 1.248 6.208-1.248 5.12-3.424 3.392-5.12 1.28-6.208-1.28-6.208-3.392-5.12-5.088-3.392-6.24-1.28q-3.264 0-6.208 1.28t-5.12 3.392-3.392 5.12-1.28 6.208zM4 16q0-3.264 1.6-6.016t4.384-4.352 6.016-1.632 6.016 1.632 4.384 4.352 1.6 6.016-1.6 6.048-4.384 4.352-6.016 1.6-6.016-1.6-4.384-4.352-1.6-6.048zM9.76 20.256q0 0.832 0.576 1.408t1.44 0.608 1.408-0.608l2.816-2.816 2.816 2.816q0.576 0.608 1.408 0.608t1.44-0.608 0.576-1.408-0.576-1.408l-2.848-2.848 2.848-2.816q0.576-0.576 0.576-1.408t-0.576-1.408-1.44-0.608-1.408 0.608l-2.816 2.816-2.816-2.816q-0.576-0.608-1.408-0.608t-1.44 0.608-0.576 1.408 0.576 1.408l2.848 2.816-2.848 2.848q-0.576 0.576-0.576 1.408z"></path>
                                </svg>
                            </span>
                        </li>

                    )
                })}
            </ul>


        </section>
    )
}