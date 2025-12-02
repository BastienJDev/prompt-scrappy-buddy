import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, MapPin, Clock, Euro, ExternalLink, Loader2, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const jobSites = [
  {
    name: "Indeed",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fc/Indeed_logo.svg",
    buildUrl: (job: string, location: string) => 
      `https://fr.indeed.com/jobs?q=${encodeURIComponent(job)}&l=${encodeURIComponent(location)}`
  },
  {
    name: "HelloWork",
    logo: "https://www.hellowork.com/images/logo-hellowork.svg",
    buildUrl: (job: string, location: string) => 
      `https://www.hellowork.com/fr-fr/emploi/recherche.html?k=${encodeURIComponent(job)}&l=${encodeURIComponent(location)}`
  },
  {
    name: "APEC",
    logo: "https://www.apec.fr/files/live/mounts/images/medias_apec/logo/logo_apec_bleu.svg",
    buildUrl: (job: string, location: string) => 
      `https://www.apec.fr/candidat/recherche-emploi.html/emploi?motsCles=${encodeURIComponent(job)}&lieux=${encodeURIComponent(location)}`
  },
  {
    name: "Welcome to the Jungle",
    logo: "https://www.welcometothejungle.com/assets/images/logos/wttj.svg",
    buildUrl: (job: string, location: string) => 
      `https://www.welcometothejungle.com/fr/jobs?query=${encodeURIComponent(job)}&aroundQuery=${encodeURIComponent(location)}`
  },
  {
    name: "Cadremploi",
    logo: "https://www.cadremploi.fr/assets/images/logos/cadremploi-logo.svg",
    buildUrl: (job: string, location: string) => 
      `https://www.cadremploi.fr/emploi/liste_offres?motcle=${encodeURIComponent(job)}&lieu=${encodeURIComponent(location)}`
  },
  {
    name: "Optioncarrière",
    logo: "https://www.optioncarriere.com/images/optioncarriere-logo.svg",
    buildUrl: (job: string, location: string) => 
      `https://www.optioncarriere.com/recherche?s=${encodeURIComponent(job)}&l=${encodeURIComponent(location)}`
  },
  {
    name: "WeAreMeent",
    logo: "https://wearemeent.com/wp-content/uploads/2023/01/meent-logo.svg",
    buildUrl: (job: string, location: string) => 
      `https://wearemeent.com/?s=${encodeURIComponent(job + ' ' + location)}`
  },
  {
    name: "France Travail",
    logo: "https://candidat.francetravail.fr/dist/img/logo-ft.svg",
    buildUrl: (job: string, location: string) => 
      `https://candidat.francetravail.fr/offres/recherche?motsCles=${encodeURIComponent(job)}&offresPartenaires=true&lieu=${encodeURIComponent(location)}`
  }
];

interface JobOffer {
  id: string;
  titre: string;
  entreprise: string;
  localisation: string;
  type: string;
  salaire: string;
  date: string;
  description: string;
  lien: string;
  tags: string[];
}

export default function OffresGenerales() {
  const [isLoading, setIsLoading] = useState(true);
  const [offres, setOffres] = useState<JobOffer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const { toast } = useToast();

  const handleSiteClick = (site: typeof jobSites[0]) => {
    const url = site.buildUrl(jobTitle, location);
    window.open(url, '_blank');
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('france-travail', {
        body: { query: '' }
      });

      if (error) throw error;

      if (data?.offers) {
        const formattedOffers: JobOffer[] = data.offers.map((offer: any) => ({
          id: offer.id,
          titre: offer.intitule,
          entreprise: offer.entreprise?.nom || 'Non renseigné',
          localisation: offer.lieuTravail?.libelle || 'Non renseigné',
          type: offer.typeContrat || 'Non renseigné',
          salaire: offer.salaire?.libelle || 'Non renseigné',
          date: offer.dateCreation,
          description: offer.description || 'Aucune description disponible',
          lien: offer.origineOffre?.urlOrigine || '#',
          tags: offer.competences?.slice(0, 4).map((c: any) => c.libelle) || []
        }));
        setOffres(formattedOffers);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les offres d'emploi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOffres = offres.filter(offre => {
    const query = searchQuery.toLowerCase();
    return (
      offre.titre.toLowerCase().includes(query) ||
      offre.entreprise.toLowerCase().includes(query) ||
      offre.localisation.toLowerCase().includes(query) ||
      offre.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const handleApply = (offre: JobOffer) => {
    if (offre.lien && offre.lien !== '#') {
      window.open(offre.lien, '_blank');
    } else {
      toast({
        title: "Candidature",
        description: `Offre : ${offre.titre}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-8 px-4 pb-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Offres d'emploi générales
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Découvrez les opportunités professionnelles
            </p>
          </div>

          {/* Recherche sur les sites d'emploi */}
          <Card className="border-border p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Rechercher sur les sites d'emploi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Poste recherché</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ex: Juriste, Avocat, Data Analyst..."
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Localisation</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ex: Paris, Lyon, Marseille..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Cliquez sur un site pour lancer la recherche :</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {jobSites.map((site) => (
                  <button
                    key={site.name}
                    onClick={() => handleSiteClick(site)}
                    className="group flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                    title={`Rechercher sur ${site.name}`}
                  >
                    <div className="h-10 w-full flex items-center justify-center mb-2">
                      <img
                        src={site.logo}
                        alt={site.name}
                        className="max-h-10 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <span className="hidden text-lg font-semibold text-foreground">{site.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      {site.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Filtre des offres France Travail */}
          <Card className="border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Filtrer les offres France Travail ci-dessous..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {isLoading ? (
            <Card className="border-border p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-muted-foreground text-lg">
                Chargement des offres...
              </p>
            </Card>
          ) : filteredOffres.length === 0 ? (
            <Card className="border-border p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">
                {searchQuery ? "Aucune offre ne correspond à votre recherche" : "Aucune offre d'emploi disponible pour le moment"}
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {filteredOffres.map((offre, index) => (
                <Card 
                  key={offre.id}
                  className="border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-2xl font-bold text-foreground">
                            {offre.titre}
                          </h2>
                          <Badge className="bg-primary text-white">
                            {offre.type}
                          </Badge>
                        </div>
                        
                        <div className="text-xl font-semibold text-primary">
                          {offre.entreprise}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{offre.localisation}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4" />
                            <span>{offre.salaire}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(offre.date).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long'
                            })}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {offre.tags.map((tag, i) => (
                            <Badge 
                              key={i}
                              variant="secondary"
                              className="bg-secondary/50 text-foreground"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Briefcase className="w-8 h-8 text-primary flex-shrink-0" />
                    </div>
                    
                    <p className="text-foreground/80 leading-relaxed">
                      {offre.description}
                    </p>

                    <div className="pt-2">
                      <Button
                        onClick={() => handleApply(offre)}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Postuler
                      </Button>
                    </div>
                  </div>
                  
                  <div className="h-1 bg-gradient-to-r from-primary/50 via-accent/50 to-transparent" />
                </Card>
              ))}
            </div>
          )}

          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8 text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Configurez vos alertes
            </h3>
            <p className="text-muted-foreground mb-4">
              Utilisez la page Gestion des sites pour ajouter vos sites d'emploi préférés et recevoir les dernières offres automatiquement.
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/"}
            >
              Gérer mes sources
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
