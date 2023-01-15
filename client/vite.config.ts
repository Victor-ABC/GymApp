/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { defineConfig } from 'vite';
import postcssPresetEnv from 'postcss-preset-env';
import viteLitCssPlugin from './vite-lit-css-plugin.js';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    viteLitCssPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'avatar.png',
        'favicon.png',
        'no-image.png',
        'standardUploadImage.png'
      ],
      manifest: {
        name: 'Gym+',
        short_name: 'Gym+',
        description: 'Gym+',
        theme_color: '#4a968b',
        background_color: '#728380',
        icons: [
          {
            src: 'favicon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: { port: 8080 },
  css: {
    postcss: {
      plugins: [postcssPresetEnv({ stage: 2 })]
    }
  }
});
