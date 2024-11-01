import { NetworkManagementClient } from "@azure/arm-network";
import { ResourceManagementClient } from "@azure/arm-resources";
import { DefaultAzureCredential } from "@azure/identity";

interface Resource {
  fromcateg: string;
  from: string;
  to: string;
  tocateg: string;
  association: string;
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

const excludedNetworkObjects = [
  "*Microsoft.Network/virtualNetworks*",
  "*Microsoft.Network/virtualNetworks/subnets*",
  "*Microsoft.Network/networkSecurityGroups*",
];

async function convertFromNetwork(
  targets: string[],
  targetType: string = "Azure Resource Group",
  categoryDepth: number = 1,
  excludeTypes: string[] = []
): Promise<any[]> {
  const credential = new DefaultAzureCredential();
  const resourceClient = new ResourceManagementClient(credential, "<subscription-id>");
  const networkClient = new NetworkManagementClient(credential, "<subscription-id>");

  const excludedObjects = [...excludedNetworkObjects, ...excludeTypes];
  const scriptblock = excludedObjects
    .map((obj) => `!resource.type.includes("${obj}")`)
    .join(" && ");

  const results = [];

  for (const target of targets) {
    let resourceGroup: string;
    let location: string;

    switch (targetType) {
      case "Azure Resource Group":
        console.log(`Exporting network associations for resource group: '${target}'`);
        resourceGroup = target;
        const resourceGroupDetails = await resourceClient.resourceGroups.get(resourceGroup);
        location = resourceGroupDetails.location;
        break;
      case "File":
        // TODO: Handle file input
        break;
      case "Url":
        // TODO: Handle URL input
        break;
      default:
        throw new Error("Invalid target type");
    }

    const networkWatchers = await networkClient.networkWatchers.listAll();
    const networkWatcher = networkWatchers.find((nw) => nw.location === location);

    if (!networkWatcher) {
      console.log(`Network watcher not found for resource group: '${resourceGroup}'`);
      continue;
    }

    console.log(`Network watcher found: '${networkWatcher.name}'`);
    console.log("Obtaining network topology using Network Watcher");

    const topology = await networkClient.networkWatchers.getTopology(
      networkWatcher.name!,
      resourceGroup
    );

    const resources = topology.resources.filter((resource: any) =>
      eval(scriptblock)
    );

    if (resources.length === 0) {
      console.log(`Skipping ${targetType}: "${target}" as no resources were found.`);
      continue;
    }

    const data: Resource[] = resources
      .filter((resource: any) => resource.type.split("/").length <= categoryDepth + 1)
      .map((resource: any) => {
        const associations = resource.associations || [];
        return associations.map((association: any) => {
          const r = rank[resource.type] || 9999;
          return {
            fromcateg: resource.type,
            from: resource.name,
            to: association.name,
            tocateg: association.resourceType,
            association: association.associationType,
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

export { convertFromNetwork };
