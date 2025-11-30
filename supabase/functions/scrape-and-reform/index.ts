import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SiteEntry {
  category: string;
  siteName: string;
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

    if (useAI && !prompt) {
      throw new Error("Prompt is required when AI reformulation is enabled");
    }

    console.log(`Scraping ${sites.length} sites, AI reformulation: ${useAI}`);

    const scrapedContent: string[] = [];

    // Scrape each site
    for (const site of sites as SiteEntry[]) {
      try {
        console.log(`Scraping: ${site.siteName}`);
        
        // Add protocol if missing
        let url = site.siteName;
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
          scrapedContent.push(`[${site.category}] ${site.siteName}: Erreur de récupération`);
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

        scrapedContent.push(`[${site.category}] ${site.siteName}:\n${textContent}\n\n---\n\n`);
      } catch (error) {
        console.error(`Error scraping ${site.siteName}:`, error);
        scrapedContent.push(`[${site.category}] ${site.siteName}: Erreur lors du scraping\n\n---\n\n`);
      }
    }

    const combinedContent = scrapedContent.join("");

    // If AI is disabled, return raw content
    if (!useAI) {
      console.log("Returning raw scraped content");
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
            content: "You are a helpful assistant that reformulates web content based on user instructions. Always respond in French.",
          },
          {
            role: "user",
            content: `Voici le contenu scrappé de plusieurs sites web:\n\n${combinedContent}\n\nInstruction: ${prompt}`,
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
