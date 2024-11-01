import { promises as fs } from "fs";
import { join } from "path";

async function getASCIIArt(): Promise<string> {
  const mid = String.fromCharCode(9552);
  const full = String.fromCharCode(9553);
  const tl = String.fromCharCode(9556);
  const tr = String.fromCharCode(9559);
  const bl = String.fromCharCode(9562);
  const br = String.fromCharCode(9565);
  const b = String.fromCharCode(9608);

  const projectRoot = join(__dirname, "..", "..");
  const moduleVersion = JSON.parse(await fs.readFile(join(projectRoot, "AzViz.psd1"), "utf8")).ModuleVersion;

  const asciiArt = `
    ${b}${b}${b}${b}${b}${tr} ${b}${b}${b}${b}${b}${b}${b}${tr}${b}${b}${tr}   ${b}${b}${tr}${b}${b}${tr}${b}${b}${b}${b}${b}${b}${b}${tr}   
   ${b}${b}${tl}${mid}${mid}${b}${b}${tr}${bl}${mid}${mid}${b}${b}${b}${tl}${br}${b}${b}${full}   ${b}${b}${full}${b}${b}${full}${bl}${mid}${mid}${b}${b}${b}${tl}${br}   Author    : Prateek Singh (Twitter @singhprateik)
   ${b}${b}${b}${b}${b}${b}${b}${full}  ${b}${b}${b}${tl}${br} ${b}${b}${full}   ${b}${b}${full}${b}${b}${full}  ${b}${b}${b}${tl}${br}    Module    : Azure Visualizer v${moduleVersion}
   ${b}${b}${tl}${mid}${mid}${b}${b}${full} ${b}${b}${b}${tl}${br}  ${bl}${b}${b}${tr} ${b}${b}${tl}${br}${b}${b}${full} ${b}${b}${b}${tl}${br}     Github    : https://github.com/PrateekKumarSingh/AzViz
   ${b}${b}${full}  ${b}${b}${full}${b}${b}${b}${b}${b}${b}${b}${tr} ${bl}${b}${b}${b}${b}${tl}${br} ${b}${b}${full}${b}${b}${b}${b}${b}${b}${b}${tr}   Document  : https://azviz.readthedocs.io
   ${bl}${mid}${br}  ${bl}${mid}${br}${bl}${mid}${mid}${mid}${mid}${mid}${mid}${br}  ${bl}${mid}${mid}${mid}${br}  ${bl}${mid}${br}${bl}${mid}${mid}${mid}${mid}${mid}${mid}${br}  
  `;

  return asciiArt;
}

export { getASCIIArt };
