import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyState } from "@/lib/progress.functions";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "child" | "parent" | "counselor";

export function useMyRole() {
  const { session, loading: authLoading } = useAuth();
  const fetchState = useServerFn(getMyState);
  const { data, isLoading } = useQuery({
    queryKey: ["my-state"],
    queryFn: () => fetchState(),
    enabled: !!session,
  });
  const role = (data?.roles?.[0] as AppRole | undefined) ?? null;
  return {
    session,
    role,
    loading: authLoading || (!!session && isLoading),
  };
}