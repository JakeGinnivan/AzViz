import { getTenantDiagrams } from '../../AzViz/src/nodejs/getTenantDiagrams';
import { ResourceManagementClient } from '@azure/arm-resources';
import { DefaultAzureCredential } from '@azure/identity';
import { convertToDOTLanguage } from '../../AzViz/src/nodejs/convertToDOTLanguage';
import { promises as fs } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';

jest.mock('@azure/arm-resources');
jest.mock('@azure/identity');
jest.mock('../../AzViz/src/nodejs/convertToDOTLanguage');
jest.mock('fs');
jest.mock('path');
jest.mock('child_process');

describe('getTenantDiagrams', () => {
  const mockResourceManagementClient = {
    subscriptions: {
      list: jest.fn(),
    },
    resourceGroups: {
      list: jest.fn(),
    },
  };

  beforeEach(() => {
    (ResourceManagementClient as jest.Mock).mockImplementation(() => mockResourceManagementClient);
    (DefaultAzureCredential as jest.Mock).mockImplementation(() => ({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate tenant diagrams for Azure resources', async () => {
    const theme = 'light';
    const outputFilePath = 'output';
    const labelVerbosity = 1;
    const categoryDepth = 1;
    const outputFormat = 'png';
    const direction = 'left-to-right';

    mockResourceManagementClient.subscriptions.list.mockResolvedValue([
      {
        subscriptionId: 'test-subscription-id',
        displayName: 'test-subscription',
      },
    ]);

    mockResourceManagementClient.resourceGroups.list.mockResolvedValue([
      {
        name: 'test-rg',
      },
    ]);

    (convertToDOTLanguage as jest.Mock).mockResolvedValue('dot-language');
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fs.unlink as jest.Mock).mockResolvedValue(undefined);
    (exec as jest.Mock).mockImplementation((cmd, callback) => {
      callback(null, '', '');
    });

    await getTenantDiagrams(theme, outputFilePath, labelVerbosity, categoryDepth, outputFormat, direction);

    expect(mockResourceManagementClient.subscriptions.list).toHaveBeenCalled();
    expect(mockResourceManagementClient.resourceGroups.list).toHaveBeenCalled();
    expect(convertToDOTLanguage).toHaveBeenCalledWith(
      ['test-rg'],
      'Azure Resource Group',
      labelVerbosity,
      categoryDepth,
      direction,
      'spline',
      []
    );
    expect(fs.writeFile).toHaveBeenCalledWith(join(__dirname, 'temp.dot'), 'dot-language', 'utf8');
    expect(exec).toHaveBeenCalledWith(
      'dot -Tpng temp.dot -o output/test-subscription/test-rg.png',
      expect.any(Function)
    );
    expect(fs.unlink).toHaveBeenCalledWith(join(__dirname, 'temp.dot'));
  });

  it('should throw an error if GraphViz is not installed', async () => {
    const theme = 'light';
    const outputFilePath = 'output';
    const labelVerbosity = 1;
    const categoryDepth = 1;
    const outputFormat = 'png';
    const direction = 'left-to-right';

    mockResourceManagementClient.subscriptions.list.mockResolvedValue([
      {
        subscriptionId: 'test-subscription-id',
        displayName: 'test-subscription',
      },
    ]);

    mockResourceManagementClient.resourceGroups.list.mockResolvedValue([
      {
        name: 'test-rg',
      },
    ]);

    (convertToDOTLanguage as jest.Mock).mockResolvedValue('dot-language');
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fs.unlink as jest.Mock).mockResolvedValue(undefined);
    (exec as jest.Mock).mockImplementation((cmd, callback) => {
      callback(new Error('GraphViz is not installed'), '', '');
    });

    await expect(
      getTenantDiagrams(theme, outputFilePath, labelVerbosity, categoryDepth, outputFormat, direction)
    ).rejects.toThrow('GraphViz is not installed on this system. Please download and install from https://graphviz.org/download/ and re-run this command.');
  });
});
