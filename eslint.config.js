import js from '@eslint/js'; // Import the core ESLint configuration for JavaScript
import globals from 'globals'; // Import predefined global variables for different environments
import reactHooks from 'eslint-plugin-react-hooks'; // Import ESLint plugin for React Hooks linting
import reactRefresh from 'eslint-plugin-react-refresh'; // Import ESLint plugin for React Fast Refresh
import tseslint from 'typescript-eslint'; // Import TypeScript ESLint configuration

/** 
 * ESLint configuration file for linting TypeScript files.
 * 
 * This file sets up ESLint with rules and plugins to ensure code 
 * quality and consistency in TypeScript and React applications. 
 * It extends recommended configurations and includes rules for 
 * React Hooks and React Refresh.
 */
export default tseslint.config(
  { ignores: ['dist'] }, // Ignore the 'dist' folder from linting
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended], // Extend recommended configurations for both JS and TypeScript
    files: ['**/*.{ts,tsx}'], // Target TypeScript files for linting
    languageOptions: {
      ecmaVersion: 2020, // Set ECMAScript version
      globals: globals.browser, // Specify global variables for browser environment
    },
    plugins: {
      'react-hooks': reactHooks, // Include React Hooks plugin
      'react-refresh': reactRefresh, // Include React Refresh plugin
    },
    rules: {
      ...reactHooks.configs.recommended.rules, // Set recommended rules for React Hooks
      'react-refresh/only-export-components': [
        'warn', // Emit a warning if non-component exports are present
        { allowConstantExport: true }, // Allow constant exports without warnings
      ],
    },
  }
);