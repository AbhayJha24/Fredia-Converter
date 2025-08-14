'use client';

import styles from "./page.module.css";
import AddFile from "./components/AddFile";
import Files from "./components/Files";
import { ThemeType, FileDisplay } from "./Types/Types";
import { CSS, Theme } from "./Contexts";
import { useEffect, useState } from "react";

export default function Home() {

  const [theme, setTheme] = useState<ThemeType>("light"); // Fallback to light theme if the media query is not supported
  const [files, setFiles] = useState<FileDisplay[]>([])

  useEffect(() => {
    setTheme(()=>{
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });
  }, []);

  return (
    <CSS value={styles}>
    <Theme value={theme as ThemeType}>
      <Files filesControls={{files, setFiles}}></Files>
      <hr />
      <AddFile setFiles={setFiles}></AddFile>
    </Theme>
    </CSS>
  );
}
