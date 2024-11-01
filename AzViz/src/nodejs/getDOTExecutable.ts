import { execSync } from "child_process";
import { join } from "path";

function getDOTExecutable(): string | null {
  const possiblePaths = [
    "C:\\Program Files\\NuGet\\Packages\\Graphviz*\\dot.exe",
    "C:\\program files*\\GraphViz*\\bin\\dot.exe",
    "/usr/local/bin/dot",
    "/usr/bin/dot",
  ];

  for (const path of possiblePaths) {
    try {
      const resolvedPath = execSync(`which ${path}`).toString().trim();
      if (resolvedPath) {
        return resolvedPath;
      }
    } catch (error) {
      // Ignore errors and continue checking other paths
    }
  }

  return null;
}

export { getDOTExecutable };
