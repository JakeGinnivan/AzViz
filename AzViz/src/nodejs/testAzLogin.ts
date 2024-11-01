import { DefaultAzureCredential } from "@azure/identity";
import { SubscriptionClient } from "@azure/arm-subscriptions";

async function testAzLogin(): Promise<boolean> {
  try {
    const credential = new DefaultAzureCredential();
    const client = new SubscriptionClient(credential);
    const subscriptions = await client.subscriptions.list();
    return subscriptions.length > 0;
  } catch (error) {
    console.error("Azure login test failed:", error);
    return false;
  }
}

export { testAzLogin };
