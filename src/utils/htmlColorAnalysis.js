const puppeteer = require('puppeteer');

/**
 * Analyze website HTML/CSS to extract actual design colors
 * @param {string} url - Website URL to analyze
 * @returns {Promise<Object>} Extracted color theme from HTML analysis
 */
async function analyzeWebsiteColors(url) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't work in Windows
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extract colors from various UI elements
    const colorAnalysis = await page.evaluate(() => {
      // Helper function to convert any color format to hex
      const toHex = (color) => {
        if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return null;
        
        // If already hex, return as is
        if (color.startsWith('#')) return color;
        
        // Convert rgb/rgba to hex
        const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1]);
          const g = parseInt(rgbMatch[2]);
          const b = parseInt(rgbMatch[3]);
          const alpha = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
          
          // Skip transparent colors
          if (alpha < 0.1) return null;
          
          return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
          }).join('');
        }
        
        return null;
      };
      
      // Helper to check if color is light or dark
      const isLight = (hex) => {
        if (!hex) return false;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5;
      };
      
      const results = {
        buttons: [],
        headers: [],
        navigation: [],
        links: [],
        backgrounds: [],
        cssVariables: {},
        logos: [],
        fonts: {
          headingFonts: [],
          bodyFonts: [],
          fontLinks: []
        }
      };
      
      // 1. Extract CSS custom properties (highest priority)
      const rootStyles = getComputedStyle(document.documentElement);
      const cssVarPattern = /^--/;
      for (let i = 0; i < rootStyles.length; i++) {
        const property = rootStyles[i];
        if (cssVarPattern.test(property) && property.includes('color')) {
          const value = rootStyles.getPropertyValue(property).trim();
          const hex = toHex(value);
          if (hex) {
            results.cssVariables[property] = hex;
          }
        }
      }
      
      // 2. Analyze buttons (primary source for accent colors)
      const buttonSelectors = [
        'button', '.btn', '.button', '[role="button"]',
        '.btn-primary', '.primary-btn', '.cta', '.call-to-action',
        'input[type="submit"]', 'input[type="button"]'
      ];
      
      buttonSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
          if (index < 10) { // Limit to first 10 buttons
            const styles = getComputedStyle(el);
            const bgColor = toHex(styles.backgroundColor);
            const textColor = toHex(styles.color);
            const borderColor = toHex(styles.borderColor);
            
            if (bgColor || textColor || borderColor) {
              results.buttons.push({
                selector,
                backgroundColor: bgColor,
                color: textColor,
                borderColor: borderColor,
                className: el.className,
                text: el.textContent?.trim().substring(0, 50)
              });
            }
          }
        });
      });
      
      // 3. Analyze headers and navigation (brand colors)
      const headerSelectors = [
        'header', 'nav', '.navbar', '.navigation', '.header',
        '.site-header', '.main-nav', '.top-bar'
      ];
      
      headerSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const styles = getComputedStyle(el);
          const bgColor = toHex(styles.backgroundColor);
          const textColor = toHex(styles.color);
          
          if (bgColor || textColor) {
            results.navigation.push({
              selector,
              backgroundColor: bgColor,
              color: textColor
            });
          }
        });
      });
      
      // 4. Analyze headings
      ['h1', 'h2', 'h3'].forEach(tag => {
        const elements = document.querySelectorAll(tag);
        elements.forEach((el, index) => {
          if (index < 5) { // First 5 headings
            const styles = getComputedStyle(el);
            const textColor = toHex(styles.color);
            
            if (textColor) {
              results.headers.push({
                tag,
                color: textColor,
                text: el.textContent?.trim().substring(0, 30)
              });
            }
          }
        });
      });
      
      // 5. Analyze links
      const links = document.querySelectorAll('a');
      const linkColors = new Set();
      for (let i = 0; i < Math.min(links.length, 20); i++) {
        const styles = getComputedStyle(links[i]);
        const color = toHex(styles.color);
        if (color) linkColors.add(color);
      }
      results.links = Array.from(linkColors);
      
      // 6. Extract logo URLs with smart filtering
      const findLogos = () => {
        const potentialLogos = [];
        
        // Strategy 1: Look in header/navigation areas first (most likely to contain logos)
        const headerAreas = document.querySelectorAll('header, nav, .navbar, .header, .site-header, .top-bar');
        headerAreas.forEach(area => {
          // Find images in header areas
          const headerImages = area.querySelectorAll('img');
          headerImages.forEach(img => {
            const rect = img.getBoundingClientRect();
            // Filter by size (logos are usually not tiny icons or huge banners)
            if (rect.width >= 80 && rect.width <= 400 && rect.height >= 20 && rect.height <= 200) {
              potentialLogos.push({
                element: img,
                score: 90, // High score for header images with good dimensions
                reason: 'header-image-good-size',
                src: img.src,
                alt: img.alt,
                width: rect.width,
                height: rect.height,
                position: 'header'
              });
            }
          });
          
          // Find SVGs in header areas
          const headerSvgs = area.querySelectorAll('svg');
          headerSvgs.forEach(svg => {
            const rect = svg.getBoundingClientRect();
            if (rect.width >= 80 && rect.width <= 400 && rect.height >= 20 && rect.height <= 200) {
              potentialLogos.push({
                element: svg,
                score: 85,
                reason: 'header-svg-good-size',
                type: 'svg',
                viewBox: svg.getAttribute('viewBox'),
                innerHTML: svg.outerHTML.substring(0, 300),
                width: rect.width,
                height: rect.height,
                position: 'header'
              });
            }
          });
        });
        
        // Strategy 2: Look for explicit logo classes/attributes
        const explicitLogoSelectors = [
          'img[alt*="logo" i]', 'img[class*="logo" i]', 'img[id*="logo" i]',
          '.logo img', '.brand img', '.site-logo img', '.company-logo img',
          'svg[class*="logo" i]', 'svg[id*="logo" i]', '.logo svg', '.brand svg'
        ];
        
        explicitLogoSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width >= 60 && rect.width <= 500) { // More lenient for explicit logos
              let logoData = {
                element: el,
                score: 80,
                reason: 'explicit-logo-selector',
                position: 'explicit'
              };
              
              if (el.tagName === 'IMG') {
                logoData.src = el.src;
                logoData.alt = el.alt;
                logoData.width = rect.width;
                logoData.height = rect.height;
              } else if (el.tagName === 'SVG') {
                logoData.type = 'svg';
                logoData.viewBox = el.getAttribute('viewBox');
                logoData.innerHTML = el.outerHTML.substring(0, 300);
                logoData.width = rect.width;
                logoData.height = rect.height;
              }
              
              potentialLogos.push(logoData);
            }
          });
        });
        
        // Strategy 3: Look for images with logo-like characteristics
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
          const rect = img.getBoundingClientRect();
          const src = img.src.toLowerCase();
          const alt = (img.alt || '').toLowerCase();
          
          // Check if it's likely a logo based on filename or alt text
          const logoKeywords = ['logo', 'brand', 'company', 'site'];
          const hasLogoKeyword = logoKeywords.some(keyword => 
            src.includes(keyword) || alt.includes(keyword)
          );
          
          // Check if it's in a good position (top 30% of page)
          const isInTopArea = rect.top <= window.innerHeight * 0.3;
          
          // Good logo dimensions and characteristics
          if (hasLogoKeyword && isInTopArea && 
              rect.width >= 80 && rect.width <= 350 && 
              rect.height >= 25 && rect.height <= 150) {
            potentialLogos.push({
              element: img,
              score: 70,
              reason: 'logo-characteristics',
              src: img.src,
              alt: img.alt,
              width: rect.width,
              height: rect.height,
              position: 'top-area'
            });
          }
        });
        
        // Remove duplicates and sort by score
        const uniqueLogos = potentialLogos.filter((logo, index, arr) => 
          arr.findIndex(l => l.src === logo.src || l.innerHTML === logo.innerHTML) === index
        );
        
        return uniqueLogos.sort((a, b) => b.score - a.score).slice(0, 3); // Top 3 candidates
      };
      
      results.logos = findLogos();
      
      // 7. Extract font information
      // Get font links from head
      const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"], link[href*="typekit.net"], link[href*="fonts.adobe.com"]');
      fontLinks.forEach(link => {
        results.fonts.fontLinks.push({
          href: link.href,
          type: 'external'
        });
      });
      
      // Extract only 2 fonts: heading font and body font
      const extractTwoFonts = () => {
        let headingFont = null;
        let bodyFont = null;
        
        // Get heading font (try H1 first, then H2, then H3)
        const headingTags = ['h1', 'h2', 'h3'];
        for (const tag of headingTags) {
          const heading = document.querySelector(tag);
          if (heading) {
            const styles = getComputedStyle(heading);
            const fontFamily = styles.fontFamily;
            
            if (fontFamily) {
              headingFont = {
                fontFamily: fontFamily.replace(/['"]/g, ''), // Remove quotes
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
                source: tag
              };
              break; // Stop after finding first heading font
            }
          }
        }
        
        // Get body font
        const bodyElement = document.querySelector('p') || document.querySelector('body');
        if (bodyElement) {
          const styles = getComputedStyle(bodyElement);
          const fontFamily = styles.fontFamily;
          
          if (fontFamily) {
            bodyFont = {
              fontFamily: fontFamily.replace(/['"]/g, ''),
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              source: bodyElement.tagName.toLowerCase()
            };
          }
        }
        
        return { headingFont, bodyFont };
      };
      
      const extractedFonts = extractTwoFonts();
      results.fonts.headingFont = extractedFonts.headingFont;
      results.fonts.bodyFont = extractedFonts.bodyFont;
      
      // 8. Analyze main backgrounds
      const bgSelectors = ['body', 'main', '.main', '.container', '.wrapper'];
      bgSelectors.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) {
          const styles = getComputedStyle(el);
          const bgColor = toHex(styles.backgroundColor);
          if (bgColor) {
            results.backgrounds.push({
              selector,
              backgroundColor: bgColor
            });
          }
        }
      });
      
      return results;
    });
    
    // Process and prioritize the extracted colors
    const theme = generateThemeFromAnalysis(colorAnalysis);
    
    return {
      success: true,
      theme,
      rawAnalysis: colorAnalysis,
      extractedAt: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate UI theme from color analysis data
 * @param {Object} analysis - Raw color analysis data
 * @returns {Object} Processed theme colors
 */
function generateThemeFromAnalysis(analysis) {
  // Helper functions
  const isLight = (hex) => {
    if (!hex) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };
  
  const getContrastColor = (hex) => isLight(hex) ? '#000000' : '#ffffff';
  
  // 1. Find accent color (prioritize buttons with background colors)
  let accentColor = '#007bff'; // fallback
  
  // Check CSS variables first
  const primaryVars = Object.entries(analysis.cssVariables).find(([key]) => 
    key.includes('primary') || key.includes('accent') || key.includes('brand')
  );
  if (primaryVars) {
    accentColor = primaryVars[1];
  } else {
    // Look for button background colors
    const buttonWithBg = analysis.buttons.find(btn => 
      btn.backgroundColor && !isLight(btn.backgroundColor)
    );
    if (buttonWithBg) {
      accentColor = buttonWithBg.backgroundColor;
    }
  }
  
  // 2. Find background color
  let backgroundColor = '#ffffff'; // fallback
  const bodyBg = analysis.backgrounds.find(bg => bg.selector === 'body');
  if (bodyBg && bodyBg.backgroundColor) {
    backgroundColor = bodyBg.backgroundColor;
  }
  
  // 3. Find text colors
  let headlineColor = '#212529'; // fallback
  let textColor = '#343a40'; // fallback
  
  if (analysis.headers.length > 0) {
    headlineColor = analysis.headers[0].color;
  }
  
  // Use a slightly lighter color for body text
  if (analysis.headers.length > 1) {
    textColor = analysis.headers[1].color;
  } else if (analysis.links.length > 0) {
    textColor = analysis.links[0];
  }
  
  // 4. Generate card colors (slightly different from main background)
  const cardBackgroundColor = isLight(backgroundColor) ? 
    adjustBrightness(backgroundColor, -0.05) : 
    adjustBrightness(backgroundColor, 0.05);
  
  // 5. Extract font information (simplified)
  let primaryFont = 'Inter, system-ui, -apple-system, sans-serif'; // fallback
  let headingFont = primaryFont;
  
  // Use extracted heading font
  if (analysis.fonts.headingFont) {
    headingFont = analysis.fonts.headingFont.fontFamily;
  }
  
  // Use extracted body font
  if (analysis.fonts.bodyFont) {
    primaryFont = analysis.fonts.bodyFont.fontFamily;
  }
  
  // 6. Extract logo information
  const logoInfo = {
    logos: analysis.logos,
    primaryLogo: analysis.logos.length > 0 ? analysis.logos[0] : null
  };
  
  // Extract font links for your implementation
  const fontLink = analysis.fonts.fontLinks.length > 0 ? analysis.fonts.fontLinks[0].href : null;
  
  return {
    // Colors (matching your usage)
    accentColor,
    headlineColor,
    textColor,
    backgroundColor,
    cardBackgroundColor,
    cardIconColor: accentColor,
    cardTextColor: textColor,
    accentColorContrast: getContrastColor(accentColor),
    
    // Fonts (matching your exact usage)
    fontFamily: primaryFont,           // Body text font
    fontLink: fontLink,               // Google Fonts link for body
    headingFontFamily: headingFont,   // Heading font (you use headlineFontFamily)
    headingFontLink: fontLink,        // Same font link for headings
    
    // Additional data
    defaultGradient: `linear-gradient(120deg, ${accentColor} 0%, ${adjustBrightness(accentColor, -0.2)} 100%)`,
    logoInfo,
    isCustom: true,
    colorMood: isLight(backgroundColor) ? 'light' : 'dark',
    confidence: calculateConfidence(analysis),
    
    // Raw analysis data for debugging
    extractedFonts: {
      headingFont: analysis.fonts.headingFont,
      bodyFont: analysis.fonts.bodyFont,
      fontLinks: analysis.fonts.fontLinks
    }
  };
}

/**
 * Adjust color brightness
 * @param {string} hex - Hex color
 * @param {number} factor - Brightness adjustment factor (-1 to 1)
 * @returns {string} Adjusted hex color
 */
function adjustBrightness(hex, factor) {
  if (!hex) return hex;
  
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  
  const adjust = (color) => {
    const adjusted = Math.round(color + (color * factor));
    return Math.min(255, Math.max(0, adjusted));
  };
  
  const newR = adjust(r);
  const newG = adjust(g);
  const newB = adjust(b);
  
  return '#' + [newR, newG, newB].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Calculate confidence score for the extracted theme
 * @param {Object} analysis - Raw analysis data
 * @returns {number} Confidence score (0-1)
 */
function calculateConfidence(analysis) {
  let score = 0;
  
  // CSS variables found (high confidence)
  if (Object.keys(analysis.cssVariables).length > 0) score += 0.4;
  
  // Buttons with background colors found
  if (analysis.buttons.some(btn => btn.backgroundColor)) score += 0.3;
  
  // Navigation colors found
  if (analysis.navigation.length > 0) score += 0.2;
  
  // Multiple consistent colors found
  if (analysis.headers.length > 2) score += 0.1;
  
  return Math.min(1, score);
}

module.exports = {
  analyzeWebsiteColors,
  generateThemeFromAnalysis
};
