import { QueryClient } from '@tanstack/react-query';

/**
 * Query client configuration optimized for real-time game data
 *
 * Key optimizations:
 * - Stale-while-revalidate for instant UI updates
 * - Background refetching on window focus
 * - Structural sharing to prevent unnecessary re-renders
 * - Smart retry logic with exponential backoff
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache duration - data considered fresh for this long
      staleTime: 30_000, // 30 seconds (individual hooks override for real-time data)

      // Cache persistence - data kept in memory for this long
      gcTime: 5 * 60 * 1000, // 5 minutes

      // Refetch behavior
      refetchOnWindowFocus: true,  // Refetch when user returns to tab
      refetchOnReconnect: true,    // Refetch when internet reconnects
      refetchOnMount: true,        // Refetch when component mounts

      // Retry logic with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Structural sharing prevents re-renders when data hasn't changed
      structuralSharing: true,
    },
  },
});

// Enable TanStack Query DevTools browser extension
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import('@tanstack/query-core').QueryClient;
  }
}

// Only assign in browser environment (not during SSR)
if (typeof window !== 'undefined') {
  window.__TANSTACK_QUERY_CLIENT__ = queryClient;
}
