// Variables globales
let currentUser = null;
let currentGames = [];
let currentStats = null;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Configuration des événements
    setupEventListeners();
    
    // Vérification de l'état de connexion sauvegardé
    const savedUser = localStorage.getItem('roblox_user_data');
    if (savedUser) {
        try {
            const userData = JSON.parse(savedUser);
            if (isValidUserData(userData)) {
                loadSavedUserData(userData);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données sauvegardées:', error);
            localStorage.removeItem('roblox_user_data');
        }
    }

    // Animation d'entrée
    animatePageLoad();
}

function setupEventListeners() {
    // Gestion des onglets
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Gestion de la fermeture des modales
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('errorModal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // Gestion du redimensionnement
    window.addEventListener('resize', debounce(handleResize, 250));

    // Raccourcis clavier
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Gestion de la connexion
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('robloxUsername').value.trim();
    
    if (!username) {
        showError('Veuillez entrer un nom d\'utilisateur Roblox valide.');
        return;
    }

    try {
        showLoading(true);
        
        // Connexion via l'API Roblox
        const userData = await robloxAPI.connectUser(username);
        
        // Sauvegarde des données
        currentUser = userData.user;
        currentGames = userData.games;
        currentStats = robloxAPI.calculateStats();
        
        // Sauvegarde dans le localStorage
        saveUserData({
            user: currentUser,
            games: currentGames,
            stats: currentStats,
            timestamp: Date.now()
        });
        
        // Affichage du dashboard
        showDashboard();
        updateDashboard();
        
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showError(error.message || 'Erreur de connexion. Vérifiez le nom d\'utilisateur et réessayez.');
    } finally {
        showLoading(false);
    }
}

// Affichage du dashboard
function showDashboard() {
    const loginSection = document.getElementById('loginSection');
    const dashboard = document.getElementById('dashboard');
    const userInfo = document.getElementById('userInfo');

    loginSection.style.display = 'none';
    dashboard.classList.add('active');
    userInfo.style.display = 'flex';

    // Animation d'entrée du dashboard
    setTimeout(() => {
        dashboard.style.opacity = '1';
        dashboard.style.transform = 'translateY(0)';
    }, 100);
}

// Mise à jour du dashboard avec les données
function updateDashboard() {
    if (!currentUser || !currentStats) return;

    // Mise à jour des informations utilisateur
    updateUserInfo();
    
    // Mise à jour des statistiques
    updateStats();
    
    // Mise à jour des jeux
    updateGamesSection();
    
    // Mise à jour du profil
    updateProfile();
    
    // Création des graphiques
    createCharts();
}

// Mise à jour des informations utilisateur dans l'en-tête
function updateUserInfo() {
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) userName.textContent = currentUser.displayName || currentUser.name;
    if (userAvatar) {
        userAvatar.src = currentUser.avatarUrl;
        userAvatar.alt = `Avatar de ${currentUser.name}`;
    }
}

// Mise à jour des statistiques
function updateStats() {
    // Animation des compteurs
    chartsManager.animateCounter('totalVisits', currentStats.totalVisits);
    chartsManager.animateCounter('totalGames', currentStats.totalGames);
    chartsManager.animateCounter('totalRobux', currentStats.estimatedRobux);
    chartsManager.animateCounter('totalFavorites', currentStats.totalFavorites);

    // Animation des barres de progression
    setTimeout(() => {
        const maxVisits = Math.max(currentStats.totalVisits, 100000);
        const maxGames = Math.max(currentStats.totalGames, 10);
        const maxRobux = Math.max(currentStats.estimatedRobux, 5000);
        const maxFavorites = Math.max(currentStats.totalFavorites, 1000);

        chartsManager.animateProgressBar('visitsProgress', (currentStats.totalVisits / maxVisits) * 100, 500);
        chartsManager.animateProgressBar('gamesProgress', (currentStats.totalGames / maxGames) * 100, 700);
        chartsManager.animateProgressBar('robuxProgress', (currentStats.estimatedRobux / maxRobux) * 100, 900);
        chartsManager.animateProgressBar('favoritesProgress', (currentStats.totalFavorites / maxFavorites) * 100, 1100);
    }, 1000);
}

// Mise à jour de la section des jeux
function updateGamesSection() {
    const gamesGrid = document.getElementById('gamesGrid');
    if (!gamesGrid) return;

    gamesGrid.innerHTML = '';

    if (currentGames.length === 0) {
        gamesGrid.innerHTML = `
            <div class="no-games">
                <h3>🎮 Aucun jeu trouvé</h3>
                <p>Il semble que vous n'ayez pas encore créé de jeux publics sur Roblox.</p>
            </div>
        `;
        return;
    }

    currentGames.forEach((game, index) => {
        const gameCard = createGameCard(game, index);
        gamesGrid.appendChild(gameCard);
    });

    // Animation d'entrée des cartes
    setTimeout(() => {
        const cards = gamesGrid.querySelectorAll('.game-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 200);
}

// Création d'une carte de jeu
function createGameCard(game, index) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.5s ease';

    const createdDate = new Date(game.created).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const updatedDate = new Date(game.updated).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    card.innerHTML = `
        <div class="game-thumbnail" style="background-image: url('${game.thumbnailUrl}')">
            ${!game.thumbnailUrl ? game.genre.charAt(0) : ''}
        </div>
        <div class="game-info">
            <h3 title="${game.name}">${game.name}</h3>
            <p class="game-description">${game.description}</p>
            
            <div class="game-stats">
                <div class="game-stat">
                    <span class="game-stat-value">${formatNumber(game.visits)}</span>
                    <span class="game-stat-label">Visites</span>
                </div>
                <div class="game-stat">
                    <span class="game-stat-value">${formatNumber(game.favorites)}</span>
                    <span class="game-stat-label">Favoris</span>
                </div>
                <div class="game-stat">
                    <span class="game-stat-value">${formatNumber(game.likes)}</span>
                    <span class="game-stat-label">J'aime</span>
                </div>
                <div class="game-stat">
                    <span class="game-stat-value">${formatNumber(game.estimatedRevenue)} R$</span>
                    <span class="game-stat-label">Revenus</span>
                </div>
            </div>

            <div class="game-meta">
                <p><strong>Genre:</strong> ${game.genre}</p>
                <p><strong>Créé:</strong> ${createdDate}</p>
                <p><strong>Mis à jour:</strong> ${updatedDate}</p>
                <p><strong>Joueurs max:</strong> ${game.maxPlayers}</p>
            </div>

            <div class="game-actions">
                <button class="btn" onclick="viewGameDetails(${game.id})">
                    <i>👁️</i> Voir détails
                </button>
                <button class="btn btn-secondary" onclick="openGameInRoblox(${game.id})">
                    <i>🚀</i> Ouvrir
                </button>
            </div>
        </div>
    `;

    return card;
}

// Mise à jour du profil
function updateProfile() {
    const profileAvatar = document.getElementById('profileAvatar');
    const profileUsername = document.getElementById('profileUsername');
    const profileJoinDate = document.getElementById('profileJoinDate');
    const profileDescription = document.getElementById('profileDescription');
    const profileFriends = document.getElementById('profileFriends');
    const profileFollowers = document.getElementById('profileFollowers');
    const profileFollowing = document.getElementById('profileFollowing');

    if (profileAvatar) profileAvatar.src = currentUser.avatarUrl;
    if (profileUsername) profileUsername.textContent = currentUser.displayName || currentUser.name;
    
    if (profileJoinDate && currentUser.created) {
        const joinDate = new Date(currentUser.created).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        profileJoinDate.textContent = `Membre depuis le ${joinDate}`;
    }
    
    if (profileDescription) {
        profileDescription.textContent = currentUser.description || 'Aucune description disponible';
    }

    // Animation des statistiques du profil
    if (profileFriends) chartsManager.animateCounter('profileFriends', currentUser.friendsCount || 0);
    if (profileFollowers) chartsManager.animateCounter('profileFollowers', currentUser.followersCount || 0);
    if (profileFollowing) chartsManager.animateCounter('profileFollowing', currentUser.followingCount || 0);
}

// Création des graphiques
function createCharts() {
    const chartData = robloxAPI.getChartData();
    if (!chartData) return;

    // Graphique des visites
    chartsManager.createVisitsChart('visitsChart', chartData.visitsData);

    // Graphique de répartition des jeux
    if (chartData.gamesPopularity.length > 0) {
        chartsManager.createGamesChart('gamesChart', chartData.gamesPopularity);
        chartsManager.createPopularityChart('popularityChart', chartData.gamesPopularity);
    }

    // Tableau analytique
    createAnalyticsTable();
}

// Création du tableau analytique
function createAnalyticsTable() {
    const tableContainer = document.getElementById('analyticsTable');
    if (!tableContainer || currentGames.length === 0) return;

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Jeu</th>
                <th>Visites</th>
                <th>Favoris</th>
                <th>J'aime</th>
                <th>Ratio J'aime/Visites</th>
                <th>Revenus estimés</th>
                <th>Performance</th>
            </tr>
        </thead>
        <tbody>
            ${currentGames.map(game => {
                const ratio = ((game.likes / game.visits) * 100).toFixed(2);
                const performance = getPerformanceRating(game);
                return `
                    <tr>
                        <td><strong>${game.name}</strong></td>
                        <td>${game.visits.toLocaleString()}</td>
                        <td>${game.favorites.toLocaleString()}</td>
                        <td>${game.likes.toLocaleString()}</td>
                        <td>${ratio}%</td>
                        <td>${game.estimatedRevenue} R$</td>
                        <td><span class="performance-${performance.toLowerCase()}">${performance}</span></td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;

    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
}

// Calcul du rating de performance d'un jeu
function getPerformanceRating(game) {
    const visitToFavoriteRatio = game.favorites / game.visits;
    const likeToVisitRatio = game.likes / game.visits;
    
    const score = (visitToFavoriteRatio * 0.6 + likeToVisitRatio * 0.4) * 100;
    
    if (score > 5) return 'Excellent';
    if (score > 3) return 'Bon';
    if (score > 1) return 'Moyen';
    return 'Faible';
}

// Changement d'onglet
function switchTab(tabName) {
    // Désactivation de tous les onglets
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Activation de l'onglet sélectionné
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Actions spécifiques par onglet
    switch(tabName) {
        case 'analytics':
            // Redimensionnement des graphiques après affichage
            setTimeout(() => chartsManager.resizeCharts(), 100);
            break;
        case 'games':
            // Actualisation des jeux si nécessaire
            break;
    }
}

// Actions sur les jeux
function viewGameDetails(gameId) {
    const game = currentGames.find(g => g.id === gameId);
    if (!game) return;

    alert(`Détails du jeu: ${game.name}\n\nVisites: ${game.visits.toLocaleString()}\nFavoris: ${game.favorites.toLocaleString()}\nJ'aime: ${game.likes.toLocaleString()}\nGenre: ${game.genre}\nJoueurs max: ${game.maxPlayers}\n\n(Interface détaillée à implémenter)`);
}

function openGameInRoblox(gameId) {
    const game = currentGames.find(g => g.id === gameId);
    if (!game) return;

    // Ouverture dans un nouvel onglet (URL simulée)
    window.open(`https://www.roblox.com/games/${gameId}`, '_blank');
}

// Actualisation des données
async function refreshGames() {
    if (!currentUser) return;

    try {
        showLoading(true);
        const newGames = await robloxAPI.getUserGames(currentUser.id);
        currentGames = newGames;
        currentStats = robloxAPI.calculateStats();
        
        updateDashboard();
        
        // Notification de succès
        showNotification('Données exportées avec succès!', 'success');
}

// Déconnexion
function logout() {
    // Nettoyage des données
    currentUser = null;
    currentGames = [];
    currentStats = null;
    
    // Suppression du localStorage
    localStorage.removeItem('roblox_user_data');
    
    // Nettoyage des graphiques
    chartsManager.destroyAllCharts();
    
    // Affichage de la page de connexion
    const loginSection = document.getElementById('loginSection');
    const dashboard = document.getElementById('dashboard');
    const userInfo = document.getElementById('userInfo');

    dashboard.classList.remove('active');
    userInfo.style.display = 'none';
    loginSection.style.display = 'flex';

    // Réinitialisation du formulaire
    document.getElementById('robloxUsername').value = '';
    
    showNotification('Déconnexion réussie!', 'info');
}

// Gestion des notifications
function showNotification(message, type = 'info') {
    // Création de la notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

    // Style de la notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease;
    `;

    // Couleurs selon le type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    notification.style.backgroundColor = colors[type] || colors.info;

    // Ajout au DOM
    document.body.appendChild(notification);

    // Suppression automatique après 5 secondes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Sauvegarde des données utilisateur
function saveUserData(data) {
    try {
        localStorage.setItem('roblox_user_data', JSON.stringify(data));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
    }
}

// Chargement des données utilisateur sauvegardées
function loadSavedUserData(userData) {
    const timeDiff = Date.now() - userData.timestamp;
    const oneHour = 60 * 60 * 1000;

    // Vérification de la fraîcheur des données (1 heure)
    if (timeDiff > oneHour) {
        localStorage.removeItem('roblox_user_data');
        return;
    }

    currentUser = userData.user;
    currentGames = userData.games;
    currentStats = userData.stats;

    showDashboard();
    updateDashboard();
    
    showNotification('Session restaurée avec succès!', 'info');
}

// Validation des données utilisateur
function isValidUserData(userData) {
    return userData && 
           userData.user && 
           userData.user.id && 
           userData.user.name &&
           Array.isArray(userData.games) &&
           userData.timestamp &&
           typeof userData.timestamp === 'number';
}

// Gestion des raccourcis clavier
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + R : Actualiser
    if ((event.ctrlKey || event.metaKey) && event.key === 'r' && currentUser) {
        event.preventDefault();
        refreshGames();
    }
    
    // Ctrl/Cmd + E : Exporter
    if ((event.ctrlKey || event.metaKey) && event.key === 'e' && currentUser) {
        event.preventDefault();
        exportData();
    }
    
    // Escape : Fermer les modales
    if (event.key === 'Escape') {
        closeModal();
    }
    
    // Chiffres 1-4 : Navigation entre onglets
    if (event.key >= '1' && event.key <= '4' && currentUser) {
        const tabs = ['overview', 'games', 'analytics', 'profile'];
        const tabIndex = parseInt(event.key) - 1;
        if (tabs[tabIndex]) {
            switchTab(tabs[tabIndex]);
        }
    }
}

// Gestion du redimensionnement
function handleResize() {
    chartsManager.resizeCharts();
}

// Utilitaire de debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Animation de chargement de page
function animatePageLoad() {
    const elements = document.querySelectorAll('.container > *');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        setTimeout(() => {
            el.style.transition = 'all 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Formatage des nombres
function formatNumber(num) {
    if (typeof num !== 'number') return '0';
    
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'G';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

// Gestion des erreurs globales
window.addEventListener('error', function(event) {
    console.error('Erreur JavaScript:', event.error);
    showNotification('Une erreur inattendue s\'est produite.', 'error');
});

// Gestion des promesses rejetées
window.addEventListener('unhandledrejection', function(event) {
    console.error('Promesse rejetée:', event.reason);
    event.preventDefault();
});

// Ajout des styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
    }
    
    .notification button:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
    
    .game-description {
        font-size: 14px;
        color: #666;
        margin-bottom: 15px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    
    .game-meta {
        font-size: 12px;
        color: #888;
        margin: 15px 0;
        padding: 10px;
        background: rgba(0, 162, 255, 0.05);
        border-radius: 6px;
    }
    
    .game-meta p {
        margin: 2px 0;
    }
    
    .game-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 15px;
    }
    
    .game-actions .btn {
        font-size: 14px;
        padding: 8px 16px;
        margin: 0;
    }
    
    .no-games {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 15px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    
    .no-games h3 {
        color: #666;
        margin-bottom: 15px;
        font-size: 24px;
    }
    
    .no-games p {
        color: #888;
        font-size: 16px;
    }
    
    .performance-excellent {
        color: #28a745;
        font-weight: bold;
    }
    
    .performance-bon {
        color: #17a2b8;
        font-weight: bold;
    }
    
    .performance-moyen {
        color: #ffc107;
        font-weight: bold;
    }
    
    .performance-faible {
        color: #dc3545;
        font-weight: bold;
    }
    
    .animate-progress {
        transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
`;

document.head.appendChild(style);

// Fonctions utilitaires exportées pour usage global
window.robloxHub = {
    refreshGames,
    refreshProfile,
    exportData,
    logout,
    switchTab,
    showNotification,
    formatNumber
};Jeux actualisés avec succès!', 'success');
    } catch (error) {
        showError('Erreur lors de l\'actualisation des jeux: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function refreshProfile() {
    if (!currentUser) return;

    try {
        showLoading(true);
        const userData = await robloxAPI.connectUser(currentUser.name);
        currentUser = userData.user;
        
        updateProfile();
        saveUserData({
            user: currentUser,
            games: currentGames,
            stats: currentStats,
            timestamp: Date.now()
        });
        
        showNotification('Profil actualisé avec succès!', 'success');
    } catch (error) {
        showError('Erreur lors de l\'actualisation du profil: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Export des données
function exportData() {
    if (!currentUser) return;

    const exportData = {
        user: currentUser,
        games: currentGames,
        stats: currentStats,
        charts: robloxAPI.getChartData(),
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `roblox-creator-data-${currentUser.name}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('