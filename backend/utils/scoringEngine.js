const ScoringRule = require('../models/ScoringRule');

class ScoringEngine {
  async calculatePoints(achievement) {
    try {
      const rule = await ScoringRule.findOne({ 
        type: achievement.type,
        isActive: true 
      });

      if (!rule) {
        return this.getDefaultPoints(achievement);
      }

      let points = rule.basePoints;
      
      // Apply level multiplier
      const levelMultiplier = rule.levelMultipliers[achievement.level] || 1;
      points *= levelMultiplier;

      // Apply category bonus
      if (achievement.category === 'winner') {
        points *= 1.5;
      } else if (achievement.category === 'runner-up') {
        points *= 1.2;
      }

      return Math.round(points);
    } catch (error) {
      console.error('Error calculating points:', error);
      return this.getDefaultPoints(achievement);
    }
  }

  getDefaultPoints(achievement) {
    const defaultScores = {
      hackathon: { participation: 5, winner: 15, 'runner-up': 10 },
      workshop: { participation: 3, winner: 8, 'runner-up': 5 },
      internship: { participation: 20, winner: 20, 'runner-up': 20 },
      certification: { participation: 10, winner: 10, 'runner-up': 10 },
      competition: { participation: 5, winner: 15, 'runner-up': 10 },
      sports: { participation: 5, winner: 12, 'runner-up': 8 },
      cultural: { participation: 5, winner: 12, 'runner-up': 8 },
      research: { publication: 25, granted: 25 },
      patent: { granted: 30, publication: 20 },
      conference: { publication: 15, participation: 10 }
    };

    const typeScores = defaultScores[achievement.type] || { participation: 5, winner: 10 };
    let points = typeScores[achievement.category] || 5;

    // Level multiplier
    const levelMultipliers = {
      college: 1,
      state: 1.5,
      national: 2,
      international: 3
    };

    points *= (levelMultipliers[achievement.level] || 1);

    return Math.round(points);
  }

  async initializeDefaultRules() {
    const defaultRules = [
      {
        type: 'hackathon',
        category: 'technical',
        basePoints: 10,
        levelMultipliers: { college: 1, state: 1.5, national: 2, international: 3 }
      },
      {
        type: 'workshop',
        category: 'learning',
        basePoints: 5,
        levelMultipliers: { college: 1, state: 1.5, national: 2, international: 3 }
      },
      {
        type: 'internship',
        category: 'professional',
        basePoints: 20,
        levelMultipliers: { college: 1, state: 1, national: 1.5, international: 2 }
      },
      {
        type: 'certification',
        category: 'learning',
        basePoints: 10,
        levelMultipliers: { college: 1, state: 1.2, national: 1.5, international: 2 }
      },
      {
        type: 'competition',
        category: 'technical',
        basePoints: 8,
        levelMultipliers: { college: 1, state: 1.5, national: 2, international: 3 }
      },
      {
        type: 'research',
        category: 'academic',
        basePoints: 25,
        levelMultipliers: { college: 1, state: 1.5, national: 2, international: 3 }
      },
      {
        type: 'patent',
        category: 'innovation',
        basePoints: 30,
        levelMultipliers: { college: 1, state: 1.5, national: 2, international: 3 }
      }
    ];

    for (const rule of defaultRules) {
      await ScoringRule.findOneAndUpdate(
        { type: rule.type },
        rule,
        { upsert: true, new: true }
      );
    }
  }
}

module.exports = new ScoringEngine();
