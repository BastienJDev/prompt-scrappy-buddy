import { Card } from "@/components/ui/card";
import { Scale, FileText, Shield, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SiteJuridique() {
  const sections = [
    {
      id: "mentions-legales",
      title: "Mentions légales",
      icon: FileText,
      content: "Informations légales obligatoires concernant l'éditeur du site, l'hébergement et les responsabilités.",
      items: [
        "Éditeur du site",
        "Hébergement",
        "Directeur de publication",
        "Contact"
      ]
    },
    {
      id: "conditions-utilisation",
      title: "Conditions d'utilisation",
      icon: BookOpen,
      content: "Règles d'utilisation du site et des services proposés.",
      items: [
        "Acceptation des conditions",
        "Utilisation du site",
        "Propriété intellectuelle",
        "Limitation de responsabilité"
      ]
    },
    {
      id: "confidentialite",
      title: "Politique de confidentialité",
      icon: Shield,
      content: "Protection de vos données personnelles et respect de votre vie privée.",
      items: [
        "Collecte des données",
        "Utilisation des données",
        "Conservation des données",
        "Vos droits RGPD"
      ]
    },
    {
      id: "ressources-juridiques",
      title: "Ressources juridiques emploi",
      icon: Scale,
      content: "Informations juridiques liées à l'emploi et au droit du travail.",
      items: [
        "Code du travail",
        "Conventions collectives",
        "Droits des salariés",
        "Procédures de recrutement"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-8 px-4 pb-12">
        <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
              <h1 className="relative text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Informations juridiques
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Mentions légales, confidentialité et ressources juridiques
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Card 
                  key={section.id}
                  className="border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h2 className="text-xl font-bold text-foreground">
                          {section.title}
                        </h2>
                        <p className="text-foreground/80 text-sm leading-relaxed">
                          {section.content}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-foreground/70">
                        Contenu :
                      </h3>
                      <ul className="space-y-1">
                        {section.items.map((item, i) => (
                          <li 
                            key={i}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => {
                        // Navigation vers la section détaillée
                        console.log(`Navigating to ${section.id}`);
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Consulter
                    </Button>
                  </div>
                  
                  <div className="h-1 bg-gradient-to-r from-primary/50 via-accent/50 to-transparent" />
                </Card>
              );
            })}
          </div>

          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8">
            <div className="text-center space-y-4">
              <Scale className="w-12 h-12 mx-auto text-primary" />
              <h3 className="text-xl font-bold text-foreground">
                Besoin d'informations supplémentaires ?
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Pour toute question juridique ou demande d'information complémentaire, 
                n'hésitez pas à nous contacter via notre formulaire de contact.
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/"}
              >
                Nous contacter
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
