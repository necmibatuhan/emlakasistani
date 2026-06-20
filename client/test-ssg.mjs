import fs from 'fs';
import path from 'path';

(async () => {
  try {
    const dirs = fs.readdirSync('./.vite-react-ssg-temp');
    if (dirs.length > 0) {
      const modPath = `./.vite-react-ssg-temp/${dirs[0]}/main.mjs`;
      console.log(`Loading ${modPath}`);
      const mod = await import(modPath);
      console.log("Loaded mod!");
      console.log("Exports:", Object.keys(mod));
    } else {
      console.log("No temp dirs");
    }
  } catch (err) {
    console.error("Crash during import!", err);
  }
})();
