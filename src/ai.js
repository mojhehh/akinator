// ============================================================
// AI Engine - Cerebras LLM-powered question & guessing logic
// With constraint tracking and Firebase learning
// ============================================================

const CEREBRAS_URL = 'https://api.cerebras.ai/v1/chat/completions';

// Models ranked best to worst for guessing accuracy
const MODELS = ['llama-3.3-70b', 'gpt-oss-120b', 'qwen-3-32b', 'llama3.1-8b'];

async function callCerebras(env, messages, temperature = 0.15, maxTokens = 2048) {
  let lastError = null;

  for (const model of MODELS) {
    try {
      const res = await fetch(CEREBRAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.CEREBRAS_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_completion_tokens: maxTokens,
          top_p: 1,
          stream: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          content: data.choices[0].message.content,
          model,
        };
      }

      if (res.status === 429) {
        lastError = `Rate limited on ${model}`;
        continue;
      }

      const errText = await res.text();
      lastError = `${model}: ${res.status} - ${errText}`;
    } catch (e) {
      lastError = `${model}: ${e.message}`;
    }
  }

  throw new Error(`All models failed. Last error: ${lastError}`);
}

// ============================================================
// Firebase knowledge helpers
// ============================================================

async function getKnownCharacters(env) {
  try {
    const url = `${env.FIREBASE_DB_URL}/characters.json?limitToLast=200`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data) return Object.values(data);
    }
  } catch (e) { /* ignore */ }
  return [];
}

async function getQAPatterns(env) {
  try {
    const url = `${env.FIREBASE_DB_URL}/qaPatterns.json?limitToLast=100`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data) return Object.values(data);
    }
  } catch (e) { /* ignore */ }
  return [];
}

// ============================================================
// Build structured constraints from Q&A history
// This is the KEY improvement - explicit fact tracking
// ============================================================

function buildConstraints(history) {
  const facts = [];
  const questions = [];
  const answers = [];

  for (let i = 1; i < history.length; i++) {
    const msg = history[i];
    if (msg.role === 'user' && msg.content.startsWith('Answer:')) {
      const answerText = msg.content.replace('Answer: ', '').trim();
      const prevMsg = history[i - 1];
      let question = '';
      try {
        const parsed = JSON.parse(prevMsg.content);
        question = parsed.question || prevMsg.content;
      } catch {
        question = prevMsg.content;
      }

      questions.push(question);
      answers.push(answerText);

      // Classify the answer
      const lower = answerText.toLowerCase();
      const isYes = lower === 'yes' || lower === 'probably yes';
      const isNo = lower === 'no' || lower === 'probably not';
      const isDK = lower.includes('know');

      if (isYes) {
        facts.push(`CONFIRMED: ${question} = YES`);
      } else if (isNo) {
        facts.push(`RULED OUT: ${question} = NO`);
      } else if (isDK) {
        facts.push(`UNKNOWN: ${question} = unsure`);
      } else {
        facts.push(`${answerText.toUpperCase()}: ${question}`);
      }
    }
  }

  return { facts, questions, answers };
}

// ============================================================
// START GAME
// ============================================================

export async function handleAIInit(env, category) {
  // Load Firebase knowledge in parallel
  const [knownChars, qaPatterns] = await Promise.all([
    getKnownCharacters(env),
    getQAPatterns(env),
  ]);

  const systemPrompt = buildSystemPrompt(category, knownChars, qaPatterns);

  // Category-aware first question suggestions
  let categoryContext, firstQuestionHint;
  switch (category) {
    case 'characters':
      categoryContext = 'a character or person (real or fictional)';
      firstQuestionHint = 'Good first question: "Is this person/character real (not fictional)?"';
      break;
    case 'animals':
      categoryContext = 'an animal or creature';
      firstQuestionHint = 'Good first question: "Is it a real animal (not mythical or fictional)?"';
      break;
    case 'objects':
      categoryContext = 'an object or thing';
      firstQuestionHint = 'Good first question: "Is it electronic or uses electricity?"';
      break;
    default:
      categoryContext = 'something — it could be a character, person, animal, or object';
      firstQuestionHint = 'Good first question: "Is it a living thing (person, animal, creature)?"';
      break;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `I'm thinking of ${categoryContext}. Start guessing!

${firstQuestionHint}

IMPORTANT: You already KNOW the category is "${category}". Do NOT waste a question asking what category it is. Ask something that NARROWS DOWN within that category.

Respond with ONLY JSON: {"question": "your question", "confidence": 0, "topGuesses": []}`,
    },
  ];

  const result = await callCerebras(env, messages, 0.3);
  const parsed = parseJSON(result.content);

  return {
    question: parsed.question || "Is your character a real person (not fictional)?",
    confidence: parsed.confidence || 0,
    topGuesses: parsed.topGuesses || [],
    questionNumber: 1,
    history: [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: JSON.stringify({ question: parsed.question || "Is your character a real person (not fictional)?", confidence: 0, topGuesses: [] }) },
    ],
    model: result.model,
  };
}

// ============================================================
// PROCESS ANSWER -> NEXT QUESTION
// This is completely rewritten for strict constraint tracking
// ============================================================

export async function handleAIQuestion(env, body) {
  const { history, answer, questionNumber } = body;

  // Add this answer to history
  const updatedHistory = [
    ...history,
    { role: 'user', content: `Answer: ${answer}` },
  ];

  // Build structured constraints from ALL Q&A so far
  const { facts } = buildConstraints(updatedHistory);

  // Create constraint summary — this is what forces the AI to stay logical
  const constraintBlock = facts.length > 0
    ? facts.map((f, i) => `  ${i + 1}. ${f}`).join('\n')
    : '  (no facts yet)';

  const userPrompt = `The player answered: "${answer}"

=========== WHAT WE KNOW FOR CERTAIN ===========
${constraintBlock}
=================================================

We are on question ${questionNumber} of 20.

THINK STEP BY STEP:

Step 1 - WHAT DO THE FACTS TELL US?
Look at every CONFIRMED and RULED OUT fact. What does it narrow us to?

Step 2 - LIST YOUR TOP 3-5 CANDIDATES
Name 3-5 SPECIFIC entities that fit ALL facts.

Step 3 - DECIDE: GUESS NOW OR KEEP ASKING?

ASK YOURSELF: "If I had to bet money right now, what would I guess?"
- If you have ONE strong answer that fits ALL facts → SET shouldGuess TO TRUE. Do it NOW. Don't keep asking just to be safe.
- If you have 2-3 candidates and can't tell them apart → ask ONE more question to split them
- If you truly have no idea → keep narrowing

IMPORTANT: You do NOT need to be 100% sure. If your top candidate fits every fact and you can't think of a better answer, GUESS IT. 
The player WANTS you to guess. Don't overthink it. Real Akinator guesses in 10-15 questions.

Examples of when you SHOULD guess (shouldGuess: true):
  - Facts say: electronic + screen + entertainment + channels → GUESS "Television" NOW
  - Facts say: fictional + anime + ninja + orange outfit → GUESS "Naruto" NOW  
  - Facts say: real person + musician + female + pop → GUESS "Taylor Swift" NOW
  - Facts say: animal + pet + furry + purrs → GUESS "Cat" NOW

Examples of when you should NOT guess yet:
  - Only 2-3 facts established, too vague to pick anyone specific
  - You have 5+ equally likely candidates

NEVER guess a CATEGORY (like "musician", "animal", "superhero"). Always guess a SPECIFIC thing ("Taylor Swift", "Cat", "Batman", "Television").

Step 4 - IF NOT GUESSING, ASK YOUR NEXT QUESTION
Your question must:
  a) Be about TRAITS/FEATURES only — NEVER include entity names in your question
  b) SPLIT your candidates — true for some, false for others  
  c) Be SHORT (under 12 words)
  d) NEVER repeat a previous question

Respond with ONLY valid JSON:
{"question": "your next question", "confidence": <0-100>, "topGuesses": ["Name1", "Name2", "Name3"], "shouldGuess": <true or false>, "reasoning": "brief reasoning"}

REMEMBER: If your confidence is above 75% and you have a specific entity in mind, SET shouldGuess TO TRUE.`;

  const messages = [
    ...updatedHistory,
    { role: 'user', content: userPrompt },
  ];

  const result = await callCerebras(env, messages, 0.1);
  const parsed = parseJSON(result.content);

  // SANITIZE: Strip any character/entity names from the question
  if (parsed.question && parsed.topGuesses && parsed.topGuesses.length > 0) {
    let q = parsed.question;
    for (const guess of parsed.topGuesses) {
      if (guess && q.toLowerCase().includes(guess.toLowerCase())) {
        console.log(`[AI] CAUGHT: Question contained guess name "${guess}"`);
        const regex = new RegExp(guess.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        q = q.replace(regex, 'it').replace(/Is it it/gi, 'Is it').replace(/the it/gi, 'it');
        parsed.question = q;
      }
    }
  }
  if (parsed.question) {
    parsed.question = parsed.question
      .replace(/Is the \w+ you are thinking of/gi, 'Is it')
      .replace(/Is the \w+ you're thinking of/gi, 'Is it')
      .replace(/Is the .+ you are thinking of/gi, 'Is it')
      .replace(/Are you thinking of .+\?/gi, '')
      .trim();
    if (!parsed.question || parsed.question.length < 5) {
      parsed.question = 'Does it have any special or unique abilities?';
    }
  }

  // Build clean history
  const newHistory = [
    ...updatedHistory,
    { role: 'assistant', content: JSON.stringify(parsed) },
  ];

  const trimmedHistory = trimHistory(newHistory);

  // Category words — these are NOT valid guesses, only specific entities are
  const categoryWords = ['musician', 'athlete', 'actor', 'singer', 'rapper', 'celebrity', 
    'superhero', 'villain', 'animal', 'person', 'character', 'object', 'thing', 'creature',
    'female', 'male', 'human', 'robot', 'alien', 'monster', 'fictional', 'real',
    'politician', 'scientist', 'artist', 'writer', 'director', 'youtuber', 'streamer',
    'dog breed', 'cat breed', 'fish', 'bird', 'insect', 'reptile', 'mammal'];

  // Let the AI decide — but help it along
  let shouldGuess = !!parsed.shouldGuess;

  // If AI reports high confidence but forgot to set shouldGuess, nudge it
  if (!shouldGuess && parsed.confidence >= 80 && parsed.topGuesses && parsed.topGuesses[0]) {
    const topGuessLower = parsed.topGuesses[0].toLowerCase().trim();
    if (!categoryWords.includes(topGuessLower)) {
      console.log(`[AI] Confidence ${parsed.confidence}% but shouldGuess=false. Overriding — guess "${parsed.topGuesses[0]}"`);
      shouldGuess = true;
    }
  }

  // Safety: never guess if the AI's top guess is a category, not a specific entity
  if (shouldGuess && parsed.topGuesses && parsed.topGuesses[0]) {
    const topGuessLower = parsed.topGuesses[0].toLowerCase().trim();
    if (categoryWords.includes(topGuessLower)) {
      console.log(`[AI] BLOCKED: Tried to guess category "${parsed.topGuesses[0]}" — keep asking`);
      shouldGuess = false;
      parsed.confidence = Math.min(parsed.confidence, 30);
    }
  }

  // Hard floor: never before question 5 (need some baseline info)
  if (questionNumber < 5) {
    shouldGuess = false;
  }

  // Hard ceiling: must guess at question 20
  if (questionNumber >= 20) {
    shouldGuess = true;
  }

  return {
    question: parsed.question,
    confidence: parsed.confidence || 0,
    topGuesses: parsed.topGuesses || [],
    questionNumber: questionNumber + 1,
    shouldGuess,
    history: trimmedHistory,
    model: result.model,
  };
}

// ============================================================
// FINAL GUESS - with double-check against all facts
// ============================================================

export async function handleAIGuess(env, body) {
  const { history, questionNumber } = body;

  const { facts } = buildConstraints(history);
  const constraintBlock = facts.map((f, i) => `  ${i + 1}. ${f}`).join('\n');

  const messages = [
    ...history,
    {
      role: 'user',
      content: `FINAL GUESS TIME!

=========== ALL ESTABLISHED FACTS ===========
${constraintBlock}
==============================================

MANDATORY VERIFICATION PROCESS:
1. Pick your #1 guess
2. Go through EVERY fact above and check: does your guess match?
   - "Real person = YES" — is your guess a real person? If not, CHANGE YOUR GUESS
   - "Technology = YES" — is your guess related to technology? If not, CHANGE YOUR GUESS
   - "Fictional = YES" — is your guess fictional? If not, CHANGE YOUR GUESS
   - "Has wings = YES" — does your guess have wings? If not, CHANGE YOUR GUESS
   - "Has a horn = YES" — does your guess have a horn? If not, CHANGE YOUR GUESS
   - Do this for EVERY. SINGLE. FACT.
3. CHECK FOR COMMONLY CONFUSED ENTITIES:
   - Unicorn (has horn, no wings) vs Pegasus (has wings, no horn)
   - Minotaur (bull head) vs Centaur (horse body)
   - Dragon (breathes fire) vs Griffin (lion-eagle hybrid)
   - Fidget Spinner is NOT electronic, does NOT need batteries, does NOT have a screen
   - Remote Control IS electronic, DOES need batteries
   - Make sure you picked the RIGHT one based on the facts!
4. DOUBLE CHECK: Go through the facts list ONE MORE TIME.
   For each CONFIRMED fact, say to yourself: "Is [my guess] [this fact]? YES or NO?"
   If ANY answer is NO, your guess is WRONG. Pick a different guess.
5. If your guess survives all checks, that's your answer
6. If not, try your #2 guess with the same process

GUESS NAMING RULES:
- Use the SIMPLEST common name everyone would recognize
- GOOD: "Cat", "Dog", "Remote Control", "Pikachu", "Batman", "Elon Musk"
- BAD: "Domestic Cat", "Domesticated Dog", "Television Remote Control", "Pikachu (Pokemon)"
- If it's a common animal, just say the animal name: "Cat" not "Domestic Cat" or "Housecat"
- If it's a common object, use the everyday name: "Remote" or "TV Remote" not "Infrared Remote Control Device"
- Think: what would a normal person call this thing?

Respond with ONLY valid JSON (no markdown):
{"guess": "simple common name", "confidence": <0-100>, "description": "1-2 sentence description of who/what this is", "alternativeGuesses": ["name 1", "name 2", "name 3"]}`,
    },
  ];

  const result = await callCerebras(env, messages, 0.05);
  const parsed = parseJSON(result.content);

  // Post-process: simplify over-specific common names
  if (parsed.guess) {
    parsed.guess = simplifyGuessName(parsed.guess);
  }
  if (parsed.alternativeGuesses) {
    parsed.alternativeGuesses = parsed.alternativeGuesses.map(g => simplifyGuessName(g));
  }

  // HARD CONSTRAINT CHECK: Verify the guess doesn't violate established facts
  const guessLower = (parsed.guess || '').toLowerCase();
  const violatesConstraints = checkGuessViolation(guessLower, facts);
  if (violatesConstraints) {
    console.log(`[AI] VIOLATION: Guess "${parsed.guess}" violates facts. Promoting alternatives.`);
    // Try to find a non-violating alternative
    if (parsed.alternativeGuesses && parsed.alternativeGuesses.length > 0) {
      for (const alt of parsed.alternativeGuesses) {
        if (!checkGuessViolation(alt.toLowerCase(), facts)) {
          parsed.alternativeGuesses = [parsed.guess, ...parsed.alternativeGuesses.filter(a => a !== alt)];
          parsed.guess = alt;
          parsed.confidence = Math.min(parsed.confidence, 60);
          break;
        }
      }
    }
  }

  return {
    guess: parsed.guess || 'Unknown',
    confidence: parsed.confidence || 50,
    description: parsed.description || '',
    alternativeGuesses: parsed.alternativeGuesses || [],
    questionNumber,
    model: result.model,
  };
}

// ============================================================
// SYSTEM PROMPT - with Firebase knowledge
// ============================================================

function buildSystemPrompt(category, knownChars = [], qaPatterns = []) {
  let learnedKnowledge = '';

  if (knownChars.length > 0) {
    const charList = knownChars
      .filter(c => c && c.name)
      .slice(0, 80)
      .map(c => c.name)
      .join(', ');
    if (charList) {
      learnedKnowledge += `\n\nPOPULAR PICKS (players have chosen these before): ${charList}`;
    }
  }

  if (qaPatterns.length > 0) {
    const examples = qaPatterns
      .filter(p => p && p.character && p.patterns && p.patterns.length > 0)
      .slice(0, 20)
      .map(p => {
        const lastGame = p.patterns[p.patterns.length - 1];
        if (!lastGame || !lastGame.questions) return null;
        const qaPairs = lastGame.questions
          .map((q, i) => `${q} -> ${lastGame.answers?.[i] || '?'}`)
          .slice(0, 5)
          .join('; ');
        return `${p.character}: ${qaPairs}`;
      })
      .filter(Boolean)
      .join('\n    ');

    if (examples) {
      learnedKnowledge += `\n\nLEARNED FROM PAST GAMES (use this knowledge!):\n    ${examples}`;
    }
  }

  return `You are AKANATOR, the world's best guessing AI. You guess what someone is thinking of by asking strategic yes/no questions.

GUESSING: ${category === 'any' ? 'Anything — characters, people, animals, objects' : category}

=== ABSOLUTE RULE #1: NEVER NAME YOUR GUESS IN A QUESTION ===
You are playing a GUESSING GAME. You must NEVER reveal what you think the answer is until the FINAL GUESS.
Your questions must be GENERIC and about TRAITS, not about a specific entity.

  FORBIDDEN (never do this):
    - "Is the Unicorn you are thinking of from European folklore?" ❌
    - "Is the character you're thinking of Pikachu?" ❌
    - "Are you thinking of Batman?" ❌
    - "Is it SpongeBob SquarePants?" ❌
    - Any question that contains a character/person/entity name ❌

  CORRECT (always do this):
    - "Does it have a horn on its head?" ✅
    - "Is it a yellow creature?" ✅
    - "Does this character wear a cape?" ✅
    - "Does it live underwater?" ✅
    - "Is this person a musician?" ✅
    - Questions about TRAITS, FEATURES, PROPERTIES only ✅

If you mention a specific name in your question, YOU LOSE. Never do it.

=== HOW YOU THINK ===
You use CONSTRAINT ELIMINATION. Each answer adds a constraint. You must NEVER violate a constraint.

CORRECT EXAMPLE:
  Q: "Is this a real person?" -> YES (constraint: must be real)
  Q: "Is this person involved in technology?" -> YES (constraint: must be tech-related)
  Q: "Is this person alive today?" -> YES (constraint: must be living)
  Q: "Is this person male?" -> YES (constraint: must be male)
  >> VALID guesses: Elon Musk, Mark Zuckerberg, Tim Cook, Jensen Huang
  >> INVALID guesses: Steve Jobs (dead), Mario (fictional), Taylor Swift (not tech), Fidget Spinner (not a person)

WRONG EXAMPLE (NEVER DO THIS):
  Q: "Is it related to technology?" -> YES
  Q: "Is it an object?" -> NO  
  >> Then guessing "iPhone" is WRONG because iPhone is an object and objects were ruled out!

=== QUESTION QUALITY RULES ===
1. Questions must be SHORT (under 15 words)
2. Questions must be YES/NO answerable
3. Questions must be about GENERIC TRAITS (not specific entities)
4. Questions must ELIMINATE candidates, not confirm what you already know
5. Never ask redundant questions ("Is it popular?" "Is it well-known?")
6. Never ask confirmation questions about facts already established

GOOD QUESTION EXAMPLES:
  - "Is it a living creature?"
  - "Is it from a movie or TV show?"
  - "Does it have four legs?"
  - "Does it have any supernatural powers?"
  - "Is it from Greek mythology?"
  - "Can it fly?"
  - "Does it have a horn?"
  - "Is it usually depicted as white?"
  - "Is this person under 40 years old?"
  - "Did this character first appear before the year 2000?"

=== KNOWLEDGE DATABASE ===
Real People: Elon Musk, Taylor Swift, Cristiano Ronaldo, MrBeast, LeBron James, Dwayne Johnson, Lionel Messi, Donald Trump, Joe Biden, Beyonce, Drake, Eminem, Kanye West, Oprah, Bill Gates, Jeff Bezos, Mark Zuckerberg, Einstein, Napoleon, Cleopatra, Ariana Grande, BTS, Billie Eilish, PewDiePie, xQc, Kai Cenat, IShowSpeed, and more
Fictional: Goku, Naruto, Luffy, SpongeBob, Mickey Mouse, Mario, Link, Sonic, Pikachu, Harry Potter, Batman, Spider-Man, Iron Man, Superman, Shrek, Homer Simpson, Elsa, Darth Vader, Thanos, Joker, Deadpool, Ash Ketchum, Vegeta, Sasuke, Eren Jaeger, Gojo, Sukuna, Tanjiro, Deku, Saitama, and more
Animals: Dog, Cat, Lion, Eagle, Shark, Elephant, Panda, Wolf, Tiger, Dolphin, etc.
Objects: iPhone, Computer, Car, Guitar, Television, Internet, Bitcoin, etc.

=== COMMONLY CONFUSED PAIRS (always ask distinguishing questions!) ===
Unicorn vs Pegasus: Unicorn has horn + no wings; Pegasus has wings + no horn
Dragon vs Griffin: Dragon breathes fire + reptile; Griffin is lion+eagle hybrid
MiNotaur vs Centaur: Minotaur = bull head + man body; Centaur = man torso + horse body
Phoenix vs Thunderbird: Phoenix = fire rebirth; Thunderbird = storm/lightning
Zeus vs Thor: Zeus = Greek; Thor = Norse
Goku vs Naruto: Goku = Saiyan/Dragon Ball; Naruto = ninja/Hidden Leaf
Batman vs Iron Man: Batman has no powers; Iron Man has tech suit
Elsa vs Elsa (Frozen vs other): Frozen Elsa has ice powers, is a queen
Sonic vs Flash: Sonic = hedgehog/game; Flash = human/DC Comics
Lion vs Tiger: Lion has mane + pride; Tiger has stripes + solitary
Dog vs Wolf: Dog = domesticated; Wolf = wild
Horse vs Zebra: Horse = solid color; Zebra = stripes
${learnedKnowledge}

=== RESPONSE FORMAT ===
Always respond in pure JSON. No markdown. No backticks. No explanation outside JSON.`;
}

// ============================================================
// Guess name simplification — "Domestic Cat" -> "Cat"
// ============================================================

const NAME_SIMPLIFICATIONS = {
  'domestic cat': 'Cat',
  'domesticated cat': 'Cat',
  'house cat': 'Cat',
  'housecat': 'Cat',
  'feline': 'Cat',
  'felis catus': 'Cat',
  'domestic dog': 'Dog',
  'domesticated dog': 'Dog',
  'canis familiaris': 'Dog',
  'canis lupus familiaris': 'Dog',
  'television remote control': 'Remote Control',
  'tv remote control': 'Remote Control',
  'remote control device': 'Remote Control',
  'infrared remote control': 'Remote Control',
  'television remote': 'TV Remote',
  'fidget spinner toy': 'Fidget Spinner',
  'personal computer': 'Computer',
  'desktop computer': 'Computer',
  'laptop computer': 'Laptop',
  'mobile phone': 'Phone',
  'cell phone': 'Phone',
  'cellular phone': 'Phone',
  'smartphone': 'Phone',
  'electric guitar': 'Guitar',
  'acoustic guitar': 'Guitar',
  'motor vehicle': 'Car',
  'automobile': 'Car',
  'domestic rabbit': 'Rabbit',
  'goldfish (carassius auratus)': 'Goldfish',
};

function simplifyGuessName(name) {
  if (!name) return name;
  const lower = name.toLowerCase().trim();
  if (NAME_SIMPLIFICATIONS[lower]) {
    return NAME_SIMPLIFICATIONS[lower];
  }
  // Remove parenthetical qualifiers: "Cat (domestic)" -> "Cat"
  const cleaned = name.replace(/\s*\([^)]*\)\s*/g, '').trim();
  // Remove leading "A " or "The "
  return cleaned.replace(/^(A |An |The )/i, '').trim();
}

// ============================================================
// Hard constraint violation check
// ============================================================

function checkGuessViolation(guessLower, facts) {
  // Known properties of common wrong guesses
  const ENTITY_PROPERTIES = {
    'fidget spinner': { electronic: false, needsBatteries: false, hasScreen: false, isAnimal: false, isPerson: false },
    'remote control': { electronic: true, needsBatteries: true, hasScreen: false, isAnimal: false, isPerson: false },
    'tv remote': { electronic: true, needsBatteries: true, hasScreen: false, isAnimal: false, isPerson: false },
    'phone': { electronic: true, needsBatteries: true, hasScreen: true, isAnimal: false, isPerson: false },
    'computer': { electronic: true, needsBatteries: false, hasScreen: true, isAnimal: false, isPerson: false },
    'cat': { electronic: false, needsBatteries: false, hasScreen: false, isAnimal: true, isPerson: false },
    'dog': { electronic: false, needsBatteries: false, hasScreen: false, isAnimal: true, isPerson: false },
  };

  const props = ENTITY_PROPERTIES[guessLower];
  if (!props) return false; // Can't check, allow it

  for (const fact of facts) {
    const f = fact.toLowerCase();
    // Check electronic constraint
    if (f.includes('electronic') && f.includes('= yes') && !props.electronic) return true;
    if (f.includes('electronic') && f.includes('= no') && props.electronic) return true;
    // Check batteries 
    if ((f.includes('batteries') || f.includes('battery')) && f.includes('= yes') && !props.needsBatteries) return true;
    if ((f.includes('batteries') || f.includes('battery')) && f.includes('= no') && props.needsBatteries) return true;
    // Check screen
    if (f.includes('screen') && f.includes('= yes') && !props.hasScreen) return true;
    if (f.includes('screen') && f.includes('= no') && props.hasScreen) return true;
    // Check animal
    if (f.includes('animal') && f.includes('= yes') && !props.isAnimal) return true;
    if (f.includes('animal') && f.includes('= no') && props.isAnimal) return true;
    // Check person
    if (f.includes('person') && f.includes('= yes') && !props.isPerson) return true;
    if (f.includes('person') && f.includes('= no') && props.isPerson) return true;
  }
  return false;
}

// ============================================================
// JSON parsing helper — handles common LLM output issues
// ============================================================

function parseJSON(text) {
  let cleaned = text.trim();

  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        try {
          const fixed = jsonMatch[0]
            .replace(/'/g, '"')
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .replace(/\n/g, ' ');
          return JSON.parse(fixed);
        } catch {
          return { question: text.substring(0, 200), confidence: 0, topGuesses: [] };
        }
      }
    }
    return { question: text.substring(0, 200), confidence: 0, topGuesses: [] };
  }
}

function trimHistory(history) {
  if (history.length <= 42) return history;
  const system = history[0];
  const recent = history.slice(-40);
  return [system, ...recent];
}
