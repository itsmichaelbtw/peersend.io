import { fileURLToPath } from "node:url";

import globals from "globals";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default [
	{
		ignores: ["dist/**", "node_modules/**"]
	},
	{
		...js.configs.recommended,
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: { ...globals.browser, ...globals.es2022 }
		}
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: ["./tsconfig.app.json", "./tsconfig.node.json"],
				tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
				ecmaVersion: 2022,
				sourceType: "module",
				ecmaFeatures: { jsx: true }
			}
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
			react: reactPlugin,
			"react-hooks": reactHooks
		},
		settings: {
			react: { version: "detect" }
		},
		rules: {
			...tsPlugin.configs["recommended"].rules,
			...tsPlugin.configs["recommended-requiring-type-checking"].rules,
			...reactPlugin.configs["recommended"].rules,
			...reactHooks.configs["recommended"].rules,
			...prettier.rules,
			"@typescript-eslint/unbound-method": "off",
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/explicit-function-return-type": "error",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/only-throw-error": "off",
			"react/react-in-jsx-scope": "off",
			"react/prop-types": "off",
			"no-console": "warn",
			"no-debugger": "error",
			eqeqeq: ["error", "always"],
			curly: ["error", "multi-line"],
			"react/self-closing-comp": "warn",
			"react/jsx-boolean-value": ["warn", "never"],
			"react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }]
		}
	}
];
