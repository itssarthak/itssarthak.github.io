/**
 * URL Parameters Handler
 * Captures and stores URL query parameters in localStorage
 * Works across the entire website including non-existent URLs
 */

(function() {
    'use strict';
    
    // Configuration
    const STORAGE_KEY = 'urlParams';
    const STORAGE_EXPIRY_KEY = 'urlParamsExpiry';
    const EXPIRY_DAYS = 30; // How long to keep params in localStorage
    
    /**
     * Parse URL query parameters
     * @param {string} url - The URL to parse (optional, defaults to current URL)
     * @returns {Object} - Object containing all query parameters
     */
    function parseQueryParams(url = window.location.href) {
        const params = {};
        const urlObj = new URL(url);
        
        // Get all search parameters
        for (const [key, value] of urlObj.searchParams.entries()) {
            params[key] = value;
        }
        
        return params;
    }
    
    /**
     * Store parameters in localStorage with timestamp
     * @param {Object} params - Parameters to store
     */
    function storeParams(params) {
        if (Object.keys(params).length === 0) {
            return; // No params to store
        }
        
        const timestamp = Date.now();
        const expiryTime = timestamp + (EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        
        // Get existing params from localStorage
        const existingParams = getStoredParams();
        
        // Merge new params with existing ones (new params take precedence)
        const mergedParams = { ...existingParams, ...params };
        
        // Store the merged parameters
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                params: mergedParams,
                timestamp: timestamp,
                url: window.location.href,
                pathname: window.location.pathname,
                referrer: document.referrer || 'direct'
            }));
            localStorage.setItem(STORAGE_EXPIRY_KEY, expiryTime.toString());
            
            // Log for debugging (remove in production if needed)
            console.log('URL Parameters stored:', mergedParams);
        } catch (error) {
            console.warn('Failed to store URL parameters:', error);
        }
    }
    
    /**
     * Retrieve stored parameters from localStorage
     * @returns {Object} - Stored parameters or empty object
     */
    function getStoredParams() {
        try {
            const expiry = localStorage.getItem(STORAGE_EXPIRY_KEY);
            const now = Date.now();
            
            // Check if data has expired
            if (expiry && now > parseInt(expiry)) {
                clearStoredParams();
                return {};
            }
            
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                return data.params || {};
            }
        } catch (error) {
            console.warn('Failed to retrieve stored URL parameters:', error);
        }
        
        return {};
    }
    
    /**
     * Clear stored parameters from localStorage
     */
    function clearStoredParams() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_EXPIRY_KEY);
        } catch (error) {
            console.warn('Failed to clear stored URL parameters:', error);
        }
    }
    
    /**
     * Get all stored data including metadata
     * @returns {Object} - Complete stored data object
     */
    function getStoredData() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to retrieve stored URL data:', error);
        }
        
        return null;
    }
    
    /**
     * Main function to capture and store URL parameters
     */
    function captureUrlParams() {
        const params = parseQueryParams();
        
        if (Object.keys(params).length > 0) {
            storeParams(params);
        }
    }
    
    /**
     * Enhanced routing function that preserves query parameters
     * @param {string} targetUrl - The URL to redirect to
     * @param {boolean} replace - Whether to use location.replace (default: true)
     */
    function redirectWithParams(targetUrl, replace = true) {
        // Capture current URL params before redirect
        captureUrlParams();
        
        // Perform the redirect
        if (replace) {
            window.location.replace(targetUrl);
        } else {
            window.location.href = targetUrl;
        }
    }
    
    // Initialize: Capture parameters immediately when script loads
    captureUrlParams();
    
    // Expose functions globally for use by other scripts
    window.URLParamsHandler = {
        capture: captureUrlParams,
        store: storeParams,
        get: getStoredParams,
        getData: getStoredData,
        clear: clearStoredParams,
        redirect: redirectWithParams,
        parse: parseQueryParams
    };
    
    // Also expose for backward compatibility
    window.captureUrlParams = captureUrlParams;
    window.getStoredParams = getStoredParams;
    
})(); 