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

interface RelevantMatch {
  siteName: string;
  category: string;
  url: string;
  matchingKeywords: string[];
  relevantParagraphs: string[];
}

// Extract keywords from prompt (remove common French words)
function extractKeywords(prompt: string): string[] {
  const stopWords = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'dans', 'sur', 'pour', 'par',
    'avec', 'sans', 'sous', 'entre', 'vers', 'chez', 'et', 'ou', 'mais', 'donc',
    'car', 'ni', 'que', 'qui', 'quoi', 'dont', 'où', 'ce', 'cette', 'ces', 'son',
    'sa', 'ses', 'leur', 'leurs', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'notre',
    'nos', 'votre', 'vos', 'au', 'aux', 'en', 'est', 'sont', 'être', 'avoir', 'fait',
    'faire', 'peut', 'peuvent', 'doit', 'doivent', 'tout', 'tous', 'toute', 'toutes',
    'plus', 'moins', 'très', 'bien', 'mal', 'peu', 'beaucoup', 'trop', 'aussi',
    'comme', 'comment', 'quand', 'pourquoi', 'si', 'alors', 'ainsi', 'donc'
  ]);
  
  return prompt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents for matching
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .map(word => word.replace(/[^a-z0-9]/g, ''));
}

// Check if text contains any keyword and return matching paragraphs
function findRelevantContent(text: string, keywords: string[]): { matches: string[], matchedKeywords: string[] } {
  const normalizedText = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  const matchedKeywords: string[] = [];
  const relevantParagraphs: Set<string> = new Set();
  
  // Split into paragraphs/sentences
  const paragraphs = text.split(/[.\n]+/).filter(p => p.trim().length > 30);
  
  for (const keyword of keywords) {
    if (normalizedText.includes(keyword)) {
      matchedKeywords.push(keyword);
      
      // Find paragraphs containing this keyword
      for (const para of paragraphs) {
        const normalizedPara = para
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        
        if (normalizedPara.includes(keyword)) {
          relevantParagraphs.add(para.trim());
        }
      }
    }
  }
  
  return {
    matches: Array.from(relevantParagraphs).slice(0, 10), // Limit to 10 most relevant paragraphs
    matchedKeywords
  };
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

    // Extract keywords from prompt for pre-filtering
    const keywords = prompt ? extractKeywords(prompt) : [];
    console.log(`Extracted keywords: ${keywords.join(', ')}`);

    const scrapedContent: string[] = [];
    const relevantMatches: RelevantMatch[] = [];

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
          continue;
        }

        const html = await websiteResponse.text();
        
        // Extract text content from HTML
        const textContent = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        // If we have keywords, pre-filter content
        if (keywords.length > 0 && useAI) {
          const { matches, matchedKeywords } = findRelevantContent(textContent, keywords);
          
          if (matches.length > 0) {
            console.log(`✓ Found ${matches.length} relevant paragraphs in ${site.siteName} (keywords: ${matchedKeywords.join(', ')})`);
            
            relevantMatches.push({
              siteName: site.siteName,
              category: site.category,
              url: url,
              matchingKeywords: matchedKeywords,
              relevantParagraphs: matches
            });
          } else {
            console.log(`✗ No relevant content in ${site.siteName}`);
          }
        } else {
          // No keywords or AI disabled - keep all content (limited)
          scrapedContent.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n[${site.category}] ${site.siteName}\n🔗 URL: ${url}\n\n${textContent.slice(0, 5000)}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`);
        }
      } catch (error) {
        console.error(`Error scraping ${site.siteName}:`, error);
      }
    }

    // Build content for AI based on relevant matches
    let contentForAI = "";
    
    if (relevantMatches.length > 0) {
      console.log(`Found relevant content in ${relevantMatches.length} sites`);
      
      for (const match of relevantMatches) {
        contentForAI += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        contentForAI += `📍 SOURCE: ${match.siteName}\n`;
        contentForAI += `📁 Catégorie: ${match.category}\n`;
        contentForAI += `🔗 URL EXACTE: ${match.url}\n`;
        contentForAI += `🔑 Mots-clés trouvés: ${match.matchingKeywords.join(', ')}\n`;
        contentForAI += `\n📄 EXTRAITS PERTINENTS:\n`;
        match.relevantParagraphs.forEach((para, i) => {
          contentForAI += `\n[Extrait ${i + 1}]\n${para}\n`;
        });
        contentForAI += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      }
    } else if (scrapedContent.length > 0) {
      contentForAI = scrapedContent.join("");
    }

    // If AI is disabled, return raw content
    if (!useAI) {
      console.log("Returning raw scraped content");
      
      if (prompt && relevantMatches.length > 0) {
        return new Response(
          JSON.stringify({ 
            result: `Recherche: "${prompt}"\nMots-clés: ${keywords.join(', ')}\n\n${contentForAI}` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ result: scrapedContent.join("") }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if we found any relevant content
    if (!contentForAI || contentForAI.trim().length === 0) {
      console.log("No relevant content found for the query");
      return new Response(
        JSON.stringify({ 
          result: `❌ Aucune information pertinente trouvée pour la recherche "${prompt}".\n\nMots-clés recherchés: ${keywords.join(', ')}\n\nEssayez avec d'autres termes ou vérifiez que les sites contiennent bien ce type d'information.` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use Lovable AI to reformulate
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`Calling Lovable AI with ${relevantMatches.length} pre-filtered sources`);

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `Tu es un assistant expert en synthèse d'informations juridiques et sportives.

CONTEXTE: L'utilisateur recherche des informations spécifiques. Le contenu ci-dessous a été PRÉ-FILTRÉ pour ne contenir QUE les passages pertinents avec leurs URLs exactes.

RÈGLES STRICTES:
1. Utilise UNIQUEMENT les informations fournies dans les extraits
2. Pour CHAQUE information, cite OBLIGATOIREMENT l'URL exacte de la source
3. NE JAMAIS inventer ou déduire des informations non présentes
4. Réponds TOUJOURS en français
5. Structure ta réponse de manière claire

FORMAT DE RÉPONSE:
Pour chaque information trouvée:

📌 **[Titre/Sujet]**
[Information extraite]
🔗 Source: [URL exacte]

---`,
          },
          {
            role: "user",
            content: `REQUÊTE: "${prompt}"

SOURCES PRÉ-FILTRÉES (contenant les mots-clés: ${keywords.join(', ')}):
${contentForAI}

INSTRUCTIONS:
1. Synthétise les informations pertinentes à ma requête "${prompt}"
2. Cite l'URL EXACTE pour chaque information (utilise les URLs fournies dans "🔗 URL EXACTE:")
3. Si plusieurs sources traitent du même sujet, regroupe-les
4. Présente les résultats de manière structurée et professionnelle`,
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
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
