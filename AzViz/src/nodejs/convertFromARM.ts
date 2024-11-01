import { ResourceManagementClient } from "@azure/arm-resources";
import { DefaultAzureCredential } from "@azure/identity";
import { promises as fs } from "fs";
import { join } from "path";
import { exec } from "child_process";

interface Resource {
  fromcateg: string;
  from: string;
  to: string;
  tocateg: string;
  isdependent: boolean;
  rank: number;
}

const rank = {
  "Microsoft.Network/publicIPAddresses": 1,
  "Microsoft.Network/loadBalancers": 2,
  "Microsoft.Network/virtualNetworks": 3,
  "Microsoft.Network/networkSecurityGroups": 4,
  "Microsoft.Network/networkInterfaces": 5,
  "Microsoft.Compute/virtualMachines": 6,
};

const excludedARMObjects = [
  "Microsoft.Network/virtualNetworks*",
  "Microsoft.Network/virtualNetworks/subnets*",
  "Microsoft.Network/networkSecurityGroups*",
];

async function convertFromARM(
  targets: string[],
  targetType: string = "Azure Resource Group",
  categoryDepth: number = 1,
  excludeTypes: string[] = []
): Promise<any[]> {
  const credential = new DefaultAzureCredential();
  const client = new ResourceManagementClient(credential, "<subscription-id>");

  const excludedObjects = [...excludedARMObjects, ...excludeTypes];
  const scriptblock = excludedObjects
    .map((obj) => `!resource.type.includes("${obj}")`)
    .join(" && ");

  const results = [];

  for (const target of targets) {
    let templatePath: string;

    switch (targetType) {
      case "Azure Resource Group":
        console.log(`Exporting ARM template of Azure resource group: '${target}'`);
        const tempFile = join(__dirname, `${target}.json`);
        await client.resourceGroups.exportTemplate(target, {
          resources: ["*"],
          options: "SkipResourceNameParameterization",
        });
        templatePath = tempFile;
        break;
      case "File":
        console.log(`Accessing ARM template from local file: '${target}'`);
        templatePath = target;
        break;
      case "Url":
        console.log(`Downloading ARM template from URL: '${target}'`);
        const tempUrlFile = join(__dirname, `${target}.json`);
        await exec(`curl -o ${tempUrlFile} ${target}`);
        templatePath = tempUrlFile;
        break;
      default:
        throw new Error("Invalid target type");
    }

    console.log("Processing the ARM template to extract resources");
    const armTemplate = JSON.parse(await fs.readFile(templatePath, "utf8"));
    const resources = armTemplate.resources.filter((resource: any) =>
      eval(scriptblock)
    );

    if (resources.length > 0) {
      console.log(`Total resources found: ${resources.length}`);
      await fs.unlink(templatePath);
    } else {
      console.log(`Skipping ${targetType}: "${target}" as no resources were found.`);
      continue;
    }

    const data: Resource[] = resources
      .filter((resource: any) => resource.type.split("/").length <= categoryDepth + 1)
      .map((resource: any) => {
        const dependson = resource.dependsOn || [];
        return dependson.map((dependency: any) => {
          const r = rank[resource.type] || 9999;
          return {
            fromcateg: resource.type,
            from: resource.name,
            to: dependency.split("/")[1],
            tocateg: dependency.split("/")[0],
            isdependent: true,
            rank: r,
          };
        });
      })
      .flat();

    results.push({
      Type: targetType,
      Name: target,
      Resources: data.filter((resource) => eval(scriptblock)),
    });
  }

  return results;
}

export { convertFromARM };
