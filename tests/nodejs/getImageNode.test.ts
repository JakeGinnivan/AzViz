import { getImageNode } from "../../src/nodejs/getImageNode";
import { join } from "path";
import { images } from "../../src/nodejs/images";

describe("getImageNode", () => {
  it("should generate a valid image node for a given name, rows, and type", () => {
    const name = "testNode";
    const rows = ["Row 1", "Row 2"];
    const type = "AzureCacheforRedis";
    const rootPath = join(__dirname, "..", "..", "..");
    const iconPath = join(rootPath, "icons");
    const expectedNode = `"${name}" [label=<<TABLE border="0" cellborder="0" cellpadding="0"><TR><TD ALIGN="center" colspan="2"><img src="${join(iconPath, images[type])}"/></TD></TR><TR><TD align="center" colspan="2"><B><FONT POINT-SIZE="11">${rows[0]}</FONT></B></TD></TR><TR><TD align="right"><FONT POINT-SIZE="9">Provider:</FONT></TD><TD align="left"><FONT POINT-SIZE="9">${rows[1].split("/", 2)[0]}</FONT></TD></TR><TR><TD align="right"><FONT POINT-SIZE="9">Type:</FONT></TD><TD align="left"><FONT POINT-SIZE="9">${rows[1].split("/", 2)[1]}</FONT></TD></TR></TABLE>>;fillcolor="white";shape="none";penwidth="1";fontname="Courier New";]`;

    const node = getImageNode(name, rows, type);

    expect(node).toBe(expectedNode);
  });

  it("should handle unknown types gracefully", () => {
    const name = "testNode";
    const rows = ["Row 1", "Row 2"];
    const type = "UnknownType";
    const rootPath = join(__dirname, "..", "..", "..");
    const iconPath = join(rootPath, "icons");
    const expectedNode = `"${name}" [label=<<TABLE border="0" cellborder="0" cellpadding="0"><TR><TD ALIGN="center" colspan="2"><img src="${join(iconPath, images["resources"])}"/></TD></TR><TR><TD align="center" colspan="2"><B><FONT POINT-SIZE="11">${rows[0]}</FONT></B></TD></TR><TR><TD align="right"><FONT POINT-SIZE="9">Provider:</FONT></TD><TD align="left"><FONT POINT-SIZE="9">${rows[1].split("/", 2)[0]}</FONT></TD></TR><TR><TD align="right"><FONT POINT-SIZE="9">Type:</FONT></TD><TD align="left"><FONT POINT-SIZE="9">${rows[1].split("/", 2)[1]}</FONT></TD></TR></TABLE>>;fillcolor="white";shape="none";penwidth="1";fontname="Courier New";]`;

    const node = getImageNode(name, rows, type);

    expect(node).toBe(expectedNode);
  });
});
