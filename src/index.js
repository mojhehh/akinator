// ============================================================
// AKANATOR - AI-Powered Character Guessing Game
// Cloudflare Worker with Cerebras AI, Google Search, Firebase
// ============================================================

import { handleAIQuestion, handleAIGuess, handleAIInit } from './ai.js';
import { searchCharacter, searchCharacterImages } from './search.js';
import { firebaseSaveGame, firebaseGetLeaderboard, firebaseSaveCharacter, firebaseGetCharacters, firebaseIncrementStats, firebaseSaveQAPattern } from './firebase.js';
import { getHTML } from './frontend.js';
import { LOGO_BASE64, LOGO_MIME } from './logo-data.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // === ROUTES ===

      // Serve frontend
      if (path === '/' || path === '/index.html') {
        return new Response(getHTML(env), {
          headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
        });
      }

      // Serve logo image
      if (path === '/assets/logo.png') {
        const binaryStr = atob(LOGO_BASE64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
        return new Response(bytes, {
          headers: { 'Content-Type': LOGO_MIME, 'Cache-Control': 'public, max-age=31536000', ...corsHeaders },
        });
      }

      // Start a new game session
      if (path === '/api/start' && request.method === 'POST') {
        const body = await safeParseJSON(request);
        if (!body) return jsonResponse({ error: 'Invalid JSON body' }, corsHeaders, 400);
        const category = body.category || 'any';
        const result = await handleAIInit(env, category);
        await firebaseIncrementStats(env, 'gamesStarted');
        return jsonResponse(result, corsHeaders);
      }

      // Send answer and get next question
      if (path === '/api/answer' && request.method === 'POST') {
        const body = await safeParseJSON(request);
        if (!body) return jsonResponse({ error: 'Invalid JSON body' }, corsHeaders, 400);
        if (!body.history || !body.answer) return jsonResponse({ error: 'Missing required fields: history, answer' }, corsHeaders, 400);
        const result = await handleAIQuestion(env, body);
        return jsonResponse(result, corsHeaders);
      }

      // AI makes a guess
      if (path === '/api/guess' && request.method === 'POST') {
        const body = await safeParseJSON(request);
        if (!body) return jsonResponse({ error: 'Invalid JSON body' }, corsHeaders, 400);
        if (!body.history) return jsonResponse({ error: 'Missing required field: history' }, corsHeaders, 400);
        const result = await handleAIGuess(env, body);
        return jsonResponse(result, corsHeaders);
      }

      // Search for character info + images
      if (path === '/api/search' && request.method === 'POST') {
        const body = await safeParseJSON(request);
        if (!body) return jsonResponse({ error: 'Invalid JSON body' }, corsHeaders, 400);
        const characterName = body.character;
        if (!characterName) return jsonResponse({ error: 'Missing required field: character' }, corsHeaders, 400);
        const [info, images] = await Promise.all([
          searchCharacter(env, characterName),
          searchCharacterImages(env, characterName),
        ]);
        return jsonResponse({ info, images }, corsHeaders);
      }

      // Save a game result to Firebase
      if (path === '/api/save-game' && request.method === 'POST') {
        const body = await safeParseJSON(request);
        if (!body) return jsonResponse({ error: 'Invalid JSON body' }, corsHeaders, 400);
        const result = await firebaseSaveGame(env, body);
        await firebaseIncrementStats(env, body.won ? 'gamesWon' : 'gamesLost');
        // If won, save Q&A patterns for learning
        if (body.won && body.qaData) {
          ctx.waitUntil(firebaseSaveQAPattern(env, body.qaData));
        }
        return jsonResponse(result, corsHeaders);
      }

      // Save a new character the AI didn't know
      if (path === '/api/learn' && request.method === 'POST') {
        const body = await safeParseJSON(request);
        if (!body) return jsonResponse({ error: 'Invalid JSON body' }, corsHeaders, 400);
        if (!body.name) return jsonResponse({ error: 'Missing required field: name' }, corsHeaders, 400);
        const result = await firebaseSaveCharacter(env, body);
        await firebaseIncrementStats(env, 'charactersLearned');
        return jsonResponse(result, corsHeaders);
      }

      // Get leaderboard / stats
      if (path === '/api/leaderboard') {
        const result = await firebaseGetLeaderboard(env);
        return jsonResponse(result, corsHeaders);
      }

      // Get known characters from Firebase
      if (path === '/api/characters') {
        const result = await firebaseGetCharacters(env);
        return jsonResponse(result, corsHeaders);
      }

      // Global stats
      if (path === '/api/stats') {
        const stats = await firebaseGetStats(env);
        return jsonResponse(stats, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (err) {
      console.error('Worker error:', err);
      return jsonResponse({ error: err.message || 'Internal Server Error' }, corsHeaders, 500);
    }
  },
};

function jsonResponse(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function safeParseJSON(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function firebaseGetStats(env) {
  const url = `${env.FIREBASE_DB_URL}/stats.json`;
  const res = await fetch(url);
  if (!res.ok) return { gamesStarted: 0, gamesWon: 0, gamesLost: 0, charactersLearned: 0 };
  return await res.json() || { gamesStarted: 0, gamesWon: 0, gamesLost: 0, charactersLearned: 0 };
}
