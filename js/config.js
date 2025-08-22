// Live SCB Dashboard - Konfiguration
const CONFIG = {
    // SUPABASE UPPGIFTER - Uppdatera med dina riktiga värden!
    SUPABASE_URL: 'https://tuzyfjnuksnfoqmqkshn.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1enlmam51a3NuZm9xbXFrc2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjAzMjYsImV4cCI6MjA3MTQzNjMyNn0.qNBqJkgiCbpeHho3y0YsgVrvqZ9DC2kdM_y0Xnx0asM',
    EDGE_FUNCTION_URL: 'https://tuzyfjnuksnfoqmqkshn.supabase.co/functions/v1/scb-data-fetcher',
    
    // APP-INSTÄLLNINGAR
    DEBUG: true,
    CACHE_INFO: true,
    VERSION: '2.0.0',
    APP_NAME: 'Karlskoga Live Dashboard'
};

// Debug-funktion
function debugLog(message, data = null) {
    if (CONFIG.DEBUG) {
        const timestamp = new Date().toLocaleTimeString('sv-SE');
        console.log(`🔍 [${timestamp}] ${message}`, data || '');
    }
}

// Validera konfiguration
function validateConfig() {
    const errors = [];
    
    if (CONFIG.SUPABASE_URL.includes('ERSÄTT_MED')) {
        errors.push('⚠️ SUPABASE_URL behöver uppdateras med din riktiga Project URL');
    }
    
    if (CONFIG.SUPABASE_ANON_KEY.includes('ERSÄTT_MED')) {
        errors.push('⚠️ SUPABASE_ANON_KEY behöver uppdateras med din riktiga anon key');
    }
    
    if (CONFIG.EDGE_FUNCTION_URL.includes('ERSÄTT_MED')) {
        errors.push('⚠️ EDGE_FUNCTION_URL behöver uppdateras med din riktiga Function URL');
    }
    
    if (errors.length > 0) {
        console.warn('❌ Konfigurationsfel funna:');
        errors.forEach(error => console.warn(error));
        console.warn('💡 Uppdatera js/config.js med dina riktiga Supabase-uppgifter från anteckningsappen');
        return false;
    } else {
        debugLog('✅ Konfiguration validerad framgångsrikt');
        return true;
    }
}

// Test av nätverksanslutning
async function testNetworkConnection() {
    try {
        const response = await fetch(CONFIG.EDGE_FUNCTION_URL);
        return response.ok;
    } catch {
        return false;
    }
}

// Initiera konfiguration
document.addEventListener('DOMContentLoaded', function() {
    debugLog('🚀 Live SCB Dashboard konfiguration laddad', {
        version: CONFIG.VERSION,
        debug: CONFIG.DEBUG,
        app: CONFIG.APP_NAME
    });
    
    validateConfig();
});
