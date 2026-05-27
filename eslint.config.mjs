import base from "@dimaslanjaka/eslint-base-config";

/** @type {import('eslint').Linter.Config} */
export default {
  ...base,
  rules: {
    ...base.rules
    // Add theme-specific rules here
  }
};
