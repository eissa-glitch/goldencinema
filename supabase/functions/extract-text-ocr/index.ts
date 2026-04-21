import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AUTHORIZED_EMAIL = "michaelmounir396@gmail.com";
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 1500;
const MAX_RETRY_DELAY_MS = 10000;

const SYSTEM_PROMPT = `أنت خبير في استخراج النصوص من الصور (OCR) بجميع اللغات (العربية، الإنجليزية، وغيرها) وتصحيح الأخطاء اللغوية.

مهمتك:
1. استخراج كل النص الموجود في الصورة بدقة عالية بأي لغة كان (عربي، إنجليزي، أرقام، رموز)
2. تصحيح أي أخطاء إملائية أو نحوية في النص المستخرج مع الحفاظ على اللغة الأصلية لكل جزء
3. الحفاظ على التنسيق الأصلي للنص (فقرات، عناوين، ترتيب اللغات المختلطة)
4. لا تترجم النص، فقط استخرجه كما هو بلغته الأصلية
5. إذا لم تجد نصاً في الصورة، أرجع رسالة توضح ذلك

أرجع النص المستخرج والمصحح فقط، بدون أي شرح إضافي.`;

const USER_PROMPT = "استخرج كل النص من هذه الصورة بجميع اللغات الموجودة فيها (عربي، إنجليزي، إلخ) وصححه لغوياً مع الحفاظ على اللغة الأصلية:";

class HttpError extends Error {
  status: number;
  retryAfterMs?: number;

  constructor(status: number, message: string, retryAfterMs?: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseRetryAfterMs(headers: Headers, errorText = ""): number | undefined {
  const retryAfterHeader = headers.get("retry-after");

  if (retryAfterHeader) {
    const retryAfterSeconds = Number(retryAfterHeader);
    if (Number.isFinite(retryAfterSeconds)) {
      return Math.max(retryAfterSeconds * 1000, 0);
    }

    const retryDate = Date.parse(retryAfterHeader);
    if (!Number.isNaN(retryDate)) {
      return Math.max(retryDate - Date.now(), 0);
    }
  }

  const match = errorText.match(/retry(?: in)?\s+([\d.]+)s/i) || errorText.match(/"retryDelay"\s*:\s*"([\d.]+)s"/i);
  if (!match) {
    return undefined;
  }

  const retryAfterSeconds = Number(match[1]);
  return Number.isFinite(retryAfterSeconds) ? Math.max(retryAfterSeconds * 1000, 0) : undefined;
}

function getRetryDelayMs(attempt: number, retryAfterMs?: number): number {
  if (retryAfterMs && retryAfterMs > 0) {
    return Math.min(retryAfterMs, MAX_RETRY_DELAY_MS);
  }

  return Math.min(DEFAULT_RETRY_DELAY_MS * 2 ** (attempt - 1), MAX_RETRY_DELAY_MS);
}

function buildUrlWithApiKey(url: string, apiKey: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}key=${encodeURIComponent(apiKey)}`;
}

function detectApiType(url: string): string {
  if (!url) return "lovable";
  if (url.includes("generativelanguage.googleapis.com")) return "google-genai";
  if (url.includes("vision.googleapis.com")) return "google-vision";
  if (url.includes("cognitiveservices.azure.com")) return "azure";
  if (url.includes("api.ocr.space")) return "ocrspace";
  return "openai-compatible";
}

function isRateLimitError(error: unknown): error is HttpError {
  return error instanceof HttpError && error.status === 429;
}

async function withRateLimitRetry<T>(provider: string, callback: () => Promise<T>, maxAttempts = MAX_RETRY_ATTEMPTS): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await callback();
    } catch (error) {
      if (!isRateLimitError(error) || attempt === maxAttempts) {
        throw error;
      }

      const delay = getRetryDelayMs(attempt, error.retryAfterMs);
      console.warn(`Rate limit from ${provider}; retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
      await sleep(delay);
    }
  }

  throw new Error("OCR retry attempts exceeded");
}

async function fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error("فشل في تحميل الصورة");
  }

  const buffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const mimeType = response.headers.get("content-type") || "image/png";

  return { base64, mimeType };
}

async function callGoogleGenAI(apiUrl: string, apiKey: string, imageUrl: string): Promise<string> {
  if (!apiKey) {
    throw new Error("لم يتم تكوين مفتاح Google Gemini");
  }

  const googleApiUrl = apiUrl.replace(/models\/[^:]+:/, "models/gemini-2.0-flash:");
  const { base64, mimeType } = await fetchImageAsBase64(imageUrl);

  const response = await fetch(buildUrlWithApiKey(googleApiUrl, apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${SYSTEM_PROMPT}\n\n${USER_PROMPT}` },
            { inline_data: { mime_type: mimeType, data: base64 } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google GenAI error:", response.status, errorText);

    if (response.status === 429) {
      throw new HttpError(429, "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً", parseRetryAfterMs(response.headers, errorText));
    }

    throw new Error(`Google API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGoogleVision(apiUrl: string, apiKey: string, imageUrl: string): Promise<string> {
  if (!apiKey) {
    throw new Error("لم يتم تكوين مفتاح Google Vision");
  }

  const { base64 } = await fetchImageAsBase64(imageUrl);
  const endpoint = buildUrlWithApiKey(apiUrl, apiKey);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64 },
          features: [{ type: "TEXT_DETECTION" }],
          imageContext: { languageHints: ["ar", "en"] },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Google Vision error:", response.status, errorText);

    if (response.status === 429) {
      throw new HttpError(429, "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً", parseRetryAfterMs(response.headers, errorText));
    }

    throw new Error(`Google Vision error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.responses?.[0]?.fullTextAnnotation?.text || data.responses?.[0]?.textAnnotations?.[0]?.description || "";
}

async function callAzureVision(apiUrl: string, apiKey: string, imageUrl: string): Promise<string> {
  if (!apiKey) {
    throw new Error("لم يتم تكوين مفتاح Azure Vision");
  }

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

    if (submitResponse.status === 429) {
      throw new HttpError(429, "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً", parseRetryAfterMs(submitResponse.headers, errorText));
    }

    throw new Error(`Azure Vision error: ${submitResponse.status} - ${errorText}`);
  }

  const operationLocation = submitResponse.headers.get("Operation-Location");
  if (!operationLocation) {
    throw new Error("Azure did not return operation location");
  }

  let result: any = null;

  for (let i = 0; i < 10; i++) {
    await sleep(1500);

    const pollResponse = await fetch(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
    });

    if (!pollResponse.ok) {
      const errorText = await pollResponse.text();
      console.error("Azure poll error:", pollResponse.status, errorText);

      if (pollResponse.status === 429) {
        throw new HttpError(429, "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً", parseRetryAfterMs(pollResponse.headers, errorText));
      }

      throw new Error(`Azure polling error: ${pollResponse.status} - ${errorText}`);
    }

    result = await pollResponse.json();
    if (result.status === "succeeded") {
      break;
    }
    if (result.status === "failed") {
      throw new Error("Azure OCR failed");
    }
  }

  if (!result || result.status !== "succeeded") {
    throw new Error("Azure OCR timed out");
  }

  const lines: string[] = [];
  result.analyzeResult?.readResults?.forEach((page: any) => {
    page.lines?.forEach((line: any) => {
      lines.push(line.text);
    });
  });

  return lines.join("\n");
}

async function callOcrSpace(apiUrl: string, apiKey: string, imageUrl: string): Promise<string> {
  if (!apiKey) {
    throw new Error("لم يتم تكوين مفتاح OCR.space");
  }

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

    if (response.status === 429) {
      throw new HttpError(429, "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً", parseRetryAfterMs(response.headers, errorText));
    }

    throw new Error(`OCR.space error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (data.IsErroredOnProcessing) {
    throw new Error(data.ErrorMessage?.[0] || "OCR.space processing error");
  }

  return data.ParsedResults?.map((result: any) => result.ParsedText).join("\n") || "";
}

async function callOpenAICompatible(apiUrl: string, apiKey: string, imageUrl: string): Promise<string> {
  const url = apiUrl || "https://ai.gateway.lovable.dev/v1/chat/completions";
  const key = apiKey || Deno.env.get("LOVABLE_API_KEY");

  if (!key) {
    throw new Error("لم يتم تكوين مفتاح API للـ OCR");
  }

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
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI-compatible error:", response.status, errorText);

    if (response.status === 429) {
      throw new HttpError(429, "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً", parseRetryAfterMs(response.headers, errorText));
    }

    if (response.status === 402) {
      throw new HttpError(402, "يرجى إضافة رصيد إلى حساب AI");
    }

    throw new Error(`AI gateway error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function extractWithProvider(apiType: string, apiUrl: string, apiKey: string, imageUrl: string): Promise<string> {
  switch (apiType) {
    case "google-genai":
      return callGoogleGenAI(apiUrl, apiKey, imageUrl);
    case "google-vision":
      return callGoogleVision(apiUrl, apiKey, imageUrl);
    case "azure":
      return callAzureVision(apiUrl, apiKey, imageUrl);
    case "ocrspace":
      return callOcrSpace(apiUrl, apiKey, imageUrl);
    default:
      return callOpenAICompatible(apiUrl, apiKey, imageUrl);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "يجب تسجيل الدخول أولاً" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "جلسة غير صالحة، يرجى تسجيل الدخول مجدداً" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (user.email !== AUTHORIZED_EMAIL) {
      return new Response(JSON.stringify({ error: "غير مصرح لك باستخدام هذه الخاصية" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { imageUrl } = await req.json();
    if (!imageUrl || typeof imageUrl !== "string") {
      return new Response(JSON.stringify({ error: "Image URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: apiSettings } = await adminClient
      .from("site_content")
      .select("content_key, content_value")
      .in("content_key", ["api_url_ocr", "api_key_ocr"]);

    const settingsMap: Record<string, string> = {};
    apiSettings?.forEach((setting: any) => {
      settingsMap[setting.content_key] = setting.content_value;
    });

    const customApiUrl = settingsMap["api_url_ocr"] || "";
    const customApiKey = settingsMap["api_key_ocr"] || "";
    const hasCustomProvider = Boolean(customApiUrl);
    const apiType = detectApiType(customApiUrl);

    console.log(`OCR request: type=${apiType}, customProvider=${hasCustomProvider}, user=${user.email}, image=${imageUrl}`);

    let extractedText = "";

    if (hasCustomProvider) {
      try {
        extractedText = await withRateLimitRetry(apiType, () => extractWithProvider(apiType, customApiUrl, customApiKey, imageUrl));
      } catch (error) {
        if (!isRateLimitError(error)) {
          throw error;
        }

        console.warn(`Provider ${apiType} hit rate limit, falling back to Lovable AI`);
        extractedText = await withRateLimitRetry("lovable-ai", () => callOpenAICompatible("", "", imageUrl), 2);
      }
    } else {
      extractedText = await withRateLimitRetry("lovable-ai", () => callOpenAICompatible("", "", imageUrl), 2);
    }

    console.log(`Text extracted successfully using ${hasCustomProvider ? apiType : "lovable-ai"}`);

    return new Response(JSON.stringify({ success: true, text: extractedText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("OCR error:", error);

    if (error instanceof HttpError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to extract text",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});