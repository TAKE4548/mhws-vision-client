import { defineConfig } from 'orval';

export default defineConfig({
  vision: {
    input: '../mhws-vision-server/docs/system/openapi.yaml',
    output: {
      mode: 'tags-split',
      target: 'src/api/generated/vision.ts',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      mock: true,
      override: {
        mutator: {
          path: './src/lib/api-client.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
