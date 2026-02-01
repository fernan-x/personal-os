import type { Linter } from "eslint";
import globals from "globals";
import base from "./base.ts";

const nest: Linter.Config[] = [
  ...base,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default nest;
