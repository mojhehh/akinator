// ============================================================
// Frontend - Full HTML/CSS/JS for Akanator
// ============================================================

export function getHTML(env) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AKANATOR - The AI Mind Reader</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧞</text></svg>">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --primary: #6c3ce0;
      --primary-light: #8b5cf6;
      --primary-dark: #4c1d95;
      --accent: #f59e0b;
      --accent-glow: #fbbf24;
      --bg-dark: #0a0a1a;
      --bg-card: #111128;
      --bg-card-hover: #1a1a3e;
      --text: #e2e8f0;
      --text-dim: #94a3b8;
      --success: #10b981;
      --danger: #ef4444;
      --glass: rgba(255, 255, 255, 0.05);
      --glass-border: rgba(255, 255, 255, 0.1);
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg-dark);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* === ANIMATED BACKGROUND === */
    .bg-effects {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }

    .bg-effects .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
      animation: float 20s ease-in-out infinite;
    }

    .bg-effects .orb:nth-child(1) {
      width: 600px; height: 600px;
      background: radial-gradient(circle, #6c3ce0 0%, transparent 70%);
      top: -200px; left: -200px;
      animation-delay: 0s;
    }

    .bg-effects .orb:nth-child(2) {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #f59e0b 0%, transparent 70%);
      bottom: -200px; right: -200px;
      animation-delay: -7s;
    }

    .bg-effects .orb:nth-child(3) {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: -14s;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(50px, -50px) scale(1.1); }
      66% { transform: translate(-30px, 30px) scale(0.9); }
    }

    /* === PARTICLES === */
    .particles {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 0;
    }

    .particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: var(--accent);
      border-radius: 50%;
      opacity: 0;
      animation: sparkle 4s ease-in-out infinite;
    }

    @keyframes sparkle {
      0% { opacity: 0; transform: translateY(0) scale(0); }
      50% { opacity: 0.8; transform: translateY(-40px) scale(1); }
      100% { opacity: 0; transform: translateY(-80px) scale(0); }
    }

    /* === MAIN CONTAINER === */
    .container {
      position: relative;
      z-index: 1;
      max-width: 700px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    /* === HEADER === */
    .header {
      text-align: center;
      margin-bottom: 30px;
    }

    .header .genie {
      font-size: 80px;
      animation: genieBounce 3s ease-in-out infinite;
      display: inline-block;
      filter: drop-shadow(0 0 30px rgba(108, 60, 224, 0.5));
    }

    @keyframes genieBounce {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-10px) rotate(-3deg); }
      75% { transform: translateY(-5px) rotate(3deg); }
    }

    .header h1 {
      font-family: 'Cinzel', serif;
      font-size: 3rem;
      font-weight: 900;
      background: linear-gradient(135deg, var(--accent) 0%, var(--primary-light) 50%, var(--accent) 100%);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s ease-in-out infinite;
      margin: 10px 0;
      letter-spacing: 4px;
    }

    @keyframes shimmer {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }

    .header p {
      color: var(--text-dim);
      font-size: 1.1rem;
      font-weight: 300;
    }

    /* === CARD === */
    .card {
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      backdrop-filter: blur(20px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(108, 60, 224, 0.1);
      transition: all 0.3s ease;
    }

    .card:hover {
      box-shadow: 0 25px 70px rgba(0, 0, 0, 0.6), 0 0 120px rgba(108, 60, 224, 0.15);
    }

    /* === SCREENS === */
    .screen { display: none; }
    .screen.active {
      display: block;
      animation: fadeSlideIn 0.5s ease-out;
    }

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* === CATEGORY SELECT === */
    .categories {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 25px 0;
    }

    .category-btn {
      background: var(--glass);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      color: var(--text);
    }

    .category-btn:hover {
      background: rgba(108, 60, 224, 0.2);
      border-color: var(--primary-light);
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(108, 60, 224, 0.2);
    }

    .category-btn .emoji { font-size: 2.5rem; margin-bottom: 8px; display: block; }
    .category-btn .label { font-weight: 600; font-size: 0.95rem; }

    /* === QUESTION AREA === */
    .question-number {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .q-badge {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .confidence-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      color: var(--text-dim);
    }

    .confidence-track {
      width: 100px;
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .confidence-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-light), var(--accent));
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    .question-text {
      font-size: 1.4rem;
      font-weight: 600;
      text-align: center;
      margin: 30px 0;
      line-height: 1.5;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* === ANSWER BUTTONS === */
    .answers {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
    }

    .answer-btn {
      background: var(--glass);
      border: 1px solid var(--glass-border);
      border-radius: 14px;
      padding: 14px 20px;
      color: var(--text);
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .answer-btn:hover {
      transform: translateX(5px);
      border-color: var(--primary-light);
      background: rgba(108, 60, 224, 0.15);
    }

    .answer-btn:active {
      transform: translateX(2px) scale(0.98);
    }

    .answer-btn .key {
      background: var(--primary);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
      flex-shrink: 0;
    }

    .answer-btn.yes:hover { border-color: var(--success); background: rgba(16, 185, 129, 0.15); }
    .answer-btn.no:hover { border-color: var(--danger); background: rgba(239, 68, 68, 0.15); }
    .answer-btn.yes:hover .key { background: var(--success); }
    .answer-btn.no:hover .key { background: var(--danger); }

    /* === TOP GUESSES === */
    .top-guesses {
      margin-top: 20px;
      padding: 15px;
      background: rgba(108, 60, 224, 0.1);
      border-radius: 12px;
      border: 1px solid rgba(108, 60, 224, 0.2);
    }

    .top-guesses h4 {
      font-size: 0.8rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .top-guesses ul {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .top-guesses li {
      background: rgba(255,255,255,0.05);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      color: var(--accent);
    }

    /* === GUESS REVEAL === */
    .guess-reveal {
      text-align: center;
      padding: 20px 0;
    }

    .guess-character {
      font-family: 'Cinzel', serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent);
      margin: 15px 0;
      text-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
    }

    .guess-description {
      color: var(--text-dim);
      font-size: 1rem;
      margin-bottom: 25px;
      line-height: 1.6;
    }

    .guess-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 20px;
    }

    /* === BUTTONS === */
    .btn {
      padding: 12px 28px;
      border-radius: 14px;
      border: none;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      box-shadow: 0 4px 15px rgba(108, 60, 224, 0.4);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(108, 60, 224, 0.5);
    }

    .btn-success {
      background: linear-gradient(135deg, var(--success), #059669);
      color: white;
    }

    .btn-danger {
      background: linear-gradient(135deg, var(--danger), #dc2626);
      color: white;
    }

    .btn-ghost {
      background: var(--glass);
      border: 1px solid var(--glass-border);
      color: var(--text);
    }

    .btn-ghost:hover {
      background: rgba(255,255,255,0.1);
    }

    /* === IMAGE GALLERY === */
    .image-gallery {
      margin: 25px 0;
    }

    .image-gallery h3 {
      font-size: 1rem;
      color: var(--text-dim);
      margin-bottom: 15px;
      text-align: center;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 10px;
    }

    .gallery-img {
      width: 100%;
      height: 140px;
      object-fit: cover;
      border-radius: 12px;
      border: 2px solid var(--glass-border);
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .gallery-img:hover {
      transform: scale(1.05);
      border-color: var(--primary-light);
      box-shadow: 0 5px 20px rgba(108, 60, 224, 0.3);
    }

    /* === SEARCH RESULTS === */
    .search-results {
      margin: 20px 0;
    }

    .search-result {
      background: var(--glass);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 10px;
      transition: all 0.3s ease;
    }

    .search-result:hover {
      border-color: var(--primary-light);
    }

    .search-result a {
      color: var(--primary-light);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .search-result a:hover { text-decoration: underline; }

    .search-result p {
      color: var(--text-dim);
      font-size: 0.85rem;
      margin-top: 5px;
      line-height: 1.4;
    }

    /* === LEARN FORM === */
    .learn-form {
      margin-top: 25px;
      padding: 20px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 16px;
    }

    .learn-form h3 {
      color: var(--accent);
      margin-bottom: 15px;
      font-size: 1.1rem;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-dim);
      margin-bottom: 6px;
    }

    .form-group input, .form-group textarea, .form-group select {
      width: 100%;
      padding: 10px 14px;
      background: var(--glass);
      border: 1px solid var(--glass-border);
      border-radius: 10px;
      color: var(--text);
      font-size: 0.95rem;
      font-family: inherit;
      transition: border-color 0.3s;
    }

    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      outline: none;
      border-color: var(--primary-light);
    }

    .form-group select option {
      background: var(--bg-card);
      color: var(--text);
    }

    /* === PROGRESS BAR === */
    .progress-container {
      width: 100%;
      margin: 15px 0;
    }

    .progress-bar {
      height: 4px;
      background: rgba(255,255,255,0.1);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary-light), var(--accent));
      border-radius: 2px;
      transition: width 0.5s ease;
    }

    /* === STATS BAR === */
    .stats-bar {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin: 15px 0;
      flex-wrap: wrap;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* === LOADING === */
    .loading {
      display: none;
      text-align: center;
      padding: 30px;
    }

    .loading.active { display: block; }

    .thinking-dots {
      display: inline-flex;
      gap: 6px;
    }

    .thinking-dots span {
      width: 10px; height: 10px;
      background: var(--primary-light);
      border-radius: 50%;
      animation: dotBounce 1.4s ease-in-out infinite;
    }

    .thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
    .thinking-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes dotBounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
      40% { transform: scale(1); opacity: 1; }
    }

    .loading-text {
      color: var(--text-dim);
      margin-top: 12px;
      font-size: 0.9rem;
      font-style: italic;
    }

    /* === MODAL IMAGE VIEWER === */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.9);
      z-index: 1000;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal-overlay img {
      max-width: 90%;
      max-height: 90%;
      border-radius: 12px;
      box-shadow: 0 0 60px rgba(108, 60, 224, 0.3);
    }

    /* === ALT GUESSES === */
    .alt-guesses {
      margin-top: 20px;
    }

    .alt-guesses h4 {
      color: var(--text-dim);
      font-size: 0.85rem;
      margin-bottom: 10px;
    }

    .alt-guess-btn {
      background: var(--glass);
      border: 1px solid var(--glass-border);
      border-radius: 10px;
      padding: 10px 16px;
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s ease;
      margin: 4px;
      font-size: 0.9rem;
    }

    .alt-guess-btn:hover {
      border-color: var(--accent);
      background: rgba(245, 158, 11, 0.1);
    }

    /* === MODEL BADGE === */
    .model-badge {
      font-size: 0.7rem;
      color: var(--text-dim);
      background: rgba(255,255,255,0.05);
      padding: 3px 8px;
      border-radius: 6px;
      margin-top: 10px;
      display: inline-block;
    }

    /* === FOOTER === */
    .footer {
      text-align: center;
      margin-top: 30px;
      color: var(--text-dim);
      font-size: 0.8rem;
    }

    .footer a {
      color: var(--primary-light);
      text-decoration: none;
    }

    /* === LIVE SYNC INDICATOR === */
    .sync-indicator {
      position: fixed;
      top: 15px;
      right: 15px;
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      color: var(--text-dim);
      z-index: 100;
    }

    .sync-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--success);
      animation: pulse 2s ease-in-out infinite;
    }

    .sync-dot.offline {
      background: var(--danger);
      animation: none;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    /* === RESPONSIVE === */
    @media (max-width: 600px) {
      .container { padding: 10px; }
      .card { padding: 24px 18px; border-radius: 18px; }
      .header h1 { font-size: 2rem; letter-spacing: 2px; }
      .categories { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .question-text { font-size: 1.15rem; }
      .guess-character { font-size: 1.5rem; }
      .guess-actions { flex-direction: column; }
      .stats-bar { gap: 12px; }
    }

    /* Splash Screen */
    #splashScreen {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      opacity: 1;
      animation: splashFadeOut 1s ease 2.5s forwards;
    }
    #splashScreen img {
      width: 100vw;
      height: 100vh;
      object-fit: contain;
      opacity: 0;
      animation: splashLogoIn 1s ease forwards;
    }
    @keyframes splashLogoIn {
      from { opacity: 0; transform: scale(0.85); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes splashFadeOut {
      from { opacity: 1; }
      to   { opacity: 0; pointer-events: none; }
    }
    body.splash-active { overflow: hidden; }
  </style>
</head>
<body class="splash-active">
  <!-- Splash Screen -->
  <div id="splashScreen">
    <img src="/assets/logo.png" alt="Akanator">
  </div>
  <!-- Background Effects -->
  <div class="bg-effects">
    <div class="orb"></div>
    <div class="orb"></div>
    <div class="orb"></div>
  </div>

  <div class="particles" id="particles"></div>

  <!-- Firebase Sync Indicator -->
  <div class="sync-indicator" id="syncIndicator">
    <div class="sync-dot" id="syncDot"></div>
    <span id="syncText">Live</span>
  </div>

  <!-- Image Modal -->
  <div class="modal-overlay" id="imageModal" onclick="closeModal()">
    <img id="modalImage" src="" alt="">
  </div>

  <div class="container">
    <div class="header">
      <span class="genie">🧞</span>
      <h1>AKANATOR</h1>
      <p>I can read your mind. Think of anything.</p>
    </div>

    <div class="card">
      <!-- ===== WELCOME SCREEN ===== -->
      <div class="screen active" id="screen-welcome">
        <h2 style="text-align:center; margin-bottom:10px; font-size:1.2rem;">Choose a Category</h2>
        <p style="text-align:center; color:var(--text-dim); margin-bottom:5px; font-size:0.9rem;">Think of something and I'll guess it in 20 questions or fewer!</p>

        <div class="categories">
          <div class="category-btn" onclick="startGame('characters')">
            <span class="emoji">🧑</span>
            <span class="label">Characters & People</span>
          </div>
          <div class="category-btn" onclick="startGame('animals')">
            <span class="emoji">🐾</span>
            <span class="label">Animals</span>
          </div>
          <div class="category-btn" onclick="startGame('objects')">
            <span class="emoji">📦</span>
            <span class="label">Objects</span>
          </div>
          <div class="category-btn" onclick="startGame('any')">
            <span class="emoji">✨</span>
            <span class="label">Anything!</span>
          </div>
        </div>

        <div id="globalStats" class="stats-bar" style="display:none;">
          <div class="stat-item">
            <div class="stat-value" id="statGames">-</div>
            <div class="stat-label">Games</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="statWinRate">-</div>
            <div class="stat-label">Win Rate</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="statCharacters">-</div>
            <div class="stat-label">Known</div>
          </div>
        </div>
      </div>

      <!-- ===== QUESTION SCREEN ===== -->
      <div class="screen" id="screen-question">
        <div class="question-number">
          <span class="q-badge">Q<span id="qNum">1</span>/20</span>
          <div class="confidence-bar">
            <span>Confidence:</span>
            <div class="confidence-track">
              <div class="confidence-fill" id="confidenceFill" style="width:0%"></div>
            </div>
            <span id="confidenceText">0%</span>
          </div>
        </div>

        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill" style="width:5%"></div>
          </div>
        </div>

        <div class="question-text" id="questionText">
          Loading...
        </div>

        <div class="answers" id="answersArea">
          <button class="answer-btn yes" onclick="answer('Yes')">
            <span class="key">1</span> Yes
          </button>
          <button class="answer-btn" onclick="answer('Probably yes')">
            <span class="key">2</span> Probably Yes
          </button>
          <button class="answer-btn" onclick="answer('I dont know')">
            <span class="key">3</span> Don't Know
          </button>
          <button class="answer-btn" onclick="answer('Probably not')">
            <span class="key">4</span> Probably Not
          </button>
          <button class="answer-btn no" onclick="answer('No')">
            <span class="key">5</span> No
          </button>
        </div>

        <div id="topGuessesArea" class="top-guesses" style="display:none">
          <h4>🧠 My Top Guesses</h4>
          <ul id="topGuessesList"></ul>
        </div>

        <div class="loading" id="loadingQuestion">
          <div class="thinking-dots"><span></span><span></span><span></span></div>
          <div class="loading-text">Akanator is thinking...</div>
        </div>

        <span class="model-badge" id="modelBadge"></span>
      </div>

      <!-- ===== GUESS SCREEN ===== -->
      <div class="screen" id="screen-guess">
        <div class="guess-reveal">
          <span style="font-size:3rem;">🎯</span>
          <h2 style="margin:10px 0 5px;">I think it's...</h2>
          <div class="guess-character" id="guessName">???</div>
          <p class="guess-description" id="guessDesc"></p>

          <div id="guessConfidence" style="margin-bottom:15px;">
            <span style="color:var(--text-dim); font-size:0.9rem;">Confidence: </span>
            <span id="guessConfValue" style="color:var(--accent); font-weight:700;"></span>
          </div>

          <div class="guess-actions">
            <button class="btn btn-success" onclick="guessCorrect()">✅ Yes, that's right!</button>
            <button class="btn btn-danger" onclick="guessWrong()">❌ No, wrong!</button>
          </div>

          <div class="alt-guesses" id="altGuessesArea" style="display:none">
            <h4>Or maybe it's one of these?</h4>
            <div id="altGuessesList"></div>
          </div>
        </div>

        <div class="loading" id="loadingGuess">
          <div class="thinking-dots"><span></span><span></span><span></span></div>
          <div class="loading-text">Searching the cosmos...</div>
        </div>
      </div>

      <!-- ===== RESULT SCREEN (CORRECT) ===== -->
      <div class="screen" id="screen-result-correct">
        <div style="text-align:center; padding:20px 0;">
          <span style="font-size:4rem; display:block; margin-bottom:15px;">🎉</span>
          <h2 style="color:var(--success); font-size:1.8rem;">I knew it!</h2>
          <p class="guess-character" id="resultCharName"></p>

          <div id="resultImages" class="image-gallery" style="display:none">
            <h3>📸 Here they are!</h3>
            <div class="gallery-grid" id="resultGallery"></div>
          </div>

          <div id="resultSearchInfo" class="search-results" style="display:none">
            <h3 style="color:var(--text-dim); font-size:0.9rem; margin-bottom:10px;">📚 Learn More</h3>
            <div id="resultSearchResults"></div>
          </div>

          <div class="stats-bar" style="margin:25px 0;">
            <div class="stat-item">
              <div class="stat-value" id="resultQuestions">-</div>
              <div class="stat-label">Questions</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" id="resultModel">-</div>
              <div class="stat-label">AI Model</div>
            </div>
          </div>

          <button class="btn btn-primary" onclick="playAgain()" style="margin-top:10px;">🔄 Play Again</button>
        </div>

        <div class="loading" id="loadingSearch">
          <div class="thinking-dots"><span></span><span></span><span></span></div>
          <div class="loading-text">Finding images & info...</div>
        </div>
      </div>

      <!-- ===== RESULT SCREEN (WRONG) ===== -->
      <div class="screen" id="screen-result-wrong">
        <div style="text-align:center; padding:20px 0;">
          <span style="font-size:4rem; display:block; margin-bottom:15px;">🤔</span>
          <h2 style="color:var(--accent); font-size:1.5rem;">You beat me this time!</h2>
          <p style="color:var(--text-dim); margin:10px 0 20px;">Help me learn so I can do better next time!</p>

          <div class="learn-form" id="learnForm">
            <h3>🧠 Teach Me</h3>
            <div class="form-group">
              <label>Who/What were you thinking of?</label>
              <input type="text" id="learnName" placeholder="e.g. SpongeBob SquarePants">
            </div>
            <div class="form-group">
              <label>Category</label>
              <select id="learnCategory">
                <option value="fictional-character">Fictional Character</option>
                <option value="real-person">Real Person</option>
                <option value="animal">Animal</option>
                <option value="object">Object</option>
                <option value="place">Place</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Brief description</label>
              <textarea id="learnDescription" rows="2" placeholder="e.g. Yellow cartoon sponge who lives under the sea"></textarea>
            </div>
            <div class="form-group">
              <label>A key characteristic I should have asked about</label>
              <input type="text" id="learnHint" placeholder="e.g. Lives underwater">
            </div>
            <button class="btn btn-primary" onclick="submitLearn()" style="width:100%; justify-content:center;">
              📚 Teach Akanator
            </button>
          </div>

          <button class="btn btn-ghost" onclick="playAgain()" style="margin-top:15px;">🔄 Play Again</button>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Powered by AI ✨ Built on Cloudflare Workers</p>
    </div>
  </div>

  <!-- ===== FIREBASE SDK ===== -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

  <script>
    // Splash screen removal
    (function() {
      const splash = document.getElementById('splashScreen');
      if (splash) {
        setTimeout(function() {
          splash.style.display = 'none';
          document.body.classList.remove('splash-active');
        }, 3500);
      }
    })();

    // ============================================================
    // FIREBASE INIT - Realtime sync
    // ============================================================
    const firebaseConfig = {
      apiKey: "AIzaSyCk2pBTvSiWdXfX4k5mYGGJJMxQUBvk5W0",
      authDomain: "akanator-17686.firebaseapp.com",
      projectId: "akanator-17686",
      storageBucket: "akanator-17686.firebasestorage.app",
      messagingSenderId: "632124715829",
      appId: "1:632124715829:web:d99672bba9a93ade74d27c",
      measurementId: "G-79CWCMX2JJ",
      databaseURL: "https://akanator-17686-default-rtdb.firebaseio.com"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    // Real-time connection status
    const connectedRef = db.ref('.info/connected');
    connectedRef.on('value', (snap) => {
      const syncDot = document.getElementById('syncDot');
      const syncText = document.getElementById('syncText');
      if (snap.val() === true) {
        syncDot.classList.remove('offline');
        syncText.textContent = 'Live';
      } else {
        syncDot.classList.add('offline');
        syncText.textContent = 'Offline';
      }
    });

    // Real-time stats listener
    db.ref('stats').on('value', (snap) => {
      const stats = snap.val();
      if (stats) {
        document.getElementById('statGames').textContent = stats.gamesStarted || 0;
        const total = (stats.gamesWon || 0) + (stats.gamesLost || 0);
        const rate = total > 0 ? Math.round((stats.gamesWon / total) * 100) : 0;
        document.getElementById('statWinRate').textContent = rate + '%';
        document.getElementById('statCharacters').textContent = stats.charactersLearned || 0;
        document.getElementById('globalStats').style.display = 'flex';
      }
    });

    // ============================================================
    // GAME STATE
    // ============================================================
    let gameState = {
      category: '',
      questionNumber: 0,
      history: [],
      currentQuestion: '',
      confidence: 0,
      topGuesses: [],
      currentGuess: '',
      model: '',
      questionsAsked: [],
      answersGiven: [],
    };

    // ============================================================
    // SCREEN MANAGEMENT
    // ============================================================
    function showScreen(screenId) {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('screen-' + screenId).classList.add('active');
    }

    // ============================================================
    // START GAME
    // ============================================================
    async function startGame(category) {
      gameState.category = category;
      showScreen('question');
      showLoading('loadingQuestion', true);
      hideElement('answersArea');

      try {
        const res = await fetch('/api/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category }),
        });

        const data = await res.json();

        gameState.questionNumber = data.questionNumber;
        gameState.history = data.history;
        gameState.currentQuestion = data.question;
        gameState.confidence = data.confidence;
        gameState.topGuesses = data.topGuesses;
        gameState.model = data.model;
        gameState.questionsAsked = [data.question];
        gameState.answersGiven = [];

        updateQuestionUI(data);
      } catch (err) {
        console.error('Start error:', err);
        document.getElementById('questionText').textContent = 'Error connecting. Please try again.';
      }

      showLoading('loadingQuestion', false);
      showElement('answersArea');
    }

    // ============================================================
    // ANSWER A QUESTION
    // ============================================================
    async function answer(ans) {
      showLoading('loadingQuestion', true);
      hideElement('answersArea');

      try {
        const res = await fetch('/api/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            history: gameState.history,
            answer: ans,
            questionNumber: gameState.questionNumber,
          }),
        });

        const data = await res.json();

        // Track: ans is the answer to the CURRENT question (before update)
        gameState.answersGiven.push(ans);

        gameState.questionNumber = data.questionNumber;
        gameState.history = data.history;
        gameState.currentQuestion = data.question;
        gameState.confidence = data.confidence;
        gameState.topGuesses = data.topGuesses;
        gameState.model = data.model;
        // Track: push the NEW question we just received
        if (data.question) gameState.questionsAsked.push(data.question);

        if (data.shouldGuess || data.questionNumber > 20) {
          await makeGuess();
          return;
        }

        updateQuestionUI(data);
      } catch (err) {
        console.error('Answer error:', err);
        document.getElementById('questionText').textContent = 'Error. Trying again...';
      }

      showLoading('loadingQuestion', false);
      showElement('answersArea');
    }

    // ============================================================
    // AI MAKES A GUESS
    // ============================================================
    async function makeGuess() {
      showScreen('guess');
      showLoading('loadingGuess', true);

      try {
        const res = await fetch('/api/guess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            history: gameState.history,
            questionNumber: gameState.questionNumber,
          }),
        });

        const data = await res.json();

        gameState.currentGuess = data.guess;
        gameState.model = data.model;

        document.getElementById('guessName').textContent = data.guess;
        document.getElementById('guessDesc').textContent = data.description;
        document.getElementById('guessConfValue').textContent = data.confidence + '%';

        // Show alternative guesses
        if (data.alternativeGuesses && data.alternativeGuesses.length > 0) {
          const altArea = document.getElementById('altGuessesArea');
          const altList = document.getElementById('altGuessesList');
          altList.innerHTML = '';
          data.alternativeGuesses.forEach(alt => {
            const btn = document.createElement('button');
            btn.className = 'alt-guess-btn';
            btn.textContent = alt;
            btn.onclick = () => selectAltGuess(alt);
            altList.appendChild(btn);
          });
          altArea.style.display = 'block';
        }
      } catch (err) {
        console.error('Guess error:', err);
        document.getElementById('guessName').textContent = 'Error making guess';
      }

      showLoading('loadingGuess', false);
    }

    function selectAltGuess(guess) {
      gameState.currentGuess = guess;
      guessCorrect();
    }

    // ============================================================
    // GUESS CORRECT
    // ============================================================
    async function guessCorrect() {
      showScreen('result-correct');
      document.getElementById('resultCharName').textContent = gameState.currentGuess;
      document.getElementById('resultQuestions').textContent = gameState.questionNumber;
      document.getElementById('resultModel').textContent = gameState.model;

      // Save game + Q&A patterns to Firebase for learning
      fetch('/api/save-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: gameState.currentGuess,
          category: gameState.category,
          questionsAsked: gameState.questionNumber,
          won: true,
          qaData: {
            character: gameState.currentGuess,
            category: gameState.category,
            questions: gameState.questionsAsked,
            answers: gameState.answersGiven,
            traits: extractTraits(),
          },
        }),
      }).catch(e => console.error('Save game error:', e));

      // Save the character
      fetch('/api/learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gameState.currentGuess,
          category: gameState.category,
          description: document.getElementById('guessDesc').textContent,
          hints: extractHints(),
        }),
      }).catch(e => console.error('Learn error:', e));

      // Real-time Firebase: save Q&A pattern directly for instant learning
      try {
        const charKey = gameState.currentGuess.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        db.ref('qaPatterns/' + charKey).update({
          character: gameState.currentGuess,
          category: gameState.category,
          lastUpdated: Date.now(),
          traits: extractTraits(),
        });
        db.ref('qaPatterns/' + charKey + '/patterns').push({
          questions: gameState.questionsAsked,
          answers: gameState.answersGiven,
          timestamp: Date.now(),
        });
      } catch(e) { console.error('Firebase QA save error:', e); }

      // Search for images and info
      showLoading('loadingSearch', true);
      try {
        console.log('[Akanator] Searching for:', gameState.currentGuess);
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ character: gameState.currentGuess }),
        });
        const data = await res.json();
        console.log('[Akanator] Search response:', JSON.stringify(data).substring(0, 500));

        // Display images
        const imgs = data.images && data.images.images ? data.images.images : [];
        console.log('[Akanator] Images found:', imgs.length);
        if (imgs.length > 0) {
          const gallery = document.getElementById('resultGallery');
          gallery.innerHTML = '';
          imgs.forEach(img => {
            const imgEl = document.createElement('img');
            imgEl.className = 'gallery-img';
            imgEl.src = img.thumbnail || img.url;
            imgEl.alt = img.title || gameState.currentGuess;
            imgEl.loading = 'lazy';
            imgEl.onclick = (e) => { e.stopPropagation(); openModal(img.url || img.thumbnail); };
            imgEl.onerror = () => { console.log('[Akanator] Image failed to load:', img.thumbnail); imgEl.style.display = 'none'; };
            gallery.appendChild(imgEl);
          });
          document.getElementById('resultImages').style.display = 'block';
        } else {
          // Even if no API images, try a simple fallback
          const gallery = document.getElementById('resultGallery');
          gallery.innerHTML = '';
          const fallbackImg = document.createElement('img');
          fallbackImg.className = 'gallery-img';
          fallbackImg.src = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(gameState.currentGuess) + '&prop=pageimages&pithumbsize=400&format=json';
          // Use a Wikipedia page image as last resort
          fetchWikiImage(gameState.currentGuess).then(url => {
            if (url) {
              const img = document.createElement('img');
              img.className = 'gallery-img';
              img.src = url;
              img.alt = gameState.currentGuess;
              img.onclick = (e) => { e.stopPropagation(); openModal(url); };
              img.onerror = () => img.style.display = 'none';
              gallery.appendChild(img);
              document.getElementById('resultImages').style.display = 'block';
            }
          }).catch(() => {});
        }

        // Display search results
        const results = data.info && data.info.results ? data.info.results : [];
        if (results.length > 0) {
          const searchDiv = document.getElementById('resultSearchResults');
          searchDiv.innerHTML = '';
          results.forEach(r => {
            const div = document.createElement('div');
            div.className = 'search-result';
            div.innerHTML = '<a href="' + r.link + '" target="_blank">' + escapeHtml(r.title) + '</a><p>' + escapeHtml(r.snippet) + '</p>';
            searchDiv.appendChild(div);
          });
          document.getElementById('resultSearchInfo').style.display = 'block';
        }
      } catch (err) {
        console.error('[Akanator] Search error:', err);
      }
      showLoading('loadingSearch', false);
    }

    // ============================================================
    // GUESS WRONG
    // ============================================================
    function guessWrong() {
      showScreen('result-wrong');

      // Save game loss
      fetch('/api/save-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: gameState.currentGuess,
          category: gameState.category,
          questionsAsked: gameState.questionNumber,
          won: false,
        }),
      }).catch(e => console.error('Save game error:', e));
    }

    // ============================================================
    // TEACH / LEARN
    // ============================================================
    async function submitLearn() {
      const name = document.getElementById('learnName').value.trim();
      const category = document.getElementById('learnCategory').value;
      const description = document.getElementById('learnDescription').value.trim();
      const hint = document.getElementById('learnHint').value.trim();

      if (!name) {
        alert('Please enter a name!');
        return;
      }

      try {
        await fetch('/api/learn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            category,
            description,
            hints: hint ? [hint] : [],
          }),
        });

        document.getElementById('learnForm').innerHTML =
          '<div style="text-align:center; padding:20px;">' +
          '<span style="font-size:3rem;">🧠</span>' +
          '<h3 style="color:var(--success); margin:10px 0;">Thanks! I learned about ' + escapeHtml(name) + '!</h3>' +
          '<p style="color:var(--text-dim);">I will remember this for next time.</p>' +
          '</div>';

        // Firebase real-time update
        db.ref('stats/charactersLearned').transaction(val => (val || 0) + 1);
      } catch (err) {
        console.error('Learn submit error:', err);
        alert('Error saving. Please try again.');
      }
    }

    // ============================================================
    // PLAY AGAIN
    // ============================================================
    function playAgain() {
      gameState = {
        category: '',
        questionNumber: 0,
        history: [],
        currentQuestion: '',
        confidence: 0,
        topGuesses: [],
        currentGuess: '',
        model: '',
        questionsAsked: [],
        answersGiven: [],
      };
      document.getElementById('resultImages').style.display = 'none';
      document.getElementById('resultSearchInfo').style.display = 'none';
      document.getElementById('altGuessesArea').style.display = 'none';
      showScreen('welcome');
    }

    // ============================================================
    // UI HELPERS
    // ============================================================
    function updateQuestionUI(data) {
      document.getElementById('qNum').textContent = data.questionNumber || gameState.questionNumber;
      document.getElementById('questionText').textContent = data.question;
      document.getElementById('confidenceFill').style.width = (data.confidence || 0) + '%';
      document.getElementById('confidenceText').textContent = (data.confidence || 0) + '%';
      document.getElementById('progressFill').style.width = ((data.questionNumber || gameState.questionNumber) / 20 * 100) + '%';

      if (data.model) {
        document.getElementById('modelBadge').textContent = '🤖 ' + data.model;
      }

      // Top guesses
      if (data.topGuesses && data.topGuesses.length > 0) {
        const list = document.getElementById('topGuessesList');
        list.innerHTML = '';
        data.topGuesses.forEach(g => {
          const li = document.createElement('li');
          li.textContent = g;
          list.appendChild(li);
        });
        document.getElementById('topGuessesArea').style.display = 'block';
      } else {
        document.getElementById('topGuessesArea').style.display = 'none';
      }
    }

    function showLoading(id, show) {
      document.getElementById(id).classList.toggle('active', show);
    }

    function hideElement(id) {
      document.getElementById(id).style.display = 'none';
    }

    function showElement(id) {
      document.getElementById(id).style.display = '';
    }

    function openModal(url) {
      document.getElementById('modalImage').src = url;
      document.getElementById('imageModal').classList.add('active');
    }

    function closeModal() {
      document.getElementById('imageModal').classList.remove('active');
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    async function fetchWikiImage(name) {
      try {
        const searchUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(name) + '&format=json&origin=*&srlimit=1';
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        const pages = searchData?.query?.search;
        if (!pages || pages.length === 0) return null;
        const title = pages[0].title;
        const imgUrl = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=pageimages&pithumbsize=400&format=json&origin=*';
        const imgRes = await fetch(imgUrl);
        const imgData = await imgRes.json();
        const pageObj = Object.values(imgData?.query?.pages || {})[0];
        return pageObj?.thumbnail?.source || null;
      } catch (e) {
        console.error('[Akanator] Wiki image fallback error:', e);
        return null;
      }
    }

    function extractHints() {
      // Extract key Q&A pairs as hints from the game history
      const hints = [];
      for (let i = 0; i < gameState.questionsAsked.length; i++) {
        const q = gameState.questionsAsked[i];
        const a = gameState.answersGiven[i];
        if (q && a) hints.push(q + ' -> ' + a);
      }
      return hints.slice(-15);
    }

    function extractTraits() {
      // Extract YES/NO traits as a structured object for Firebase learning
      const traits = {};
      for (let i = 0; i < gameState.questionsAsked.length; i++) {
        const q = (gameState.questionsAsked[i] || '').toLowerCase();
        const a = (gameState.answersGiven[i] || '').toLowerCase();
        const isYes = a.includes('yes');
        const isNo = a === 'no' || a === 'probably not';
        
        // Extract trait keywords from questions
        if (q.includes('real person') || q.includes('real')) traits['real'] = isYes;
        if (q.includes('fictional')) traits['fictional'] = isYes;
        if (q.includes('male') || q.includes('man')) traits['male'] = isYes;
        if (q.includes('female') || q.includes('woman')) traits['female'] = isYes;
        if (q.includes('alive')) traits['alive'] = isYes;
        if (q.includes('anime')) traits['anime'] = isYes;
        if (q.includes('movie') || q.includes('film')) traits['movie'] = isYes;
        if (q.includes('tv') || q.includes('television') || q.includes('show')) traits['tv'] = isYes;
        if (q.includes('video game') || q.includes('game')) traits['game'] = isYes;
        if (q.includes('music') || q.includes('singer') || q.includes('rapper')) traits['music'] = isYes;
        if (q.includes('sport') || q.includes('athlete')) traits['sport'] = isYes;
        if (q.includes('technology') || q.includes('tech')) traits['tech'] = isYes;
        if (q.includes('animal')) traits['animal'] = isYes;
        if (q.includes('superhero') || q.includes('marvel') || q.includes('dc')) traits['superhero'] = isYes;
        if (q.includes('cartoon')) traits['cartoon'] = isYes;
        if (q.includes('human')) traits['human'] = isYes;
      }
      return traits;
    }

    // ============================================================
    // KEYBOARD SHORTCUTS
    // ============================================================
    document.addEventListener('keydown', (e) => {
      const questionScreen = document.getElementById('screen-question');
      if (!questionScreen.classList.contains('active')) return;
      if (document.getElementById('loadingQuestion').classList.contains('active')) return;

      const keyMap = { '1': 'Yes', '2': 'Probably yes', '3': 'I dont know', '4': 'Probably not', '5': 'No' };
      if (keyMap[e.key]) {
        answer(keyMap[e.key]);
      }
    });

    // Close modal with escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // ============================================================
    // PARTICLES
    // ============================================================
    function createParticles() {
      const container = document.getElementById('particles');
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 4 + 's';
        particle.style.animationDuration = (3 + Math.random() * 3) + 's';
        container.appendChild(particle);
      }
    }

    createParticles();

    // Load initial stats
    fetch('/api/stats').then(r => r.json()).then(stats => {
      if (stats && stats.gamesStarted > 0) {
        document.getElementById('statGames').textContent = stats.gamesStarted;
        const total = (stats.gamesWon || 0) + (stats.gamesLost || 0);
        const rate = total > 0 ? Math.round((stats.gamesWon / total) * 100) : 0;
        document.getElementById('statWinRate').textContent = rate + '%';
        document.getElementById('statCharacters').textContent = stats.charactersLearned || 0;
        document.getElementById('globalStats').style.display = 'flex';
      }
    }).catch(() => {});
  </script>
</body>
</html>`;
}
