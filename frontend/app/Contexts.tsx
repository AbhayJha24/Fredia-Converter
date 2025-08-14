'use client';

import { Styles, ThemeType } from "./Types/Types";
import { createContext } from "react";
import styles from "./page.module.css";

// CSS Context for providing styles throughout the application
const CSS = createContext<Styles>(styles);

// Theme Context for managing the theme of the application
const Theme = createContext<ThemeType>("light");

export { CSS, Theme };