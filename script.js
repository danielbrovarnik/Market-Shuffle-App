// Ensure DOM is fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function() {

    // --- Ticker Configuration ---
    // IMPORTANT: PASTE YOUR ***REAL*** FMP API KEY BETWEEN THE QUOTES BELOW
    // You should ideally use environment variables for API keys in production!
    const FMP_API_KEY = "kn9jnQr6yIf9i5YcpdJHvajv8sVz3zA7"; // <<< PASTE YOUR KEY HERE! Or replace with a secure method
    // Example: const FMP_API_KEY = "abc123def456...";

    const TICKER_SYMBOLS = ["AAPL", "GOOGL", "TSLA", "AMZN", "MSFT", "NVDA", "SPY"]; // Stocks to display
    const SnpExplorerBaseURL = "https://random-snp-500-stock-explorer.netlify.app/"; // Base URL of your target tool

    const tickerContainer = document.querySelector('.ticker-container');
    const tickerWrap = document.getElementById('ticker-wrap');
    const uniqueSymbolCount = TICKER_SYMBOLS.length; // How many unique items we have

    // Initially hide the ticker container
    if (tickerContainer) {
        tickerContainer.style.display = 'none';
    }

    // Function to fetch stock data from FMP
    async function fetchStockData(symbols) {
        if (FMP_API_KEY === "kn9jnQr6yIf9i5YcpdJHvajv8sVz3zA7" || FMP_API_KEY === "YOUR_ACTUAL_FMP_API_KEY_GOES_HERE" || !FMP_API_KEY) { // Check placeholder
            console.error("FMP API Key is missing or is still the placeholder value. Please replace it in the script with your real key. The ticker will not function.");
            return null; // Stop if key is missing/placeholder
        }
        const symbolsString = symbols.join(',');
        const apiUrl = `https://financialmodelingprep.com/api/v3/quote/${symbolsString}?apikey=${FMP_API_KEY}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try { const errorData = await response.json(); if (errorData && errorData["Error Message"]) { errorMsg = `FMP API Error: ${errorData["Error Message"]}`; } } catch (parseError) {}
                throw new Error(errorMsg);
            }
            const data = await response.json();
            if (data && data["Error Message"]) { throw new Error(`FMP API Error: ${data["Error Message"]}`); }
            if (Array.isArray(data) && data.length === 0 && symbols.length > 0) {
                console.warn("FMP API returned an empty array. Potential reasons: incorrect symbols, API limit reached, or temporary issue.");
                return [];
             }
            return data;
        } catch (error) {
            console.error("Error fetching stock data:", error);
            // Display a user-friendly message in the ticker itself
            if (tickerWrap) {
                tickerWrap.innerHTML = `<p style="color: red; padding: 0 1rem; width: 100%; text-align: center;">Could not load stock data. ${error.message.includes("API Key") ? 'Check API Key.' : 'Try again later.'}</p>`;
                tickerWrap.style.animation = 'none'; // Stop animation
                if (tickerContainer) tickerContainer.style.display = 'block'; // Show the container with the error
            }
            return null; // Return null to indicate failure
        }
    }

    // Function to update the ticker UI
    function updateTickerUI(stockData) {
        if (!tickerWrap) { console.error("Ticker wrap element not found."); return; }
        if (!stockData || !Array.isArray(stockData) || stockData.length === 0) { console.warn("updateTickerUI called with invalid or empty data."); return; }

        const tickerItems = tickerWrap.querySelectorAll('.ticker-item');
        if (tickerItems.length === 0) { console.error("Ticker items not found in the DOM."); return; }

        stockData.forEach(quote => {
            if (!quote || typeof quote !== 'object' || !quote.symbol) { console.warn("Received invalid quote object:", quote); return; }

            const itemsToUpdate = tickerWrap.querySelectorAll(`.ticker-item[data-symbol="${quote.symbol}"]`);
            if (itemsToUpdate.length === 0) { console.warn(`No ticker item found for symbol: ${quote.symbol}`); return; }

            itemsToUpdate.forEach(item => {
                const priceEl = item.querySelector('.price');
                const changeEl = item.querySelector('.change');
                if (priceEl && changeEl) {
                    const price = (typeof quote.price === 'number' && !isNaN(quote.price)) ? quote.price.toFixed(2) : '--.--';
                    priceEl.textContent = price;

                    const changePercent = quote.changesPercentage;
                    let changeClass = 'change-neutral';
                    let changeIcon = '';
                    let formattedChange = '--.--%';

                    if (typeof changePercent === 'number' && !isNaN(changePercent)) {
                        formattedChange = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
                        if (changePercent > 0.001) { // Use small threshold to avoid floating point issues with 0.00
                            changeClass = 'change-up';
                            changeIcon = '▲ ';
                        } else if (changePercent < -0.001) {
                            changeClass = 'change-down';
                            changeIcon = '▼ ';
                        } else {
                            changeClass = 'change-neutral'; // Explicitly neutral if very close to 0
                            formattedChange = `${0.00.toFixed(2)}%`; // Display as 0.00%
                        }
                    } else {
                        formattedChange = '--.--%';
                        changeClass = 'change-neutral';
                        changeIcon = '';
                    }
                    changeEl.textContent = changeIcon + formattedChange;
                    // Reset classes and add the correct one
                    changeEl.className = 'change'; // Base class
                    changeEl.classList.add(changeClass);

                } else { console.warn(`Price or Change element missing for symbol: ${quote.symbol}`); }
            });
        });
    }

    // Function to setup/adjust ticker animation
    function setupTickerAnimation() {
         if (!tickerContainer || tickerContainer.style.display === 'none' || !tickerWrap || uniqueSymbolCount === 0) { return; }
         // Check if ticker wrap contains the error message paragraph
         if (tickerWrap.querySelector('p[style*="color: red"]')) { console.log("Ticker contains error message, skipping animation setup."); tickerWrap.style.animation = 'none'; return; }

         const allItems = tickerWrap.querySelectorAll('.ticker-item');
         const expectedItemCount = uniqueSymbolCount * 2; // We duplicate items for seamless scroll

         // Basic check if items exist
         if (allItems.length === 0 || uniqueSymbolCount === 0) {
            console.warn("Ticker items not found or no symbols configured. Cannot set up animation.");
            tickerWrap.style.animation = 'none'; // Ensure no animation runs
            return;
         }
         // Warning if count doesn't match, but try to proceed if we have at least the unique items
         if (allItems.length !== expectedItemCount) { console.warn(`Ticker items count mismatch (found ${allItems.length}, expected ${expectedItemCount}). Animation might be imperfect.`); if (allItems.length < uniqueSymbolCount) { console.error("Cannot calculate ticker width: Not enough unique items found in DOM."); tickerWrap.style.animation = 'none'; return; } }

         // Calculate width of the unique items (the first half)
         let uniqueWidth = 0;
         for (let i = 0; i < uniqueSymbolCount; i++) { if (allItems[i]) { uniqueWidth += allItems[i].offsetWidth; } else { console.error(`Ticker item at index ${i} missing.`); tickerWrap.style.setProperty('--scroll-amount', `-50%`); tickerWrap.style.animationDuration = ''; // Use CSS default
            tickerWrap.style.animationPlayState = 'running'; return; // Exit if an item is missing
          } }

         const totalWidth = tickerWrap.scrollWidth; // Total width of all items

         // Only apply animation if we have a valid width
         if (uniqueWidth > 0 && totalWidth >= uniqueWidth) {
             tickerWrap.style.setProperty('--scroll-amount', `-${uniqueWidth}px`); // Set CSS variable

             // Adjust speed based on width (longer content scrolls slightly faster relatively)
             const desiredSpeedReferenceDuration = 25; // Base duration in seconds for 50% scroll
             const referenceDistanceRatio = 0.5; // The ratio --scroll-amount is initially set to in CSS

             // Check for valid totalWidth to avoid division by zero or negative duration
             if (totalWidth <= 0 || totalWidth < uniqueWidth) { console.warn(`Ticker totalWidth calculation issue (Total: ${totalWidth}, Unique: ${uniqueWidth}). Using CSS default animation settings.`); tickerWrap.style.setProperty('--scroll-amount', `-50%`); tickerWrap.style.animationDuration = ''; tickerWrap.style.animationPlayState = 'running'; return; }

             // Calculate duration: proportional to the distance being scrolled
             // Duration = (Actual Distance / Reference Distance) * Reference Duration
             const newDuration = (uniqueWidth / (referenceDistanceRatio * totalWidth)) * desiredSpeedReferenceDuration;

             // Apply duration if it's a sensible positive number
             if (isFinite(newDuration) && newDuration > 0.1) { tickerWrap.style.animationDuration = `${newDuration}s`; tickerWrap.style.animationPlayState = 'running'; }
             else { console.warn(`Calculated invalid animation duration (${newDuration}). Using CSS default duration.`); tickerWrap.style.setProperty('--scroll-amount', `-50%`); tickerWrap.style.animationDuration = ''; // Revert to CSS default
               tickerWrap.style.animationPlayState = 'running';
             }
         } else { console.warn("Ticker width calculation failed (uniqueWidth <= 0 or totalWidth < uniqueWidth). Using CSS default animation settings."); tickerWrap.style.setProperty('--scroll-amount', `-50%`); tickerWrap.style.animationDuration = ''; // Use CSS default
            tickerWrap.style.animationPlayState = 'running';
         }
    }

    // Function to handle clicks on ticker items
    function handleTickerClick(event) {
        const clickedItem = event.target.closest('.ticker-item');
        if (clickedItem) { const symbol = clickedItem.getAttribute('data-symbol'); if (symbol) { const targetUrl = `${SnpExplorerBaseURL}?ticker=${symbol}`; window.open(targetUrl, '_blank'); } }
    }

    // --- Initial Ticker Setup ---
    if(tickerContainer && tickerWrap) {
        tickerWrap.addEventListener('click', handleTickerClick);
        fetchStockData(TICKER_SYMBOLS)
            .then(data => {
                // Check if data is valid and NOT the error case (which returns null)
                if (data && Array.isArray(data)) {
                    if (data.length > 0) {
                        tickerContainer.style.display = 'block'; // Show container
                        updateTickerUI(data);
                        // Use requestAnimationFrame to ensure layout is calculated before setting animation
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => { // Double RAF for potentially complex layouts
                                setupTickerAnimation();
                            });
                        });
                    } else {
                        // API returned empty array, but no error
                        console.warn("No ticker data received (API returned empty array), but no error reported. Hiding ticker.");
                        tickerContainer.style.display = 'none';
                    }
                } else if (data === null) {
                    // Error case already handled inside fetchStockData (message displayed in ticker)
                    console.log("Ticker data fetch failed. Error message should be visible in the ticker area.");
                } else {
                    // Unexpected data format
                     console.error("Received unexpected data format from fetchStockData. Hiding ticker.", data);
                     tickerContainer.style.display = 'none';
                }
            })
            .catch(error => {
                // Catch any unexpected errors *not* handled inside fetchStockData
                console.error("Critical error during ticker setup:", error);
                if (tickerContainer) tickerContainer.style.display = 'none'; // Hide on critical error
            });

         // Debounced resize handler for ticker animation recalculation
         let resizeTimer;
         window.addEventListener('resize', () => {
             clearTimeout(resizeTimer);
             if (tickerContainer.style.display !== 'none' && !tickerWrap.querySelector('p[style*="color: red"]')) { // Only run if ticker is visible and not showing an error
                 resizeTimer = setTimeout(setupTickerAnimation, 250);
             }
         });
    } else {
        console.error("Ticker container (.ticker-container) or wrap element (#ticker-wrap) not found!");
    }

    // --- Particle Background Configurations & Theme Toggle ---
    let currentParticleConfig = null; // Track the current config ('none', 'candlestick', 'particles')

    function initParticlesCandlestick() {
        destroyParticles(); // Ensure previous instance is cleared
        const particlesDiv = document.getElementById("particles-js");
        if (!particlesDiv) return;
        particlesDiv.style.display = "block";
        particlesJS("particles-js", { "particles": { "number": { "value": 50, "density": { "enable": true, "value_area": 800 } }, "color": { "value": ["#28a745", "#dc3545", "#adb5bd"] }, "shape": { "type": "edge", "stroke": { "width": 0, "color": "#000000" }, "polygon": { "nb_sides": 4 } }, "opacity": { "value": 0.8, "random": true, "anim": { "enable": true, "speed": 0.5, "opacity_min": 0.1, "sync": false } }, "size": { "value": 10, "random": true, "anim": { "enable": false } }, "line_linked": { "enable": false }, "move": { "enable": true, "speed": 2, "direction": "bottom", "random": true, "straight": false, "out_mode": "out", "bounce": false, "attract": { "enable": false } } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": false }, "onclick": { "enable": false }, "resize": true } }, "retina_detect": true });
        currentParticleConfig = 'candlestick';
        const canvas = particlesDiv.querySelector('canvas'); if(canvas) canvas.style.zIndex = -1;
    }

    function initParticlesStandard() {
        destroyParticles(); // Ensure previous instance is cleared
        const particlesDiv = document.getElementById("particles-js");
        if (!particlesDiv) return;
        particlesDiv.style.display = "block";
        var particleColor = document.body.classList.contains("dark-mode") ? "#ffffff" : "#333333";
        var lineColor = document.body.classList.contains("dark-mode") ? "#555555" : "#cccccc";
        particlesJS("particles-js", { "particles": { "number": { "value": 80, "density": { "enable": true, "value_area": 800 } }, "color": { "value": particleColor }, "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" }, "polygon": { "nb_sides": 5 } }, "opacity": { "value": 0.5, "random": false, "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false } }, "size": { "value": 3, "random": true, "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false } }, "line_linked": { "enable": true, "distance": 150, "color": lineColor, "opacity": 0.4, "width": 1 }, "move": { "enable": true, "speed": 3, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false, "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 } } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "repulse" }, "onclick": { "enable": true, "mode": "push" }, "resize": true }, "modes": { "grab": { "distance": 400, "line_linked": { "opacity": 1 } }, "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 }, "repulse": { "distance": 100, "duration": 0.4 }, "push": { "particles_nb": 4 }, "remove": { "particles_nb": 2 } } }, "retina_detect": true });
        currentParticleConfig = 'particles';
        const canvas = particlesDiv.querySelector('canvas'); if(canvas) canvas.style.zIndex = -1;
    }

    function destroyParticles() {
       if (window.pJSDom && window.pJSDom[0] && window.pJSDom[0].pJS && typeof window.pJSDom[0].pJS.fn.vendors.destroypJS === 'function') {
            try {
                window.pJSDom[0].pJS.fn.vendors.destroypJS();
            } catch (e) {
                console.warn("Error during pJS destroy:", e);
            }
            window.pJSDom = []; // Clear the reference
        }
        // Also manually clear the div content as a fallback
        const particlesDiv = document.getElementById("particles-js");
        if (particlesDiv) particlesDiv.innerHTML = '';
        currentParticleConfig = 'none'; // Update state
    }

    function handleBgSelect() {
        const bgSelect = document.getElementById('bg-select');
        if (!bgSelect) return;
        let selected = bgSelect.value;
        const particlesDiv = document.getElementById("particles-js");
        if (!particlesDiv) { console.error("#particles-js div not found!"); return; }

        destroyParticles(); // Always destroy first

        if (selected === "none") {
            particlesDiv.style.display = "none"; // Hide the container
        } else {
            particlesDiv.style.display = "block"; // Show container before init
            // Use setTimeout to allow the DOM changes to potentially render before init
            setTimeout(() => {
                try {
                    if (selected === "candlestick") {
                        initParticlesCandlestick();
                    } else if (selected === "particles") {
                        initParticlesStandard();
                    }
                } catch (e) {
                    console.error(`Error initializing particles (${selected}):`, e);
                    particlesDiv.style.display = 'none'; // Hide on error
                    currentParticleConfig = 'none'; // Reset state on error
                }
            }, 50); // Small delay
        }
    }

    const bgSelect = document.getElementById('bg-select');
    if (bgSelect) {
        bgSelect.addEventListener('change', handleBgSelect);
        // Initialize based on default selection
        handleBgSelect();
    } else { console.error("#bg-select dropdown not found!"); }

    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    function updateThemeIconAndAttributes() {
        if (!themeToggle) return; // Guard clause

        const isDarkMode = body.classList.contains('dark-mode');
        themeToggle.title = isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode";
        themeToggle.setAttribute('aria-label', themeToggle.title);

        // CSS handles the actual icon visibility based on body class
    }

    // Check for saved theme or prefers-color-scheme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode'); // Explicitly ensure light mode if not dark
    }
    updateThemeIconAndAttributes(); // Set initial state

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);

            // Re-initialize standard particles if active, as colors change
            if (currentParticleConfig === "particles") {
                handleBgSelect(); // This will destroy and re-init with correct colors
            }
             // Re-initialize candlestick particles if active? (Optional, colors are fixed)
             // if (currentParticleConfig === "candlestick") {
             //     handleBgSelect();
             // }

            updateThemeIconAndAttributes(); // Update button attributes/tooltip
        });
    } else { console.error("#theme-toggle button not found!"); }


    // --- Fade In Container ---
    const mainContainer = document.querySelector('.container');
    if (mainContainer) {
        // Use setTimeout to allow initial rendering paint before starting transition
        setTimeout(() => {
            mainContainer.style.opacity = 1;
        }, 50); // Small delay
    } else { console.error(".container element not found!"); }

    // --- Quote Slider ---
    const quotes = [ "Investing is a marathon, not a sprint.", "The best time to plant a tree was 20 years ago. The second best time is now.", "Compound interest is the eighth wonder of the world. He who understands it, earns it... he who doesn't... pays it. - Albert Einstein", "Don't look for the needle in the haystack. Just buy the haystack. - John Bogle", "The stock market is a device for transferring money from the impatient to the patient. - Warren Buffett", "Time in the market beats timing the market.", "Successful investing takes time, discipline and patience. - Warren Buffett", "Risk comes from not knowing what you're doing. - Warren Buffett", "Be fearful when others are greedy, and greedy when others are fearful. - Warren Buffett", "Know what you own, and know why you own it. - Peter Lynch", "In investing, what is comfortable is rarely profitable. - Robert Arnott", "The intelligent investor is a realist who sells to optimists and buys from pessimists. - Benjamin Graham", "Price is what you pay. Value is what you get. - Warren Buffett", "Our favorite holding period is forever. - Warren Buffett", "Wide diversification is only required when investors do not understand what they are doing. - Warren Buffett", "The investor's chief problem—and even his worst enemy—is likely to be himself. - Benjamin Graham", "Investing should be more like watching paint dry or watching grass grow. If you want excitement, take $800 and go to Las Vegas. - Paul Samuelson", "An investment in knowledge pays the best interest. - Benjamin Franklin", "The four most dangerous words in investing are: 'This time it's different.' - Sir John Templeton", "It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price. - Warren Buffett" ];
    let currentQuoteIndex = Math.floor(Math.random() * quotes.length); // Start with a random quote
    const quoteText = document.getElementById('quote-text');
    const nextQuoteButton = document.getElementById('next-quote-button');

    function displayQuote() {
        if (quoteText && quotes.length > 0) {
            quoteText.innerText = `"${quotes[currentQuoteIndex]}"`; // Add quotes
        }
    }

    if (nextQuoteButton) {
        nextQuoteButton.addEventListener('click', function() {
            if (quotes.length <= 1) return; // No need to change if only one quote

            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * quotes.length);
            } while (nextIndex === currentQuoteIndex); // Ensure the next quote is different

            currentQuoteIndex = nextIndex;
            displayQuote();
        });
    } else { console.error("#next-quote-button not found!"); }

    // Display the initial quote
    if (quoteText) {
        displayQuote();
    } else { console.error("#quote-text span not found!"); }

}); // End DOMContentLoaded
