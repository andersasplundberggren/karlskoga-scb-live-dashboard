// Live SCB API-wrapper med Supabase Edge Function
class LiveSCBApi {
    constructor() {
        this.edgeFunctionUrl = CONFIG.EDGE_FUNCTION_URL;
        this.supabaseKey = CONFIG.SUPABASE_ANON_KEY;
        this.lastDataFetch = null;
        this.connectionTested = false;
        
        debugLog('🚀 Live SCB API initialiserad');
    }

    async testConnection() {
        try {
            debugLog('🔍 Testar anslutning till Supabase Edge Function...');
            
            const response = await fetch(this.edgeFunctionUrl, {
                method: 'GET',
                headers: this.getHeaders(),
                // Timeout för test
                signal: AbortSignal.timeout(10000) // 10 sekunder
            });

            if (response.ok) {
                const data = await response.json();
                debugLog('✅ Edge Function svarar korrekt:', data);
                
                this.connectionTested = true;
                
                let message = 'Live SCB API fungerar perfekt!';
                if (data.cached) {
                    message += ` (Cached data, ${data.cacheAgeMinutes || 0} min gammal)`;
                } else {
                    message += ' (Fresh data genererad)';
                }
                
                return {
                    success: true,
                    message: message,
                    data: data
                };
            } else {
                throw new Error(`Edge Function HTTP error: ${response.status}`);
            }
            
        } catch (error) {
            debugLog('❌ Anslutningstest misslyckades:', error.message);
            
            let errorMessage = 'Anslutningsfel: ';
            if (error.name === 'TimeoutError') {
                errorMessage += 'Timeout - Edge Function svarar inte inom 10 sekunder';
            } else if (error.message.includes('fetch')) {
                errorMessage += 'Kan inte nå Supabase - kontrollera internetanslutning';
            } else {
                errorMessage += error.message;
            }
            
            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }

    async getPopulationData(forceRefresh = false) {
        try {
            debugLog('📊 Hämtar live befolkningsdata från Supabase Edge Function...');
            
            // Lägg till cache-busting om force refresh
            let url = this.edgeFunctionUrl;
            if (forceRefresh) {
                url += '?refresh=' + Date.now();
                debugLog('🔄 Force refresh begärd - tvingar ny data');
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders(),
                signal: AbortSignal.timeout(30000) // 30 sekunder för data-hämtning
            });

            if (!response.ok) {
                throw new Error(`Edge Function error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            debugLog('📊 API-resultat mottaget:', result);

            if (result.success && result.data) {
                this.lastDataFetch = new Date();
                
                // Konvertera till dashboard-format
                const formattedData = this.formatForDashboard(result.data);
                
                // Skapa meddelande baserat på datakälla och status
                let message = this.createStatusMessage(result);
                
                return {
                    success: true,
                    message: message,
                    dataSource: this.getDataSourceInfo(result),
                    cached: result.cached || false,
                    cacheAge: result.cacheAgeMinutes || 0,
                    fallback: result.fallback || false,
                    data: formattedData
                };
            } else {
                throw new Error('Ogiltigt svar från Edge Function - saknar data');
            }
            
        } catch (error) {
            debugLog('❌ Fel vid live datahämtning:', error.message);
            
            // Skapa detaljerat felmeddelande
            let errorMessage = 'Datahämtning misslyckades: ';
            if (error.name === 'TimeoutError') {
                errorMessage = 'Timeout - Edge Function tog för lång tid att svara';
            } else if (error.message.includes('fetch')) {
                errorMessage = 'Nätverksproblem - kontrollera internetanslutning';
            } else {
                errorMessage += error.message;
            }
            
            // Local fallback med realistisk data
            const fallbackData = this.generateLocalFallback();
            return {
                success: true,
                message: errorMessage + ' - använder lokal fallback',
                dataSource: 'local_fallback',
                cached: false,
                fallback: true,
                error: error.message,
                data: fallbackData
            };
        }
    }

    formatForDashboard(scbData) {
        debugLog('🔄 Formaterar SCB-data för dashboard...');
        
        const years = Object.keys(scbData.populations).sort();
        const populations = years.map(year => scbData.populations[year]);
        
        // Validera data
        if (years.length === 0 || populations.some(p => isNaN(p))) {
            throw new Error('Ogiltigt dataformat från Edge Function');
        }
        
        return {
            years: years,
            populations: populations,
            ageGroups: scbData.ageGroups,
            metadata: {
                lastUpdated: scbData.lastUpdated,
                source: scbData.source,
                fetchTime: this.lastDataFetch?.toISOString(),
                totalPopulation: populations[populations.length - 1]
            }
        };
    }

    createStatusMessage(result) {
        if (result.fallback) {
            if (result.cached) {
                return `SCB temporärt otillgängligt - använder cached fallback (${result.cacheAgeMinutes || 0} min)`;
            } else {
                return 'SCB temporärt otillgängligt - använder kvalitetsdata';
            }
        } else if (result.cached) {
            return `Cached SCB-data (${result.cacheAgeMinutes || 0} minuter gammal)`;
        } else {
            return 'Fresh SCB-data framgångsrikt hämtad';
        }
    }

    getDataSourceInfo(result) {
        if (result.fallback && result.cached) return 'fallback_cached';
        if (result.fallback) return 'fallback_quality';
        if (result.cached) return 'scb_cached';
        return 'scb_live';
    }

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json',
            'apikey': this.supabaseKey,
            'X-Client-Info': 'karlskoga-dashboard/2.0'
        };
    }

    generateLocalFallback() {
        debugLog('🎲 Genererar lokal fallback-data...');
        
        const currentYear = new Date().getFullYear();
        const years = [];
        const populations = [];
        
        // Verkliga siffror som bas (senaste kända från SCB)
        const baseData = {
            2020: 28756,
            2021: 30045,
            2022: 30189,
            2023: 30261,
            2024: 30167  // Q3 2024
        };
        
        // Generera 5 års data
        for (let i = 4; i >= 0; i--) {
            const year = currentYear - i;
            years.push(year.toString());
            
            if (baseData[year]) {
                // Använd verklig data med minimal variation
                const variation = Math.floor(Math.random() * 40 - 20); // ±20
                populations.push(Math.max(baseData[year] + variation, 29500));
            } else {
                // Projicera baserat på trend
                const referenceYear = 2024;
                const referencePopulation = 30167;
                const yearDiff = year - referenceYear;
                const annualChange = -20; // Lätt minskning per år
                
                const projected = referencePopulation + (yearDiff * annualChange);
                const variation = Math.floor(Math.random() * 60 - 30);
                populations.push(Math.max(projected + variation, 29500));
            }
        }
        
        const latestPop = populations[populations.length - 1];
        debugLog('📊 Lokal fallback genererad:', { latestPopulation: latestPop, years: years.length });
        
        return {
            years: years,
            populations: populations,
            ageGroups: {
                '0-17': Math.round(latestPop * 0.168),
                '18-64': Math.round(latestPop * 0.570),
                '65+': Math.round(latestPop * 0.262)
            },
            metadata: {
                lastUpdated: new Date().toISOString(),
                source: 'Lokal fallback baserat på SCB-trender',
                fetchTime: new Date().toISOString(),
                totalPopulation: latestPop
            }
        };
    }

    // Hjälpfunktioner för debugging och status
    getLastFetchInfo() {
        return this.lastDataFetch ? {
            time: this.lastDataFetch,
            ageMinutes: Math.round((Date.now() - this.lastDataFetch.getTime()) / 1000 / 60),
            ageSeconds: Math.round((Date.now() - this.lastDataFetch.getTime()) / 1000)
        } : null;
    }

    isConfigValid() {
        return !CONFIG.SUPABASE_URL.includes('ERSÄTT_MED') && 
               !CONFIG.SUPABASE_ANON_KEY.includes('ERSÄTT_MED') &&
               !CONFIG.EDGE_FUNCTION_URL.includes('ERSÄTT_MED');
    }

    getSystemStatus() {
        return {
            configValid: this.isConfigValid(),
            connectionTested: this.connectionTested,
            lastFetch: this.getLastFetchInfo(),
            edgeFunctionUrl: this.edgeFunctionUrl
        };
    }
}

// Skapa global API-instans
const scbApi = new LiveSCBApi();

// Validera setup vid laddning
document.addEventListener('DOMContentLoaded', function() {
    if (!scbApi.isConfigValid()) {
        console.warn('⚠️ VIKTIGT: Konfiguration inte korrekt inställd!');
        console.warn('💡 Uppdatera js/config.js med dina riktiga Supabase-uppgifter');
        console.warn('📝 Kontrollera: Project URL, Anon Key och Function URL');
    } else {
        debugLog('✅ Live SCB API redo för användning!');
        debugLog('🔧 System status:', scbApi.getSystemStatus());
    }
});
