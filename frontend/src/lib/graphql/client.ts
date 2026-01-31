const GRAPHQL_URL = process.env.NEXT_PUBLIC_PONDER_GRAPHQL_URL || 'http://localhost:42069/graphql';

console.log('[GraphQL Client] Using URL:', GRAPHQL_URL);

// Simple fetch-based GraphQL client for React Query
// Note: Ponder does NOT support WebSocket subscriptions - using polling instead
export async function graphqlRequest<TData, TVariables = any>(
  query: string | any,
  variables?: TVariables
): Promise<TData> {
  // Extract query string from gql tagged template
  let queryString: string;

  if (typeof query === 'string') {
    queryString = query;
  } else if (query?.loc?.source?.body) {
    queryString = query.loc.source.body;
  } else if (typeof query?.toString === 'function') {
    queryString = query.toString();
  } else {
    console.error('[GraphQL Request] Invalid query format:', query);
    throw new Error('Invalid query format');
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: queryString,
      variables: variables || {},
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('[GraphQL Response] Error:', text);
    throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    const text = await response.text();
    console.error('[GraphQL Response] Non-JSON response:', text.substring(0, 500));
    throw new Error(`Expected JSON but got ${contentType}`);
  }

  const json = await response.json();

  if (json.errors) {
    console.error('[GraphQL Errors]:', json.errors);
    throw new Error(json.errors[0]?.message || 'GraphQL query failed');
  }

  return json.data as TData;
}

// Legacy export for backwards compatibility
export const graphqlClient = {
  query: () => {
    throw new Error('Direct graphqlClient usage deprecated, use graphqlRequest instead');
  },
};
