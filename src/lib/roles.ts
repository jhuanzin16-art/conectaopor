import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type AppRole = "super_admin" | "admin" | "editor";

export const rotuloRole: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  editor: "Editor",
};

export function useRoles() {
  const { user } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["roles", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role as AppRole);
    },
  });

  return {
    roles: data,
    loading: isLoading,
    isStaff: data.length > 0,
    isSuperAdmin: data.includes("super_admin"),
    canManageUsers: data.includes("super_admin") || data.includes("admin"),
    isEditorOnly: data.length > 0 && data.every((r) => r === "editor"),
  };
}
