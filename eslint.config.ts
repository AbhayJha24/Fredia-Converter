import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfig from '@electron-toolkit/eslint-config';
import importPlugin from 'eslint-plugin-import';

export default defineConfig([
    globalIgnores(["**/frontend/"]), 
    eslintConfig,
    {
        plugins: {
            import: importPlugin,
        },
        rules: {
            "import/extensions": 0,
            "import/no-extraneous-dependencies": 0,

            "import/no-unresolved": [2, {
                ignore: ["electron"],
            }],

            "linebreak-style": 0,
        },
    }
]);