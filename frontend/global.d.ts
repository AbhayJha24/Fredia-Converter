// Types for electron's IPC API

export {}; // make this file a module so `declare global` works

declare global {
  interface Window {
    nodeAPI: {
      saveFile: (file:Buffer<ArrayBuffer>, filename: string, filePath:string, ext:string) => void;
      convertFile: (path:string, filename: string, destPath:string, ext:string, index:number) => Promise<boolean>;
      chooseFolder: () => Promise<string|null>;
      getFilePath: (file:File) => string;
      onUpdateProgress: (callback: (event, value:{progress:number, idx:number})=>void) => void
    };
  }
}