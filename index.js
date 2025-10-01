// Global variables
let temperatureChart;
let currentData = {};
let historicalData = { labels: [], temperature: [], humidity: [] };

// API Configuration - Replace with your Function App URL
const API_BASE_URL = 'https://iot-dashboard-api-f0e6dxhdgqaudger.eastasia-01.azurewebsites.net/api';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing IoT Dashboard...');
    loadDashboardData();
    initializeChart();
    setInterval(refreshDashboard, 60000); // Auto-refresh every minute
});

async function loadDashboardData() {
    console.log('📡 Loading real-time data from database...');
    
    try {
        // Show loading state
        showLoadingState();
        
        // Fetch current data
        await fetchCurrentData();
        
        // Fetch historical data
        await fetchHistoricalData();
        
        // Fetch statistics
        await fetchStatistics();
        
        // Update all dashboard components
        updateCurrentValues();
        updateSystemStatus();
        updateChart();
        updateLastUpdatedTime();
        
        // Hide loading state
        hideLoadingState();
        
        console.log('✅ Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showErrorState();
    }
}

async function fetchCurrentData() {
    try {
        const response = await fetch(`${API_BASE_URL}/getCurrentData`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        currentData = await response.json();
        console.log('📊 Current data:', currentData);
        
    } catch (error) {
        console.error('❌ Error fetching current data:', error);
        // Use fallback data
        currentData = {
            temperature: 0,
            temperatureF: 0,
            humidity: 0,
            heatIndexC: 0,
            heatIndexF: 0,
            deviceId: 'esp32-sensor-01',
            location: 'Unknown',
            sensorStatus: 'Offline',
            wifiRSSI: -100
        };
    }
}

async function fetchHistoricalData(hours = 24) {
    try {
        const response = await fetch(`${API_BASE_URL}/getHistoricalData?hours=${hours}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        historicalData = await response.json();
        console.log(`📈 Historical data (${hours}h):`, historicalData.labels.length, 'points');
        
    } catch (error) {
        console.error('❌ Error fetching historical data:', error);
        // Use empty data
        historicalData = { labels: [], temperature: [], humidity: [] };
    }
}

async function fetchStatistics() {
    try {
        const response = await fetch(`${API_BASE_URL}/getStatistics`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const stats = await response.json();
        console.log('📊 Statistics:', stats);
        
        // Update statistics in DOM
        document.getElementById('avg-temp').textContent = `${stats.avgTemp}°C`;
        document.getElementById('max-temp').textContent = `${stats.maxTemp}°C`;
        document.getElementById('avg-humidity').textContent = `${stats.avgHumidity}%`;
        document.getElementById('alert-count').textContent = stats.alertCount;
        document.getElementById('data-points').textContent = stats.dataPoints.toLocaleString();
        document.getElementById('uptime').textContent = `${stats.uptime}%`;
        
    } catch (error) {
        console.error('❌ Error fetching statistics:', error);
    }
}

function updateCurrentValues() {
    // Update current values from real data
    document.getElementById('temperature').textContent = `${currentData.temperature}°C`;
    document.getElementById('temp-fahrenheit').textContent = `${currentData.temperatureF}°F`;
    document.getElementById('humidity').textContent = `${currentData.humidity}%`;
    document.getElementById('heat-index').textContent = `${currentData.heatIndexC}°C`;
    document.getElementById('heat-fahrenheit').textContent = `${currentData.heatIndexF}°F`;

    // Update status indicators based on real thresholds
    updateStatusIndicators();
    
    // Update trends (compare with previous values if available)
    updateTrends();
}

function updateStatusIndicators() {
    const tempIndicator = document.getElementById('temp-indicator');
    const humidityIndicator = document.getElementById('humidity-indicator');
    const heatIndicator = document.getElementById('heat-indicator');

    // Temperature status (your actual thresholds)
    if (currentData.temperature > 35) {
        tempIndicator.className = 'status-indicator status-alert';
    } else if (currentData.temperature > 30) {
        tempIndicator.className = 'status-indicator status-warning';
    } else {
        tempIndicator.className = 'status-indicator status-normal';
    }

    // Humidity status (your actual thresholds)
    if (currentData.humidity > 80) {
        humidityIndicator.className = 'status-indicator status-alert';
    } else if (currentData.humidity > 75) {
        humidityIndicator.className = 'status-indicator status-warning';
    } else {
        humidityIndicator.className = 'status-indicator status-normal';
    }

    // Heat index status
    if (currentData.heatIndexC > 40) {
        heatIndicator.className = 'status-indicator status-alert';
    } else if (currentData.heatIndexC > 35) {
        heatIndicator.className = 'status-indicator status-warning';
    } else {
        heatIndicator.className = 'status-indicator status-normal';
    }
}

function updateSystemStatus() {
    document.getElementById('device-id').textContent = currentData.deviceId || 'Unknown';
    document.getElementById('location').textContent = currentData.location || 'Unknown';
    document.getElementById('sensor-status').textContent = currentData.sensorStatus || 'Unknown';
    
    // WiFi signal strength from real data
    const wifiElement = document.getElementById('wifi-signal');
    const wifiRSSI = currentData.wifiRSSI || -100;
    
    if (wifiRSSI > -50) {
        wifiElement.textContent = `${wifiRSSI} dBm Strong`;
        wifiElement.style.color = '#27ae60';
    } else if (wifiRSSI > -70) {
        wifiElement.textContent = `${wifiRSSI} dBm Good`;  
        wifiElement.style.color = '#f39c12';
    } else {
        wifiElement.textContent = `${wifiRSSI} dBm Weak`;
        wifiElement.style.color = '#e74c3c';
    }
}

function updateTrends() {
    // Calculate trends from historical data
    if (historicalData.temperature.length >= 2) {
        const recent = historicalData.temperature.slice(-2);
        const trend = recent[1] - recent[0];
        
        const tempTrend = document.getElementById('temp-trend');
        if (trend > 0.5) {
            tempTrend.innerHTML = `<i class="fas fa-arrow-up"></i> +${trend.toFixed(1)}°C from last reading`;
            tempTrend.style.color = '#e74c3c';
        } else if (trend < -0.5) {
            tempTrend.innerHTML = `<i class="fas fa-arrow-down"></i> ${trend.toFixed(1)}°C from last reading`;
            tempTrend.style.color = '#3498db';
        } else {
            tempTrend.innerHTML = `<i class="fas fa-equals"></i> Stable`;
            tempTrend.style.color = '#27ae60';
        }
    }
    
    if (historicalData.humidity.length >= 2) {
        const recent = historicalData.humidity.slice(-2);
        const trend = recent[1] - recent[0];
        
        const humidityTrend = document.getElementById('humidity-trend');
        if (trend > 2) {
            humidityTrend.innerHTML = `<i class="fas fa-arrow-up"></i> +${trend.toFixed(0)}% from last reading`;
        } else if (trend < -2) {
            humidityTrend.innerHTML = `<i class="fas fa-arrow-down"></i> ${trend.toFixed(0)}% from last reading`;
        } else {
            humidityTrend.innerHTML = `<i class="fas fa-equals"></i> Stable`;
        }
    }
}

function initializeChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historicalData.labels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: historicalData.temperature,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Humidity (%)',
                    data: historicalData.humidity,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        }
    });
}

function updateChart() {
    if (temperatureChart && historicalData.labels.length > 0) {
        temperatureChart.data.labels = historicalData.labels;
        temperatureChart.data.datasets[0].data = historicalData.temperature;
        temperatureChart.data.datasets[1].data = historicalData.humidity;
        temperatureChart.update();
    }
}

function updateLastUpdatedTime() {
    const now = new Date();
    document.getElementById('last-update').textContent = 
        `Last Updated: ${now.toLocaleString()}`;
}

function showLoadingState() {
    document.body.style.opacity = '0.7';
}

function hideLoadingState() {
    document.body.style.opacity = '1';
}

function showErrorState() {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 9999;
        background: #e74c3c; color: white; padding: 15px 20px;
        border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    errorDiv.innerHTML = '⚠️ Unable to load real-time data. Check API connection.';
    document.body.appendChild(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

async function refreshDashboard() {
    console.log('🔄 Refreshing dashboard with real data...');
    await loadDashboardData();
}

// Time range selector
document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('time-btn')) {
        document.querySelectorAll('.time-btn').forEach(btn => 
            btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const range = e.target.dataset.range;
        let hours;
        
        switch(range) {
            case '1h': hours = 1; break;
            case '6h': hours = 6; break;
            case '24h': hours = 24; break;
            case '7d': hours = 168; break;
            default: hours = 24;
        }
        
        console.log(`📊 Loading ${range} of data...`);
        await fetchHistoricalData(hours);
        updateChart();
    }
});

