import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Briefcase, MapPin } from "lucide-react";
import { useState } from "react";

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

export default function OffresGenerales() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");

  const handleSiteClick = (site: typeof jobSites[0]) => {
    const url = site.buildUrl(jobTitle, location);
    window.open(url, '_blank');
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
        </div>
      </main>
    </div>
  );
}
