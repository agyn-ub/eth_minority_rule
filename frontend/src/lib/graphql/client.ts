import { createClient, fetchExchange, subscriptionExchange } from 'urql';
import { createClient as createWSClient } from 'graphql-ws';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_PONDER_GRAPHQL_URL || 'http://localhost:42069/graphql';
const WS_URL = GRAPHQL_URL.replace('http', 'ws');

// WebSocket client for subscriptions
const wsClient = typeof window !== 'undefined' ? createWSClient({
  url: WS_URL,
}) : null;

// urql client
export const graphqlClient = createClient({
  url: GRAPHQL_URL,
  exchanges: [
    fetchExchange,  // HTTP queries
    ...(wsClient ? [subscriptionExchange({
      forwardSubscription(operation) {
        return {
          subscribe: (sink: any) => {
            const dispose = wsClient!.subscribe(operation as any, sink);
            return {
              unsubscribe: dispose,
            };
          },
        };
      },
    })] : []),
  ],
});

// Helper for React Query
export async function graphqlRequest<TData, TVariables = any>(
  query: string | any, // Accept both string and DocumentNode
  variables?: TVariables
): Promise<TData> {
  const result = await graphqlClient.query(query, variables as any).toPromise();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data as TData;
}
