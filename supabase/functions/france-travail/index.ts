import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FranceTravailOffer {
  id: string;
  intitule: string;
  entreprise?: {
    nom?: string;
  };
  lieuTravail: {
    libelle: string;
    commune?: string;
  };
  typeContrat?: string;
  salaire?: {
    libelle?: string;
  };
  dateCreation: string;
  description?: string;
  origineOffre?: {
    urlOrigine?: string;
  };
  competences?: Array<{
    libelle: string;
  }>;
}

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const tokenUrl = 'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire';
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&scope=api_offresdemploiv2 o2dsoffre`,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token error:', errorText);
    throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function searchOffers(accessToken: string, query: string = ''): Promise<FranceTravailOffer[]> {
  // Codes INSEE pour Paris et petite couronne
  const parisCodes = [
    '75056', // Paris
    '92001', '92002', '92004', '92007', '92009', '92012', '92014', '92019', '92020', // Hauts-de-Seine
    '93001', '93005', '93006', '93007', '93008', '93010', '93013', '93014', // Seine-Saint-Denis
    '94001', '94002', '94003', '94004', '94011', '94015', '94016', '94017', // Val-de-Marne
  ];
  
  const params = new URLSearchParams({
    commune: parisCodes.join(','),
    range: '0-149',
  });

  if (query) {
    params.append('motsCles', query);
  }

  const searchUrl = `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params.toString()}`;
  
  console.log('Searching offers with URL:', searchUrl);

  const response = await fetch(searchUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Search error:', errorText);
    throw new Error(`Failed to search offers: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.resultats || [];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    const clientId = Deno.env.get('FRANCE_TRAVAIL_CLIENT_ID');
    const clientSecret = Deno.env.get('FRANCE_TRAVAIL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error('France Travail API credentials not configured');
    }

    console.log('Getting access token...');
    const accessToken = await getAccessToken(clientId, clientSecret);
    
    console.log('Searching offers...');
    const offers = await searchOffers(accessToken, query);
    
    console.log(`Found ${offers.length} offers`);

    return new Response(JSON.stringify({ offers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in france-travail function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      offers: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
