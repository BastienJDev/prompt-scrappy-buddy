import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Copy } from "lucide-react";
import { toast } from "sonner";

interface Actualite {
  id: number;
  titre: string;
  date: string;
  categorie: string;
  description: string;
  badge: string;
  badgeColor: string;
}

interface EmailPreviewProps {
  actualites: Actualite[];
}

export const EmailPreview = ({ actualites }: EmailPreviewProps) => {
  const generateEmailHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 20px; }
    .news-item { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb; }
    .news-item:last-child { border-bottom: none; }
    .news-title { color: #1f2937; font-size: 20px; font-weight: bold; margin-bottom: 8px; }
    .news-meta { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
    .news-badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-left: 8px; }
    .news-description { color: #374151; line-height: 1.6; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏆 Actualités Sportives</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Votre résumé sportif du ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
    <div class="content">
      ${actualites.map(actu => `
        <div class="news-item">
          <div class="news-title">
            ${actu.titre}
            <span class="news-badge" style="background-color: ${actu.badgeColor.includes('green') ? '#10b981' : actu.badgeColor.includes('orange') ? '#f97316' : actu.badgeColor.includes('blue') ? '#3b82f6' : '#eab308'}; color: white;">
              ${actu.badge}
            </span>
          </div>
          <div class="news-meta">
            📅 ${new Date(actu.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} • ${actu.categorie}
          </div>
          <div class="news-description">
            ${actu.description}
          </div>
        </div>
      `).join('')}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Actualités Sportives - Tous droits réservés
    </div>
  </div>
</body>
</html>
    `.trim();
  };

  const copyToClipboard = () => {
    const html = generateEmailHTML();
    navigator.clipboard.writeText(html).then(() => {
      toast.success("Email copié dans le presse-papiers");
    }).catch(() => {
      toast.error("Erreur lors de la copie");
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Mail className="w-4 h-4" />
          Aperçu Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aperçu de l'email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={copyToClipboard} variant="outline" className="gap-2">
              <Copy className="w-4 h-4" />
              Copier le HTML
            </Button>
          </div>
          <Card className="p-4 bg-muted">
            <div dangerouslySetInnerHTML={{ __html: generateEmailHTML() }} />
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
