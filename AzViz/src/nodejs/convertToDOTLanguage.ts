import { convertFromARM } from "./convertFromARM";
import { convertFromNetwork } from "./convertFromNetwork";
import { getImageLabel } from "./getImageLabel";
import { getImageNode } from "./getImageNode";
import { removeSpecialChars } from "./removeSpecialChars";
import { getDOTExecutable } from "./getDOTExecutable";
import { exec } from "child_process";
import { promises as fs } from "fs";
import { join } from "path";

interface Resource {
  fromcateg: string;
  from: string;
  to: string;
  tocateg: string;
  isdependent: boolean;
  rank: number;
  association?: string;
}

const rank = {
  "Microsoft.Network/publicIPAddresses": 1,
  "Microsoft.Network/loadBalancers": 2,
  "Microsoft.Network/virtualNetworks": 3,
  "Microsoft.Network/networkSecurityGroups": 4,
  "Microsoft.Network/networkInterfaces": 5,
  "Microsoft.Compute/virtualMachines": 6,
};

async function convertToDOTLanguage(
  targets: string[],
  targetType: string = "Azure Resource Group",
  labelVerbosity: number = 1,
  categoryDepth: number = 1,
  direction: string = "top-to-bottom",
  splines: string = "spline",
  excludeTypes: string[] = []
): Promise<string> {
  const rankdir = direction === "left-to-right" ? "LR" : "TB";
  const specialChars = "() []{}&-.";
  const graphObjects: any[] = [];

  const networkObjects = await convertFromNetwork(targets, targetType, categoryDepth, excludeTypes);
  graphObjects.push(...networkObjects);

  const armObjects = await convertFromARM(targets, targetType, categoryDepth, excludeTypes);
  graphObjects.push(...armObjects);

  const groupedGraphObjects = graphObjects.reduce((acc, obj) => {
    const existing = acc.find((item: any) => item.Name === obj.Name);
    if (existing) {
      existing.Resources.push(...obj.Resources);
    } else {
      acc.push({ ...obj });
    }
    return acc;
  }, []);

  const sortedGraphObjects = groupedGraphObjects.sort((a: any, b: any) => a.rank - b.rank);

  let counter = 0;
  const subgraphs = sortedGraphObjects.map((target: any) => {
    counter += 1;
    const vnets = []; // Placeholder for virtual networks
    const networkLayout: any[] = [];

    const resources = target.Resources;
    const nodes: any[] = [];
    const edges: any[] = [];

    resources.forEach((resource: Resource) => {
      const from = resource.from;
      const fromcateg = resource.fromcateg;
      const to = resource.to;
      const tocateg = resource.tocateg;

      if (resource.isdependent) {
        edges.push({
          from: `${fromcateg}/${from}`.toLowerCase(),
          to: `${tocateg}/${to}`.toLowerCase(),
          attributes: {
            arrowhead: "normal",
            style: "dashed",
            penwidth: "1",
            fontname: "Courier New",
            color: "lightslategrey",
          },
        });

        if (labelVerbosity === 1) {
          nodes.push(getImageNode(`${fromcateg}/${from}`.toLowerCase(), from, fromcateg));
          nodes.push(getImageNode(`${tocateg}/${to}`.toLowerCase(), to, tocateg));
        } else if (labelVerbosity === 2) {
          nodes.push(getImageNode(`${fromcateg}/${from}`.toLowerCase(), from, fromcateg));
          nodes.push(getImageNode(`${tocateg}/${to}`.toLowerCase(), to, tocateg));
        }
      }

      if (resource.association) {
        edges.push({
          from: `${fromcateg}/${from}`.toLowerCase(),
          to: `${tocateg}/${to}`.toLowerCase(),
          attributes: {
            arrowhead: "normal",
            style: "solid",
            penwidth: "1",
            fontname: "Courier New",
            color: "royalblue2",
          },
        });

        if (labelVerbosity === 1) {
          nodes.push(getImageNode(`${fromcateg}/${from}`.toLowerCase(), from, fromcateg));
          nodes.push(getImageNode(`${tocateg}/${to}`.toLowerCase(), to, tocateg));
        } else if (labelVerbosity === 2) {
          nodes.push(getImageNode(`${fromcateg}/${from}`.toLowerCase(), from, fromcateg));
          nodes.push(getImageNode(`${tocateg}/${to}`.toLowerCase(), to, tocateg));
        }
      } else {
        if (labelVerbosity === 1) {
          nodes.push(getImageNode(`${fromcateg}/${from}`.toLowerCase(), from, fromcateg));
        } else if (labelVerbosity === 2) {
          nodes.push(getImageNode(`${fromcateg}/${from}`.toLowerCase(), from, fromcateg));
        }
      }
    });

    const resourceGroupLocation = "location"; // Placeholder for resource group location
    const resourceGroupSubGraphName = `${removeSpecialChars(target.Name, specialChars)}${counter}`;
    const resourceGroupSubGraphNameLabel = getImageLabel("ResourceGroups", `ResourceGroup: ${removeSpecialChars(target.Name, specialChars)}`, `Location: ${resourceGroupLocation}`);
    const resourceGroupSubGraphAttributes = {
      label: resourceGroupSubGraphNameLabel,
      labelloc: "t",
      penwidth: "1",
      fontname: "Courier New",
      style: "rounded, dashed",
      color: "black",
      bgcolor: "ghostwhite",
      fontsize: "9",
    };

    return {
      name: resourceGroupSubGraphName,
      attributes: resourceGroupSubGraphAttributes,
      nodes,
      edges,
      networkLayout,
    };
  });

  const legend = [
    'subgraph clusterLegend {',
    'label = "Legend\\n\\n";',
    'rank = 9999999999999',
    'clusterrank=local',
    'bgcolor = "ivory1"',
    'fontcolor = "black"',
    'fontsize = 11',
    'node [shape=point]',
    '{',
    'rank=same',
    'd0 [style = invis];',
    'd1 [style = invis];',
    'p0 [style = invis];',
    'p1 [style = invis];',
    '}',
    'd0 -> d1 [arrowhead="normal";style="dashed";label="Resource\\nDependency";color="lightslategrey";fontname="Courier New";penwidth="1";fontsize="9";fontcolor="black"]',
    'p0 -> p1 [style="solid";fontname="Courier New";label="Network\\nAssociation";arrowhead="normal";color="royalblue2";penwidth="1";fontsize="9";fontcolor="black"]',
    '}',
  ];

  const graph = [
    'strict digraph Visualization {',
    `rankdir=${rankdir}`,
    'overlap=false',
    `splines=${splines}`,
    'color="white"',
    'bgcolor="white"',
    'penwidth="1"',
    'fontname="Courier New"',
    'fontcolor="black"',
    'fontsize="9"',
    'subgraph main {',
    'label=<<TABLE border="0" cellborder="0" cellpadding="0"><TR><TD ALIGN="center" colspan="2"><img src="icons/Subscriptions.png"/></TD></TR><TR><TD align="left">  Subscription: subscription</TD></TR><TR><TD align="left">  Id: id</TD></TR></TABLE>>',
    'fontsize="9"',
    'style="rounded,solid"',
    'bgcolor="ivory1"',
    'edge [color="black"; fontcolor="black"; fontsize="11"]',
    'node [color="black"; fontcolor="black"; fontsize="11"]',
    ...subgraphs.map((subgraph) => {
      return [
        `subgraph ${subgraph.name} {`,
        ...Object.entries(subgraph.attributes).map(([key, value]) => `${key}="${value}"`),
        ...subgraph.nodes,
        ...subgraph.edges.map((edge) => `${edge.from} -> ${edge.to} [${Object.entries(edge.attributes).map(([key, value]) => `${key}="${value}"`).join("; ")}]`),
        ...subgraph.networkLayout,
        '}',
      ].join("\n");
    }),
    ...legend,
    '}',
    '}',
  ].join("\n");

  const dotFilePath = join(__dirname, "temp.dot");
  await fs.writeFile(dotFilePath, graph, "utf8");

  const graphViz = getDOTExecutable();
  if (!graphViz) {
    throw new Error("GraphViz is not installed on this system. Please download and install from https://graphviz.org/download/ and re-run this command.");
  }

  await new Promise<void>((resolve, reject) => {
    exec(`${graphViz} ${dotFilePath}`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });

  await fs.unlink(dotFilePath);

  return graph;
}

export { convertToDOTLanguage };
