import { join } from "path";
import { images } from "./images";

function getImageLabel(type: string, row1: string, row2: string): string {
  const rootPath = join(__dirname, "..", "..");
  const iconPath = join(rootPath, "icons");

  return `<<TABLE border='0' cellborder='0' cellspacing='0' cellpadding='0'><TR><TD ALIGN='center' rowspan='2'><img src='${join(iconPath, images[type])}' /></TD><TD align='left'>  ${row1}</TD></TR><TR><TD align='left'>  ${row2}</TD></TR></TABLE>>`;
}

export { getImageLabel };
