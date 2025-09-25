// Global variables
let temperatureChart;
let currentData = {
    temperature: 25.3,
    temperatureF: 77.5,
    humidity: 65,
    heatIndexC: 27.1,
    heatIndexF: 80.8,
    deviceId: 'esp32-sensor-01',
    location: 'Plant_Floor_1',
    sensorStatus: 'DHT11 Active',
    wifiRSSI: -45
};

// Sample historical data for chart
const historicalData = {
    labels: [],
    temperature: [],
    humidity: []
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadDashboardData();
    initializeChart();
    setInterval(refreshDashboard, 60000); // Auto-refresh every minute
});

function initializeDashboard() {
    // Generate sample time labels
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
        const time = new Date(now - i * 60 * 60 * 1000);
        historicalData.labels.push(time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }));
        
        // Generate sample data with some variation
        const baseTemp = 25 + Math.sin(i * 0.3) * 3 + (Math.random() - 0.5) * 2;
        const baseHumidity = 65 + Math.cos(i * 0.4) * 8 + (Math.random() - 0.5) * 5;
        
        historicalData.temperature.push(Math.round(baseTemp * 10) / 10);
        historicalData.humidity.push(Math.round(baseHumidity));
    }
}

function loadDashboardData() {
    // In a real implementation, this would fetch data from your SQL Database
    // For now, we'll simulate with dynamic data
    updateCurrentValues();
    updateSystemStatus();
    updateStatistics();
    updateAlerts();
    updateLastUpdatedTime();
}

function updateCurrentValues() {
    // Add some realistic variation to the data
    const variation = (Math.random() - 0.5) * 0.5;
    currentData.temperature = Math.round((25 + variation) * 10) / 10;
    currentData.temperatureF = Math.round((currentData.temperature * 9/5 + 32) * 10) / 10;
    
    const humidityVariation = (Math.random() - 0.5) * 3;
    currentData.humidity = Math.round(65 + humidityVariation);
    
    // Calculate heat index (simplified formula)
    currentData.heatIndexC = Math.round((currentData.temperature + 0.5 * currentData.humidity/10) * 10) / 10;
    currentData.heatIndexF = Math.round((currentData.heatIndexC * 9/5 + 32) * 10) / 10;

    // Update DOM elements
    document.getElementById('temperature').textContent = `${currentData.temperature}°C`;
    document.getElementById('temp-fahrenheit').textContent = `${currentData.temperatureF}°F`;
    document.getElementById('humidity').textContent = `${currentData.humidity}%`;
    document.getElementById('heat-index').textContent = `${currentData.heatIndexC}°C`;
    document.getElementById('heat-fahrenheit').textContent = `${currentData.heatIndexF}°F`;

    // Update status indicators
    updateStatusIndicators();
}

function updateStatusIndicators() {
    const tempIndicator = document.getElementById('temp-indicator');
    const humidityIndicator = document.getElementById('humidity-indicator');
    const heatIndicator = document.getElementById('heat-indicator');

    // Temperature status
    if (currentData.temperature > 35) {
        tempIndicator.className = 'status-indicator status-alert';
    } else if (currentData.temperature > 30) {
        tempIndicator.className = 'status-indicator status-warning';
    } else {
        tempIndicator.className = 'status-indicator status-normal';
    }

    // Humidity status
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
    document.getElementById('device-id').textContent = currentData.deviceId;
    document.getElementById('location').textContent = currentData.location;
    document.getElementById('sensor-status').textContent = currentData.sensorStatus;
    
    // WiFi signal strength
    const wifiElement = document.getElementById('wifi-signal');
    if (currentData.wifiRSSI > -50) {
        wifiElement.textContent = `${currentData.wifiRSSI} dBm Strong`;
        wifiElement.style.color = '#27ae60';
    } else if (currentData.wifiRSSI > -70) {
        wifiElement.textContent = `${currentData.wifiRSSI} dBm Good`;
        wifiElement.style.color = '#f39c12';
    } else {
        wifiElement.textContent = `${currentData.wifiRSSI} dBm Weak`;
        wifiElement.style.color = '#e74c3c';
    }
}

function updateStatistics() {
    // Calculate daily statistics from historical data
    const temps = historicalData.temperature;
    const humidities = historicalData.humidity;
    
    const avgTemp = Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10;
    const maxTemp = Math.max(...temps);
    const avgHumidity = Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length);
    
    document.getElementById('avg-temp').textContent = `${avgTemp}°C`;
    document.getElementById('max-temp').textContent = `${maxTemp}°C`;
    document.getElementById('avg-humidity').textContent = `${avgHumidity}%`;
    document.getElementById('alert-count').textContent = '2';
    document.getElementById('data-points').textContent = '1,440';
}

function updateAlerts() {
    const alertsContainer = document.getElementById('alerts-container');
    const alerts = [
        {
            type: 'high',
            title: 'High Temperature Alert',
            message: 'Temperature exceeded 35°C',
            time: '2 hours ago',
            device: 'esp32-sensor-01'
        },
        {
            type: 'medium',
            title: 'Humidity Warning',
            message: 'Humidity approaching upper threshold',
            time: '4 hours ago',
            device: 'esp32-sensor-01'
        },
        {
            type: 'low',
            title: 'System Notice',
            message: 'Daily data backup completed',
            time: '6 hours ago',
            device: 'system'
        }
    ];

    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert-item alert-${alert.type}">
            <div class="alert-title">${alert.title}</div>
            <div class="alert-message">${alert.message}</div>
            <div class="alert-time">${alert.time} • ${alert.device}</div>
        </div>
    `).join('');
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
                    },
                    min: 20,
                    max: 40
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Humidity (%)'
                    },
                    min: 40,
                    max: 90,
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function updateLastUpdatedTime() {
    const now = new Date();
    document.getElementById('last-update').textContent = 
        `Last Updated: ${now.toLocaleString()}`;
}

function refreshDashboard() {
    console.log('🔄 Refreshing dashboard data...');
    
    // Add loading state
    document.body.classList.add('loading');
    
    setTimeout(() => {
        loadDashboardData();
        
        // Update chart with new data point
        const now = new Date();
        historicalData.labels.push(now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }));
        historicalData.labels.shift(); // Remove oldest point
        
        historicalData.temperature.push(currentData.temperature);
        historicalData.temperature.shift();
        
        historicalData.humidity.push(currentData.humidity);
        historicalData.humidity.shift();
        
        temperatureChart.update();
        
        // Remove loading state
        document.body.classList.remove('loading');
        
        console.log('✅ Dashboard refreshed successfully');
    }, 1000);
}

// Time range selector for chart
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('time-btn')) {
        document.querySelectorAll('.time-btn').forEach(btn => 
            btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const range = e.target.dataset.range;
        console.log(`📊 Changing chart range to: ${range}`);
        // Here you would update the chart with different time ranges
    }
});

// Connection status simulation
setInterval(() => {
    const connectionStatus = document.getElementById('connection-status');
    const isOnline = Math.random() > 0.05; // 95% uptime simulation
    
    if (isOnline) {
        connectionStatus.innerHTML = '🟢 Connected';
        connectionStatus.style.color = '#27ae60';
    } else {
        connectionStatus.innerHTML = '🔴 Disconnected';
        connectionStatus.style.color = '#e74c3c';
    }
}, 30000); // Check every 30 seconds
