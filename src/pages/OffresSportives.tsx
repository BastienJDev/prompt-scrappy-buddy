import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, MapPin, Clock, Euro, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface JobOffer {
  id: number;
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

export default function OffresSportives() {
  const [isLoading] = useState(false);
  const { toast } = useToast();

  const offres: JobOffer[] = [
    {
      id: 1,
      titre: "Entraîneur Football",
      entreprise: "Club Sportif de Paris",
      localisation: "Paris",
      type: "CDI",
      salaire: "35K - 45K €",
      date: "2025-11-28",
      description: "Rejoignez notre club pour encadrer les équipes jeunes. Diplôme d'État requis. Expérience en compétition souhaitée.",
      lien: "#",
      tags: ["Football", "Jeunes", "Formation", "DE"]
    },
    {
      id: 2,
      titre: "Préparateur Physique",
      entreprise: "Centre de Performance",
      localisation: "Lyon",
      type: "CDD",
      salaire: "30K - 38K €",
      date: "2025-11-27",
      description: "Préparez les athlètes de haut niveau. Diplôme en STAPS et certifications en préparation physique exigés.",
      lien: "#",
      tags: ["Prépa physique", "Haut niveau", "STAPS"]
    },
    {
      id: 3,
      titre: "Coach Personnel",
      entreprise: "Fitness Studio Premium",
      localisation: "Marseille",
      type: "Freelance",
      salaire: "35-50 €/h",
      date: "2025-11-26",
      description: "Accompagnez nos clients dans l'atteinte de leurs objectifs sportifs et bien-être. CQP ou BPJEPS requis.",
      lien: "#",
      tags: ["Coaching", "Fitness", "Bien-être", "CQP"]
    },
    {
      id: 4,
      titre: "Responsable Marketing Sportif",
      entreprise: "Équipementier Sportif",
      localisation: "Toulouse",
      type: "CDI",
      salaire: "40K - 50K €",
      date: "2025-11-25",
      description: "Développez notre stratégie marketing dans l'univers du sport. Expérience en marketing digital et passion pour le sport requises.",
      lien: "#",
      tags: ["Marketing", "Digital", "Sport Business", "Stratégie"]
    },
    {
      id: 5,
      titre: "Éducateur Sportif Multisports",
      entreprise: "Association Sportive",
      localisation: "Nantes",
      type: "CDI",
      salaire: "25K - 30K €",
      date: "2025-11-24",
      description: "Animez des activités sportives variées pour tous publics. BPJEPS APT ou équivalent exigé.",
      lien: "#",
      tags: ["Multisports", "Animation", "BPJEPS", "Tout public"]
    }
  ];

  const handleApply = (offre: JobOffer) => {
    toast({
      title: "Candidature",
      description: `Redirection vers l'offre : ${offre.titre}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-8 px-4 pb-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-accent via-accent-glow to-primary bg-clip-text text-transparent">
                Offres d'emploi sportives
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Les opportunités dans le monde du sport
            </p>
          </div>

          {isLoading ? (
            <Card className="border-border p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-muted-foreground text-lg">
                Chargement des offres sportives...
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {offres.map((offre, index) => (
                <Card 
                  key={offre.id}
                  className="border-border overflow-hidden hover:border-accent/50 transition-all duration-300 hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-2xl font-bold text-foreground">
                            {offre.titre}
                          </h2>
                          <Badge className="bg-accent text-white">
                            {offre.type}
                          </Badge>
                        </div>
                        
                        <div className="text-xl font-semibold text-accent">
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
                      
                      <Trophy className="w-8 h-8 text-accent flex-shrink-0" />
                    </div>
                    
                    <p className="text-foreground/80 leading-relaxed">
                      {offre.description}
                    </p>

                    <div className="pt-2">
                      <Button
                        onClick={() => handleApply(offre)}
                        className="bg-accent hover:bg-accent/90 text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Postuler
                      </Button>
                    </div>
                  </div>
                  
                  <div className="h-1 bg-gradient-to-r from-accent/50 via-primary/50 to-transparent" />
                </Card>
              ))}
            </div>
          )}

          <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5 p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Configurez vos alertes sportives
            </h3>
            <p className="text-muted-foreground mb-4">
              Utilisez la page Gestion des sites pour ajouter vos sites d'emploi sportifs préférés et recevoir les dernières offres automatiquement.
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
