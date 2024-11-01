import { getASCIIArt } from '../../AzViz/src/nodejs/getASCIIArt';

describe('getASCIIArt', () => {
  it('should generate ASCII art with the correct format', async () => {
    const asciiArt = await getASCIIArt();
    expect(asciiArt).toContain('Author    : Prateek Singh (Twitter @singhprateik)');
    expect(asciiArt).toContain('Module    : Azure Visualizer v');
    expect(asciiArt).toContain('Github    : https://github.com/PrateekKumarSingh/AzViz');
    expect(asciiArt).toContain('Document  : https://azviz.readthedocs.io');
  });

  it('should include the correct module version', async () => {
    const asciiArt = await getASCIIArt();
    const moduleVersion = JSON.parse(await fs.readFile(join(__dirname, '..', '..', 'AzViz.psd1'), 'utf8')).ModuleVersion;
    expect(asciiArt).toContain(`Module    : Azure Visualizer v${moduleVersion}`);
  });
});
