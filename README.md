# Market Shuffle Hub

A simple, dynamic landing page providing quick access to various stock exploration tools and a trading community Discord. Built with vanilla HTML, CSS, and JavaScript.

## ✨ Features

* **Quick Links:** Provides direct access to related web applications:
    * S&P 500 Stock Explorer
    * Mid Cap Stock Explorer
    * Stock Wordle game
* **Community Link:** Easy access to join a related Discord trading community.
* **Live Stock Ticker:** Displays scrolling real-time price data for selected major stocks/indices (powered by the FMP API). *Requires API Key setup for full functionality.*
* **Theme Toggle:** Switch between Light and Dark modes for comfortable viewing. Theme preference is saved locally.
* **Dynamic Backgrounds:** Choose from several animated background effects (Candlestick Confetti, Particles) or disable them.
* **Quote Slider:** Displays inspirational or insightful quotes related to finance and investing.
* **Responsive Design:** Adapts layout for usability on desktop and mobile devices.

## 🛠️ Technology Stack

* **HTML5:** Semantic markup for structure.
* **CSS3:** Styling, animations, responsive design (Flexbox, CSS Variables, Keyframes, Media Queries).
* **Vanilla JavaScript (ES6+):** DOM manipulation, event handling, API fetching, theme/background logic.
* **[particles.js](https://github.com/VincentGarreau/particles.js/):** Library used for the animated particle background effects.
* **[Financial Modeling Prep (FMP) API](https://site.financialmodelingprep.com/developer/docs/):** Used to fetch data for the live stock ticker.



## 🚀 Usage & Setup

The site is designed to be straightforward:

1.  **Navigation:** Click the cards to visit the linked tools or the Discord server.
2.  **Theme:** Click the sun/moon icon ☀️/🌙 in the header to toggle the theme.
3.  **Background:** Use the "Background" dropdown in the header to change or disable the animated background.
4.  **Ticker:** Hover over the ticker to pause scrolling. Click a symbol to open the S&P 500 Explorer for that stock.
5.  **Quotes:** Click the "Next Quote" button to see a different quote.

**Setting up the Stock Ticker (for local use or self-hosting):**

The live stock ticker requires an API key from Financial Modeling Prep.

1.  Obtain a free API key from [Financial Modeling Prep](https://site.financialmodelingprep.com/).
2.  Open the `script.js` file (or the `<script>` section in `index.html` if you haven't separated the files yet).
3.  Find the line: `const FMP_API_KEY = "YOUR_ACTUAL_FMP_API_KEY_GOES_HERE";` (or similar).
4.  Replace `"YOUR_ACTUAL_FMP_API_KEY_GOES_HERE"` with your actual FMP API key.


## 🔗 Links

* **Live Site:** [Link to your deployed site on GitHub Pages or Netlify, etc.] * S&P 500 Explorer: [https://random-snp-500-stock-explorer.netlify.app/](https://random-snp-500-stock-explorer.netlify.app/)
* Mid Cap Explorer: [https://random-mid-cap-stock-explorer.netlify.app/](https://random-mid-cap-stock-explorer.netlify.app/)
* Stock Wordle: [https://stock-wordle.netlify.app/](https://stock-wordle.netlify.app/)
* Discord Community: [https://discord.gg/Qcuc8e7VAj](https://discord.gg/Qcuc8e7VAj)

## 🙏 Acknowledgments

* Particle effects powered by [particles.js](https://github.com/VincentGarreau/particles.js/).
* Stock data provided by [Financial Modeling Prep](https://site.financialmodelingprep.com/).
* Theme toggle icons adapted from [Feather Icons](https://feathericons.com/).
* Discord icon from [SVGRepo](https://www.svgrepo.com/).
