import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: authError } = await anonClient.auth.getUser();
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, ...params } = await req.json();

    if (action === "list") {
      // List all users
      const { data, error } = await adminClient.auth.admin.listUsers({
        page: params.page || 1,
        perPage: params.perPage || 50,
      });
      if (error) throw error;

      // Get all roles
      const { data: roles } = await adminClient
        .from("user_roles")
        .select("*");

      const rolesMap: Record<string, string> = {};
      (roles || []).forEach((r: any) => {
        rolesMap[r.user_id] = r.role;
      });

      const users = data.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        role: rolesMap[u.id] || "user",
        email_confirmed_at: u.email_confirmed_at,
      }));

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "set_role") {
      const { userId, role } = params;
      if (!userId || !role) throw new Error("userId and role required");

      // Don't allow removing own admin role
      if (userId === caller.id && role !== "admin") {
        return new Response(JSON.stringify({ error: "لا يمكنك إزالة صلاحياتك الخاصة" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Upsert role
      const { data: existing } = await adminClient
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        await adminClient
          .from("user_roles")
          .update({ role })
          .eq("user_id", userId);
      } else {
        await adminClient
          .from("user_roles")
          .insert({ user_id: userId, role });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_user") {
      const { userId } = params;
      if (!userId) throw new Error("userId required");

      if (userId === caller.id) {
        return new Response(JSON.stringify({ error: "لا يمكنك حذف حسابك الخاص" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error } = await adminClient.auth.admin.deleteUser(userId);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_user") {
      const { email, password, role } = params;
      if (!email || !password) throw new Error("email and password required");

      const { data: newUser, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) throw error;

      if (role && role !== "user") {
        await adminClient
          .from("user_roles")
          .insert({ user_id: newUser.user.id, role });
      }

      return new Response(JSON.stringify({ success: true, user: newUser.user }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
