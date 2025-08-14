
// CSS Type for using the CSS context
type Styles = {
    readonly [key: string]: string;
}

// Theme Type for using the Theme context
type ThemeType = "light" | "dark";

// Supported file types for media files
type SupportedFileType = "image/jpeg" | "image/png" | "image/gif" | "image/bmp" |"image/webp" |"audio/mpeg" |"audio/wav" |"audio/aac" |"audio/flac" |"video/mp4" |"video/x-msvideo" |"video/x-matroska" |"video/quicktime"

// FileDisplay type for storing the file object and its metadata in the state
type FileDisplay = {
    index: number;
    file: File;
    fileName: string;
    fileSize: string;
    fileType: SupportedFileType;
    toType: SupportedFileType | undefined;
    converted: "converted" | "not converted" | "converting" | "error";
    path: string;
    destination: string;
    progress: number;
}

export type {Styles, ThemeType, SupportedFileType, FileDisplay};