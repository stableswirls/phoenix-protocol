/**
 * Phoenix Protocol - Hash-based SPA Router
 * Handles client-side routing with hash fragments
 */

class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.currentParams = {};
    this.beforeNavigateHooks = [];
    this.afterNavigateHooks = [];
    this.appElement = null;
  }

  /**
   * Initialize the router with the app container element
   * @param {string} selector - CSS selector for the app container
   */
  init(selector = '#app') {
    this.appElement = document.querySelector(selector);
    if (!this.appElement) {
      throw new Error(`Router: Element "${selector}" not found`);
    }

    // Listen for hash changes
    window.addEventListener('hashchange', () => this._handleRoute());
    
    // Handle initial route
    this._handleRoute();
  }

  /**
   * Register a route
   * @param {string} path - Route path (e.g., '/phase/:id')
   * @param {Function|Object} handler - Async function that returns HTML string, 
   *   OR a module object with { default: Function, setup?: Function }
   */
  on(path, handler) {
    this.routes.set(path, handler);
    return this; // Allow chaining
  }

  /**
   * Register a route with a page module (has default export + optional setup)
   * @param {string} path - Route path
   * @param {Object} pageModule - Module with default (render fn) and optional setup fn
   */
  page(path, pageModule) {
    this.routes.set(path, { module: pageModule });
    return this;
  }

  /**
   * Navigate to a route
   * @param {string} path - Route path to navigate to
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * Go back in history
   */
  back() {
    window.history.back();
  }

  /**
   * Add a before-navigate hook
   * @param {Function} hook - Function called before navigation, receives (toPath, fromPath)
   */
  beforeNavigate(hook) {
    this.beforeNavigateHooks.push(hook);
  }

  /**
   * Add an after-navigate hook
   * @param {Function} hook - Function called after navigation, receives (toPath, params)
   */
  afterNavigate(hook) {
    this.afterNavigateHooks.push(hook);
  }

  /**
   * Get the current hash path
   * @returns {string}
   */
  getCurrentPath() {
    const hash = window.location.hash.slice(1); // Remove #
    return hash || '/';
  }

  /**
   * Internal: Handle route changes
   */
  async _handleRoute() {
    const path = this.getCurrentPath();
    const previousRoute = this.currentRoute;

    // Run before-navigate hooks
    for (const hook of this.beforeNavigateHooks) {
      const shouldContinue = await hook(path, previousRoute);
      if (shouldContinue === false) return;
    }

    // Find matching route
    const match = this._matchRoute(path);

    if (match) {
      const { handler, params } = match;
      this.currentRoute = path;
      this.currentParams = params;

      try {
        let result;

        // Check if handler is a page module
        if (handler && handler.module) {
          const pageModule = handler.module;
          result = await pageModule.default(params);
          
          // Render the result
          if (typeof result === 'string') {
            this.appElement.innerHTML = result;
          } else if (result instanceof HTMLElement) {
            this.appElement.innerHTML = '';
            this.appElement.appendChild(result);
          }

          // Call setup function after DOM is ready
          if (typeof pageModule.setup === 'function') {
            // Use requestAnimationFrame to ensure DOM is painted
            requestAnimationFrame(() => {
              pageModule.setup(params);
            });
          }
        } else if (typeof handler === 'function') {
          // Call the route handler
          const result = await handler(params);

          // Render the result
          if (typeof result === 'string') {
            this.appElement.innerHTML = result;
          } else if (result instanceof HTMLElement) {
            this.appElement.innerHTML = '';
            this.appElement.appendChild(result);
          }

          // Call setup function if the handler has one (page module pattern)
          if (handler._setup) {
            handler._setup();
          }
        }

        // Add page transition animation
        const page = this.appElement.querySelector('.page');
        if (page) {
          page.classList.add('animate-fadeIn');
        }

        // Scroll to top
        window.scrollTo(0, 0);

      } catch (error) {
        console.error('Router: Error rendering route', path, error);
        this.appElement.innerHTML = `
          <div class="page">
            <div class="container" style="padding-top: 100px; text-align: center;">
              <h1 class="heading-lg text-danger">Something went wrong</h1>
              <p class="text-muted" style="margin-top: 16px;">${error.message}</p>
              <button class="btn btn-primary" style="margin-top: 24px;" onclick="window.location.hash='/'">
                Go Home
              </button>
            </div>
          </div>
        `;
      }
    } else {
      // 404 - Route not found
      this.appElement.innerHTML = `
        <div class="page">
          <div class="container" style="padding-top: 100px; text-align: center;">
            <h1 class="heading-xl text-primary">404</h1>
            <p class="text-muted" style="margin-top: 16px;">Page not found</p>
            <button class="btn btn-primary" style="margin-top: 24px;" onclick="window.location.hash='/'">
              Go Home
            </button>
          </div>
        </div>
      `;
    }

    // Run after-navigate hooks
    for (const hook of this.afterNavigateHooks) {
      await hook(path, this.currentParams);
    }
  }

  /**
   * Internal: Match a path against registered routes
   * Supports dynamic segments like :id
   * @param {string} path - The path to match
   * @returns {{ handler: Function, params: Object } | null}
   */
  _matchRoute(path) {
    for (const [routePath, handler] of this.routes) {
      const params = this._extractParams(routePath, path);
      if (params !== null) {
        return { handler, params };
      }
    }
    return null;
  }

  /**
   * Internal: Extract parameters from a path based on a route pattern
   * @param {string} pattern - Route pattern (e.g., '/phase/:id')
   * @param {string} path - Actual path (e.g., '/phase/1')
   * @returns {Object|null} - Extracted params or null if no match
   */
  _extractParams(pattern, path) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params = {};

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        // Dynamic segment
        const paramName = patternParts[i].slice(1);
        params[paramName] = decodeURIComponent(pathParts[i]);
      } else if (patternParts[i] !== pathParts[i]) {
        // Static segment doesn't match
        return null;
      }
    }

    return params;
  }
}

// Singleton router instance
const router = new Router();

export default router;
