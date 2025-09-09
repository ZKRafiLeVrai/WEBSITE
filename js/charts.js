// Configuration globale de Chart.js
Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#666';
Chart.defaults.plugins.legend.display = true;
Chart.defaults.plugins.legend.position = 'top';

class ChartsManager {
    constructor() {
        this.charts = new Map();
        this.colors = {
            primary: '#00a2ff',
            secondary: '#6c757d',
            success: '#28a745',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8',
            gradient: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
        };
    }

    // Création du graphique des visites
    createVisitsChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Destruction du graphique existant
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(item => item.date),
                datasets: [{
                    label: 'Visites quotidiennes',
                    data: data.map(item => item.visits),
                    borderColor: this.colors.primary,
                    backgroundColor: this.createGradient(ctx, this.colors.primary),
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointHoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: this.colors.primary,
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            title: function(context) {
                                return `🎮 ${context[0].label}`;
                            },
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `👥 ${context.parsed.toLocaleString()} visites (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 2000
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    // Création du graphique de popularité
    createPopularityChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(game => game.name.length > 15 ? game.name.substring(0, 12) + '...' : game.name),
                datasets: [
                    {
                        label: 'Visites',
                        data: data.map(game => game.visits),
                        backgroundColor: this.createGradient(ctx, this.colors.primary, 'vertical'),
                        borderColor: this.colors.primary,
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Favoris',
                        data: data.map(game => game.favorites),
                        backgroundColor: this.createGradient(ctx, this.colors.warning, 'vertical'),
                        borderColor: this.colors.warning,
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
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
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: this.colors.primary,
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            title: function(context) {
                                return `🎮 ${context[0].label}`;
                            },
                            label: function(context) {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                const icon = label === 'Visites' ? '👥' : '⭐';
                                return `${icon} ${label}: ${value.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            color: '#888'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#888',
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        },
                        title: {
                            display: true,
                            text: 'Visites',
                            color: this.colors.primary
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            color: '#888',
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        },
                        title: {
                            display: true,
                            text: 'Favoris',
                            color: this.colors.warning
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    // Création d'un gradient
    createGradient(ctx, color, direction = 'horizontal') {
        const gradient = ctx.createLinearGradient(
            direction === 'horizontal' ? 0 : 0,
            direction === 'horizontal' ? 0 : ctx.canvas.height,
            direction === 'horizontal' ? ctx.canvas.width : 0,
            direction === 'horizontal' ? 0 : 0
        );
        
        gradient.addColorStop(0, color + '80');
        gradient.addColorStop(1, color + '20');
        return gradient;
    }

    // Mise à jour des graphiques avec nouvelles données
    updateChart(canvasId, newData) {
        const chart = this.charts.get(canvasId);
        if (!chart) return;

        chart.data = newData;
        chart.update('active');
    }

    // Destruction d'un graphique
    destroyChart(canvasId) {
        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
            this.charts.delete(canvasId);
        }
    }

    // Destruction de tous les graphiques
    destroyAllCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    // Animation des compteurs
    animateCounter(elementId, targetValue, duration = 2000) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Fonction d'easing pour une animation plus naturelle
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
            
            element.textContent = currentValue.toLocaleString();
            element.classList.add('animate-counter');

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = targetValue.toLocaleString();
            }
        };

        requestAnimationFrame(updateCounter);
    }

    // Animation des barres de progression
    animateProgressBar(elementId, percentage, delay = 0) {
        const element = document.getElementById(elementId);
        if (!element) return;

        setTimeout(() => {
            element.style.width = `${Math.min(percentage, 100)}%`;
            element.classList.add('animate-progress');
        }, delay);
    }

    // Génération de couleurs aléatoires harmonieuses
    generateHarmoniousColors(count) {
        const colors = [];
        const baseHue = Math.random() * 360;
        
        for (let i = 0; i < count; i++) {
            const hue = (baseHue + (i * 360 / count)) % 360;
            const saturation = 65 + Math.random() * 25; // 65-90%
            const lightness = 50 + Math.random() * 20;  // 50-70%
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
        
        return colors;
    }

    // Export des graphiques en image
    exportChart(canvasId, filename) {
        const chart = this.charts.get(canvasId);
        if (!chart) return;

        const url = chart.toBase64Image();
        const link = document.createElement('a');
        link.download = filename || `chart-${canvasId}-${Date.now()}.png`;
        link.href = url;
        link.click();
    }

    // Redimensionnement des graphiques
    resizeCharts() {
        this.charts.forEach(chart => {
            chart.resize();
        });
    }

    // Mise à jour du thème des graphiques
    updateTheme(isDark = false) {
        const textColor = isDark ? '#fff' : '#666';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        Chart.defaults.color = textColor;
        Chart.defaults.borderColor = gridColor;
        Chart.defaults.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        // Mise à jour de tous les graphiques existants
        this.charts.forEach(chart => {
            chart.options.scales.x.ticks.color = textColor;
            chart.options.scales.y.ticks.color = textColor;
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.y.grid.color = gridColor;
            chart.update();
        });
    }
}

// Instance globale du gestionnaire de graphiques
const chartsManager = new ChartsManager();

// Redimensionnement automatique lors du changement de taille de fenêtre
window.addEventListener('resize', () => {
    chartsManager.resizeCharts();
});

// Fonctions utilitaires pour les graphiques
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
}

// Configuration des tooltips personnalisés
Chart.register({
    id: 'customTooltips',
    afterDraw: function(chart) {
        // Ajout d'animations et d'effets personnalisés si nécessaire
    }
});

// Plugin pour ajouter des annotations
Chart.register({
    id: 'annotations',
    afterDatasetsDraw: function(chart) {
        const ctx = chart.ctx;
        const datasets = chart.data.datasets;
        
        // Ajout d'annotations personnalisées si nécessaire
        datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            if (meta.hidden) return;
            
            // Logique d'annotation personnalisée
        });
    }
});: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: this.colors.primary,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return `📅 ${context[0].label}`;
                            },
                            label: function(context) {
                                return `👥 ${context.parsed.y.toLocaleString()} visites`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            color: '#888'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#888',
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        this.charts.set(canvasId, chart);
        return chart;
    }

    // Création du graphique en camembert des jeux
    createGamesChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        if (this.charts.has(canvasId)) {
            this.charts.get(canvasId).destroy();
        }

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(game => game.name),
                datasets: [{
                    data: data.map(game => game.visits),
                    backgroundColor: this.colors.gradient.slice(0, data.length),
                    borderWidth: 3,
                    borderColor: '#fff',
                    hoverBorderWidth: 5,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive