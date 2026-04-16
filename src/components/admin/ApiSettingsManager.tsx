import { useState } from "react";
import { useSiteContent, useUpdateContent, useCreateContent, useDeleteContent } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Eye, EyeOff, Save, Globe, Key } from "lucide-react";
import { toast } from "sonner";

interface ApiSetting {
  key: string;
  label: string;
  value: string;
  isSecret: boolean;
}

const OCR_PROVIDERS = [
  { value: "custom", label: "رابط مخصص", placeholder: "https://api.example.com/v1" },
  { value: "lovable", label: "Lovable AI (افتراضي)", url: "" },
  { value: "google-genai", label: "Google Gemini", url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" },
  { value: "google-vision", label: "Google Cloud Vision", url: "https://vision.googleapis.com/v1/images:annotate" },
  { value: "azure", label: "Azure Computer Vision", placeholder: "https://YOUR_RESOURCE.cognitiveservices.azure.com/vision/v3.2" },
  { value: "ocrspace", label: "OCR.space", url: "https://api.ocr.space/parse/image" },
  { value: "openai", label: "OpenAI / متوافق", url: "https://api.openai.com/v1/chat/completions" },
  { value: "openrouter", label: "OpenRouter", url: "https://openrouter.ai/api/v1/chat/completions" },
  { value: "together", label: "Together AI", url: "https://api.together.xyz/v1/chat/completions" },
];

const ApiSettingsManager = () => {
  const { data: siteContent, isLoading } = useSiteContent();
  const updateContent = useUpdateContent();
  const createContent = useCreateContent();
  const deleteContent = useDeleteContent();

  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newApiKey, setNewApiKey] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Filter API settings from site_content (keys starting with "api_")
  const apiSettings: ApiSetting[] = siteContent?.list
    ?.filter((item) => item.content_key.startsWith("api_"))
    ?.map((item) => ({
      key: item.content_key,
      label: item.description || item.content_key.replace("api_", "").replace(/_/g, " "),
      value: item.content_value,
      isSecret: item.content_key.includes("_key_"),
    })) || [];

  const toggleVisibility = (key: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleAddApi = () => {
    if (!newLabel.trim()) {
      toast.error("يرجى إدخال اسم الخدمة");
      return;
    }

    const sanitizedLabel = newLabel.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

    const urlKey = `api_url_${sanitizedLabel}`;
    const keyKey = `api_key_${sanitizedLabel}`;

    // Create URL entry
    if (newUrl.trim()) {
      createContent.mutate({
        key: urlKey,
        value: newUrl.trim(),
        description: `${newLabel} - رابط API`,
      });
    }

    // Create API key entry
    if (newApiKey.trim()) {
      createContent.mutate({
        key: keyKey,
        value: newApiKey.trim(),
        description: `${newLabel} - مفتاح API`,
      });
    }

    if (!newUrl.trim() && !newApiKey.trim()) {
      toast.error("يرجى إدخال رابط أو مفتاح API على الأقل");
      return;
    }

    setNewLabel("");
    setNewUrl("");
    setNewApiKey("");
  };

  const handleUpdate = (key: string, value: string) => {
    updateContent.mutate({ key, value });
  };

  const handleDelete = (key: string) => {
    deleteContent.mutate(key);
  };

  // Group settings by service name
  const groupedSettings: Record<string, ApiSetting[]> = {};
  apiSettings.forEach((setting) => {
    const parts = setting.key.replace("api_", "").split("_");
    // Remove url/key prefix to get service name
    const type = parts[0]; // url or key
    const serviceName = parts.slice(1).join("_");
    if (!groupedSettings[serviceName]) {
      groupedSettings[serviceName] = [];
    }
    groupedSettings[serviceName].push(setting);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New API */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            إضافة خدمة API جديدة
          </CardTitle>
          <CardDescription>
            أضف رابط ومفتاح API لخدمة خارجية جديدة.
            <br />
            <span className="text-xs text-primary/80 mt-1 inline-block">
              💡 مثال: أضف خدمة باسم <strong>ocr</strong> وسيتم حفظ الإعدادات بالمفاتيح <code className="bg-muted px-1 rounded">api_url_ocr</code> و <code className="bg-muted px-1 rounded">api_key_ocr</code> وستستخدمها وظيفة الـ OCR تلقائياً بدلاً من القيم الافتراضية.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>اسم الخدمة (بالإنجليزية)</Label>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="مثال: openai, stripe, telegram"
              dir="ltr"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                رابط API (URL)
              </Label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                مفتاح API (Key)
              </Label>
              <Input
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="sk-..."
                dir="ltr"
              />
            </div>
          </div>
          <Button onClick={handleAddApi} className="w-full">
            <Plus className="ml-2 h-4 w-4" />
            إضافة الخدمة
          </Button>
        </CardContent>
      </Card>

      {/* Existing API Settings */}
      {Object.keys(groupedSettings).length > 0 ? (
        Object.entries(groupedSettings).map(([serviceName, settings]) => (
          <Card key={serviceName}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">
                {serviceName.replace(/_/g, " ")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.key} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 min-w-[100px]">
                    {setting.isSecret ? (
                      <Key className="h-4 w-4 text-primary" />
                    ) : (
                      <Globe className="h-4 w-4 text-accent-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {setting.isSecret ? "مفتاح" : "رابط"}
                    </span>
                  </div>
                  <div className="flex-1 relative">
                    <Input
                      type={setting.isSecret && !visibleKeys.has(setting.key) ? "password" : "text"}
                      defaultValue={setting.value}
                      dir="ltr"
                      onBlur={(e) => {
                        if (e.target.value !== setting.value) {
                          handleUpdate(setting.key, e.target.value);
                        }
                      }}
                    />
                  </div>
                  {setting.isSecret && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVisibility(setting.key)}
                    >
                      {visibleKeys.has(setting.key) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(setting.key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            لا توجد إعدادات API حالياً. أضف خدمة جديدة من الأعلى.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiSettingsManager;
