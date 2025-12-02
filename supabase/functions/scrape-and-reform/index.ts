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

    // Use OpenAI to reformulate
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    console.log(`Calling OpenAI with ${relevantMatches.length} pre-filtered sources`);

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Tu es un assistant expert en analyse juridique approfondie.

CONTEXTE:
Les données proviennent d'un scrapper juridique spécialisé, conçu pour analyser la requête dans son ensemble, en tenant compte du genre grammatical, des liens sémantiques et du contexte juridique.
À partir de ces données, produis une analyse complète, structurée et approfondie.

RÈGLES STRICTES:
- Utilise UNIQUEMENT les informations fournies dans les extraits
- Pour CHAQUE information, cite OBLIGATOIREMENT l'URL exacte de la source avec le format: 🔗 Source: [URL]
- NE JAMAIS inventer ou déduire des informations non présentes dans les sources
- Réponds TOUJOURS en français

⸻

STRUCTURE DE RÉPONSE:

## 1. BASE LÉGALE
Présente de manière exhaustive les fondements légaux :
• Les textes officiels applicables (codes, lois, décrets, règlements, directives, conventions)
• Les articles précis (numéros, intitulés et portée juridique)
• Le champ d'application de chaque texte
• Les conditions de mise en œuvre
• Les exceptions légales
• Les interactions entre plusieurs textes si pertinentes
• La logique juridique sous-jacente (raison d'être, ratio legis)

## 2. ANALYSE DE LA JURISPRUDENCE
Expose les principales décisions judiciaires :
• Les décisions majeures (juridictions nationales, européennes, internationales)
• Les faits essentiels
• Le raisonnement des juges
• La solution retenue
• Les principes dégagés (motifs décisifs, attendus de principe)
• Les tendances jurisprudentielles (stabilité, revirement, divergences)
• Les zones d'incertitude ou d'interprétation

## 3. APPORT DOCTRINAL
Présente l'analyse doctrinale :
• Les positions des auteurs reconnus
• Les débats doctrinaux
• Les divergences d'interprétation
• Les analyses critiques
• Les approches théoriques ou conceptuelles
• Les propositions d'évolution

## 4. SPÉCIFICITÉS ET PARTICULARITÉS
Détaille les particularités de la notion :
• Ses nuances conceptuelles
• Ses limites
• Ses conditions d'application pratiques
• Les difficultés rencontrées
• Ses implications concrètes dans différents contextes
• Les exceptions, régimes spéciaux, cas atypiques

## 5. AVANTAGES ET INCONVÉNIENTS (si pertinent)
• Avantages dans le système juridique
• Inconvénients ou limites
• Critiques doctrinales
• Risques ou dérives potentiels

## 6. QUESTIONS POUR APPROFONDIR
Propose 5 à 8 questions pertinentes permettant d'aller plus loin dans :
• La compréhension de la notion
• Son application
• Ses zones grises
• Ses enjeux doctrinaux ou jurisprudentiels
• Ses implications pratiques

⸻

STYLE D'ÉCRITURE:
Adopte un langage juridique rigoureux, mais humanisé, fluide, clair et pédagogique.
Évite les formulations trop techniques sans explication.
Rends l'analyse agréable à lire, tout en restant précise et académique.`,
          },
          {
            role: "user",
            content: `REQUÊTE: "${prompt}"

SOURCES PRÉ-FILTRÉES (contenant les mots-clés: ${keywords.join(', ')}):
${contentForAI}

INSTRUCTIONS:
1. Analyse en profondeur les informations relatives à ma requête "${prompt}"
2. Structure ta réponse selon les 6 sections définies
3. Cite l'URL EXACTE pour chaque information (utilise les URLs fournies dans "🔗 URL EXACTE:")
4. Si une section n'a pas d'informations pertinentes dans les sources, indique-le clairement
5. Termine par les questions d'approfondissement`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error("Limite de requêtes dépassée. Réessayez plus tard.");
      }
      if (aiResponse.status === 401 || aiResponse.status === 402) {
        throw new Error("Erreur d'authentification. Vérifiez votre clé API OpenAI.");
      }
      throw new Error(`OpenAI API error: ${aiResponse.status}`);
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
