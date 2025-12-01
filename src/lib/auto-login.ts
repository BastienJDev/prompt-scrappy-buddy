// Utility to trigger the Chrome extension auto-login
export function triggerAutoLogin(siteId: string, startUrl?: string) {
  console.log(`[ScrapAI] Triggering auto-login for: ${siteId}`);
  
  const event = new CustomEvent('SCRAPAI_AUTO_LOGIN', {
    detail: {
      siteId,
      startUrl,
      userOpened: true // We're opening the tab from the UI
    }
  });
  
  window.dispatchEvent(event);
  
  // Open the site in a new tab
  if (startUrl) {
    window.open(startUrl, '_blank');
  }
}

// Site configurations matching the Chrome extension
export const SITE_CONFIGS = {
  dalloz: {
    name: "Dalloz",
    startUrl: "https://catalogue-bu.u-bourgogne.fr/discovery/dbsearch?vid=33UB_INST:33UB_INST&lang=fr"
  },
  lamyline: {
    name: "Lamyline",
    startUrl: "https://catalogue-bu.u-bourgogne.fr/discovery/dbsearch?vid=33UB_INST:33UB_INST&lang=fr"
  },
  lexisnexis: {
    name: "Lexis 360",
    startUrl: "https://catalogue-bu.u-bourgogne.fr/discovery/search?vid=33UB_INST:33UB_INST&lang=fr"
  },
  cairn: {
    name: "Cairn",
    startUrl: "https://catalogue-bu.u-bourgogne.fr/discovery/dbsearch?vid=33UB_INST:33UB_INST&lang=fr"
  },
  ledoctrinal: {
    name: "Le Doctrinal",
    startUrl: "https://catalogue-bu.u-bourgogne.fr/discovery/dbsearch?vid=33UB_INST:33UB_INST&lang=fr"
  },
  droitdusport: {
    name: "Droit du Sport",
    startUrl: "http://droitdusport.com/"
  }
} as const;
