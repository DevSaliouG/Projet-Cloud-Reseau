const http = require("http");

// Stockage en mémoire des articles reçus de la base
let articles = []; // tableau d'objets { id, title, content, created_at }

// Fonction pour générer la page HTML avec Tailwind CSS
function renderHomePage() {
  let articlesHtml = "";
  if (articles.length === 0) {
    articlesHtml = `
        <div class="glass-card animate-pulse flex flex-col items-center justify-center h-48">
            <svg class="w-12 h-12 text-sky-400 mb-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span class="text-sky-600 font-semibold">Chargement des articles...</span>
        </div>`;
  } else {
    articlesHtml = articles
      .map(
        (article, i) => `
            <div class="glass-card article-card opacity-0 translate-y-8 transition-all duration-700 delay-[${i * 100}ms] will-change-transform">
                <h2 class="text-2xl font-bold text-slate-800 mb-2">${escapeHtml(article.title)}</h2>
                <p class="text-xs text-sky-500 mb-2">Publié le ${article.created_at || "date inconnue"}</p>
                <p class="text-slate-700">${escapeHtml(article.content)}</p>
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
    <title>Projet Cloud - Articles</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            min-height: 100vh;
            scroll-behavior: smooth;
            color: #334155;
        }
        .glass-card {
            background: rgba(255,255,255,0.95);
            border-radius: 1rem;
            box-shadow: 0 4px 16px 0 rgba(15, 23, 42, 0.08);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid #e2e8f0;
            transition: box-shadow 0.3s, transform 0.3s, border-color 0.3s;
        }
        .glass-card:hover {
            box-shadow: 0 12px 32px 0 rgba(15, 23, 42, 0.12), 0 0 0 1px #cbd5e1;
            transform: translateY(-4px);
            border-color: #94a3b8;
        }
        .navbar-glass {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(8px);
            border-bottom: 1px solid #e2e8f0;
        }
        .hero-bg {
            background: linear-gradient(120deg, rgba(226, 232, 240, 0.6) 0%, rgba(203, 213, 225, 0.6) 100%);
            backdrop-filter: blur(4px);
        }
        .article-card {
            animation: fadeInUp 0.7s forwards;
        }
        @keyframes fadeInUp {
            to {
                opacity: 1;
                transform: none;
            }
        }
        .glow {
            box-shadow: 0 0 12px 1px #0ea5e9, 0 0 24px 4px #bae6fd;
        }
        .archi-card {
            background: rgba(255,255,255,0.95);
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 12px 0 rgba(15, 23, 42, 0.06);
            backdrop-filter: blur(8px);
        }
    </style>
</head>
<body class="font-sans antialiased text-slate-800">
    <!-- Animated background -->
    <div class="fixed inset-0 -z-10 pointer-events-none">
        <div class="absolute w-96 h-96 bg-gradient-to-br from-sky-200 via-slate-200 to-transparent rounded-full blur-3xl opacity-20 left-[-10%] top-[-10%] animate-pulse"></div>
        <div class="absolute w-80 h-80 bg-gradient-to-tr from-slate-200 via-sky-100 to-transparent rounded-full blur-2xl opacity-15 right-[-8%] bottom-[-8%] animate-pulse"></div>
    </div>
    <!-- Navbar -->
    <nav class="navbar-glass sticky top-0 z-20 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
            <div class="flex items-center space-x-3">
                <span class="inline-block w-8 h-8 bg-gradient-to-tr from-sky-400 to-sky-500 rounded-full glow"></span>
                <span class="text-xl font-bold text-slate-800 tracking-tight">Projet Cloud</span>
            </div>
            <ul class="flex space-x-6 text-slate-600 font-medium">
                <li><a href="#articles" class="hover:text-sky-500 transition">Articles</a></li>
                <li><a href="#architecture" class="hover:text-sky-500 transition">Architecture</a></li>
            </ul>
        </div>
    </nav>
    <!-- Hero Section -->
    <section class="hero-bg py-20 px-4 text-center">
        <h1 class="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-sky-500 via-slate-600 to-sky-400 text-transparent bg-clip-text mb-4 drop-shadow-lg">Bienvenue sur notre Cloud SaaS</h1>
        <p class="text-xl md:text-2xl text-slate-600 mb-8 font-medium">Une architecture sécurisée, moderne et scalable pour vos données.</p>
        <a href="#articles" class="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold shadow-md hover:scale-105 transition-all duration-300">Voir les articles</a>
    </section>
    <!-- Articles Section -->
    <section id="articles" class="max-w-5xl mx-auto py-16 px-4">
        <h2 class="text-3xl font-bold text-slate-800 mb-8 text-center">Nos Articles</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            ${articlesHtml}
        </div>
    </section>
    <!-- Architecture Section -->
    <section id="architecture" class="py-16 px-4">
        <div class="max-w-4xl mx-auto archi-card p-8 flex flex-col md:flex-row items-center gap-8">
            <div class="flex-1">
                <h3 class="text-2xl font-bold text-sky-600 mb-2">Architecture Cloud Sécurisée</h3>
                <p class="text-slate-600 mb-4">Notre projet sépare la base de données (LAN) et le serveur web (DMZ) via un firewall, garantissant sécurité et performance.</p>
                <ul class="text-slate-700 space-y-1">
                    <li><span class="font-bold">LAN</span> : Base de données sécurisée</li>
                    <li><span class="font-bold">DMZ</span> : Serveur web Node.js</li>
                    <li><span class="font-bold">Firewall</span> : Contrôle des accès</li>
                </ul>
            </div>
            <div class="flex-1 flex items-center justify-center">
                <svg width="220" height="100" viewBox="0 0 220 100" fill="none">
                    <rect x="10" y="30" width="60" height="40" rx="10" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="2"/>
                    <text x="40" y="55" text-anchor="middle" fill="#0369a1" font-size="16" font-weight="bold">LAN</text>
                    <rect x="150" y="30" width="60" height="40" rx="10" fill="#e0f2fe" stroke="#0ea5e9" stroke-width="2"/>
                    <text x="180" y="55" text-anchor="middle" fill="#0369a1" font-size="16" font-weight="bold">DMZ</text>
                    <rect x="80" y="40" width="60" height="20" rx="8" fill="#7dd3fc" stroke="#0284c7" stroke-width="2"/>
                    <text x="110" y="55" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">Firewall</text>
                    <path d="M70 50 Q90 50 80 50 Q100 50 150 50" stroke="#0ea5e9" stroke-width="3" fill="none" marker-end="url(#arrow)" stroke-dasharray="5,3"/>
                    <defs>
                        <marker id="arrow" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#0ea5e9"/>
                        </marker>
                    </defs>
                </svg>
            </div>
        </div>
    </section>
    <!-- Footer -->
    <footer class="navbar-glass py-8 mt-16">
        <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
            <div class="flex items-center space-x-2 mb-4 md:mb-0">
                <span class="inline-block w-6 h-6 bg-gradient-to-tr from-sky-400 to-sky-500 rounded-full glow"></span>
                <span class="text-slate-800 font-bold">Projet Cloud</span>
            </div>
            <div class="text-slate-600 text-sm space-x-4">
                <a href="#articles" class="hover:text-sky-500 transition">Articles</a>
                <a href="#architecture" class="hover:text-sky-500 transition">Architecture</a>
            </div>
            <div class="text-slate-400 text-xs mt-2 md:mt-0">&copy; ${new Date().getFullYear()} Projet Cloud. Tous droits réservés.</div>
        </div>
    </footer>
    <script>
        // Animation d'apparition des cards articles
        window.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.article-card').forEach((el, i) => {
                setTimeout(() => {
                    el.classList.remove('opacity-0', 'translate-y-8');
                }, 100 + i * 120);
            });
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
    .replace(/[&<>]/g, function (m) {
      if (m === "&") return "&amp;";
      if (m === "<") return "&lt;";
      if (m === ">") return "&gt;";
      return m;
    })
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function (c) {
      return c;
    });
}

const server = http.createServer((req, res) => {
  // Endpoint API pour recevoir les articles depuis VM3 (POST)
  if (req.method === "POST" && req.url === "/api/articles") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (Array.isArray(data.articles)) {
          articles = data.articles;
          console.log(
            `[${new Date().toISOString()}] Mise à jour reçue : ${articles.length} articles`,
          );
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "ok", count: articles.length }));
        } else {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid data format" }));
        }
      } catch (e) {
        console.error("Erreur parsing JSON:", e.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  // Page principale (GET /)
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderHomePage());
    return;
  }

  // 404 pour toute autre route
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

const port = 3000;
server.listen(port, () => {
  console.log(`Serveur Node.js en écoute sur le port ${port}`);
});
