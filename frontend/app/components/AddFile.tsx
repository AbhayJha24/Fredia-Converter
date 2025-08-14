
import React, { useContext, useRef, useEffect, useState } from 'react';
import { Theme, CSS } from '../Contexts';
import { FileDisplay, Styles, SupportedFileType } from '../Types/Types';
import mapping from '../mappings/supportedFiles.json';
import randomIndex from '../auxiliary/random';

type AddFileProps = {
    setFiles: React.Dispatch<React.SetStateAction<FileDisplay[]>>;
}

function AddFile({setFiles}: AddFileProps) {

    // Theme and CSS Contexts
    const styles: Styles = useContext(CSS);
    const theme = useContext(Theme);

    // HTML FILEBOX COMPONENT
    const fileBox = useRef<HTMLDivElement>(null);

    // dragging state
    const [dragging, setDragging] = useState(false)

    useEffect(() => {
        fileBox.current?.addEventListener("dragover", (e:DragEvent) => {

            // Prevent the default and set the dragging state to true when the user drags in

            e.preventDefault();
            setDragging(true);
        });
        
        fileBox.current?.addEventListener("dragleave", (e:DragEvent) => {

            // Prevent the default and set the dragging state to false when the user drags out

            e.preventDefault();
            setDragging(false);
        });

        fileBox.current?.addEventListener("drop", (e:DragEvent) => {

            // First prevent the default and set the dragging state to false

            e.preventDefault();
            setDragging(false);

            // Check if the files are supported media files or not

            const files = e.dataTransfer?.files;
            if (files && files.length > 0) {
                const f:FileDisplay[] = [];

                for (let i = 0; i < files.length; i++) {
                    if (
                        !mapping.supportedFileTypes.find(type=>{
                            if (files[0].type === type) {
                                return true;
                            }
                            return false;
                        })
                    ) {
                        console.warn(`File ${files[i].name} is not a supported file type.`);
                        alert(`File ${files[i].name} is not a supported file type.`);
                        return
                    }
                }

                // Create an object containing the dragging in file and it details along with a random id
                
                for (let i = 0; i < files.length; i++) {
                    const fileDiplay:FileDisplay = {
                        index: randomIndex(window),
                        file: files[i],
                        fileName: files[i].name,
                        fileSize: files[i].size < 1024 ? `${files[i].size} B` : 
                        files[i].size < 1048576 ? `${(files[i].size / 1024).toFixed(2)} KB` : 
                        `${(files[i].size / 1048576).toFixed(2)} MB`,
                        fileType: files[i].type as SupportedFileType,
                        converted: "not converted",
                        toType: undefined,
                        path: window.nodeAPI.getFilePath(files[i]),
                        destination: "",
                        progress: 0
                    }
                    
                    f.push(fileDiplay);
                }
                
                // Push the file details into a state variable

                setFiles(pf=>{
                    return [...pf, ...f];
                });
            }
        });
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    

    return (
        <section>
            <div className={dragging? styles.addFileContainerDrag :styles.addFileContainer} ref={fileBox}>
                <h1 className={styles.addFileHeading}>Add Media</h1>
                <div className={styles.addFileBox}>
                    <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.5 20L18.5 14M18.5 14L21 16.5M18.5 14L16 16.5" stroke={theme === "dark" ? "#ffffff" : "#000000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5H9.58579C9.851 5 10.1054 5.10536 10.2929 5.29289L12 7H19C20.1046 7 21 7.89543 21 9V11" stroke={theme === "dark" ? "#ffffff" : "#000000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <p className={styles.addFileText}>Drag and Drop any media file here</p>
            </div>
        </section>
    )
}

export default AddFile