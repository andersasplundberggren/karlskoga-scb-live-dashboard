// EXTRA KOD FÖR FÖRBÄTTRAD ÅLDERSVISUALISERING
// Lägg till denna kod i din HTML-fil för att få riktiga åldersgrupper

// Förbättrad funktion för att hämta historisk data med åldersgrupper
async function fetchHistoricalDataWithAge() {
    const url = `${API_BASE}/tables/TAB6471/data`;
    
    const query = {
        "query": [
            {
                "code": "ContentsCode",
                "selection": {
                    "filter": "item",
                    "values": ["000007SF"]
                }
            },
            {
                "code": "Region",
                "selection": {
                    "filter": "item",
                    "values": [KARLSKOGA_CODE]
                }
            },
            {
                "code": "Alder",
                "selection": {
                    "filter": "item",
                    "values": ["-4", "5-9", "10-14", "15-19", "20-24", 
                               "25-29", "30-34", "35-39", "40-44", "45-49",
                               "50-54", "55-59", "60-64", "65-69", "70-74",
                               "75-79", "80-84", "85-89", "90-94", "95-99", "100+5"]
                }
            },
            {
                "code": "Kon",
                "selection": {
                    "filter": "item",
                    "values": ["TotSa"]
                }
            },
            {
                "code": "Tid",
                "selection": {
                    "filter": "from",
                    "values": ["2025M01"]  // Senaste året
                }
            }
        ],
        "response": {
            "format": "json-stat2"
        }
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// Förbättrad funktion för att hämta prognosdata med åldersgrupper
async function fetchForecastDataWithAge() {
    const url = `${API_BASE}/tables/BefProgRegFakN22/data`;
    
    const query = {
        "query": [
            {
                "code": "Region",
                "selection": {
                    "filter": "item",
                    "values": [KARLSKOGA_CODE]
                }
            },
            {
                "code": "UtlSvBakgr",
                "selection": {
                    "filter": "item",
                    "values": ["TOT"]
                }
            },
            {
                "code": "Alder",
                "selection": {
                    "filter": "item",
                    "values": ["0-4", "5-9", "10-14", "15-19", "20-24",
                               "25-29", "30-34", "35-39", "40-44", "45-49",
                               "50-54", "55-59", "60-64", "65-69", "70-74",
                               "75-79", "80-84", "85-89", "90+"]
                }
            },
            {
                "code": "Kon",
                "selection": {
                    "filter": "item",
                    "values": ["1+2"]
                }
            },
            {
                "code": "Tid",
                "selection": {
                    "filter": "item",
                    "values": ["2070"]
                }
            }
        ],
        "response": {
            "format": "json-stat2"
        }
    };
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(query)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// Funktion för att gruppera åldersdata i större kategorier
function groupAgeData(data, ageMapping) {
    const groups = {
        '0-19': 0,
        '20-39': 0,
        '40-64': 0,
        '65+': 0
    };
    
    const values = data.value;
    const ageCategories = Object.keys(data.dimension.Alder.category.index);
    
    ageCategories.forEach((age, idx) => {
        const value = values[idx];
        
        if (['0-4', '-4', '5-9', '10-14', '15-19'].includes(age)) {
            groups['0-19'] += value;
        } else if (['20-24', '25-29', '30-34', '35-39'].includes(age)) {
            groups['20-39'] += value;
        } else if (['40-44', '45-49', '50-54', '55-59', '60-64'].includes(age)) {
            groups['40-64'] += value;
        } else {
            groups['65+'] += value;
        }
    });
    
    return groups;
}

// Förbättrad createAgeChart funktion som använder riktig data
function createAgeChartImproved(historicalAge, forecastAge) {
    const ctx = document.getElementById('ageChart').getContext('2d');
    
    // Gruppera data
    const currentGroups = groupAgeData(historicalAge);
    const forecastGroups = groupAgeData(forecastAge);
    
    const ageGroups = ['0-19', '20-39', '40-64', '65+'];
    
    ageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ageGroups,
            datasets: [
                {
                    label: 'Nuläge (2025)',
                    data: ageGroups.map(group => currentGroups[group]),
                    backgroundColor: 'rgba(102, 126, 234, 0.7)',
                    borderColor: '#667eea',
                    borderWidth: 2
                },
                {
                    label: 'Prognos 2070',
                    data: ageGroups.map(group => forecastGroups[group]),
                    backgroundColor: 'rgba(240, 147, 251, 0.7)',
                    borderColor: '#f093fb',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toLocaleString('sv-SE') + ' personer';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('sv-SE');
                        }
                    },
                    title: {
                        display: true,
                        text: 'Antal personer'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Åldersgrupp'
                    }
                }
            }
        }
    });
}

// Uppdatera init-funktionen för att använda den nya funktionen:
async function initImproved() {
    try {
        // Hämta historisk data, prognos, och detaljerad åldersdata
        const [historicalData, forecastData, historicalAge, forecastAge] = await Promise.all([
            fetchHistoricalData(),
            fetchForecastData(),
            fetchHistoricalDataWithAge(),
            fetchForecastDataWithAge()
        ]);
        
        // Uppdatera statistikkort
        updateStats(historicalData, forecastData);
        
        // Skapa diagram
        createPopulationChart(historicalData, forecastData);
        createAgeChartImproved(historicalAge, forecastAge);  // Använd förbättrad version
        createGenderChart(historicalData, forecastData);
        
        // Visa innehåll
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        document.getElementById('update-date').textContent = new Date().toLocaleDateString('sv-SE');
        
    } catch (error) {
        console.error('Fel vid hämtning av data:', error);
        showError('Det gick inte att hämta data från SCB. Försök igen senare.');
    }
}

// BONUS: Funktion för att skapa en befolkningspyramid
function createPopulationPyramid(historicalAge, forecastAge) {
    const ctx = document.getElementById('pyramidChart').getContext('2d');
    
    // Extrahera män och kvinnor separat
    const ageLabels = ['0-4', '5-9', '10-14', '15-19', '20-24', '25-29', 
                       '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', 
                       '60-64', '65-69', '70-74', '75-79', '80-84', '85-89', '90+'];
    
    // Här behöver du hämta data uppdelat på kön
    // Detta kräver att du ändrar query för att få både män (1) och kvinnor (2)
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ageLabels,
            datasets: [
                {
                    label: 'Män',
                    data: [/* män data, negativa värden */],
                    backgroundColor: 'rgba(74, 144, 226, 0.7)',
                    borderColor: '#4A90E2',
                    borderWidth: 1
                },
                {
                    label: 'Kvinnor',
                    data: [/* kvinnor data, positiva värden */],
                    backgroundColor: 'rgba(233, 75, 140, 0.7)',
                    borderColor: '#E94B8C',
                    borderWidth: 1
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const value = Math.abs(context.parsed.x);
                            label += value.toLocaleString('sv-SE') + ' personer';
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        callback: function(value) {
                            return Math.abs(value).toLocaleString('sv-SE');
                        }
                    }
                },
                y: {
                    stacked: true
                }
            }
        }
    });
}
