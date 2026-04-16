import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AUTHORIZED_EMAIL = "michaelmounir396@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "يجب تسجيل الدخول أولاً" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "جلسة غير صالحة، يرجى تسجيل الدخول مجدداً" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (user.email !== AUTHORIZED_EMAIL) {
      return new Response(
        JSON.stringify({ error: "غير مصرح لك باستخدام هذه الخاصية" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Read API settings from site_content using service role (bypasses RLS)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: apiSettings } = await adminClient
      .from("site_content")
      .select("content_key, content_value")
      .in("content_key", ["api_url_ocr", "api_key_ocr"]);

    const settingsMap: Record<string, string> = {};
    apiSettings?.forEach((s: any) => {
      settingsMap[s.content_key] = s.content_value;
    });

    const customApiUrl = settingsMap["api_url_ocr"];
    const customApiKey = settingsMap["api_key_ocr"];
    
    // Determine if using Google native API or OpenAI-compatible API
    const isGoogleNative = customApiUrl && customApiUrl.includes("generativelanguage.googleapis.com");
    
    const systemPrompt = `أنت خبير في استخراج النصوص من الصور (OCR) وتصحيح الأخطاء اللغوية العربية.
            
مهمتك:
1. استخراج كل النص الموجود في الصورة بدقة عالية
2. تصحيح أي أخطاء إملائية أو نحوية في النص المستخرج
3. الحفاظ على التنسيق الأصلي للنص (فقرات، عناوين)
4. إذا لم تجد نصاً في الصورة، أرجع رسالة توضح ذلك

أرجع النص المستخرج والمصحح فقط، بدون أي شرح إضافي.`;

    const userPrompt = "استخرج النص العربي من هذه الصورة وصححه لغوياً:";

    // Auto-fix deprecated model names in Google API URL
    let googleApiUrl = customApiUrl || "";
    if (isGoogleNative) {
      // Replace deprecated models with gemini-2.0-flash (supports vision)
      googleApiUrl = googleApiUrl.replace(
        /models\/[^:]+:/,
        "models/gemini-2.0-flash:"
      );
    }

    console.log("Extracting text from image:", imageUrl, "by user:", user.email);
    console.log("Using Google Native API:", isGoogleNative);

    let extractedText = "";

    if (isGoogleNative && customApiKey) {
      // Google Generative Language API (native format)
      const apiUrlWithKey = `${googleApiUrl}?key=${customApiKey}`;
      
      console.log("Using Google native API URL:", googleApiUrl);

      // Fetch image and convert to base64 for Google's API
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("فشل في تحميل الصورة");
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
      const mimeType = imageResponse.headers.get("content-type") || "image/png";

      const googleResponse = await fetch(apiUrlWithKey, {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("فشل في تحميل الصورة");
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
      const mimeType = imageResponse.headers.get("content-type") || "image/png";

      const googleResponse = await fetch(apiUrlWithKey, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\n${userPrompt}` },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  }
                }
              ]
            }
          ],
        }),
      });

      if (!googleResponse.ok) {
        const errorText = await googleResponse.text();
        console.error("Google API error:", googleResponse.status, errorText);
        
        if (googleResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        throw new Error(`Google API error: ${googleResponse.status} - ${errorText}`);
      }

      const googleData = await googleResponse.json();
      extractedText = googleData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    } else {
      // OpenAI-compatible API (default: Lovable AI Gateway)
      const apiUrl = customApiUrl || "https://ai.gateway.lovable.dev/v1/chat/completions";
      const apiKey = customApiKey || Deno.env.get("LOVABLE_API_KEY");

      if (!apiKey) {
        throw new Error("لم يتم تكوين مفتاح API للـ OCR. أضفه من إعدادات API في لوحة التحكم.");
      }

      console.log("Using OpenAI-compatible API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: userPrompt },
                { type: "image_url", image_url: { url: imageUrl } }
              ]
            }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: "تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً" }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "يرجى إضافة رصيد إلى حساب AI" }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      extractedText = data.choices?.[0]?.message?.content || "";
    }

    console.log("Text extracted successfully");

    return new Response(
      JSON.stringify({ success: true, text: extractedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("OCR error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to extract text" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
