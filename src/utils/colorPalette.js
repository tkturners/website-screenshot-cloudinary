const Vibrant = require('node-vibrant');

/**
 * Extract color palette from image buffer
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} Color palette with hex values and RGB values
 */
async function extractColorPalette(imageBuffer) {
  try {
    const palette = await Vibrant.from(imageBuffer).getPalette();
    
    const colorPalette = {};
    
    // Extract different color swatches
    for (const key of Object.keys(palette)) {
      if (palette[key]) {
        colorPalette[key] = {
          hex: palette[key].getHex(),
          rgb: palette[key].getRgb(),
          population: palette[key].getPopulation(),
          hsl: palette[key].getHsl()
        };
      }
    }
    
    return {
      success: true,
      palette: colorPalette,
      dominantColors: extractDominantColors(colorPalette)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Extract the most dominant colors from the palette
 * @param {Object} palette - Color palette object
 * @returns {Array} Array of dominant colors sorted by population
 */
function extractDominantColors(palette) {
  const colors = Object.entries(palette)
    .filter(([, color]) => color && color.population > 0)
    .map(([name, color]) => ({
      name,
      hex: color.hex,
      rgb: color.rgb,
      population: color.population
    }))
    .sort((a, b) => b.population - a.population);
    
  return colors;
}

/**
 * Get simplified color palette with just hex values
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} Simplified color palette
 */
async function getSimpleColorPalette(imageBuffer) {
  try {
    const result = await extractColorPalette(imageBuffer);
    
    if (!result.success) {
      return result;
    }
    
    const simplePalette = {};
    for (const key of Object.keys(result.palette)) {
      if (result.palette[key]) {
        simplePalette[key] = result.palette[key].hex;
      }
    }
    
    return {
      success: true,
      colors: simplePalette,
      dominantColors: result.dominantColors.map(color => ({
        name: color.name,
        hex: color.hex
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate UI theme colors from extracted palette
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} UI theme color palette
 */
async function generateUITheme(imageBuffer) {
  try {
    const result = await extractColorPalette(imageBuffer);
    
    if (!result.success) {
      return result;
    }
    
    const palette = result.palette;
    
    // Helper function to get luminance of a color
    const getLuminance = (rgb) => {
      const [r, g, b] = rgb.map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    // Helper function to check if color is light or dark
    const isLight = (rgb) => getLuminance(rgb) > 0.5;
    
    // Helper function to adjust color brightness
    const adjustBrightness = (rgb, factor) => {
      return rgb.map(c => Math.min(255, Math.max(0, Math.round(c * factor))));
    };
    
    // Helper function to convert RGB to hex
    const rgbToHex = (rgb) => {
      return '#' + rgb.map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
    };
    
    // Extract base colors
    const vibrant = palette.Vibrant;
    const darkVibrant = palette.DarkVibrant;
    const lightVibrant = palette.LightVibrant;
    const darkMuted = palette.DarkMuted;
    const lightMuted = palette.LightMuted;
    
    // Generate theme colors
    const theme = {
      // Primary accent color - use most vibrant color
      accentColor: vibrant?.hex || darkVibrant?.hex || '#007bff',
      
      // Headline color - use dark vibrant or dark muted for good readability
      headlineColor: darkVibrant?.hex || darkMuted?.hex || '#212529',
      
      // Text color - ensure good contrast
      textColor: (darkVibrant?.hex || darkMuted?.hex || '#343a40'),
      
      // Background color - use light color or white
      backgroundColor: lightMuted?.hex || lightVibrant?.hex || '#ffffff',
      
      // Card background - slightly different from main background
      cardBackgroundColor: lightMuted?.hex ? 
        rgbToHex(adjustBrightness(lightMuted.rgb, 0.95)) : 
        (lightVibrant?.hex ? rgbToHex(adjustBrightness(lightVibrant.rgb, 0.95)) : '#f8f9fa'),
      
      // Card icon color - use accent or vibrant color
      cardIconColor: vibrant?.hex || darkVibrant?.hex || '#007bff',
      
      // Card text color - ensure readability on card background
      cardTextColor: darkMuted?.hex || darkVibrant?.hex || '#495057',
      
      // Accent color contrast - white or dark based on accent color lightness
      accentColorContrast: vibrant && isLight(vibrant.rgb) ? '#000000' : '#ffffff',
      
      // Default gradient using extracted colors
      defaultGradient: vibrant && darkVibrant ? 
        `linear-gradient(120deg, ${vibrant.hex} 0%, ${darkVibrant.hex} 100%)` :
        'linear-gradient(120deg, rgb(35, 211, 211) 0%, rgb(30, 38, 109) 100%)',
      
      // Font family suggestion based on color mood
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      
      // Additional metadata
      isCustom: true,
      colorMood: vibrant ? (isLight(vibrant.rgb) ? 'light' : 'dark') : 'neutral'
    };
    
    return {
      success: true,
      theme,
      originalPalette: result.palette,
      dominantColors: result.dominantColors
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  extractColorPalette,
  getSimpleColorPalette,
  extractDominantColors,
  generateUITheme
};
