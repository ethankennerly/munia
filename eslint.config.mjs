import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import js from "@eslint/js";

export default [
    {
        ignores: [
            "**/*.config.js",
            "**/*.config.mjs",
            "**/next-env.d.ts",
            "**/scripts/**",
            "**/git_hooks/**",
            "**/.syncause/**",
            "**/.next/**",
            "**/out/**",
            "**/build/**",
            "**/dist/**",
            "**/node_modules/**",
            "**/docs/**",
            "**/.idea/**",
            "**/.vscode/**",
            "**/.cursor/**",
            "vitest.config.ts",
            "vitest.setup.ts",
        ],
    },
    js.configs.recommended,
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        files: ["src/**/*.{ts,tsx}"],
        plugins: {
            "@typescript-eslint": typescriptEslint,
            prettier: prettier,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                JSX: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/no-shadow": "off",
            "@next/next/no-img-element": "off",
            "no-nested-ternary": "off",
            "no-else-return": "warn",
            "no-restricted-syntax": "off",
            "no-continue": "off",
            "no-underscore-dangle": "off",
            "prettier/prettier": "error",
            // Disable rules that Next.js build ignores (false positives for App Router)
            "react-hooks/rules-of-hooks": "off", // Server components can be async
            "react-hooks/error-boundaries": "off", // JSX in try/catch is valid for error handling
            "react-hooks/set-state-in-effect": "off", // Common pattern in Next.js
            "react-hooks/exhaustive-deps": "warn", // Keep as warning
            "react-hooks/refs": "off", // False positives in Next.js
            "react-hooks/preserve-manual-memoization": "off", // Too strict
        },
    },
    {
        files: ["src/**/*.spec.{ts,tsx}", "src/**/vitest.config.ts", "src/**/vitest.setup.ts"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
];
