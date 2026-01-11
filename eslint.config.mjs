import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactPerf from "eslint-plugin-react-perf";
import _import from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([
    // Ignore files that should never be linted
    // Next.js only lints files in src/ directory during build
    globalIgnores([
        "**/*.config.js",
        "**/*.config.mjs",
        "**/next-env.d.ts",
        "**/scripts/**",
        "**/git_hooks/**",
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
    ]),
    // Note: Next.js configs conflict with airbnb's import plugin definition
    // Using Next.js rules manually instead (nextCoreWebVitals, nextTypescript removed)
    // Use fixupConfigRules for legacy configs only (not Next.js)
    ...fixupConfigRules(compat.extends("airbnb")),
    ...fixupConfigRules(compat.extends("plugin:@typescript-eslint/recommended")),
    ...fixupConfigRules(compat.extends("prettier")),
    {
    // Only lint files in src/ directory (matching Next.js build behavior)
    files: ["src/**/*.{ts,tsx}"],
    // Only define plugins not already included in the extended configs
    plugins: {
        "@typescript-eslint": fixupPluginRules(typescriptEslint),
        react: fixupPluginRules(react),
        "react-hooks": fixupPluginRules(reactHooks),
        "react-perf": fixupPluginRules(reactPerf),
        import: fixupPluginRules(_import),
        prettier: fixupPluginRules(prettier),
    },

    languageOptions: {
        globals: {
            JSX: "readonly",
        },

        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: "./tsconfig.json",

            ecmaFeatures: {
                jsx: true,
            },
        },
    },

    settings: {
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },

        "import/resolver": {
            typescript: {
                alwaysTryTypes: true,
                project: "./tsconfig.json",
            },
        },
    },

    rules: {
        "import/no-unresolved": "error",
        "react/jsx-props-no-spreading": "off",
        "react/react-in-jsx-scope": "off",
        "react/destructuring-assignment": "off",
        "react/jsx-filename-extension": ["error", { extensions: [".tsx"] }],
        "@typescript-eslint/no-shadow": "off",
        "import/prefer-default-export": "off",
        "@next/next/no-img-element": "off",
        "react/require-default-props": "off",
        "no-nested-ternary": "off",
        "prettier/prettier": "error",
        "no-else-return": "warn",
        "no-restricted-syntax": "off",
        "no-continue": "off",
        "import/extensions": ["error", "ignorePackages", {
            "ts": "never",
            "tsx": "never",
            "js": "never",
            "jsx": "never",
        }],

        "jsx-a11y/label-has-associated-control": ["error", {
            required: {
                some: ["nesting", "id"],
            },
        }],

        "no-underscore-dangle": "off",
    },
},
// Separate config for non-TypeScript files in src/ to avoid parserOptions.project error
{
    files: ["src/**/*.{js,mjs,cjs}"],
    languageOptions: {
        parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
},
// Override for test files in src/ to allow vitest in devDependencies
{
    files: ["src/**/*.spec.{ts,tsx}", "src/**/vitest.config.ts", "src/**/vitest.setup.ts"],
    rules: {
        "import/no-extraneous-dependencies": "off",
    },
},
// Override for svg_components index file in src/ to allow imports without extensions
{
    files: ["src/**/svg_components/index.ts"],
    rules: {
        "import/extensions": "off",
    },
},
]);