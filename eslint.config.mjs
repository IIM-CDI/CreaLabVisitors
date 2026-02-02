import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  {
    // Global ignores - these files/folders are never linted
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.env*",
      "**/*.env*",
      "**/.venv/**",
      "**/venv/**",
      "**/__pycache__/**",
      "**/*.pyc",
      "**/*.log",
      "**/coverage/**",
      "**/.git/**",
      "**/*.md",
      "**/*.json",
      "**/*.txt",
    ],
  },
  // JavaScript/TypeScript files in frontend
  {
    files: ["frontend/**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  // TypeScript-specific rules for frontend
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ["frontend/**/*.{ts,tsx}"],
  })),
  // React-specific config for JSX/TSX files in frontend
  {
    files: ["frontend/**/*.{jsx,tsx}"],
    plugins: {
      react: pluginReact,
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Using TypeScript for prop validation
    },
    settings: {
      react: {
        version: "19.2.3", // Explicit React version from frontend/package.json
      },
    },
  },
  // Backend JavaScript files (if any)
  {
    files: ["backend/**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];
