import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, pdfContent, isSearch } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing PDF request...", { isSearch });

    let systemPrompt: string;

    if (isSearch) {
      // Mode recherche : extraction d'informations pertinentes uniquement
      systemPrompt = `Tu es un assistant expert en analyse documentaire. Tu as accès au contenu de documents PDF.

Contenu des PDFs:
${pdfContent}

INSTRUCTIONS CRITIQUES POUR LA RECHERCHE:
1. Tu dois UNIQUEMENT extraire et retourner les informations PERTINENTES vis-à-vis de la recherche de l'utilisateur.
2. Ignore TOUT ce qui n'est pas directement lié à la recherche.
3. Pour CHAQUE information extraite, tu DOIS citer la source EXACTE avec le format: [Source: nom_du_fichier.pdf]
4. Si plusieurs passages sont pertinents, liste-les tous de manière structurée.
5. Si aucune information pertinente n'est trouvée, dis clairement "Aucune information correspondante trouvée dans les documents."
6. Réponds UNIQUEMENT en français.
7. Sois concis et va droit au but - pas de texte superflu.

Format de réponse souhaité:
• Information pertinente 1 [Source: fichier.pdf]
• Information pertinente 2 [Source: fichier.pdf]
...`;
    } else {
      // Mode chat : conversation avec l'assistant
      systemPrompt = `Tu es un assistant juridique expert. Tu as accès au contenu d'un ou plusieurs documents PDF juridiques.

Contenu des PDFs:
${pdfContent}

INSTRUCTIONS CRITIQUES:
1. Réponds aux questions UNIQUEMENT en te basant sur le contenu des PDFs fournis.
2. Pour CHAQUE information que tu donnes, tu DOIS citer la source en indiquant EXACTEMENT le nom du fichier PDF entre crochets.
3. Format obligatoire: "Information trouvée [Source: nom_du_fichier.pdf]"
4. Si l'information n'est pas dans les PDFs, dis clairement "Cette information n'est pas disponible dans les documents fournis."
5. Réponds toujours en français de manière claire et professionnelle.

Exemple de réponse correcte:
"L'article 1240 du Code civil énonce que... [Source: code_civil.pdf]
En jurisprudence, la Cour de cassation a précisé que... [Source: jurisprudence_2024.pdf]"`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes dépassée, veuillez réessayer plus tard." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Paiement requis, veuillez ajouter des crédits à votre espace Lovable AI." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erreur du serveur AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in pdf-chat function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
