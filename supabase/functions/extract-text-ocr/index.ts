import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AUTHORIZED_EMAIL = "michaelmounir396@gmail.com";

const SYSTEM_PROMPT = `أنت خبير في استخراج النصوص من الصور (OCR) وتصحيح الأخطاء اللغوية العربية.

مهمتك:
1. استخراج كل النص الموجود في الصورة بدقة عالية
2. تصحيح أي أخطاء إملائية أو نحوية في النص المستخرج
3. الحفاظ على التنسيق الأصلي للنص (فقرات، عناوين)
4. إذا لم تجد نصاً في الصورة، أرجع رسالة توضح ذلك

أرجع النص المستخرج والمصحح فقط، بدون أي شرح إضافي.`;

const USER_PROMPT = "استخرج النص العربي من هذه الصورة وصححه لغوياً:";

async function fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error("فشل في تحميل الصورة");
  const buffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const mimeType = response.headers.get("content-type") || "image/png";
  return { base64, mimeType };
}

function detectApiType(url: string): string {
  if (!url) return "lovable";
  if (url.includes("generativelanguage.googleapis.com")) return "google-genai";
  if (url.includes("vision.googleapis.com")) return "google-vision";
  if (url.includes("cognitiveservices.azure.com")) return "azure";
  if (url.includes("api.ocr.space")) return "ocrspace";
  return "openai-compatible";
}

// Google Generative Language API (Gemini)
async function callGoogleGenAI(apiUrl: string, apiKey: string, imageUrl: string): Promise<string> {
  const googleApiUrl = apiUrl.replace(/models\/[^:]+:/, "models/gemini-2.0-flash:");
  const { base64, mimeType } = await fetchImageAsBase64(imageUrl);

  const response = await fetch(`${googleApiUrl}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: `${SYSTEM_PROMPT}\n\n${USER_PROMPT}` },
          { inline_data: { mime_type: mimeType, data: base64 } }
        ]
      }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google GenAI error:", response.status, errorText);
    if (response.status === 429) throw { status: 429, message: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" };
    throw new Error(`Google API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

// Google Cloud Vision API
async function callGoogleVision(apiUrl: string, apiKey: string, imageUrl: string): Promise<string> {
  const { base64 } = await fetchImageAsBase64(imageUrl);

  const endpoint = apiUrl.includes("?") ? apiUrl : `${apiUrl}?key=${apiKey}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{
        image: { content: base64 },
        features: [{ type: "TEXT_DETECTION" }],
        imageContext: { languageHints: ["ar", "en"] }
      }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google Vision error:", response.status, errorText);
    if (response.status === 429) throw { status: 429, message: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" };
    throw new Error(`Google Vision error: ${response.status}`);
  }

  const data = await response.json();
  return data.responses?.[0]?.fullTextAnnotation?.text || data.responses?.[0]?.textAnnotations?.[0]?.description || "";
}

// Azure Computer Vision
async function callAzureVision(apiUrl: string, apiKey: string, imageUrl: string): Promise<string> {
  // Azure Read API - submit for analysis
  const analyzeUrl = apiUrl.endsWith("/") ? `${apiUrl}read/analyze` : `${apiUrl}/read/analyze`;
  
  const submitResponse = await fetch(`${analyzeUrl}?api-version=2023-04-01-preview`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: imageUrl }),
  });

  if (!submitResponse.ok) {
    const errorText = await submitResponse.text();
    console.error("Azure submit error:", submitResponse.status, errorText);
    if (submitResponse.status === 429) throw { status: 429, message: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" };
    throw new Error(`Azure Vision error: ${submitResponse.status}`);
  }

  const operationLocation = submitResponse.headers.get("Operation-Location");
  if (!operationLocation) throw new Error("Azure did not return operation location");

  // Poll for results
  let result: any = null;
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 1500));
    const pollResponse = await fetch(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
    });
    result = await pollResponse.json();
    if (result.status === "succeeded") break;
    if (result.status === "failed") throw new Error("Azure OCR failed");
  }

  if (!result || result.status !== "succeeded") throw new Error("Azure OCR timed out");

  // Extract text from read results
  const lines: string[] = [];
  result.analyzeResult?.readResults?.forEach((page: any) => {
    page.lines?.forEach((line: any) => {
      lines.push(line.text);
    });
  });
  return lines.join("\n");
}

// OCR.space API
async function callOcrSpace(apiUrl: string, apiKey: string, imageUrl: string): Promise<string> {
  const endpoint = apiUrl || "https://api.ocr.space/parse/image";

  const formData = new FormData();
  formData.append("url", imageUrl);
  formData.append("language", "ara");
  formData.append("isOverlayRequired", "false");
  formData.append("OCREngine", "2");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { apikey: apiKey },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OCR.space error:", response.status, errorText);
    if (response.status === 429) throw { status: 429, message: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" };
    throw new Error(`OCR.space error: ${response.status}`);
  }

  const data = await response.json();
  if (data.IsErroredOnProcessing) {
    throw new Error(data.ErrorMessage?.[0] || "OCR.space processing error");
  }

  return data.ParsedResults?.map((r: any) => r.ParsedText).join("\n") || "";
}

// OpenAI-compatible API (default / Lovable AI)
async function callOpenAICompatible(apiUrl: string, apiKey: string, imageUrl: string): Promise<string> {
  const url = apiUrl || "https://ai.gateway.lovable.dev/v1/chat/completions";
  const key = apiKey || Deno.env.get("LOVABLE_API_KEY");

  if (!key) throw new Error("لم يتم تكوين مفتاح API للـ OCR. أضفه من إعدادات API في لوحة التحكم.");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: USER_PROMPT },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI-compatible error:", response.status, errorText);
    if (response.status === 429) throw { status: 429, message: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" };
    if (response.status === 402) throw { status: 402, message: "يرجى إضافة رصيد إلى حساب AI" };
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "يجب تسجيل الدخول أولاً" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "جلسة غير صالحة" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (user.email !== AUTHORIZED_EMAIL) {
      return new Response(JSON.stringify({ error: "غير مصرح لك" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Image URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Read API settings
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: apiSettings } = await adminClient
      .from("site_content")
      .select("content_key, content_value")
      .in("content_key", ["api_url_ocr", "api_key_ocr"]);

    const settingsMap: Record<string, string> = {};
    apiSettings?.forEach((s: any) => { settingsMap[s.content_key] = s.content_value; });

    const customApiUrl = settingsMap["api_url_ocr"] || "";
    const customApiKey = settingsMap["api_key_ocr"] || "";
    const apiType = detectApiType(customApiUrl);

    console.log(`OCR request: type=${apiType}, user=${user.email}, image=${imageUrl}`);

    let extractedText = "";

    switch (apiType) {
      case "google-genai":
        extractedText = await callGoogleGenAI(customApiUrl, customApiKey, imageUrl);
        break;
      case "google-vision":
        extractedText = await callGoogleVision(customApiUrl, customApiKey, imageUrl);
        break;
      case "azure":
        extractedText = await callAzureVision(customApiUrl, customApiKey, imageUrl);
        break;
      case "ocrspace":
        extractedText = await callOcrSpace(customApiUrl, customApiKey, imageUrl);
        break;
      default:
        extractedText = await callOpenAICompatible(customApiUrl, customApiKey, imageUrl);
        break;
    }

    console.log("Text extracted successfully, type:", apiType);

    return new Response(
      JSON.stringify({ success: true, text: extractedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("OCR error:", error);

    if (error?.status) {
      return new Response(JSON.stringify({ error: error.message }),
        { status: error.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to extract text" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
