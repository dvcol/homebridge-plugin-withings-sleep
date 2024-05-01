module.exports = {
  root: true,
  plugins: ['@dvcol/presets'],
  extends: ['plugin:@dvcol/presets/base', 'plugin:@dvcol/presets/prettier'],
  overrides: [
    {
      files: ['*.spec.*', '*.test.*'],
      plugins: ['@dvcol/presets'],
      extends: ['plugin:@dvcol/presets/vitest', 'plugin:@dvcol/presets/prettier'],
    },
    {
      files: ['*.ts', '*.cts', '*.mts', '*.tsx'],
      plugins: ['@dvcol/presets'],
      extends: ['plugin:@dvcol/presets/typescript', 'plugin:@dvcol/presets/prettier'],
    },
  ],
};
