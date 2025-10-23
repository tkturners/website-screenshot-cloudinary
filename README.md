https://tk-screenshot-ab6e22e69fb5.herokuapp.com/

# Effortless Website Screenshot API: Capture, Customize, and Upload to Cloudinary

**Description:**  
Easily capture website screenshots with our API package! Simply provide any website URL, and we'll generate a screenshot and return it as a buffer. Plus, we seamlessly upload the image to Cloudinary, giving you a direct URL for instant use.

**Key Features:**
- **Capture Screenshots:** Instantly create website screenshots from any URL.
- **Buffer Output:** Receive the screenshot as a convenient buffer.
- **Cloudinary Integration:** Effortlessly upload the screenshot to Cloudinary's powerful cloud storage.
- **Customization Options:** Tailor your screenshots with a variety of customization choices.
- **Streamlined Workflow:** Get direct access to the uploaded image URL for immediate utilization.

## 1. Setting up Cloudinary Environment Variables

Before you can use Cloudinary in your Node.js application, you need to set up the necessary environment variables. These variables include:

- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary account's cloud name.
- `CLOUDINARY_API_KEY`: Your Cloudinary API key.
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret.

## Documentation

| Option | Type | Values | Default | Description |
| --- | --- | --- | --- | --- |
| width | number | | 1280 | Page width |
| height | number | | 800 | Page height |
| type | string | 'png', 'jpeg', 'webp' | 'png' | Image type |
| quality | number | 0...1 | 1 | Image quality. Only for `{type: 'jpeg'}` and `{type: 'webp'}` |
| scaleFactor | number | | 2 | Scale the webpage `n` times |
| emulateDevice | string | Devices *(Use the `name` property)* | | Make it look like the screenshot was taken on the specified device. This overrides the `width`, `height`, `scaleFactor`, and `userAgent` options |
| fullPage | boolean | | false | Capture the full scrollable page, not just the viewport |
| defaultBackground | boolean | | true | Include the default white background. Disabling this lets you capture screenshots with transparency |
| timeout | number | seconds | 60 | The number of seconds before giving up trying to load the page. Specify `0` to disable the timeout |
| delay | number | seconds | 0 | The number of seconds to wait after the page finished loading before capturing the screenshot. This can be useful if you know the page has animations that you like it to finish before capturing the screenshot |
| waitForElement | string | | | Wait for a DOM element matching the given [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) to appear in the page and to be visible before capturing the screenshot. It times out after `options.timeout` seconds |
| element | string | | | Capture the DOM element matching the given [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors). It will wait for the element to appear in the page and to be visible. It times out after `options.timeout` seconds. Any actions performed as part of `options.beforeScreenshot` occur before this |
| hideElements | string[] | | | Hide DOM elements matching the given [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors). Can be useful for cleaning up the page. This sets [`visibility: hidden`](https://stackoverflow.com/a/133064/64949) on the matched elements |
| removeElements | string[] | | | Remove DOM elements matching the given [CSS selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors). This sets [`display: none`](https://stackoverflow.com/a/133064/64949) on the matched elements, so it could potentially break the website layout |
| clickElement | string | | | Click the DOM element matching the given [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) |
| scrollToElement | string or object | | | Scroll to the DOM element matching the given [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) |
| disableAnimations | boolean | | false | Disable CSS [animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation) and [transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/transition) |
| blockAds | boolean | | true | [Ad blocking.](https://github.com/ghostery/adblocker/blob/master/packages/adblocker-puppeteer/README.md) |
| isJavaScriptEnabled | boolean | | true | Whether JavaScript on the website should be executed. This does not affect the `scripts` and `modules` options |
| scripts | string[] | | | Same as the `modules` option, but instead injects the code as [`<script>` instead of `<script type="module">`](https://developers.google.com/web/fundamentals/primers/modules). Prefer the `modules` option whenever possible |
| styles | string[] | | | Inject CSS styles into the page. Accepts an array of inline code, absolute URLs, and local file paths (must have a `.css` extension) |
| headers | object | | {} | Set custom [HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers) |
| userAgent | string | | | Set a custom [user agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent) |
| cookies | Array<string or object> | | | Set cookies in [browser string format](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) or [object format](https://pptr.dev/api/puppeteer.page.setcookie) |
| authentication | object | | | Credentials for [HTTP authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication) |
| debug | boolean | | false | Show the browser window so you can see what it's doing, redirect page console output to the terminal, and slow down each Puppeteer operation. Note: This overrides `launchOptions` with `{headless: false, slowMo: 100}` |
| darkMode | boolean | | false | Emulate preference of dark color scheme ([`prefers-color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)) |
| launchOptions | object | | {} | Options passed to [`puppeteer.launch()`](https://pptr.dev/api/puppeteer.puppeteernodelaunchoptions). Note: Some of the launch options are overridden by the `debug` option |
| overwrite | boolean | | false | Overwrite the destination file if it exists instead of throwing an error. *This option applies only to `captureWebsite.file()`* |
| preloadFunction | string or Function | | undefined | Inject a function to be executed prior to navigation. This can be useful for altering the JavaScript environment. For example, you could define a global method on the `window`, overwrite `navigator.languages` to change the language presented by the browser, or mock `Math.random` to return a fixed value |
| clip | object | | | Define the screenshot's position and size (clipping region). The position can be specified through `x` and `y` coordinates which starts from the top-left. This can be useful when you only need a part of the page. You can also consider using `element` option when you have a [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors). Note that `clip` is mutually exclusive with the `element` and `fullPage` options. |
| upload | boolean | | false | If `true`, returns the uploaded URL. Otherwise, returns a buffer. |
| palette | boolean | | false | If `true`, includes color palette extraction in the response. |

## Color Palette Extraction

This API now supports color palette extraction from website screenshots. You can extract dominant colors from any website using two methods:

### 1. Combined Screenshot + Color Palette

Add `palette=true` to your existing screenshot request:

```
GET /?url=https://example.com&palette=true
```

**Response (without upload):**
```json
{
  "image": "base64_encoded_image_data",
  "colorPalette": {
    "success": true,
    "colors": {
      "Vibrant": "#ff5722",
      "DarkVibrant": "#d84315",
      "LightVibrant": "#ffab91",
      "Muted": "#8d6e63",
      "DarkMuted": "#5d4037",
      "LightMuted": "#bcaaa4"
    },
    "dominantColors": [
      {"name": "Vibrant", "hex": "#ff5722"},
      {"name": "DarkVibrant", "hex": "#d84315"}
    ]
  }
}
```

**Response (with upload=true):**
```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/...",
  "colorPalette": {
    "success": true,
    "colors": {
      "Vibrant": "#ff5722",
      "DarkVibrant": "#d84315",
      "LightVibrant": "#ffab91",
      "Muted": "#8d6e63",
      "DarkMuted": "#5d4037",
      "LightMuted": "#bcaaa4"
    },
    "dominantColors": [
      {"name": "Vibrant", "hex": "#ff5722"},
      {"name": "DarkVibrant", "hex": "#d84315"}
    ]
  }
}
```

### 2. Dedicated Color Palette Endpoint

For color palette extraction only:

```
GET /palette?url=https://example.com
```

**Simple Response:**
```json
{
  "success": true,
  "colors": {
    "Vibrant": "#ff5722",
    "DarkVibrant": "#d84315",
    "LightVibrant": "#ffab91",
    "Muted": "#8d6e63",
    "DarkMuted": "#5d4037",
    "LightMuted": "#bcaaa4"
  },
  "dominantColors": [
    {"name": "Vibrant", "hex": "#ff5722"},
    {"name": "DarkVibrant", "hex": "#d84315"}
  ]
}
```

**Detailed Response (with detailed=true):**
```
GET /palette?url=https://example.com&detailed=true
```

```json
{
  "success": true,
  "palette": {
    "Vibrant": {
      "hex": "#ff5722",
      "rgb": [255, 87, 34],
      "population": 1234,
      "hsl": [14, 100, 57]
    },
    "DarkVibrant": {
      "hex": "#d84315",
      "rgb": [216, 67, 21],
      "population": 987,
      "hsl": [14, 82, 46]
    }
  },
  "dominantColors": [
    {"name": "Vibrant", "hex": "#ff5722", "rgb": [255, 87, 34], "population": 1234},
    {"name": "DarkVibrant", "hex": "#d84315", "rgb": [216, 67, 21], "population": 987}
  ]
}
```

### Color Palette Parameters

| Parameter | Type | Values | Default | Description |
| --- | --- | --- | --- | --- |
| palette | boolean | true/false | false | Extract color palette from screenshot |
| detailed | boolean | true/false | false | Return detailed color information (RGB, HSL, population) |

### Color Types Extracted

- **Vibrant**: The most vibrant color in the image
- **DarkVibrant**: A vibrant color that is also dark
- **LightVibrant**: A vibrant color that is also light
- **Muted**: A muted color from the image
- **DarkMuted**: A muted color that is also dark
- **LightMuted**: A muted color that is also light

## UI Theme Generation

For precise UI theming, we provide a dedicated endpoint that generates a complete theme suitable for database storage and UI applications:

### 3. UI Theme Endpoint

```http
GET /theme?url=https://example.com
```

**Response:**
```json
{
  "success": true,
  "theme": {
    "accentColor": "#ff5722",
    "headlineColor": "#d84315",
    "textColor": "#d84315",
    "backgroundColor": "#ffab91",
    "cardBackgroundColor": "#f5a085",
    "cardIconColor": "#ff5722",
    "cardTextColor": "#5d4037",
    "accentColorContrast": "#ffffff",
    "defaultGradient": "linear-gradient(120deg, #ff5722 0%, #d84315 100%)",
    "fontFamily": "Inter, system-ui, -apple-system, sans-serif",
    "isCustom": true,
    "colorMood": "dark"
  },
  "originalPalette": {
    "Vibrant": {
      "hex": "#ff5722",
      "rgb": [255, 87, 34],
      "population": 1234,
      "hsl": [14, 100, 57]
    }
  },
  "dominantColors": [
    {"name": "Vibrant", "hex": "#ff5722", "rgb": [255, 87, 34], "population": 1234}
  ]
}
```

### Theme Properties Mapping

The `/theme` endpoint generates colors specifically designed for your database schema:

| Database Field | Description | Color Logic |
| --- | --- | --- |
| `accentColor` | Primary brand/accent color | Most vibrant color from the image |
| `headlineColor` | Main heading text color | Dark vibrant or dark muted for readability |
| `textColor` | Body text color | Dark color ensuring good contrast |
| `backgroundColor` | Main background color | Light muted or light vibrant color |
| `cardBackgroundColor` | Card/container background | Slightly darker than main background |
| `cardIconColor` | Icons within cards | Vibrant accent color |
| `cardTextColor` | Text within cards | Dark color for card readability |
| `accentColorContrast` | Text on accent color | White or black based on accent lightness |
| `defaultGradient` | CSS gradient string | Generated from vibrant colors |
| `fontFamily` | Recommended font stack | Modern web-safe fonts |
| `isCustom` | Boolean flag | Always `true` for generated themes |

### Color Precision Features

- **Contrast Optimization**: Automatically ensures sufficient contrast ratios
- **Accessibility**: Colors are tested for readability
- **UI Context**: Colors are selected based on their intended UI usage
- **Fallback Values**: Provides sensible defaults when extraction fails
- **Gradient Generation**: Creates harmonious gradients from extracted colors

## Smart HTML Analysis (Recommended)

For the most accurate color extraction, we now offer HTML/CSS analysis that reads the actual design intent rather than guessing from screenshots:

### 4. HTML Analysis Endpoint 🎯 **Most Accurate**

```http
GET /analyze?url=https://example.com
```

**What it analyzes:**
- **CSS Custom Properties** (`:root` variables) - Highest priority
- **Button Colors** (primary, secondary, CTA buttons)
- **Navigation/Header Colors** (brand colors)
- **Heading Colors** (typography hierarchy)
- **Link Colors** (interactive elements)
- **Background Colors** (main containers)
- **Logo URLs** (images, SVGs, background images)
- **Font Information** (Google Fonts links, computed font families)

**Response:**
```json
{
  "success": true,
  "theme": {
    "accentColor": "#007bff",
    "headlineColor": "#212529",
    "textColor": "#343a40",
    "backgroundColor": "#ffffff",
    "cardBackgroundColor": "#f8f9fa",
    "cardIconColor": "#007bff",
    "cardTextColor": "#495057",
    "accentColorContrast": "#ffffff",
    "defaultGradient": "linear-gradient(120deg, #007bff 0%, #0056b3 100%)",
    "fontFamily": "Open Sans, sans-serif",
    "fontLink": "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&display=swap",
    "headingFontFamily": "Montserrat, sans-serif", 
    "headingFontLink": "https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap",
    "logoInfo": {
      "logos": [
        {
          "selector": ".logo img",
          "element": "img",
          "src": "https://example.com/logo.png",
          "alt": "Company Logo",
          "width": 200,
          "height": 60
        }
      ],
      "primaryLogo": {
        "selector": ".logo img",
        "element": "img",
        "src": "https://example.com/logo.png",
        "alt": "Company Logo",
        "width": 200,
        "height": 60
      }
    },
    "isCustom": true,
    "colorMood": "light",
    "confidence": 0.9
  },
  "rawAnalysis": {
    "cssVariables": {
      "--primary-color": "#007bff",
      "--accent-color": "#28a745"
    },
    "buttons": [
      {
        "selector": ".btn-primary",
        "backgroundColor": "#007bff",
        "color": "#ffffff",
        "className": "btn btn-primary",
        "text": "Get Started"
      }
    ],
    "navigation": [
      {
        "selector": "nav",
        "backgroundColor": "#ffffff",
        "color": "#212529"
      }
    ],
    "headers": [
      {
        "tag": "h1",
        "color": "#212529",
        "text": "Welcome to Our Platform"
      }
    ]
  },
  "extractedAt": "2025-10-23T12:00:00.000Z"
}
```

### Why HTML Analysis is Better:

| Feature | Screenshot Analysis | HTML Analysis |
|---------|-------------------|---------------|
| **Accuracy** | Guesses from visual dominance | Reads actual design intent |
| **Button Colors** | May miss or misidentify | Targets actual button styles |
| **Brand Colors** | Often picks content colors | Finds navigation/header colors |
| **CSS Variables** | Cannot detect | Reads `:root` custom properties |
| **JavaScript Sites** | Limited to initial render | Handles dynamic content |
| **Confidence Score** | Not available | Provides reliability metric |

### Smart Targeting Strategy:

1. **CSS Variables** (90% confidence) - Direct design system colors
2. **Button Analysis** (80% confidence) - Primary action colors
3. **Navigation Colors** (70% confidence) - Brand identity colors
4. **Header Typography** (60% confidence) - Text hierarchy
5. **Fallback Logic** - Sensible defaults when extraction fails

## Integration Example

Perfect for direct integration with your styling functions:

```typescript
// Fetch theme data
const response = await fetch('/analyze?url=https://example.com');
const { theme } = await response.json();

// Direct usage - no transformation needed!
const { 
  fontFamily,           // Body text font
  fontLink,            // Google Fonts URL
  headlineColor,       // Heading color  
  textColor,           // Body text color
  accentColor,         // Brand/accent color
  cardTextColor,       // Card text color
  headingFontFamily,   // Heading font
  headingFontLink      // Heading font URL
} = theme;

// Ready for CSS injection
const textFontImport = `@import url('${fontLink}');`;
const headlineFontImport = `@import url('${headingFontLink}');`;
```

### Response Time
- **Average**: 5-15 seconds (depends on website complexity)
- **Includes**: Full Puppeteer analysis + color extraction + font detection
