import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, Euro, ExternalLink, Loader2 } from "lucide-react";
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

export default function OffresGenerales() {
  const [isLoading] = useState(false);
  const { toast } = useToast();

  const offres: JobOffer[] = [
    {
      id: 1,
      titre: "Développeur Full Stack",
      entreprise: "TechCorp",
      localisation: "Paris",
      type: "CDI",
      salaire: "45K - 55K €",
      date: "2025-11-28",
      description: "Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe dynamique. Vous travaillerez sur des projets innovants utilisant React, Node.js et PostgreSQL.",
      lien: "#",
      tags: ["React", "Node.js", "PostgreSQL", "TypeScript"]
    },
    {
      id: 2,
      titre: "Chef de Projet Digital",
      entreprise: "Digital Agency",
      localisation: "Lyon",
      type: "CDI",
      salaire: "40K - 50K €",
      date: "2025-11-27",
      description: "Rejoignez notre agence pour piloter des projets web ambitieux. Vous serez en charge de la coordination des équipes et de la relation client.",
      lien: "#",
      tags: ["Gestion de projet", "Agile", "Client"]
    },
    {
      id: 3,
      titre: "Data Analyst",
      entreprise: "DataCo",
      localisation: "Télétravail",
      type: "CDD",
      salaire: "35K - 40K €",
      date: "2025-11-26",
      description: "Analysez les données pour extraire des insights pertinents. Maîtrise de SQL, Python et des outils de visualisation requise.",
      lien: "#",
      tags: ["SQL", "Python", "Data Viz", "Business Intelligence"]
    },
    {
      id: 4,
      titre: "Designer UX/UI",
      entreprise: "Creative Studio",
      localisation: "Bordeaux",
      type: "Freelance",
      salaire: "400-500 €/jour",
      date: "2025-11-25",
      description: "Créez des expériences utilisateur exceptionnelles pour nos clients. Portfolio requis.",
      lien: "#",
      tags: ["Figma", "Sketch", "Prototypage", "Design System"]
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
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Offres d'emploi générales
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Découvrez les opportunités professionnelles
            </p>
          </div>

          {isLoading ? (
            <Card className="border-border p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
              <p className="text-muted-foreground text-lg">
                Chargement des offres...
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {offres.map((offre, index) => (
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
