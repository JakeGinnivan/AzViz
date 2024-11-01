import { getImageLabel } from "../../src/nodejs/getImageLabel";
import { join } from "path";
import { images } from "../../src/nodejs/images";

describe("getImageLabel", () => {
  it("should generate a valid image label for a given type and rows", () => {
    const type = "AzureCacheforRedis";
    const row1 = "Row 1";
    const row2 = "Row 2";
    const rootPath = join(__dirname, "..", "..", "..");
    const iconPath = join(rootPath, "icons");
    const expectedLabel = `<<TABLE border='0' cellborder='0' cellspacing='0' cellpadding='0'><TR><TD ALIGN='center' rowspan='2'><img src='${join(iconPath, images[type])}' /></TD><TD align='left'>  ${row1}</TD></TR><TR><TD align='left'>  ${row2}</TD></TR></TABLE>>`;

    const label = getImageLabel(type, row1, row2);

    expect(label).toBe(expectedLabel);
  });

  it("should handle unknown types gracefully", () => {
    const type = "UnknownType";
    const row1 = "Row 1";
    const row2 = "Row 2";
    const rootPath = join(__dirname, "..", "..", "..");
    const iconPath = join(rootPath, "icons");
    const expectedLabel = `<<TABLE border='0' cellborder='0' cellspacing='0' cellpadding='0'><TR><TD ALIGN='center' rowspan='2'><img src='${join(iconPath, images["resources"])}' /></TD><TD align='left'>  ${row1}</TD></TR><TR><TD align='left'>  ${row2}</TD></TR></TABLE>>`;

    const label = getImageLabel(type, row1, row2);

    expect(label).toBe(expectedLabel);
  });
});
