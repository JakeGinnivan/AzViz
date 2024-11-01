# NodeJS Implementation of Azure Visualizer

This guide explains how to use the NodeJS implementation of the Azure visualizer. The NodeJS version replicates the functionality of the PowerShell scripts in the `AzViz` directory and includes modules for handling Azure Resource Groups, ARM templates, and network associations. The NodeJS implementation outputs dot language which can be fed into GraphViz as a separate process.

## Installation

### Prerequisites

Before using the NodeJS implementation, ensure you have the following installed:

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- GraphViz

### Installing Node.js and npm

Follow the instructions on the [Node.js website](https://nodejs.org/) to install Node.js and npm.

### Installing GraphViz

#### Linux

```bash
# Ubuntu
sudo apt install graphviz

# Fedora
sudo yum install graphviz

# Debian
sudo apt install graphviz
```

#### Windows

```bash
# chocolatey packages Graphviz for Windows
choco install graphviz

# alternatively using windows package manager
winget install graphviz
```

#### Mac

```bash
brew install graphviz
```

### Cloning the Repository and Installing Dependencies

```bash
# Clone the repository
git clone https://github.com/PrateekKumarSingh/AzViz.git
cd AzViz

# Navigate to the NodeJS implementation directory
cd AzViz/src/nodejs

# Install dependencies
npm install
```

## Usage

### Exporting Azure Visualizations

The NodeJS implementation provides a function `exportAzViz` to export Azure visualizations. The function accepts an options object with the following properties:

- `resourceGroup`: An array of resource group names to visualize.
- `show`: A boolean indicating whether to launch the visualization image.
- `labelVerbosity`: An integer (1, 2, or 3) specifying the level of information to include in the visualization.
- `categoryDepth`: An integer (1, 2, or 3) specifying the level of Azure Resource sub-category to include in the visualization.
- `outputFormat`: A string specifying the output format of the visualization (`png` or `svg`).
- `theme`: A string specifying the color theme (`light`, `dark`, or `neon`).
- `direction`: A string specifying the direction in which resource groups are plotted (`left-to-right` or `top-to-bottom`).
- `outputFilePath`: A string specifying the output file path.
- `splines`: A string specifying how edges appear in the visualization (`polyline`, `curved`, `ortho`, `line`, or `spline`).
- `excludeTypes`: An array of strings specifying Azure resource types and providers to exclude from the visualization.

### Example

```javascript
const { exportAzViz } = require('./exportAzViz');

const options = {
  resourceGroup: ['demo-2'],
  show: true,
  labelVerbosity: 1,
  categoryDepth: 1,
  outputFormat: 'png',
  theme: 'light',
  direction: 'top-to-bottom',
  outputFilePath: './output.png',
  splines: 'spline',
  excludeTypes: ['*workspace*', 'Microsoft.Storage*']
};

exportAzViz(options)
  .then(() => {
    console.log('Azure visualization exported successfully.');
  })
  .catch((error) => {
    console.error('Error exporting Azure visualization:', error);
  });
```

### Running Tests

The NodeJS implementation includes tests to ensure the functionality matches the PowerShell version. The tests are located in the `tests/nodejs` directory.

To run the tests, use the following command:

```bash
npm test
```

## Conclusion

The NodeJS implementation of the Azure visualizer provides a powerful and flexible way to generate visualizations of Azure resources and dependencies. By following this guide, you can install, configure, and use the NodeJS version to create automated diagrams of your Azure infrastructure.
