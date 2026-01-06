import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Hook for fetching dashboard booking data with intelligent caching
 * Revalidates on focus and reconnect, deduplicates concurrent requests
 */
export function useBookings() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/bookings/dashboard-data',
    fetcher,
    {
      revalidateOnFocus: true, // Refresh when window regains focus
      revalidateOnReconnect: true, // Refresh when connection restored
      dedupingInterval: 2000, // Dedupe requests within 2 seconds
      refreshInterval: 10000, // Auto-refresh every 10 seconds
    }
  );

  return {
    bookings: data?.bookings || [],
    userBooking: data?.userBooking || null,
    userId: data?.user?.id || null,
    user: data?.user || null,
    isLoading,
    isError: error,
    mutate, // Manual revalidation function
  };
}

/**
 * Hook for fetching games list with longer cache time (rarely changes)
 */
export function useGames() {
  const { data, error, isLoading } = useSWR('/api/games/list', fetcher, {
    revalidateOnFocus: false, // Don't refresh on focus (games rarely change)
    dedupingInterval: 60000, // Dedupe for 1 minute
    refreshInterval: 0, // No auto-refresh (only manual when games are added/deleted)
  });

  return {
    games: data || [],
    isLoading,
    isError: error,
  };
}

/**
 * Hook for fetching membership status with moderate cache time
 */
export function useMembership() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/membership/status',
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000, // Dedupe for 5 seconds
      refreshInterval: 30000, // Refresh every 30 seconds
    }
  );

  return {
    membership: data || null,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for fetching club settings with long cache time (rarely changes)
 */
export function useSettings() {
  const { data, error, isLoading } = useSWR('/api/admin/settings', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 120000, // Dedupe for 2 minutes
    refreshInterval: 0, // No auto-refresh
  });

  return {
    tableCount: data?.tableCount || 15,
    isLoading,
    isError: error,
  };
}

/**
 * Hook for admin bookings page with automatic refresh and error retry
 */
export function useAdminBookings() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/bookings/list',
    fetcher,
    {
      revalidateOnFocus: true, // Refresh when window regains focus
      revalidateOnReconnect: true, // Refresh when connection restored
      dedupingInterval: 3000, // Dedupe requests within 3 seconds
      refreshInterval: 15000, // Auto-refresh every 15 seconds for admin
      shouldRetryOnError: true, // Retry on error
      errorRetryCount: 3, // Retry up to 3 times
      errorRetryInterval: 1000, // Wait 1s between retries
    }
  );

  return {
    bookings: data || [],
    isLoading,
    isError: error,
    mutate, // Manual revalidation function
  };
}

/**
 * Hook for payment logs page with automatic refresh and error retry
 */
export function usePaymentLogs() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/payment-logs',
    fetcher,
    {
      revalidateOnFocus: true, // Refresh when window regains focus
      revalidateOnReconnect: true, // Refresh when connection restored
      dedupingInterval: 3000, // Dedupe requests within 3 seconds
      refreshInterval: 20000, // Auto-refresh every 20 seconds
      shouldRetryOnError: true, // Retry on error
      errorRetryCount: 3, // Retry up to 3 times
      errorRetryInterval: 1000, // Wait 1s between retries
    }
  );

  return {
    bookings: data || [],
    isLoading,
    isError: error,
    mutate, // Manual revalidation function
  };
}

/**
 * Hook for admin users page with automatic refresh
 */
export function useAdminUsers() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/admin/users',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe for 5 seconds
      refreshInterval: 30000, // Auto-refresh every 30 seconds
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  return {
    users: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook for admin games page (rarely changes)
 */
export function useAdminGames() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/games/list',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Dedupe for 1 minute
      refreshInterval: 0, // No auto-refresh
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  return {
    games: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}
