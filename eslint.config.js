import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "supabase/**",
      "scripts/**",
      "src/vite-env.d.ts",
      "src/lib/database.types.ts",
      "postcss.config.js",
      "tailwind.config.js",
      "eslint.config.js",
      "src/index.css"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"]
  })),
  {
    files: ["**/*.ts", "**/*.tsx"],
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
  }
]);
