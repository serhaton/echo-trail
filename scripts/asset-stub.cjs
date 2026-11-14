// Lets Node scripts import level data: bundled assets (images, sounds)
// become plain numbers, just like Metro's require() ids in the app.
const Module = require('module');
let nextId = 1;
for (const ext of ['.webp', '.png', '.jpg', '.wav', '.m4a', '.mp3']) {
  Module._extensions[ext] = (module) => {
    module.exports = nextId++;
  };
}
