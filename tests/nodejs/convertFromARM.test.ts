import { convertFromARM } from '../../AzViz/src/nodejs/convertFromARM';
import { ResourceManagementClient } from '@azure/arm-resources';
import { DefaultAzureCredential } from '@azure/identity';
import { promises as fs } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';

jest.mock('@azure/arm-resources');
jest.mock('@azure/identity');
jest.mock('fs');
jest.mock('path');
jest.mock('child_process');

describe('convertFromARM', () => {
  const mockResourceManagementClient = {
    resourceGroups: {
      exportTemplate: jest.fn(),
    },
  };

  beforeEach(() => {
    (ResourceManagementClient as jest.Mock).mockImplementation(() => mockResourceManagementClient);
    (DefaultAzureCredential as jest.Mock).mockImplementation(() => ({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should convert ARM templates from Azure Resource Group', async () => {
    const targets = ['test-rg'];
    const targetType = 'Azure Resource Group';
    const categoryDepth = 1;
    const excludeTypes = [];

    mockResourceManagementClient.resourceGroups.exportTemplate.mockResolvedValue({
      template: JSON.stringify({
        resources: [
          {
            type: 'Microsoft.Network/publicIPAddresses',
            name: 'test-pip',
            dependsOn: [],
          },
        ],
      }),
    });

    const result = await convertFromARM(targets, targetType, categoryDepth, excludeTypes);

    expect(result).toEqual([
      {
        Type: 'Azure Resource Group',
        Name: 'test-rg',
        Resources: [
          {
            fromcateg: 'Microsoft.Network/publicIPAddresses',
            from: 'test-pip',
            to: '',
            tocateg: '',
            isdependent: false,
            rank: 1,
          },
        ],
      },
    ]);
  });

  it('should convert ARM templates from local file', async () => {
    const targets = ['test-file.json'];
    const targetType = 'File';
    const categoryDepth = 1;
    const excludeTypes = [];

    (fs.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify({
        resources: [
          {
            type: 'Microsoft.Network/publicIPAddresses',
            name: 'test-pip',
            dependsOn: [],
          },
        ],
      })
    );

    const result = await convertFromARM(targets, targetType, categoryDepth, excludeTypes);

    expect(result).toEqual([
      {
        Type: 'File',
        Name: 'test-file.json',
        Resources: [
          {
            fromcateg: 'Microsoft.Network/publicIPAddresses',
            from: 'test-pip',
            to: '',
            tocateg: '',
            isdependent: false,
            rank: 1,
          },
        ],
      },
    ]);
  });

  it('should convert ARM templates from URL', async () => {
    const targets = ['http://example.com/test-template.json'];
    const targetType = 'Url';
    const categoryDepth = 1;
    const excludeTypes = [];

    (exec as jest.Mock).mockImplementation((cmd, callback) => {
      callback(null, '', '');
    });

    (fs.readFile as jest.Mock).mockResolvedValue(
      JSON.stringify({
        resources: [
          {
            type: 'Microsoft.Network/publicIPAddresses',
            name: 'test-pip',
            dependsOn: [],
          },
        ],
      })
    );

    const result = await convertFromARM(targets, targetType, categoryDepth, excludeTypes);

    expect(result).toEqual([
      {
        Type: 'Url',
        Name: 'http://example.com/test-template.json',
        Resources: [
          {
            fromcateg: 'Microsoft.Network/publicIPAddresses',
            from: 'test-pip',
            to: '',
            tocateg: '',
            isdependent: false,
            rank: 1,
          },
        ],
      },
    ]);
  });

  it('should exclude specified resource types', async () => {
    const targets = ['test-rg'];
    const targetType = 'Azure Resource Group';
    const categoryDepth = 1;
    const excludeTypes = ['Microsoft.Network/publicIPAddresses'];

    mockResourceManagementClient.resourceGroups.exportTemplate.mockResolvedValue({
      template: JSON.stringify({
        resources: [
          {
            type: 'Microsoft.Network/publicIPAddresses',
            name: 'test-pip',
            dependsOn: [],
          },
        ],
      }),
    });

    const result = await convertFromARM(targets, targetType, categoryDepth, excludeTypes);

    expect(result).toEqual([
      {
        Type: 'Azure Resource Group',
        Name: 'test-rg',
        Resources: [],
      },
    ]);
  });
});
