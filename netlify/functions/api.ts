import serverless from "serverless-http";
import { createServer } from "../../server";

let serverPromise: Promise<any> | null = null;

export const handler = async (event: any, context: any) => {
  // Create server only once and reuse it
  if (!serverPromise) {
    serverPromise = createServer();
  }

  const app = await serverPromise;
  const serverlessHandler = serverless(app);

  return serverlessHandler(event, context);
};
