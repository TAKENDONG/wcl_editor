import { defineConfig } from 'vitest/config';

// `environment: 'node'` par defaut : les modules de format sont purs et se
// testent sans navigateur. Les fichiers qui touchent au DOM declarent
// eux-memes `// @vitest-environment jsdom` en tete.
export default defineConfig({
  test: { environment: 'node' },
});
