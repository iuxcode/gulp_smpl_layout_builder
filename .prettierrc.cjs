// @ts-check
/// <reference types="@prettier/plugin-pug/src/prettier" />

/**
 * @type {import('prettier').Options}
 */
module.exports = {
  plugins: ['@prettier/plugin-pug'],

  singleQuote: false,
  trailingComma: "all",
  bracketSpacing: true,
  semi: true,
};
