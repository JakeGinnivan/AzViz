import { convertToDOTLanguage } from "./convertToDOTLanguage";
import { getASCIIArt } from "./getASCIIArt";
import { getDOTExecutable } from "./getDOTExecutable";
import { exec } from "child_process";
import { promises as fs } from "fs";
import { join } from "path";

interface ExportAzVizOptions {
  resourceGroup: string[];
  show?: boolean;
  labelVerbosity?: number;
  categoryDepth?: number;
  outputFormat?: "png" | "svg";
  theme?: "light" | "dark" | "neon";
  direction?: "left-to-right" | "top-to-bottom";
  outputFilePath?: string;
  splines?: "polyline" | "curved" | "ortho" | "line" | "spline";
  excludeTypes?: string[];
}

async function exportAzViz(options: ExportAzVizOptions): Promise<void> {
  const {
    resourceGroup,
    show = false,
    labelVerbosity = 1,
    categoryDepth = 1,
    outputFormat = "png",
    theme = "light",
    direction = "top-to-bottom",
    outputFilePath = join(__dirname, "output." + outputFormat),
    splines = "spline",
    excludeTypes = [],
  } = options;

  getASCIIArt();

  console.log("Testing Graphviz installation...");

  const graphViz = getDOTExecutable();

  if (!graphViz) {
    throw new Error(
      "'GraphViz' is not installed on this system and is a prerequisite for this module to work. Please download and install from here: https://graphviz.org/download/ and re-run this command."
    );
  } else {
    console.log(`GraphViz installation path: ${graphViz}`);
  }

  console.log("Configuring Defaults...");
  console.log(` Target Type            : Azure Resource Group`);
  console.log(` Output Format          : ${outputFormat}`);
  console.log(` Excluded Resource Types: ${excludeTypes.join(", ")}`);
  console.log(` Output File Path       : ${outputFilePath}`);
  console.log(` Label Verbosity        : ${labelVerbosity}`);
  console.log(` Category Depth         : ${categoryDepth}`);
  console.log(` Sub-graph Direction    : ${direction}`);
  console.log(` Theme                  : ${theme}`);
  console.log(` Launch Visualization   : ${show}`);

  console.log("Target Azure Resource Groups...");
  resourceGroup.forEach((rg) => console.log(` ${rg}`));

  console.log("Starting to generate Azure visualization...");

  const graph = await convertToDOTLanguage(
    resourceGroup,
    "Azure Resource Group",
    labelVerbosity,
    categoryDepth,
    direction,
    splines,
    excludeTypes
  );

  if (graph) {
    const dotFilePath = join(__dirname, "temp.dot");
    await fs.writeFile(dotFilePath, graph, "utf8");

    await new Promise<void>((resolve, reject) => {
      exec(`${graphViz} -T${outputFormat} ${dotFilePath} -o ${outputFilePath}`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    await fs.unlink(dotFilePath);

    console.log(`Visualization exported to path: ${outputFilePath}`);
    console.log("Finished Azure visualization.");

    if (show) {
      exec(`start ${outputFilePath}`);
    }
  }
}

export { exportAzViz };
