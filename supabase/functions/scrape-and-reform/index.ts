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

// Mots vides français à exclure
const stopWords = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'dans', 'sur', 'pour', 'par',
  'avec', 'sans', 'sous', 'entre', 'vers', 'chez', 'et', 'ou', 'mais', 'donc',
  'car', 'ni', 'que', 'qui', 'quoi', 'dont', 'où', 'ce', 'cette', 'ces', 'son',
  'sa', 'ses', 'leur', 'leurs', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'notre',
  'nos', 'votre', 'vos', 'au', 'aux', 'en', 'est', 'sont', 'etre', 'avoir', 'fait',
  'faire', 'peut', 'peuvent', 'doit', 'doivent', 'tout', 'tous', 'toute', 'toutes',
  'plus', 'moins', 'tres', 'bien', 'mal', 'peu', 'beaucoup', 'trop', 'aussi',
  'comme', 'comment', 'quand', 'pourquoi', 'si', 'alors', 'ainsi', 'donc'
]);

// Synonymes juridiques courants
const legalSynonyms: Record<string, string[]> = {
  'responsabilite': ['responsable', 'responsables'],
  'contrat': ['contractuel', 'contractuelle', 'contractuels', 'contractuelles', 'convention'],
  'obligation': ['obligations', 'obligatoire', 'obligatoires'],
  'droit': ['droits', 'juridique', 'juridiques'],
  'partie': ['parties', 'cocontractant', 'cocontractants'],
  'dommage': ['dommages', 'prejudice', 'prejudices'],
  'faute': ['fautes', 'fautif', 'fautive'],
  'civil': ['civile', 'civils', 'civiles'],
  'penal': ['penale', 'penaux', 'penales'],
  'personne': ['personnes'],
  'moral': ['morale', 'moraux', 'morales'],
  'physique': ['physiques'],
  'societe': ['societes', 'societaire'],
  'tribunal': ['tribunaux', 'juridiction', 'juridictions', 'cour'],
  'juge': ['juges', 'magistrat', 'magistrats'],
  'arret': ['arrets', 'decision', 'decisions', 'jugement', 'jugements'],
  'loi': ['lois', 'legislation', 'legislatif', 'legislative'],
  'code': ['codes', 'codifie', 'codifiee'],
  'article': ['articles', 'alinea', 'alineas'],
  'clause': ['clauses', 'stipulation', 'stipulations'],
  'victime': ['victimes', 'lese', 'lesee', 'leses', 'lesees'],
  'auteur': ['auteurs'],
  'infraction': ['infractions', 'delit', 'delits', 'crime', 'crimes'],
  'sanction': ['sanctions', 'peine', 'peines', 'punition'],
  'reparation': ['reparations', 'indemnisation', 'indemnite', 'indemnites'],
  'preuve': ['preuves', 'probatoire', 'probatoires'],
  'prescription': ['prescriptions', 'prescrit', 'prescrite'],
  'recours': ['action', 'actions', 'pourvoi'],
  'appel': ['appels', 'appelant', 'appelante'],
  'cassation': ['pourvoi'],
  'executoire': ['execution', 'executer'],
  'nullite': ['nul', 'nulle', 'nuls', 'nulles', 'annulation'],
  'resiliation': ['resilier', 'resilie', 'resiliee', 'resolution'],
  'sportif': ['sportive', 'sportifs', 'sportives', 'sport', 'sports'],
  'federation': ['federations', 'federal', 'federale', 'federaux', 'federales'],
  'athlete': ['athletes', 'joueur', 'joueurs', 'joueuse', 'joueuses'],
  'dopage': ['dope', 'dopee', 'antidopage'],
  'transfert': ['transferts', 'mutation', 'mutations'],
  'agent': ['agents', 'intermediaire', 'intermediaires'],
  'employeur': ['employeurs', 'patron', 'patrons'],
  'salarie': ['salariee', 'salaries', 'salariees', 'employe', 'employee'],
  'licenciement': ['licencie', 'licenciee', 'licenciement'],
  'travail': ['travaux', 'professionnel', 'professionnelle']
};

// Générer les variantes de genre et nombre pour un mot
function generateVariants(word: string): string[] {
  const variants = new Set<string>([word]);
  
  // Variantes de base (singulier/pluriel)
  if (word.endsWith('s')) {
    variants.add(word.slice(0, -1)); // Enlever le s
  } else {
    variants.add(word + 's'); // Ajouter s
  }
  
  // Variantes masculin/féminin
  if (word.endsWith('e')) {
    variants.add(word.slice(0, -1)); // Enlever le e (féminin -> masculin)
    variants.add(word + 's'); // féminin pluriel
  } else {
    variants.add(word + 'e'); // masculin -> féminin
    variants.add(word + 'es'); // féminin pluriel
  }
  
  // Terminaisons spéciales
  if (word.endsWith('al')) {
    variants.add(word.slice(0, -2) + 'aux'); // -al -> -aux
    variants.add(word + 'e'); // -al -> -ale
    variants.add(word.slice(0, -2) + 'ales'); // -al -> -ales
  }
  if (word.endsWith('aux')) {
    variants.add(word.slice(0, -3) + 'al'); // -aux -> -al
    variants.add(word.slice(0, -3) + 'ale'); // -aux -> -ale
    variants.add(word.slice(0, -3) + 'ales'); // -aux -> -ales
  }
  if (word.endsWith('if')) {
    variants.add(word.slice(0, -1) + 've'); // -if -> -ive
    variants.add(word + 's'); // -ifs
    variants.add(word.slice(0, -1) + 'ves'); // -ives
  }
  if (word.endsWith('eur')) {
    variants.add(word.slice(0, -3) + 'rice'); // -eur -> -rice
    variants.add(word.slice(0, -3) + 'euse'); // -eur -> -euse
    variants.add(word + 's'); // -eurs
  }
  
  // Ajouter les synonymes juridiques
  if (legalSynonyms[word]) {
    legalSynonyms[word].forEach(syn => variants.add(syn));
  }
  // Chercher aussi si le mot est un synonyme
  for (const [key, syns] of Object.entries(legalSynonyms)) {
    if (syns.includes(word)) {
      variants.add(key);
      syns.forEach(syn => variants.add(syn));
    }
  }
  
  return Array.from(variants);
}

// Normaliser le texte pour la comparaison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Extraire les mots-clés avec leurs variantes
function extractKeywords(prompt: string): { 
  primaryKeywords: string[], 
  allVariants: Set<string>,
  fullQuery: string,
  minRequiredMatches: number
} {
  const normalized = normalizeText(prompt);
  const words = normalized
    .split(/\s+/)
    .map(word => word.replace(/[^a-z0-9]/g, ''))
    .filter(word => word.length > 2 && !stopWords.has(word));
  
  const allVariants = new Set<string>();
  
  // Générer toutes les variantes pour chaque mot
  for (const word of words) {
    const variants = generateVariants(word);
    variants.forEach(v => allVariants.add(v));
  }
  
  // Nombre minimum de mots-clés devant apparaître ensemble
  // Au moins 50% des mots significatifs ou 2 minimum
  const minRequiredMatches = Math.max(2, Math.ceil(words.length * 0.5));
  
  return {
    primaryKeywords: words,
    allVariants,
    fullQuery: normalized,
    minRequiredMatches
  };
}

// Calculer un score de pertinence juridique
function calculateLegalRelevanceScore(text: string): number {
  const normalizedText = normalizeText(text);
  let score = 0;
  
  // Indicateurs de contenu juridique de haute qualité
  const legalIndicators = [
    { pattern: /article\s*\d+/gi, weight: 3 },
    { pattern: /code\s+(civil|penal|travail|commerce|sport)/gi, weight: 4 },
    { pattern: /cour\s+(de\s+)?cassation/gi, weight: 5 },
    { pattern: /conseil\s+(d')?etat/gi, weight: 5 },
    { pattern: /tribunal/gi, weight: 3 },
    { pattern: /jurisprudence/gi, weight: 4 },
    { pattern: /doctrine/gi, weight: 4 },
    { pattern: /arret\s+du/gi, weight: 4 },
    { pattern: /decision\s+du/gi, weight: 3 },
    { pattern: /loi\s+(n°|du|relative)/gi, weight: 4 },
    { pattern: /decret/gi, weight: 3 },
    { pattern: /reglement/gi, weight: 2 },
    { pattern: /directive\s+(europeenne|ue)/gi, weight: 3 },
    { pattern: /responsabilite\s+(civile|penale|contractuelle|delictuelle)/gi, weight: 5 },
    { pattern: /dommages?\s+(et\s+)?interets?/gi, weight: 4 },
    { pattern: /prejudice/gi, weight: 3 },
    { pattern: /reparation/gi, weight: 3 },
    { pattern: /nullite/gi, weight: 3 },
    { pattern: /resiliation/gi, weight: 3 },
    { pattern: /inexecution/gi, weight: 3 },
  ];
  
  for (const indicator of legalIndicators) {
    const matches = normalizedText.match(indicator.pattern);
    if (matches) {
      score += matches.length * indicator.weight;
    }
  }
  
  return score;
}

// Vérifier si les termes apparaissent dans un contexte proche (même paragraphe/phrase)
function checkContextualProximity(paragraph: string, keywords: string[], allVariants: Set<string>): {
  isRelevant: boolean,
  matchedKeywords: string[],
  proximityScore: number
} {
  const normalizedPara = normalizeText(paragraph);
  const matchedKeywords: string[] = [];
  let proximityScore = 0;
  
  // Compter combien de mots-clés principaux (ou leurs variantes) sont présents
  for (const keyword of keywords) {
    const variants = generateVariants(keyword);
    for (const variant of variants) {
      if (normalizedPara.includes(variant)) {
        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
        break;
      }
    }
  }
  
  // Vérifier aussi les variantes globales
  let variantMatches = 0;
  for (const variant of allVariants) {
    if (normalizedPara.includes(variant)) {
      variantMatches++;
    }
  }
  
  // Score de proximité basé sur la densité des termes
  proximityScore = (matchedKeywords.length / keywords.length) * 100 + variantMatches * 2;
  
  // Ajouter le score de pertinence juridique
  proximityScore += calculateLegalRelevanceScore(paragraph);
  
  return {
    isRelevant: matchedKeywords.length >= Math.max(2, Math.ceil(keywords.length * 0.5)),
    matchedKeywords,
    proximityScore
  };
}

// Trouver le contenu pertinent avec analyse contextuelle stricte
function findRelevantContent(
  text: string, 
  keywords: { 
    primaryKeywords: string[], 
    allVariants: Set<string>,
    fullQuery: string,
    minRequiredMatches: number
  }
): { matches: string[], matchedKeywords: string[], relevanceScore: number } {
  const { primaryKeywords, allVariants, minRequiredMatches } = keywords;
  
  if (primaryKeywords.length === 0) {
    return { matches: [], matchedKeywords: [], relevanceScore: 0 };
  }
  
  const allMatchedKeywords = new Set<string>();
  const relevantParagraphs: { text: string, score: number }[] = [];
  
  // Découper en paragraphes significatifs
  const paragraphs = text
    .split(/[\n\r]+/)
    .map(p => p.trim())
    .filter(p => p.length > 50); // Paragraphes d'au moins 50 caractères
  
  for (const para of paragraphs) {
    const { isRelevant, matchedKeywords, proximityScore } = checkContextualProximity(
      para, 
      primaryKeywords, 
      allVariants
    );
    
    // N'accepter que si suffisamment de mots-clés sont présents ensemble
    if (isRelevant && matchedKeywords.length >= minRequiredMatches) {
      matchedKeywords.forEach(k => allMatchedKeywords.add(k));
      relevantParagraphs.push({ text: para, score: proximityScore });
    }
  }
  
  // Trier par score de pertinence décroissant
  relevantParagraphs.sort((a, b) => b.score - a.score);
  
  // Calculer un score global de pertinence
  const totalScore = relevantParagraphs.reduce((sum, p) => sum + p.score, 0);
  
  return {
    matches: relevantParagraphs.slice(0, 15).map(p => p.text), // Top 15 paragraphes les plus pertinents
    matchedKeywords: Array.from(allMatchedKeywords),
    relevanceScore: totalScore
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
    const keywordsData = prompt ? extractKeywords(prompt) : null;
    const keywordsList = keywordsData?.primaryKeywords || [];
    console.log(`Extracted keywords: ${keywordsList.join(', ')}`);
    console.log(`Generated variants: ${keywordsData ? keywordsData.allVariants.size : 0} total variants`);
    console.log(`Minimum required matches: ${keywordsData?.minRequiredMatches || 0}`);

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

        // If we have keywords, pre-filter content with contextual analysis
        if (keywordsData && keywordsList.length > 0 && useAI) {
          const { matches, matchedKeywords, relevanceScore } = findRelevantContent(textContent, keywordsData);
          
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
            result: `Recherche: "${prompt}"\nMots-clés: ${keywordsList.join(', ')}\n\n${contentForAI}` 
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
          result: `❌ Aucune information pertinente trouvée pour la recherche "${prompt}".\n\nMots-clés recherchés: ${keywordsList.join(', ')}\n\nEssayez avec d'autres termes ou vérifiez que les sites contiennent bien ce type d'information.` 
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

SOURCES PRÉ-FILTRÉES (contenant les mots-clés: ${keywordsList.join(', ')}):
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
