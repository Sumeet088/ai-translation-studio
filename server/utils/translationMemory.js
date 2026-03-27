// In-memory storage
let memory = [];

// Add translation
const addToMemory = (source, target) => {
  memory.push({ source, target });
};

// Get all translations
const getMemory = () => {
  return memory;
};

// Simple similarity function
const similarity = (a, b) => {
  a = a.toLowerCase();
  b = b.toLowerCase();

  const wordsA = a.split(" ");
  const wordsB = b.split(" ");

  let match = 0;

  wordsA.forEach((word) => {
    if (wordsB.includes(word)) match++;
  });

  return match / Math.max(wordsA.length, wordsB.length);
};

// Search memory
const searchMemory = (input) => {
  let bestMatch = null;
  let bestScore = 0;

  memory.forEach((item) => {
    const score = similarity(input, item.source);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  });

  return {
    match: bestMatch,
    score: bestScore,
  };
};

// ✅ EXPORT AFTER ALL DEFINITIONS
module.exports = {
  addToMemory,
  getMemory,
  searchMemory,
};