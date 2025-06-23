import "@testing-library/jest-dom";

global.EventSource = class {
    constructor(url) {
        this.url = url;
        this.onmessage = null;
        this.onerror = null;
    }

    close() {
        // Mock cleanup
    }
};
