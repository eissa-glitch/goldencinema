import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TABLES = [
  { name: "movies", label: "الأفلام" },
  { name: "artists", label: "الفنانين" },
  { name: "movie_artists", label: "ربط الأفلام بالفنانين" },
  { name: "movie_gallery", label: "معرض صور الأفلام" },
  { name: "artist_gallery", label: "معرض صور الفنانين" },
  { name: "movie_articles", label: "مقالات الأفلام" },
  { name: "artist_articles", label: "مقالات الفنانين" },
  { name: "news_ticker", label: "شريط الأخبار" },
  { name: "site_content", label: "محتوى الموقع" },
  { name: "user_roles", label: "أدوار المستخدمين" },
] as const;

type TableName = typeof TABLES[number]["name"];

const COLUMN_MAP: Record<TableName, string[]> = {
  movies: ["id", "title", "year", "director", "duration", "rating", "synopsis", "poster", "genre", "created_at", "updated_at"],
  artists: ["id", "name", "image", "biography", "birth_year", "death_year", "role", "created_at", "updated_at"],
  movie_artists: ["id", "movie_id", "artist_id", "role"],
  movie_gallery: ["id", "movie_id", "image_url", "caption", "created_at"],
  artist_gallery: ["id", "artist_id", "image_url", "caption", "created_at"],
  movie_articles: ["id", "movie_id", "title", "content", "source", "image_url", "published_date", "created_at", "updated_at"],
  artist_articles: ["id", "artist_id", "title", "content", "source", "image_url", "published_date", "created_at", "updated_at"],
  news_ticker: ["id", "content", "is_active", "display_order", "created_at", "updated_at"],
  site_content: ["id", "content_key", "content_value", "content_type", "description", "created_at", "updated_at"],
  user_roles: ["id", "user_id", "role", "created_at"],
};

const escapeSQL = (value: unknown): string => {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const items = value.map((v) => `'${String(v).replace(/'/g, "''")}'`).join(", ");
    return `ARRAY[${items}]::text[]`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
};

const DatabaseExport = () => {
  const [selectedTables, setSelectedTables] = useState<Set<string>>(
    new Set(TABLES.map((t) => t.name))
  );
  const [isExporting, setIsExporting] = useState(false);

  const toggleTable = (name: string) => {
    setSelectedTables((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedTables.size === TABLES.length) {
      setSelectedTables(new Set());
    } else {
      setSelectedTables(new Set(TABLES.map((t) => t.name)));
    }
  };

  const exportDatabase = async () => {
    if (selectedTables.size === 0) {
      toast.error("يرجى اختيار جدول واحد على الأقل");
      return;
    }

    setIsExporting(true);
    const sqlParts: string[] = [];

    sqlParts.push("-- ===========================================");
    sqlParts.push("-- تصدير قاعدة بيانات الأرشيف السينمائي");
    sqlParts.push(`-- تاريخ التصدير: ${new Date().toLocaleString("ar-EG")}`);
    sqlParts.push("-- ===========================================\n");

    try {
      for (const table of TABLES) {
        if (!selectedTables.has(table.name)) continue;

        const { data, error } = await supabase
          .from(table.name)
          .select("*");

        if (error) {
          console.error(`Error fetching ${table.name}:`, error);
          sqlParts.push(`-- خطأ في تصدير جدول ${table.name}: ${error.message}\n`);
          continue;
        }

        const columns = COLUMN_MAP[table.name];

        sqlParts.push(`-- -------------------------------------------`);
        sqlParts.push(`-- جدول: ${table.name} (${table.label})`);
        sqlParts.push(`-- عدد السجلات: ${data?.length || 0}`);
        sqlParts.push(`-- -------------------------------------------`);

        if (!data || data.length === 0) {
          sqlParts.push(`-- لا توجد بيانات في هذا الجدول\n`);
          continue;
        }

        // Delete existing data first
        sqlParts.push(`DELETE FROM public.${table.name};`);

        // Generate INSERT statements
        for (const row of data) {
          const values = columns.map((col) => escapeSQL(row[col]));
          sqlParts.push(
            `INSERT INTO public.${table.name} (${columns.join(", ")}) VALUES (${values.join(", ")});`
          );
        }

        sqlParts.push(""); // empty line between tables
      }

      const sqlContent = sqlParts.join("\n");
      const blob = new Blob([sqlContent], { type: "application/sql;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cinema_archive_export_${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("تم تصدير قاعدة البيانات بنجاح");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("فشل في تصدير قاعدة البيانات");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          تصدير قاعدة البيانات
        </CardTitle>
        <CardDescription>
          تصدير بيانات الموقع كملف SQL كامل يمكن استيراده لاحقاً
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">اختر الجداول للتصدير:</Label>
            <Button variant="ghost" size="sm" onClick={toggleAll}>
              {selectedTables.size === TABLES.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TABLES.map((table) => (
              <div
                key={table.name}
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={table.name}
                  checked={selectedTables.has(table.name)}
                  onCheckedChange={() => toggleTable(table.name)}
                />
                <Label htmlFor={table.name} className="cursor-pointer text-sm">
                  {table.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={exportDatabase}
          disabled={isExporting || selectedTables.size === 0}
          className="w-full"
          size="lg"
        >
          {isExporting ? (
            <>
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جاري التصدير...
            </>
          ) : (
            <>
              <Download className="ml-2 h-5 w-5" />
              تصدير ملف SQL ({selectedTables.size} جدول)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DatabaseExport;
