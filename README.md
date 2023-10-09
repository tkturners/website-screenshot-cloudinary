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
| upload | boolean | | false | If `true`, returns the uploaded URL. Otherwise, returns a buffer. |# website-screenshot-cloudinary
