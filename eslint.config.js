import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig([
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "supabase/migrations/**",
      "src/vite-env.d.ts",
      "src/lib/database.types.ts",
      "postcss.config.js",
      "open-all-files.js",
      "scripts/typegen.cjs",
      "scripts/open-all-files.js",
      "src/index.css"
    ],
    plugins: {
      "@typescript-eslint": tseslint.plugin
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.eslint.json"
      }
    }
  }]);
