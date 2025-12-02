import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfId, filePath } = await req.json();
    
    console.log(`[parse-pdf] Starting parse for PDF: ${filePath}, ID: ${pdfId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[parse-pdf] Missing Supabase credentials");
      throw new Error("Missing Supabase credentials");
    }

    if (!openaiApiKey) {
      console.error("[parse-pdf] Missing OPENAI_API_KEY");
      throw new Error("Missing OPENAI_API_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download PDF from storage
    console.log(`[parse-pdf] Downloading PDF from storage...`);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("pdfs")
      .download(filePath);

    if (downloadError) {
      console.error("[parse-pdf] Download error:", downloadError);
      throw new Error(`Failed to download PDF: ${downloadError.message}`);
    }

    console.log(`[parse-pdf] PDF downloaded, size: ${fileData.size} bytes`);

    // Convert PDF to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 in chunks to avoid stack overflow
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Pdf = btoa(binary);
    
    console.log(`[parse-pdf] PDF converted to base64, length: ${base64Pdf.length}`);

    // Use OpenAI GPT-4o to extract text from PDF (via vision as image)
    // Note: OpenAI doesn't natively support PDF files, we send as data URL for the model to process
    console.log(`[parse-pdf] Calling OpenAI to extract text...`);
    
    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64Pdf}`,
                  detail: "high"
                }
              },
              {
                type: "text",
                text: `Extrais l'intégralité du texte de ce document PDF. 
                
Instructions importantes:
- Retourne UNIQUEMENT le texte extrait, sans aucun commentaire ni introduction
- Conserve la structure originale du document (titres, paragraphes, listes)
- Indique les numéros de page entre crochets [Page X] au début de chaque nouvelle page
- Ne résume pas, ne modifie pas, ne reformule pas le contenu
- Si le document contient des tableaux, formate-les en texte lisible
- Si certaines parties sont illisibles, indique [Texte illisible]`
              }
            ]
          }
        ],
        max_tokens: 16000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[parse-pdf] OpenAI API error: ${aiResponse.status}`, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (aiResponse.status === 402 || aiResponse.status === 401) {
        throw new Error("Authentication error. Please check your OpenAI API key.");
      }
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log(`[parse-pdf] OpenAI response received`);

    const extractedText = aiData.choices?.[0]?.message?.content;
    
    if (!extractedText) {
      console.error("[parse-pdf] No text extracted from OpenAI response");
      throw new Error("Failed to extract text from PDF");
    }

    console.log(`[parse-pdf] Extracted ${extractedText.length} characters`);

    // Update database with parsed content
    const { error: updateError } = await supabase
      .from("pdf_library")
      .update({
        content: extractedText,
        parsed_at: new Date().toISOString(),
      })
      .eq("id", pdfId);

    if (updateError) {
      console.error("[parse-pdf] Update error:", updateError);
      throw new Error(`Failed to update database: ${updateError.message}`);
    }

    console.log(`[parse-pdf] Successfully parsed PDF ${pdfId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        textLength: extractedText.length,
        message: "PDF parsed successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[parse-pdf] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
