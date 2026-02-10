// ============================================================
// Firebase Realtime Database - REST API Integration
// ============================================================

// Save a completed game
export async function firebaseSaveGame(env, gameData) {
  const gameId = crypto.randomUUID();
  const payload = {
    ...gameData,
    timestamp: Date.now(),
    id: gameId,
  };

  const url = `${env.FIREBASE_DB_URL}/games/${gameId}.json`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to save game to Firebase');
  }

  return { success: true, gameId };
}

// Save a character the AI learned
export async function firebaseSaveCharacter(env, characterData) {
  const charId = slugify(characterData.name);
  const url = `${env.FIREBASE_DB_URL}/characters/${charId}.json`;

  // First check if character exists
  const existing = await fetch(url);
  const existingData = await existing.json();

  const payload = existingData
    ? {
        ...existingData,
        timesPlayed: (existingData.timesPlayed || 0) + 1,
        lastPlayed: Date.now(),
        hints: mergeHints(existingData.hints || [], characterData.hints || []),
      }
    : {
        name: characterData.name,
        category: characterData.category || 'unknown',
        description: characterData.description || '',
        hints: characterData.hints || [],
        createdAt: Date.now(),
        lastPlayed: Date.now(),
        timesPlayed: 1,
        addedBy: characterData.addedBy || 'anonymous',
      };

  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to save character to Firebase');
  }

  return { success: true, charId, isNew: !existingData };
}

// Get leaderboard - recent games with stats
export async function firebaseGetLeaderboard(env) {
  const url = `${env.FIREBASE_DB_URL}/games.json?orderBy="timestamp"&limitToLast=50`;
  const res = await fetch(url);

  if (!res.ok) {
    return { games: [], stats: {} };
  }

  const data = await res.json();
  if (!data) return { games: [], stats: {} };

  const games = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);

  // Calculate stats
  const totalGames = games.length;
  const wins = games.filter(g => g.won).length;
  const avgQuestions = games.reduce((sum, g) => sum + (g.questionsAsked || 0), 0) / (totalGames || 1);

  return {
    games: games.slice(0, 20),
    stats: {
      totalGames,
      wins,
      losses: totalGames - wins,
      winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
      avgQuestions: Math.round(avgQuestions * 10) / 10,
    },
  };
}

// Get known characters
export async function firebaseGetCharacters(env) {
  const url = `${env.FIREBASE_DB_URL}/characters.json?orderBy="timesPlayed"&limitToLast=100`;
  const res = await fetch(url);

  if (!res.ok) return { characters: [] };

  const data = await res.json();
  if (!data) return { characters: [] };

  const characters = Object.values(data).sort((a, b) => (b.timesPlayed || 0) - (a.timesPlayed || 0));
  return { characters };
}

// Increment a stat counter
export async function firebaseIncrementStats(env, statName) {
  try {
    // Read current value
    const url = `${env.FIREBASE_DB_URL}/stats/${statName}.json`;
    const res = await fetch(url);
    const current = await res.json() || 0;

    // Write incremented value
    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(current + 1),
    });
  } catch (e) {
    console.error('Stats increment error:', e);
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mergeHints(existing, newHints) {
  const all = [...existing, ...newHints];
  return [...new Set(all)].slice(0, 50); // Keep max 50 unique hints
}

// Save a full Q&A decision tree from a won game so the AI can learn from it
export async function firebaseSaveQAPattern(env, data) {
  try {
    const charId = slugify(data.character);
    const url = `${env.FIREBASE_DB_URL}/qaPatterns/${charId}.json`;

    // Fetch existing patterns
    const existing = await fetch(url);
    const existingData = await existing.json();

    const qaEntry = {
      questions: data.questions || [],
      answers: data.answers || [],
      timestamp: Date.now(),
    };

    let patterns;
    if (existingData && existingData.patterns) {
      // Keep last 5 successful game patterns per character
      patterns = [...existingData.patterns, qaEntry].slice(-5);
    } else {
      patterns = [qaEntry];
    }

    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        character: data.character,
        category: data.category || 'unknown',
        patterns,
        traits: data.traits || {},
        lastUpdated: Date.now(),
      }),
    });
  } catch (e) {
    console.error('Save QA pattern error:', e);
  }
}

// Get Q&A patterns for AI context — returns characters with their traits/patterns
export async function firebaseGetQAPatterns(env) {
  try {
    const url = `${env.FIREBASE_DB_URL}/qaPatterns.json?limitToLast=100`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data) return Object.values(data);
    }
  } catch (e) {
    console.error('Get QA patterns error:', e);
  }
  return [];
}

// Store traits for characters (what the AI learned about them through Q&A)
export async function firebaseSaveTraits(env, character, traits) {
  try {
    const charId = slugify(character);
    const url = `${env.FIREBASE_DB_URL}/qaPatterns/${charId}/traits.json`;
    
    const existing = await fetch(url);
    const existingTraits = await existing.json() || {};
    
    const merged = { ...existingTraits, ...traits };
    
    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    });
  } catch (e) {
    console.error('Save traits error:', e);
  }
}
