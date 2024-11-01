import { convertFromNetwork } from '../../AzViz/src/nodejs/convertFromNetwork';
import { NetworkManagementClient } from '@azure/arm-network';
import { ResourceManagementClient } from '@azure/arm-resources';
import { DefaultAzureCredential } from '@azure/identity';

jest.mock('@azure/arm-network');
jest.mock('@azure/arm-resources');
jest.mock('@azure/identity');

describe('convertFromNetwork', () => {
  const mockResourceManagementClient = {
    resourceGroups: {
      get: jest.fn(),
    },
  };

  const mockNetworkManagementClient = {
    networkWatchers: {
      listAll: jest.fn(),
      getTopology: jest.fn(),
    },
  };

  beforeEach(() => {
    (ResourceManagementClient as jest.Mock).mockImplementation(() => mockResourceManagementClient);
    (NetworkManagementClient as jest.Mock).mockImplementation(() => mockNetworkManagementClient);
    (DefaultAzureCredential as jest.Mock).mockImplementation(() => ({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should convert network associations from Azure Resource Group', async () => {
    const targets = ['test-rg'];
    const targetType = 'Azure Resource Group';
    const categoryDepth = 1;
    const excludeTypes = [];

    mockResourceManagementClient.resourceGroups.get.mockResolvedValue({
      location: 'eastus',
    });

    mockNetworkManagementClient.networkWatchers.listAll.mockResolvedValue([
      {
        name: 'test-network-watcher',
        location: 'eastus',
      },
    ]);

    mockNetworkManagementClient.networkWatchers.getTopology.mockResolvedValue({
      resources: [
        {
          type: 'Microsoft.Network/publicIPAddresses',
          name: 'test-pip',
          associations: [],
        },
      ],
    });

    const result = await convertFromNetwork(targets, targetType, categoryDepth, excludeTypes);

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
            association: '',
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

    mockResourceManagementClient.resourceGroups.get.mockResolvedValue({
      location: 'eastus',
    });

    mockNetworkManagementClient.networkWatchers.listAll.mockResolvedValue([
      {
        name: 'test-network-watcher',
        location: 'eastus',
      },
    ]);

    mockNetworkManagementClient.networkWatchers.getTopology.mockResolvedValue({
      resources: [
        {
          type: 'Microsoft.Network/publicIPAddresses',
          name: 'test-pip',
          associations: [],
        },
      ],
    });

    const result = await convertFromNetwork(targets, targetType, categoryDepth, excludeTypes);

    expect(result).toEqual([
      {
        Type: 'Azure Resource Group',
        Name: 'test-rg',
        Resources: [],
      },
    ]);
  });

  it('should handle network watcher not found', async () => {
    const targets = ['test-rg'];
    const targetType = 'Azure Resource Group';
    const categoryDepth = 1;
    const excludeTypes = [];

    mockResourceManagementClient.resourceGroups.get.mockResolvedValue({
      location: 'eastus',
    });

    mockNetworkManagementClient.networkWatchers.listAll.mockResolvedValue([]);

    const result = await convertFromNetwork(targets, targetType, categoryDepth, excludeTypes);

    expect(result).toEqual([]);
  });
});
