import { Link } from "react-router-dom";
import { MessageSquare, Newspaper, Briefcase, Scale, FileText, Upload, Trophy, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const quickLinks = [
  {
    title: "Recherche & Scraping",
    description: "Recherchez et scrapez du contenu avec reformulation IA",
    icon: MessageSquare,
    url: "/prompt",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Actualités générales",
    description: "Consultez les dernières actualités",
    icon: Sparkles,
    url: "/actualites/generales",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Actualités sportives",
    description: "Les news du monde sportif",
    icon: Trophy,
    url: "/actualites/sportives",
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Offres d'emploi",
    description: "Trouvez des opportunités professionnelles",
    icon: Briefcase,
    url: "/offres/generales",
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Sites juridiques",
    description: "Accédez aux ressources juridiques",
    icon: Scale,
    url: "/sites-juridiques/dalloz",
    color: "from-amber-500 to-yellow-500"
  },
  {
    title: "Bibliothèque PDF",
    description: "Gérez et interrogez vos documents PDF",
    icon: FileText,
    url: "/bibliotheque-pdf",
    color: "from-indigo-500 to-violet-500"
  },
  {
    title: "Gestion des sites",
    description: "Importez et gérez les sites à scraper",
    icon: Upload,
    url: "/gestion-sites",
    color: "from-slate-500 to-gray-500"
  }
];

export default function Accueil() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Bienvenue sur ScrapAI
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Votre assistant intelligent pour le scraping web, la recherche juridique et la veille d'actualités
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickLinks.map((link) => (
            <Link key={link.title} to={link.url}>
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-border/50 bg-card/80 backdrop-blur-sm group">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{link.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {link.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
