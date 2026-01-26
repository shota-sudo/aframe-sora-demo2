// ui/vite.config.js
import basicSsl from '@vitejs/plugin-basic-ssl'
import dotenv from 'dotenv'
import fs from 'node:fs'

dotenv.config()

export default {
  plugins: [basicSsl()],
  envPrefix: ['VITE_', 'SORA_', 'CTRL_', 'STATE_'],
  server: {
    https: false,       // devサーバをHTTPSで起動
    key:  fs.readFileSync('./localhost-key.pem'),
    cert: fs.readFileSync('./localhost.pem'),
    // 必要なら他の設定（port/proxy など）もここに
  },
}
