require("@testing-library/jest-dom");

// Configure React 18 test environment
const { configure } = require("@testing-library/react");
configure({ reactStrictMode: true });

// Setup for React 18 testing
const React = require("react");
const ReactDOM = require("react-dom/client");
const { act } = require("react-dom/test-utils");

// Override render method for testing-library
const originalRender = ReactDOM.render;
ReactDOM.render = (...args) => {
    console.warn("ReactDOM.render is no longer supported in React 18. Using createRoot instead.");
    const container = args[1];
    const root = ReactDOM.createRoot(container);
    act(() => {
        root.render(args[0]);
    });
    return root;
};

// Mock matchMedia if it's not available in test environment
if (typeof window !== "undefined") {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // deprecated
            removeListener: jest.fn(), // deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });
}
