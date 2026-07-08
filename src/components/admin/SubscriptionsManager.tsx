import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Users, Package, XCircle, Edit } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  max_views_per_month: number | null;
  can_access_movies: boolean;
  features: string[];
  sort_order: number;
  is_active: boolean;
}

interface UserRow {
  id: string;
  email: string;
}

interface SubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  notes: string | null;
  subscription_plans?: { name: string } | null;
}

/* ---------- Plans tab ---------- */
const PlansTab = () => {
  const qc = useQueryClient();
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as unknown as Plan[];
    },
  });

  const updatePlan = useMutation({
    mutationFn: async (plan: Plan) => {
      const { error } = await supabase
        .from("subscription_plans")
        .update({
          name: plan.name,
          description: plan.description,
          price: plan.price,
          currency: plan.currency,
          max_views_per_month: plan.max_views_per_month,
          can_access_movies: plan.can_access_movies,
          features: plan.features,
          sort_order: plan.sort_order,
          is_active: plan.is_active,
        })
        .eq("id", plan.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-plans"] });
      qc.invalidateQueries({ queryKey: ["subscription-plans"] });
      toast.success("تم حفظ الباقة");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map((p) => (
        <PlanEditor key={p.id} plan={p} onSave={(x) => updatePlan.mutate(x)} />
      ))}
    </div>
  );
};

const PlanEditor = ({ plan, onSave }: { plan: Plan; onSave: (p: Plan) => void }) => {
  const [local, setLocal] = useState<Plan>({
    ...plan,
    features: Array.isArray(plan.features) ? plan.features : [],
  });
  const featuresText = (local.features || []).join("\n");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{local.name}</span>
          <Switch
            checked={local.is_active}
            onCheckedChange={(v) => setLocal({ ...local, is_active: v })}
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>الاسم</Label>
          <Input
            value={local.name}
            onChange={(e) => setLocal({ ...local, name: e.target.value })}
          />
        </div>
        <div>
          <Label>الوصف</Label>
          <Textarea
            value={local.description || ""}
            onChange={(e) => setLocal({ ...local, description: e.target.value })}
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>السعر</Label>
            <Input
              type="number"
              value={local.price}
              onChange={(e) =>
                setLocal({ ...local, price: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div>
            <Label>العملة</Label>
            <Input
              value={local.currency}
              onChange={(e) => setLocal({ ...local, currency: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label>حد المشاهدات الشهري (فارغ = غير محدود)</Label>
          <Input
            type="number"
            value={local.max_views_per_month ?? ""}
            onChange={(e) =>
              setLocal({
                ...local,
                max_views_per_month:
                  e.target.value === "" ? null : parseInt(e.target.value),
              })
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={local.can_access_movies}
            onCheckedChange={(v) => setLocal({ ...local, can_access_movies: v })}
          />
          <Label>يمكن الوصول للأفلام</Label>
        </div>
        <div>
          <Label>المميزات (سطر لكل ميزة)</Label>
          <Textarea
            value={featuresText}
            onChange={(e) =>
              setLocal({
                ...local,
                features: e.target.value.split("\n").filter((x) => x.trim()),
              })
            }
            rows={4}
          />
        </div>
        <Button onClick={() => onSave(local)} className="w-full">
          <Save className="w-4 h-4 ml-2" />
          حفظ
        </Button>
      </CardContent>
    </Card>
  );
};

/* ---------- Subscribers tab ---------- */
const SubscribersTab = () => {
  const qc = useQueryClient();

  const { data: usersData, isLoading: uLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const r = await supabase.functions.invoke("manage-users", {
        body: { action: "list" },
      });
      if (r.error) throw new Error(r.error.message);
      if (r.data?.error) throw new Error(r.data.error);
      return r.data;
    },
  });
  const users: UserRow[] = usersData?.users || [];

  const { data: subs = [], isLoading: sLoading } = useQuery({
    queryKey: ["admin-subs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans(name)")
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data as unknown as SubscriptionRow[];
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["admin-plans-select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("id, name, price")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as { id: string; name: string; price: number }[];
    },
  });

  const activeSubByUser = new Map<string, SubscriptionRow>();
  subs.forEach((s) => {
    if (
      s.status === "active" &&
      (!s.expires_at || new Date(s.expires_at) > new Date()) &&
      !activeSubByUser.has(s.user_id)
    ) {
      activeSubByUser.set(s.user_id, s);
    }
  });

  const assign = useMutation({
    mutationFn: async ({
      userId,
      planId,
      months,
      notes,
    }: {
      userId: string;
      planId: string;
      months: number;
      notes: string;
    }) => {
      // cancel any existing active
      await supabase
        .from("user_subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", userId)
        .eq("status", "active");

      const expires =
        months > 0
          ? new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString()
          : null;

      const { error } = await supabase.from("user_subscriptions").insert({
        user_id: userId,
        plan_id: planId,
        status: "active",
        started_at: new Date().toISOString(),
        expires_at: expires,
        notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-subs"] });
      toast.success("تم تعيين الباقة");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cancelSub = useMutation({
    mutationFn: async (subId: string) => {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ status: "cancelled" })
        .eq("id", subId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-subs"] });
      toast.success("تم إلغاء الاشتراك");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (uLoading || sLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-right">البريد الإلكتروني</TableHead>
          <TableHead className="text-right">الباقة الحالية</TableHead>
          <TableHead className="text-right">تاريخ الانتهاء</TableHead>
          <TableHead className="text-right">إجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((u) => {
          const sub = activeSubByUser.get(u.id);
          return (
            <TableRow key={u.id}>
              <TableCell dir="ltr" className="text-left font-mono text-sm">
                {u.email}
              </TableCell>
              <TableCell>
                {sub ? (
                  <Badge>{sub.subscription_plans?.name || "—"}</Badge>
                ) : (
                  <Badge variant="secondary">بدون اشتراك</Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {sub?.expires_at
                  ? new Date(sub.expires_at).toLocaleDateString("ar-EG")
                  : sub
                  ? "دائم"
                  : "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <AssignDialog
                    plans={plans}
                    onAssign={(planId, months, notes) =>
                      assign.mutate({ userId: u.id, planId, months, notes })
                    }
                  />
                  {sub && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => cancelSub.mutate(sub.id)}
                      title="إلغاء الاشتراك"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const AssignDialog = ({
  plans,
  onAssign,
}: {
  plans: { id: string; name: string; price: number }[];
  onAssign: (planId: string, months: number, notes: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState(plans[0]?.id || "");
  const [months, setMonths] = useState(1);
  const [notes, setNotes] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="تعيين باقة">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>تعيين باقة</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>الباقة</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — {p.price} EGP
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>المدة</Label>
            <Select
              value={String(months)}
              onValueChange={(v) => setMonths(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">شهر</SelectItem>
                <SelectItem value="3">3 شهور</SelectItem>
                <SelectItem value="6">6 شهور</SelectItem>
                <SelectItem value="12">سنة</SelectItem>
                <SelectItem value="0">دائم (بلا انتهاء)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>ملاحظات</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              if (!planId) return;
              onAssign(planId, months, notes);
              setOpen(false);
            }}
          >
            تفعيل الاشتراك
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ---------- Root ---------- */
const SubscriptionsManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>الباقات والاشتراكات</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="plans">
          <TabsList>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              الباقات
            </TabsTrigger>
            <TabsTrigger value="subs" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              اشتراكات الأعضاء
            </TabsTrigger>
          </TabsList>
          <TabsContent value="plans" className="mt-6">
            <PlansTab />
          </TabsContent>
          <TabsContent value="subs" className="mt-6">
            <SubscribersTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SubscriptionsManager;
