import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", ".husky/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    ...reactRecommended,
    languageOptions: {
      ...reactRecommended.languageOptions,
      globals: {
        ...globals.jest,
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
        'no-trailing-spaces': 'error',
    }
  }
);
