import { ResourceManagementClient } from "@azure/arm-resources";
import { DefaultAzureCredential } from "@azure/identity";
import { convertToDOTLanguage } from "./convertToDOTLanguage";
import { promises as fs } from "fs";
import { join } from "path";
import { exec } from "child_process";

async function getTenantDiagrams(
  theme: "light" | "dark" | "neon",
  outputFilePath: string,
  labelVerbosity: 1 | 2 | 3 = 1,
  categoryDepth: 1 | 2 | 3 = 1,
  outputFormat: "png" | "svg" = "png",
  direction: "left-to-right" | "top-to-bottom" = "left-to-right"
): Promise<void> {
  const credential = new DefaultAzureCredential();
  const client = new ResourceManagementClient(credential, "<subscription-id>");

  const subscriptions = await client.subscriptions.list();
  const dateis = new Date().toISOString().split("T")[0];

  for (const subscription of subscriptions) {
    const subscriptionId = subscription.subscriptionId!;
    const subscriptionName = subscription.displayName!;
    const subscriptionPath = join(outputFilePath, dateis, subscriptionName);
    await fs.mkdir(subscriptionPath, { recursive: true });

    const resourceGroups = await client.resourceGroups.list();
    for (const rg of resourceGroups) {
      const rgName = rg.name!;
      const filename = `${rgName}.${outputFormat}`;
      const filePath = join(subscriptionPath, filename);

      const dotLanguage = await convertToDOTLanguage(
        [rgName],
        "Azure Resource Group",
        labelVerbosity,
        categoryDepth,
        direction,
        "spline",
        []
      );

      const dotFilePath = join(__dirname, "temp.dot");
      await fs.writeFile(dotFilePath, dotLanguage, "utf8");

      const graphViz = getDOTExecutable();
      if (!graphViz) {
        throw new Error("GraphViz is not installed on this system. Please download and install from https://graphviz.org/download/ and re-run this command.");
      }

      await new Promise<void>((resolve, reject) => {
        exec(`${graphViz} -T${outputFormat} ${dotFilePath} -o ${filePath}`, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      await fs.unlink(dotFilePath);
    }
  }
}

export { getTenantDiagrams };
