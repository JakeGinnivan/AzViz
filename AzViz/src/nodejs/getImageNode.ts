import { join } from "path";
import { images } from "./images";

function getImageNode(name: string, rows: string[], type: string): string {
  const rootPath = join(__dirname, "..", "..");
  const iconPath = join(rootPath, "icons");

  let tr = "";
  let flag = true;
  for (const row of rows) {
    if (flag) {
      tr += `<TR><TD align="center" colspan="2"><B><FONT POINT-SIZE="11">${row}</FONT></B></TD></TR>`;
      flag = false;
    } else {
      const [provider, resourceType] = row.split("/", 2);
      tr += `<TR><TD align="right"><FONT POINT-SIZE="9">Provider:</FONT></TD><TD align="left"><FONT POINT-SIZE="9">${provider}</FONT></TD></TR><TR><TD align="right"><FONT POINT-SIZE="9">Type:</FONT></TD><TD align="left"><FONT POINT-SIZE="9">${resourceType}</FONT></TD></TR>`;
    }
  }

  const path = images[type];
  if (path) {
    return `"${name}" [label=<<TABLE border="0" cellborder="0" cellpadding="0"><TR><TD ALIGN="center" colspan="2"><img src="${join(iconPath, path)}"/></TD></TR>${tr}</TABLE>>;fillcolor="white";shape="none";penwidth="1";fontname="Courier New";]`;
  } else {
    return `"${name}" [label=<<TABLE border="0" cellborder="0" cellpadding="0"><TR><TD ALIGN="center" colspan="2"><img src="${join(iconPath, images["resources"])}"/></TD></TR>${tr}</TABLE>>;fillcolor="white";shape="none";penwidth="1";fontname="Courier New";]`;
  }
}

export { getImageNode };
