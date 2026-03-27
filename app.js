const http = require("http");
const querystring = require("querystring");

// Stockage en mémoire des articles
let articles = [];
let lastSyncTime = null;

// Fonction pour générer la page HTML
function renderHomePage() {
  const statsHtml = `
    <div class="stat-card">
      <div class="stat-number" data-value="${articles.length}">0</div>
      <div class="stat-label">Articles en ligne</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">${lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString("fr-FR") : "En attente"}</div>
      <div class="stat-label">Dernière sync</div>
    </div>
    <div class="stat-card">
      <div class="server-status"></div>
      <div class="stat-label">Serveur en ligne</div>
    </div>
  `;

  let articlesHtml = "";
  if (articles.length === 0) {
    articlesHtml = `
      <div class="skeleton-loader">
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
      </div>
    `;
  } else {
    articlesHtml = articles
      .map(
        (article, i) => `
          <div class="article-card" style="animation-delay: ${i * 100}ms">
            <div class="article-header">
              <h3 class="article-title">${escapeHtml(article.title)}</h3>
              <span class="article-badge">#${article.id || i + 1}</span>
            </div>
            <p class="article-content">${escapeHtml(article.content.substring(0, 120))}${article.content.length > 120 ? "..." : ""}</p>
            <div class="article-footer">
              <span class="article-date">📅 ${article.created_at || "Date inconnue"}</span>
            </div>
          </div>
        `,
      )
      .join("");
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ArticleSync - Plateforme SaaS de Gestion d'Articles</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #0ea5e9;
            --primary-dark: #0369a1;
            --primary-light: #06b6d4;
            --secondary: #1e293b;
            --accent: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --bg-dark: #0f172a;
            --bg-darker: #020617;
            --surface: #1e293b;
            --surface-light: #334155;
            --border: #475569;
            --text: #f1f5f9;
            --text-muted: #cbd5e1;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, var(--bg-darker) 0%, var(--bg-dark) 50%, #1a1a2e 100%);
            color: var(--text);
            min-height: 100vh;
            position: relative;
            overflow-x: hidden;
        }

        /* Animated background elements */
        body::before {
            content: '';
            position: fixed;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 50%);
            animation: moveGradient 15s ease-in-out infinite;
            pointer-events: none;
            z-index: -1;
        }

        @keyframes moveGradient {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(50px, 50px); }
        }

        /* Navbar */
        .navbar {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(71, 85, 105, 0.2);
            padding: 1rem 0;
        }

        .navbar-content {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 64px;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary-light), var(--accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.5px;
        }

        .logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--primary), var(--primary-light));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            box-shadow: 0 0 20px rgba(14, 165, 233, 0.4);
        }

        .nav-links {
            display: flex;
            gap: 2rem;
            list-style: none;
        }

        .nav-links a {
            color: var(--text-muted);
            text-decoration: none;
            font-weight: 500;
            position: relative;
            transition: color 0.3s;
        }

        .nav-links a:hover {
            color: var(--primary-light);
        }

        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, var(--primary), var(--primary-light));
            transition: width 0.3s;
        }

        .nav-links a:hover::after {
            width: 100%;
        }

        /* Hero Section */
        .hero {
            position: relative;
            padding: 6rem 2rem;
            text-align: center;
            overflow: hidden;
        }

        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 800px;
            height: 400px;
            background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            filter: blur(60px);
            z-index: 0;
        }

        .hero-content {
            position: relative;
            z-index: 1;
            max-width: 900px;
            margin: 0 auto;
            animation: fadeInDown 1s ease-out;
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .hero-title {
            font-size: clamp(2.5rem, 6vw, 4rem);
            font-weight: 800;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, var(--primary-light), var(--primary), #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.2;
            letter-spacing: -1px;
        }

        .hero-subtitle {
            font-size: 1.25rem;
            color: var(--text-muted);
            margin-bottom: 2rem;
            font-weight: 400;
        }

        .hero-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 3rem;
        }

        .btn {
            padding: 0.875rem 2rem;
            border: none;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            position: relative;
            overflow: hidden;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.1);
            transition: left 0.3s;
        }

        .btn:hover::before {
            left: 100%;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary), var(--primary-light));
            color: white;
            box-shadow: 0 8px 24px rgba(14, 165, 233, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(14, 165, 233, 0.5);
        }

        .btn-secondary {
            background: rgba(71, 85, 105, 0.3);
            color: var(--primary-light);
            border: 1px solid rgba(14, 165, 233, 0.3);
        }

        .btn-secondary:hover {
            background: rgba(71, 85, 105, 0.5);
            border-color: rgba(14, 165, 233, 0.6);
        }

        /* Stats Section */
        .stats-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
            animation: fadeInUp 1s ease-out 0.3s both;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .stat-card {
            background: rgba(30, 41, 59, 0.4);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(71, 85, 105, 0.2);
            border-radius: 1rem;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            background: rgba(30, 41, 59, 0.6);
            border-color: rgba(14, 165, 233, 0.4);
            transform: translateY(-4px);
        }

        .stat-number {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-light);
            margin-bottom: 0.5rem;
            font-variant-numeric: tabular-nums;
        }

        .stat-label {
            color: var(--text-muted);
            font-size: 0.875rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .server-status {
            width: 12px;
            height: 12px;
            background: var(--accent);
            border-radius: 50%;
            margin: 0 auto 0.5rem;
            box-shadow: 0 0 10px var(--accent);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { box-shadow: 0 0 10px var(--accent); }
            50% { box-shadow: 0 0 20px var(--accent); }
        }

        /* Features Section */
        .features-section {
            padding: 4rem 2rem;
            max-width: 1280px;
            margin: 0 auto;
        }

        .section-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 3rem;
            text-align: center;
            background: linear-gradient(135deg, var(--primary-light), var(--primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            animation: fadeInUp 1s ease-out 0.5s both;
        }

        .feature-card {
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(51, 65, 85, 0.2) 100%);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(71, 85, 105, 0.2);
            border-radius: 1rem;
            padding: 2rem;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--primary-light), transparent);
            opacity: 0;
            transition: opacity 0.3s;
        }

        .feature-card:hover {
            transform: translateY(-8px);
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.4) 100%);
            border-color: rgba(14, 165, 233, 0.3);
        }

        .feature-card:hover::before {
            opacity: 1;
        }

        .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        .feature-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            color: var(--text);
        }

        .feature-desc {
            color: var(--text-muted);
            line-height: 1.6;
            font-size: 0.95rem;
        }

        /* Articles Section */
        .articles-section {
            padding: 4rem 2rem;
            max-width: 1280px;
            margin: 0 auto;
        }

        .articles-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 2rem;
            animation: fadeInUp 1s ease-out 0.6s both;
        }

        .article-card {
            background: rgba(30, 41, 59, 0.4);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(71, 85, 105, 0.2);
            border-radius: 1rem;
            padding: 1.5rem;
            transition: all 0.3s ease;
            animation: fadeInScale 0.6s ease-out forwards;
            opacity: 0;
        }

        @keyframes fadeInScale {
            from {
                opacity: 0;
                transform: scale(0.9) translateY(20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        .article-card:hover {
            transform: translateY(-6px);
            background: rgba(30, 41, 59, 0.6);
            border-color: rgba(14, 165, 233, 0.4);
            box-shadow: 0 12px 32px rgba(14, 165, 233, 0.1);
        }

        .article-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            gap: 1rem;
        }

        .article-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text);
            flex: 1;
        }

        .article-badge {
            background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(16, 185, 129, 0.1));
            color: var(--primary-light);
            padding: 0.25rem 0.75rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 700;
            white-space: nowrap;
            border: 1px solid rgba(14, 165, 233, 0.2);
        }

        .article-content {
            color: var(--text-muted);
            line-height: 1.6;
            margin-bottom: 1rem;
            font-size: 0.95rem;
        }

        .article-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 1rem;
            border-top: 1px solid rgba(71, 85, 105, 0.2);
        }

        .article-date {
            color: var(--text-muted);
            font-size: 0.875rem;
            font-weight: 500;
        }

        /* Skeleton Loader */
        .skeleton-loader {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 2rem;
        }

        .skeleton-item {
            background: rgba(71, 85, 105, 0.2);
            border-radius: 1rem;
            height: 200px;
            animation: skeletonLoading 2s infinite;
        }

        @keyframes skeletonLoading {
            0%, 100% {
                background: rgba(71, 85, 105, 0.2);
            }
            50% {
                background: rgba(71, 85, 105, 0.4);
            }
        }

        /* Footer */
        .footer {
            background: rgba(15, 23, 42, 0.5);
            backdrop-filter: blur(10px);
            border-top: 1px solid rgba(71, 85, 105, 0.2);
            padding: 3rem 2rem;
            margin-top: 4rem;
        }

        .footer-content {
            max-width: 1280px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .footer-section h3 {
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--text);
        }

        .footer-section p {
            color: var(--text-muted);
            font-size: 0.875rem;
            line-height: 1.8;
        }

        .footer-links {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .footer-links a {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.875rem;
            transition: color 0.3s;
        }

        .footer-links a:hover {
            color: var(--primary-light);
        }

        .social-links {
            display: flex;
            gap: 1rem;
        }

        .social-links a {
            width: 40px;
            height: 40px;
            border-radius: 0.5rem;
            background: rgba(71, 85, 105, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
            text-decoration: none;
            transition: all 0.3s;
            border: 1px solid rgba(71, 85, 105, 0.2);
        }

        .social-links a:hover {
            background: rgba(14, 165, 233, 0.2);
            border-color: rgba(14, 165, 233, 0.4);
            color: var(--primary-light);
        }

        .footer-bottom {
            border-top: 1px solid rgba(71, 85, 105, 0.2);
            padding-top: 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
            color: var(--text-muted);
            font-size: 0.875rem;
        }

        /* Toast Notification */
        .toast {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: rgba(30, 41, 59, 0.9);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: var(--accent);
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            animation: slideInUp 0.3s ease-out;
            z-index: 2000;
        }

        @keyframes slideInUp {
            from {
                transform: translateY(100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .nav-links {
                gap: 1rem;
                font-size: 0.9rem;
            }

            .hero {
                padding: 3rem 1rem;
            }

            .hero-title {
                font-size: 1.75rem;
            }

            .hero-subtitle {
                font-size: 1rem;
            }

            .hero-buttons {
                flex-direction: column;
            }

            .stats-section {
                grid-template-columns: 1fr;
            }

            .footer-content {
                grid-template-columns: 1fr;
            }

            .toast {
                bottom: 1rem;
                right: 1rem;
                left: 1rem;
            }
        }

        /* Utility */
        .max-w {
            max-width: 1280px;
            margin: 0 auto;
        }

        .section-padding {
            padding: 4rem 2rem;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="navbar-content">
            <div class="logo">
                <div class="logo-icon">A</div>
                <span>ArticleSync</span>
            </div>
            <ul class="nav-links">
                <li><a href="#home">Accueil</a></li>
                <li><a href="#articles">Articles</a></li>
                <li><a href="#features">Fonctionnalités</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" id="home">
        <div class="hero-content">
            <h1 class="hero-title">Plateforme de gestion d'articles distribuée</h1>
            <p class="hero-subtitle">Synchronisation sécurisée entre serveur base de données et serveur web</p>
            <div class="hero-buttons">
                <button class="btn btn-primary" onclick="scrollToSection('articles')">Voir les articles</button>
                <button class="btn btn-secondary" onclick="scrollToSection('features')">Découvrir la plateforme</button>
            </div>
        </div>

        <!-- Stats Section -->
        <div class="max-w">
            <div class="stats-section">
                ${statsHtml}
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features-section" id="features">
        <h2 class="section-title">Nos Fonctionnalités</h2>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">🔐</div>
                <h3 class="feature-title">Architecture Sécurisée</h3>
                <p class="feature-desc">Séparation DMZ/LAN, firewall intelligent et isolement des données sensibles pour une sécurité maximale.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <h3 class="feature-title">Synchronisation Automatique</h3>
                <p class="feature-desc">Synchronisation en temps réel entre serveur web et base de données avec gestion des conflits.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">📈</div>
                <h3 class="feature-title">API Scalable</h3>
                <p class="feature-desc">REST API haute performance capable de gérer des milliers d'articles simultanément.</p>
            </div>
        </div>
    </section>

    <!-- Articles Section -->
    <section class="articles-section" id="articles">
        <h2 class="section-title">Articles Disponibles</h2>
        <div class="articles-grid">
            ${articlesHtml}
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer" id="contact">
        <div class="footer-content">
            <div class="footer-section">
                <h3>À propos</h3>
                <p>ArticleSync est une plateforme SaaS moderne de gestion d'articles distribuée avec architecture sécurisée et synchronisation temps réel.</p>
            </div>
            <div class="footer-section">
                <h3>Support</h3>
                <div class="footer-links">
                    <a href="mailto:gayesaliou58@gmail.com">📧 gayesaliou58@gmail.com</a>
                    <a href="mailto:serignesaliou.gaye@uadb.edu.sn">💬 serignesaliou.gaye@uadb.edu.sn</a>
                </div>
            </div>
            <div class="footer-section">
                <h3>Ressources</h3>
                <div class="footer-links">
                    <a href="#">Serveur Web DMZ</a>
                    <a href="#">API REST</a>
                    <a href="#">Documentation</a>
                </div>
            </div>
            <div class="footer-section">
                <h3>Réseaux</h3>
                <div class="social-links">
                    <a href="https://github.com/DevSaliouG" title="GitHub">✉️</a>
                    <a href="#" title="LinkedIn">💼</a>
                    <a href="#" title="Website">🌐</a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <span>&copy; 2026 G2S. Tous droits réservés.</span>
            <span>Architecture : Serveur Web DMZ | API REST sécurisée | Synchronisation DB → Web</span>
        </div>
    </footer>

    <script>
        // Animate numbers on load
        function animateNumber(element, target) {
            let current = 0;
            const increment = target / 30;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target;
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 30);
        }

        function scrollToSection(id) {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }

        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        // Page load animations
        window.addEventListener('DOMContentLoaded', () => {
            // Animate stat numbers
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(el => {
                const target = parseInt(el.dataset.value) || 0;
                animateNumber(el, target);
            });

            // Show loaded toast
            showToast('✓ Articles chargés avec succès');
        });

        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        document.querySelectorAll('.feature-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease-out';
            observer.observe(el);
        });
    </script>
</body>
</html>
    `;
}

// Fonction utilitaire pour échapper les caractères HTML
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Serveur HTTP
const server = http.createServer((req, res) => {
  // Config CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // GET /api/articles - Endpoint pour récupérer les articles
  if (req.method === "GET" && req.url === "/api/articles") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "success",
      count: articles.length,
      articles: articles,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // POST /api/articles - Endpoint pour recevoir les articles depuis VM3
  if (req.method === "POST" && req.url === "/api/articles") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload too large" }));
        req.connection.destroy();
      }
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (Array.isArray(data.articles) || Array.isArray(data)) {
          articles = Array.isArray(data.articles) ? data.articles : data;
          lastSyncTime = new Date().toISOString();
          console.log(
            `[${lastSyncTime}] ✓ Sync reçue : ${articles.length} article(s)`
          );
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            status: "success",
            message: "Articles updated",
            count: articles.length,
            timestamp: lastSyncTime
          }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Format invalide. Utilisez {articles: [...]}" }));
        }
      } catch (e) {
        console.error("❌ Erreur JSON:", e.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "JSON invalide" }));
      }
    });
    return;
  }

  // GET / - Page principale
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderHomePage());
    return;
  }

  // Health check endpoint
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "online",
      uptime: process.uptime(),
      articles: articles.length,
      lastSync: lastSyncTime
    }));
    return;
  }

  // 404 - Route non trouvée
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route non trouvée" }));
});

// Démarrage du serveur
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`
╔════════════════════════════════════════╗
║    ArticleSync - Serveur SaaS          ║
║    Écoute sur le port ${port}             ║
║                                        ║
║    GET  /              → Page HTML     ║
║    GET  /api/articles  → Articles     ║
║    POST /api/articles  → Synchroniser ║
║    GET  /health        → Status       ║
╚════════════════════════════════════════╝
  `);
});
