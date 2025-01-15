const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

extensionAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "downloadHTML") {
        const htmlContent = document.documentElement.outerHTML;
        sendResponse({ content: htmlContent });
    } else if (request.action === "downloadCSS") {
        getAllCSS().then((cssContent) => sendResponse({ content: cssContent }));
        return true; // Keep the channel open for async response
    } else if (request.action === "downloadJS") {
        getAllJS().then((jsContent) => sendResponse({ content: jsContent }));
        return true; // Keep the channel open for async response
    } else if (request.action === "downloadImages") {
        getImages().then((images) => sendResponse({ images })); // Return image data
        return true; // Keep the channel open for async response
    }
});

// Function to get all CSS rules
async function getAllCSS() {
    let cssContent = "";
    for (const stylesheet of Array.from(document.styleSheets)) {
        try {
            if (stylesheet.href) {
                const response = await fetch(stylesheet.href);
                const text = await response.text();
                cssContent += `/* Source: ${stylesheet.href} */\n${text}\n`;
            } else {
                Array.from(stylesheet.cssRules || []).forEach((rule) => {
                    cssContent += `${rule.cssText}\n`;
                });
            }
        } catch (e) {
            console.warn(`Could not access CSS for ${stylesheet.href || "inline styles"}: ${e}`);
        }
    }
    return cssContent;
}

// Function to get all JavaScript
async function getAllJS() {
    let jsContent = "";

    // External JS
    const scripts = Array.from(document.querySelectorAll("script[src]"));
    for (const script of scripts) {
        try {
            const response = await fetch(script.src);
            const text = await response.text();
            jsContent += `/* Source: ${script.src} */\n${text}\n\n`;
        } catch (e) {
            console.warn(`Failed to fetch script: ${script.src}: ${e}`);
        }
    }

    // Inline JS
    const inlineScripts = Array.from(document.querySelectorAll("script:not([src])"));
    inlineScripts.forEach((script, index) => {
        jsContent += `/* Inline Script ${index + 1} */\n${script.textContent.trim()}\n\n`;
    });

    return jsContent;
}

// Function to get all images
async function getImages() {
    return Array.from(document.querySelectorAll("img")).map((img, index) => {
        const url = img.src.startsWith("http")
            ? img.src
            : new URL(img.src, document.baseURI).href;

        return {
            name: `image-${index + 1}.jpg`,
            url: url,
            alt: img.alt || "No alt text",
        };
    });
}
