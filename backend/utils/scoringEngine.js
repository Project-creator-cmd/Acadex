/**
 * Scoring Engine
 * score = base_points × level_multiplier
 *
 * Base points:
 *   participation = 5
 *   certification = 10
 *   winner        = 15
 *   internship    = 20
 *   research      = 25
 *
 * Level multipliers:
 *   college       = ×1
 *   state         = ×1.2
 *   national      = ×1.5
 *   international = ×2
 */

const BASE_POINTS = {
  participation: 5,
  certification: 10,
  winner: 15,
  internship: 20,
  research: 25,
  // map other types to closest base
  hackathon: 15,
  workshop: 5,
  competition: 15,
  sports: 5,
  cultural: 5,
  patent: 25,
  conference: 10
};

const LEVEL_MULTIPLIERS = {
  college: 1,
  state: 1.2,
  national: 1.5,
  international: 2
};

const calculateScore = (type, level) => {
  const base = BASE_POINTS[type] ?? 5;
  const multiplier = LEVEL_MULTIPLIERS[level] ?? 1;
  return Math.round(base * multiplier);
};

module.exports = { calculateScore, BASE_POINTS, LEVEL_MULTIPLIERS };
