import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SiteEntry {
  category: string;
  siteName: string;
  url: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sites, prompt, useAI } = await req.json();

    if (!sites || !Array.isArray(sites) || sites.length === 0) {
      throw new Error("Sites array is required");
    }

    console.log(`Scraping ${sites.length} sites, AI reformulation: ${useAI}, Custom prompt: ${!!prompt}`);

    const scrapedContent: string[] = [];

    // Scrape each site
    for (const site of sites as SiteEntry[]) {
      try {
        console.log(`Scraping: ${site.siteName} - ${site.url}`);
        
        // Use the URL from the database
        let url = site.url;
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = "https://" + url;
        }

        const websiteResponse = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; ScrapReform/1.0)",
          },
        });

        if (!websiteResponse.ok) {
          console.error(`Failed to fetch ${url}: ${websiteResponse.statusText}`);
          scrapedContent.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[${site.category}] ${site.siteName}\n🔗 URL: ${url}\n❌ Erreur: ${websiteResponse.statusText}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`);
          continue;
        }

        const html = await websiteResponse.text();
        
        // Extract text content from HTML
        const textContent = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 5000); // Limit per site

        scrapedContent.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[${site.category}] ${site.siteName}\n🔗 URL: ${url}\n\n${textContent}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`);
      } catch (error) {
        console.error(`Error scraping ${site.siteName}:`, error);
        const url = site.url.startsWith("http") ? site.url : "https://" + site.url;
        scrapedContent.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[${site.category}] ${site.siteName}\n🔗 URL: ${url}\n❌ Erreur lors du scraping\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`);
      }
    }

    const combinedContent = scrapedContent.join("");

    // If AI is disabled, return raw content (or filtered by prompt if provided)
    if (!useAI) {
      console.log("Returning raw scraped content");
      
      // If there's a prompt without AI, use it as filtering instruction
      if (prompt) {
        return new Response(
          JSON.stringify({ 
            result: `Instructions de filtrage: "${prompt}"\n\n--- CONTENU BRUT ---\n\n${combinedContent}` 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ result: combinedContent }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use Lovable AI to reformulate
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Calling Lovable AI for reformulation");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a precise content filter and reformulator. Your role is to ONLY extract and present information that is directly relevant to the user's specific request. Ignore all irrelevant content. Always respond in French and cite sources with their URLs (🔗).",
          },
          {
            role: "user",
            content: `Voici le contenu scrappé de plusieurs sites web avec leurs URLs:\n\n${combinedContent}\n\nREQUÊTE SPÉCIFIQUE: ${prompt}\n\nIMPORTANT: 
1. N'inclus QUE les informations directement pertinentes à ma requête
2. Ignore tout le reste du contenu non pertinent
3. Pour chaque information, cite la source avec son URL (🔗)
4. Si aucune information pertinente n'est trouvée sur un site, ne le mentionne pas`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const result = aiData.choices[0].message.content;

    console.log("Reformulation successful");

    return new Response(
      JSON.stringify({ result }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in scrape-and-reform:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
