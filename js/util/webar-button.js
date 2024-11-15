export class WebARButton {
    /**
     * Construct a new Enter AR Button
     * @constructor
     * @param {Object} options Optional parameters
     * @param {Function} [options.onRequestSession] Callback when the AR session is requested
     * @param {Function} [options.onEndSession] Callback when the AR session ends
     * @param {string} [options.textEnterXRTitle] Text for Enter AR
     * @param {string} [options.textXRNotFoundTitle] Text for when AR is not supported
     * @param {string} [options.textExitXRTitle] Text for Exit AR
     * @param {string} [options.color] Text and icon color
     * @param {string} [options.background] Background color or set to false for none
     */
    constructor(options = {}) {
        // Set default options
        options.color = options.color || 'rgb(80,168,252)';
        options.background = options.background || false;
        options.textEnterXRTitle = options.textEnterXRTitle || 'ENTER AR';
        options.textXRNotFoundTitle = options.textXRNotFoundTitle || 'AR NOT FOUND';
        options.textExitXRTitle = options.textExitXRTitle || 'EXIT AR';

        this.options = options;

        this.session = null;

        // Create the button DOM element
        this.domElement = this.createButton(options);

        // Bind button click events
        this.domElement.addEventListener('click', () => this.handleButtonClick());
    }

    /**
     * Create the AR button DOM element
     * @param {Object} options
     * @return {HTMLElement} The button element
     */
    createButton(options) {
        const button = document.createElement('button');
        button.className = `${options.cssprefix || 'webxr-ui'}-ar-button`;
        button.textContent = options.textXRNotFoundTitle;
        button.style.color = options.color;
        button.style.background = options.background || 'transparent';
        button.style.border = `2px solid ${options.color}`;
        button.style.borderRadius = '4px';
        button.style.padding = '8px 16px';
        button.style.fontSize = '16px';
        button.style.cursor = 'pointer';
        button.style.display = 'inline-block';
        button.style.transition = 'background 0.3s, border 0.3s, color 0.3s';
        button.disabled = true; // Default to disabled

        // Hover effect
        button.addEventListener('mouseenter', () => {
            button.style.background = options.color;
            button.style.color = 'white';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = options.background || 'transparent';
            button.style.color = options.color;
        });

        return button;
    }

    /**
     * Handle the button click event
     */
    handleButtonClick() {
        if (this.session) {
            // End AR session
            this.options.onEndSession(this.session);
        } else if (this.domElement.disabled === false) {
            // Request AR session
            this.options.onRequestSession()
                .then((session) => {
                    this.session = session;
                    this.updateState();
                })
                .catch((err) => {
                    console.error('Failed to start AR session:', err);
                });
        }
    }

    /**
     * Set AR session state
     * @param {XRSession} session
     */
    setSession(session) {
        this.session = session;
        this.updateState();
    }

    /**
     * Update button state based on session status
     */
    updateState() {
        if (this.session) {
            this.domElement.textContent = this.options.textExitXRTitle;
            this.domElement.disabled = false;
        } else {
            this.domElement.textContent = this.options.textEnterXRTitle;
            this.domElement.disabled = false;
        }
    }

    /**
     * Enable the button
     */
    enable() {
        this.domElement.disabled = false;
    }

    /**
     * Disable the button
     */
    disable() {
        this.domElement.disabled = true;
    }

    /**
     * Set AR support availability
     * @param {boolean} supported
     */
    setSupported(supported) {
        this.domElement.disabled = !supported;
        if (!supported) {
            this.domElement.textContent = this.options.textXRNotFoundTitle;
        } else {
            this.domElement.textContent = this.options.textEnterXRTitle;
        }
    }
}
