import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["./public/pdf.worker.min.mjs"]),
  {
    name: "js/recommended",
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    linterOptions: {
      reportUnusedInlineConfigs: "warn",
    },
  },
  {
    name: "react/custom",
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    plugins: {
      react,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    extends: [react.configs.flat.recommended],
    // ...react.configs.flat.recommended,
    rules: {
      "react/prop-types": "off",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    name: "languageOptions/globals",
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: globals.browser },
  },
]);
