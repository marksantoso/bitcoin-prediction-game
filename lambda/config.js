// Game configuration for lambda functions
const GAME_CONFIG = {
  guessResolutionTime: 60000, // 5 seconds minimum before guess can be resolved
};

// API Version configuration
const API_CONFIG = {
  CURRENT_VERSION: 'v1',
  VERSIONS: {
    v1: {
      ACTIVE: true,
      DEPRECATED: false,
      SUNSET_DATE: null,
    }
  }
};

module.exports = {
  GAME_CONFIG,
  API_CONFIG
}; 