// Copyright 2016 Google Inc.
//
//     Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
//     Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
//     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
// limitations under the License.

// This is a stripped down and specialized version of WebAR-UI
// (https://github.com/googlevr/webvr-ui) that takes out most of the state
// management in favor of providing a simple way of requesting entry into WebAR
// for the needs of the sample pages. Functionality like beginning sessions
// is intentionally left out so that the sample pages can demonstrate them more
// clearly.

//
// State consts
//

// Not yet presenting, but ready to present
const READY_TO_PRESENT = 'ready';

// In presentation mode
const PRESENTING = 'presenting';
const PRESENTING_FULLSCREEN = 'presenting-fullscreen';

// Checking device availability
const PREPARING = 'preparing';

// Errors
const ERROR_NO_PRESENTABLE_DISPLAYS = 'error-no-presentable-displays';
const ERROR_BROWSER_NOT_SUPPORTED = 'error-browser-not-supported';
const ERROR_REQUEST_TO_PRESENT_REJECTED = 'error-request-to-present-rejected';
const ERROR_EXIT_PRESENT_REJECTED = 'error-exit-present-rejected';
const ERROR_REQUEST_STATE_CHANGE_REJECTED = 'error-request-state-change-rejected';
const ERROR_UNKOWN = 'error-unkown';

//
// DOM element
//

const _LOGO_SCALE = 0.8;
let _WEBAR_UI_CSS_INJECTED = {};

/**
 * Generate the innerHTML for the button
 *
 * @return {string} html of the button as string
 * @param {string} cssPrefix
 * @param {Number} height
 * @private
 */
const generateInnerHTML = (cssPrefix, height)=> {
  const logoHeight = height*_LOGO_SCALE;

  return `<button class="${cssPrefix}-button">
          <div class="${cssPrefix}-title"></div>
          <div class="${cssPrefix}-logo" ></div>
        </button>`;
};

/**
 * Inject the CSS string to the head of the document
 *
 * @param {string} cssText the css to inject
 */
const injectCSS = (cssText)=> {
  // Create the css
  const style = document.createElement('style');
  style.innerHTML = cssText;

  let head = document.getElementsByTagName('head')[0];
  head.insertBefore(style, head.firstChild);
};

/**
 * Generate DOM element view for button
 *
 * @return {HTMLElement}
 * @param {Object} options
 */
const createDefaultView = (options)=> {
  const fontSize = options.height / 3;
  if (options.injectCSS) {
    // Check that css isnt already injected
    if (!_WEBAR_UI_CSS_INJECTED[options.cssprefix]) {
      injectCSS(generateCSS(options, fontSize));
      _WEBAR_UI_CSS_INJECTED[options.cssprefix] = true;
    }
  }

  const el = document.createElement('div');
  el.innerHTML = generateInnerHTML(options.cssprefix, fontSize);
  return el.firstChild;
};

/**
 * Generate the CSS string to inject
 *
 * @param {Object} options
 * @param {Number} [fontSize=18]
 * @return {string}
 */
const generateCSS = (options, fontSize=18)=> {
  const height = options.height;
  const borderWidth = 2;
  const borderColor = options.background ? options.background : options.color;
  const cssPrefix = options.cssprefix;

  let borderRadius;
  if (options.corners == 'round') {
    borderRadius = options.height / 2;
  } else if (options.corners == 'square') {
    borderRadius = 2;
  } else {
    borderRadius = options.corners;
  }

  return (`
    @font-face {
        font-family: 'Karla';
        font-style: normal;
        font-weight: 400;
        src: local('Karla'), local('Karla-Regular'),
             url(https://fonts.gstatic.com/s/karla/v5/31P4mP32i98D9CEnGyeX9Q.woff2) format('woff2');
        unicode-range: U+0100-024F, U+1E00-1EFF, U+20A0-20AB, U+20AD-20CF, U+2C60-2C7F, U+A720-A7FF;
    }
    @font-face {
        font-family: 'Karla';
        font-style: normal;
        font-weight: 400;
        src: local('Karla'), local('Karla-Regular'),
             url(https://fonts.gstatic.com/s/karla/v5/Zi_e6rBgGqv33BWF8WTq8g.woff2) format('woff2');
        unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074,
                       U+20AC, U+2212, U+2215, U+E0FF, U+EFFD, U+F000;
    }

    button.${cssPrefix}-button {
        font-family: 'Karla', sans-serif;

        border: ${borderColor} ${borderWidth}px solid;
        border-radius: ${borderRadius}px;
        box-sizing: border-box;
        background: ${options.background ? options.background : 'none'};

        height: ${height}px;
        min-width: ${fontSize * 9.6}px;
        display: inline-block;
        position: relative;

        cursor: pointer;
        transition: border 0.5s;
    }

    button.${cssPrefix}-button:focus {
      outline: none;
    }

    /*
    * Logo
    */

    .${cssPrefix}-logo {
        width: ${height}px;
        height: ${height}px;
        position: absolute;
        top:0px;
        left:0px;
        width: ${height - 4}px;
        height: ${height - 4}px;
    }
    .${cssPrefix}-svg {
        fill: ${options.color};
        margin-top: ${(height - fontSize * _LOGO_SCALE) / 2 - 2}px;
        margin-left: ${height / 3 }px;
    }
    .${cssPrefix}-svg-error {
        fill: ${options.color};
        display:none;
        margin-top: ${(height - 28 / 18 * fontSize * _LOGO_SCALE) / 2 - 2}px;
        margin-left: ${height / 3 }px;
    }


    /*
    * Title
    */

    .${cssPrefix}-title {
        color: ${options.color};
        position: relative;
        font-size: ${fontSize}px;
        padding-left: ${height * 1.05}px;
        padding-right: ${(borderRadius - 10 < 5) ? height / 3 : borderRadius - 10}px;
        transition: color 0.5s;
    }

    /*
    * disabled
    */

    button.${cssPrefix}-button[disabled=true] {
        opacity: ${options.disabledOpacity};
    }

    button.${cssPrefix}-button[disabled=true] > .${cssPrefix}-logo > .${cssPrefix}-svg {
        display:none;
    }

    button.${cssPrefix}-button[disabled=true] > .${cssPrefix}-logo > .${cssPrefix}-svg-error {
        display:initial;
    }

    /*
    * error
    */

    button.${cssPrefix}-button[error=true] {
        animation: errorShake 0.4s;
    }

    @keyframes errorShake {
      0% { transform: translate(1px, 0) }
      10% { transform: translate(-2px, 0) }
      20% { transform: translate(2px, 0) }
      30% { transform: translate(-2px, 0) }
      40% { transform: translate(2px, 0) }
      50% { transform: translate(-2px, 0) }
      60% { transform: translate(2px, 0) }
      70% { transform: translate(-2px, 0) }
      80% { transform: translate(2px, 0) }
      90% { transform: translate(-1px, 0) }
      100% { transform: translate(0px, 0) }
    }
  `);
};

//
// Button class
//

export class WebARButton {
  /**
   * Construct a new Enter AR Button
   * @constructor
   * @param {HTMLCanvasElement} sourceCanvas the canvas that you want to present with WebAR
   * @param {Object} [options] optional parameters
   * @param {HTMLElement} [options.domElement] provide your own domElement to bind to
   * @param {Boolean} [options.injectCSS=true] set to false if you want to write your own styles
   * @param {Function} [options.beforeEnter] should return a promise, opportunity to intercept request to enter
   * @param {Function} [options.beforeExit] should return a promise, opportunity to intercept request to exit
   * @param {Function} [options.onRequestStateChange] set to a function returning false to prevent default state changes
   * @param {string} [options.textEnterARTitle] set the text for Enter AR
   * @param {string} [options.textARNotFoundTitle] set the text for when a AR display is not found
   * @param {string} [options.textExitARTitle] set the text for exiting AR
   * @param {string} [options.color] text and icon color
   * @param {string} [options.background] set to false for no brackground or a color
   * @param {string} [options.corners] set to 'round', 'square' or pixel value representing the corner radius
   * @param {string} [options.disabledOpacity] set opacity of button dom when disabled
   * @param {string} [options.cssprefix] set to change the css prefix from default 'webvr-ui'
   */
  constructor(options) {
    options = options || {};

    options.color = options.color || 'rgb(80,168,252)';
    options.background = options.background || false;
    options.disabledOpacity = options.disabledOpacity || 0.5;
    options.height = options.height || 55;
    options.corners = options.corners || 'square';
    options.cssprefix = options.cssprefix || 'webvr-ui';

    // This reads AR as none of the samples are designed for other formats as of yet.
    options.textEnterARTitle = options.textEnterARTitle || 'ENTER AR';
    options.textARNotFoundTitle = options.textARNotFoundTitle || 'AR NOT FOUND';
    options.textExitARTitle = options.textExitARTitle || 'EXIT AR';

    options.onRequestSession = options.onRequestSession || (function() {});
    options.onEndSession = options.onEndSession || (function() {});

    options.injectCSS = options.injectCSS !== false;

    this.options = options;

    this._enabled = false;
    this.session = null;

    // Pass in your own domElement if you really dont want to use ours
    this.domElement = options.domElement || createDefaultView(options);
    this.__defaultDisplayStyle = this.domElement.style.display || 'initial';

    // Bind button click events to __onClick
    this.domElement.addEventListener('click', ()=> this.__onARButtonClick());

    this.__forceDisabled = false;
    this.__setDisabledAttribute(true);
    this.setTitle(this.options.textARNotFoundTitle);
  }

  /**
   * Sets the enabled state of this button.
   * @param {boolean} enabled
   */
  set enabled(enabled) {
    this._enabled = enabled;
    this.__updateButtonState();
    return this;
  }

  /**
   * Gets the enabled state of this button.
   * @return {boolean}
   */
  get enabled() {
    return this._enabled;
  }

  /**
   * Indicate that there's an active ARSession. Switches the button to "Exit AR"
   * state if not null, or "Enter AR" state if null.
   * @param {ARSession} session
   * @return {EnterARButton}
   */
  setSession(session) {
    this.session = session;
    this.__updateButtonState();
    return this;
  }

  /**
   * Set the title of the button
   * @param {string} text
   * @return {EnterARButton}
   */
  setTitle(text) {
    this.domElement.title = text;
    ifChild(this.domElement, this.options.cssprefix, 'title', (title)=> {
      if (!text) {
        title.style.display = 'none';
      } else {
        title.innerText = text;
        title.style.display = 'initial';
      }
    });

    return this;
  }

  /**
   * Set the tooltip of the button
   * @param {string} tooltip
   * @return {EnterARButton}
   */
  setTooltip(tooltip) {
    this.domElement.title = tooltip;
    return this;
  }

  /**
   * Show the button
   * @return {EnterARButton}
   */
  show() {
    this.domElement.style.display = this.__defaultDisplayStyle;
    return this;
  }

  /**
   * Hide the button
   * @return {EnterARButton}
   */
  hide() {
    this.domElement.style.display = 'none';
    return this;
  }

  /**
   * Enable the button
   * @return {EnterARButton}
   */
  enable() {
    this.__setDisabledAttribute(false);
    this.__forceDisabled = false;
    return this;
  }

  /**
   * Disable the button from being clicked
   * @return {EnterARButton}
   */
  disable() {
    this.__setDisabledAttribute(true);
    this.__forceDisabled = true;
    return this;
  }

  /**
   * clean up object for garbage collection
   */
  remove() {
    if (this.domElement.parentElement) {
      this.domElement.parentElement.removeChild(this.domElement);
    }
  }

  /**
   * Set the disabled attribute
   * @param {boolean} disabled
   * @private
   */
  __setDisabledAttribute(disabled) {
    if (disabled || this.__forceDisabled) {
      this.domElement.setAttribute('disabled', 'true');
    } else {
      this.domElement.removeAttribute('disabled');
    }
  }

  /**
   * Handling click event from button
   * @private
   */
  __onARButtonClick() {
    if (this.session) {
      this.options.onEndSession(this.session);
    } else if (this._enabled) {
      let requestPromise = this.options.onRequestSession();
      if (requestPromise) {
        requestPromise.catch((err) => {
          // Reaching this point indicates that the session request has failed
          // and we should communicate that to the user somehow.
          let errorMsg = `ARSession creation failed: ${err.message}`;
          this.setTooltip(errorMsg);
          console.error(errorMsg);

          // Disable the button momentarily to indicate there was an issue.
          this.__setDisabledAttribute(true);
          this.domElement.setAttribute('error', 'true');
          setTimeout(() => {
            this.__setDisabledAttribute(false);
            this.domElement.setAttribute('error', 'false');
          }, 1000);
        });
      }
    }
  }

  /**
   * Updates the display of the button based on it's current state
   * @private
   */
  __updateButtonState() {
    if (this.session) {
      this.setTitle(this.options.textExitARTitle);
      this.setTooltip('Exit AR presentation');
      this.__setDisabledAttribute(false);
    } else if (this._enabled) {
      this.setTitle(this.options.textEnterARTitle);
      this.setTooltip('Enter AR');
      this.__setDisabledAttribute(false);
    } else {
      this.setTitle(this.options.textARNotFoundTitle);
      this.setTooltip('No AR device found.');
      this.__setDisabledAttribute(true);
    }
  }
}

/**
 * Function checking if a specific css class exists as child of element.
 *
 * @param {HTMLElement} el element to find child in
 * @param {string} cssPrefix css prefix of button
 * @param {string} suffix class name
 * @param {function} fn function to call if child is found
 * @private
 */
const ifChild = (el, cssPrefix, suffix, fn)=> {
  const c = el.querySelector('.' + cssPrefix + '-' + suffix);
  c && fn(c);
};
