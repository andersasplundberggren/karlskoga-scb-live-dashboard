# Karlskoga Kommun - Befolkningsstatistik

En interaktiv webbapplikation som visualiserar befolkningsstatistik och befolkningsprognoser för Karlskoga kommun.

## 📊 Funktioner

- **Aktuell befolkning**: Visar senaste befolkningsdata från SCB
- **Långsiktig prognos**: Befolkningsframskrivning till 2070
- **Interaktiva diagram**:
  - Befolkningsutveckling över tid (historik + prognos)
  - Könsfördelning
  - Åldersfördelning
- **Realtidsdata**: Hämtar automatiskt uppdaterad data från SCB:s API

## 🚀 Kom igång

### Lokal testning

1. Öppna `karlskoga-befolkning.html` direkt i din webbläsare
2. Inget serverupplägg eller byggsteg krävs!

### Publicera på GitHub Pages

#### Steg 1: Skapa ett GitHub-repo

```bash
# Skapa en ny mapp och initiera git
mkdir karlskoga-befolkning
cd karlskoga-befolkning
git init

# Kopiera HTML-filen
cp /sökväg/till/karlskoga-befolkning.html index.html

# Committa filen
git add index.html
git commit -m "Initial commit: Befolkningsvisualisering för Karlskoga"

# Skapa repo på GitHub och pusha
git remote add origin https://github.com/dittanvändarnamn/karlskoga-befolkning.git
git branch -M main
git push -u origin main
```

#### Steg 2: Aktivera GitHub Pages

1. Gå till ditt GitHub-repo
2. Klicka på **Settings**
3. Navigera till **Pages** (i sidomenyn)
4. Under **Source**, välj **main** branch
5. Klicka **Save**

Din sida kommer att publiceras på:
```
https://dittanvändarnamn.github.io/karlskoga-befolkning/
```

## 🔧 Teknisk information

### Datakällor

Applikationen hämtar data från två SCB-tabeller via API:

1. **TAB6471** - Månadsstatistik för befolkning
   - Använd för historisk data
   - Uppdateras månadsvis av SCB

2. **BefProgRegFakN22** - Befolkningsframskrivning 2022-2070
   - Regionala befolkningsprognoser
   - Uppdateras vartannat år av SCB

### API-format

Applikationen använder SCB:s **PxWeb API 2.0** med JSON-stat2 format:

```javascript
const query = {
  "query": [
    {
      "code": "Region",
      "selection": {
        "filter": "item",
        "values": ["1883"]  // Karlskoga kommunkod
      }
    }
  ],
  "response": {
    "format": "json-stat2"
  }
};
```

### Teknologier

- **HTML5** - Struktur
- **CSS3** - Modern design med gradients och animationer
- **JavaScript (ES6+)** - Datahantering och interaktivitet
- **Chart.js 4.4** - Diagrambibliotek
- **SCB PxWeb API 2.0** - Datakälla

## 📝 Anpassning

### Ändra kommun

För att visualisera en annan kommun, ändra kommunkoden:

```javascript
// I karlskoga-befolkning.html, hitta denna rad:
const KARLSKOGA_CODE = '1883';

// Ändra till din kommunkod, t.ex.:
const OREBRO_CODE = '1880';  // Örebro
const STOCKHOLM_CODE = '0180';  // Stockholm
```

Fullständig lista över kommunkoder: https://www.scb.se/hitta-statistik/regional-statistik-och-kartor/regionala-indelningar/lan-och-kommuner/

### Anpassa färger

Ändra färgteman i CSS-sektionen:

```css
/* Huvudgradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Diagram färger */
borderColor: '#667eea',  /* Huvudfärg */
backgroundColor: 'rgba(102, 126, 234, 0.1)',  /* Bakgrundsfärg */
```

### Lägg till fler diagram

Exempel för att lägga till ett nytt diagram:

```html
<!-- I HTML-delen -->
<div class="chart-container">
    <h2 class="chart-title">📊 Ditt nya diagram</h2>
    <div class="chart-wrapper">
        <canvas id="dinCanvas"></canvas>
    </div>
</div>
```

```javascript
// I JavaScript-delen
function createDinChart(data) {
    const ctx = document.getElementById('dinCanvas').getContext('2d');
    new Chart(ctx, {
        type: 'bar',  // eller 'line', 'pie', etc.
        data: { /* din data */ },
        options: { /* dina inställningar */ }
    });
}
```

## 🔍 API-endpoints för mer data

### Andra användbara SCB-tabeller:

```javascript
// Befolkning efter ålder (detaljerad)
const url = 'https://statistikdatabasen.scb.se/api/v2/tables/BefolkningNy/data';

// Befolkning efter födelseland
const url = 'https://statistikdatabasen.scb.se/api/v2/tables/BE0101N2/data';

// Befolkningsförändringar (födda, döda, flyttningar)
const url = 'https://statistikdatabasen.scb.se/api/v2/tables/BE0101A/data';
```

## 📚 Dokumentation

- [SCB PxWeb API 2.0](https://www.scb.se/vara-tjanster/oppna-data/pxwebapi/pxwebapi-2.0)
- [Chart.js dokumentation](https://www.chartjs.org/docs/latest/)
- [GitHub Pages guide](https://pages.github.com/)

## 🐛 Felsökning

### Problem: Data laddas inte

1. **Kontrollera nätverket**: Öppna DevTools (F12) → Network-fliken
2. **CORS-problem**: Detta bör inte inträffa eftersom SCB:s API tillåter CORS
3. **API-ändringar**: Verifiera att tabellnamnen fortfarande stämmer på SCB:s webbplats

### Problem: Diagrammen visas inte

1. **Kontrollera konsolen**: F12 → Console för felmeddelanden
2. **Chart.js laddad**: Verifiera att CDN-länken fungerar
3. **Data-format**: Kontrollera att API-svaren har rätt struktur

### Problem: Gamla data visas

- Stäng cachning i webbläsaren
- Eller öppna i incognito-läge
- API:et cachar inte data, så du får alltid senaste versionen från SCB

## 📄 Licens

Fri att använda och modifiera. Data från SCB följer [SCB:s villkor för användning](https://www.scb.se/om-scb/webbplatsens-innehall-och-kvalitet/oppna-data/).

## 🤝 Bidra

Förslag och förbättringar är välkomna! Skapa en pull request eller öppna en issue.

## 📧 Kontakt

För frågor om koden - kontakta via GitHub issues.
För frågor om data - kontakta [SCB direkt](https://www.scb.se/kontakta-oss/).

## 🙏 Tack till

- **SCB (Statistiska Centralbyrån)** för öppen data och välbyggt API
- **Chart.js** för det fantastiska diagrambiblioteket

---

**Gjord med ❤️ för Karlskoga kommun**
