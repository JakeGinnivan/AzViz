import { testAzLogin } from '../../AzViz/src/nodejs/testAzLogin';
import { DefaultAzureCredential } from '@azure/identity';
import { SubscriptionClient } from '@azure/arm-subscriptions';

jest.mock('@azure/identity');
jest.mock('@azure/arm-subscriptions');

describe('testAzLogin', () => {
  const mockSubscriptionClient = {
    subscriptions: {
      list: jest.fn(),
    },
  };

  beforeEach(() => {
    (DefaultAzureCredential as jest.Mock).mockImplementation(() => ({}));
    (SubscriptionClient as jest.Mock).mockImplementation(() => mockSubscriptionClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if Azure login is successful', async () => {
    mockSubscriptionClient.subscriptions.list.mockResolvedValue([{ subscriptionId: 'test-subscription' }]);

    const result = await testAzLogin();

    expect(result).toBe(true);
  });

  it('should return false if Azure login fails', async () => {
    mockSubscriptionClient.subscriptions.list.mockRejectedValue(new Error('Login failed'));

    const result = await testAzLogin();

    expect(result).toBe(false);
  });

  it('should log an error message if Azure login fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockSubscriptionClient.subscriptions.list.mockRejectedValue(new Error('Login failed'));

    await testAzLogin();

    expect(consoleErrorSpy).toHaveBeenCalledWith('Azure login test failed:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });
});
