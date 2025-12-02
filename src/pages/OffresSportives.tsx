import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, MapPin } from "lucide-react";
import { useState } from "react";

const sportJobSites = [
  {
    name: "Boost Partners",
    buildUrl: (job: string, location: string) => 
      `https://www.boost-partners.io/job-board?search=${encodeURIComponent(job + ' ' + location)}`
  },
  {
    name: "Sport Jobs Hunter",
    buildUrl: (job: string, location: string) => 
      `https://www.sportjobshunter.com/?s=${encodeURIComponent(job + ' ' + location)}`
  },
  {
    name: "Le Sport Recrute",
    buildUrl: (job: string, location: string) => 
      `https://www.lesportrecrute.fr/offres-emploi?search=${encodeURIComponent(job)}&location=${encodeURIComponent(location)}`
  },
  {
    name: "Sport Job",
    buildUrl: (job: string, location: string) => 
      `https://www.sport-job.fr/offre-emploi/?s=${encodeURIComponent(job + ' ' + location)}`
  },
  {
    name: "Myjobsports",
    buildUrl: (job: string, location: string) => 
      `https://www.myjobsports.com/recherche?q=${encodeURIComponent(job)}&lieu=${encodeURIComponent(location)}`
  },
  {
    name: "SPORTSJOBS",
    buildUrl: (job: string, location: string) => 
      `https://sportsjobs.fr/?s=${encodeURIComponent(job + ' ' + location)}`
  },
  {
    name: "Sportyjob",
    buildUrl: (job: string, location: string) => 
      `https://sportyjob.com/fr/offres-emploi?q=${encodeURIComponent(job)}&location=${encodeURIComponent(location)}`
  },
  {
    name: "OSV Jobs",
    buildUrl: (job: string, location: string) => 
      `https://emploi.outdoorsportsvalley.org/offres/?search=${encodeURIComponent(job + ' ' + location)}`
  },
  {
    name: "Clicandsport",
    buildUrl: (job: string, location: string) => 
      `https://www.emploi-store.fr/portail/services/clicandsportFr`
  }
];

export default function OffresSportives() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");

  const handleSiteClick = (site: typeof sportJobSites[0]) => {
    const url = site.buildUrl(jobTitle, location);
    window.open(url, '_blank');
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

          <Card className="border-border p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">Rechercher sur les sites d'emploi sportifs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Poste recherché</label>
                  <div className="relative">
                    <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ex: Coach sportif, Responsable marketing..."
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sportJobSites.map((site) => (
                  <button
                    key={site.name}
                    onClick={() => handleSiteClick(site)}
                    className="group flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card hover:border-accent/50 hover:bg-accent/5 transition-all duration-300"
                    title={`Rechercher sur ${site.name}`}
                  >
                    <div className="h-10 w-full flex items-center justify-center mb-2">
                      <span className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors text-center">
                        {site.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors">
                      Emploi sportif
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
