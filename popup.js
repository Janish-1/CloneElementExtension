document.getElementById("downloadHTMLButton").addEventListener("click", () => {
    sendMessageToContentScript("downloadHTML");
});

document.getElementById("downloadCSSButton").addEventListener("click", () => {
    sendMessageToContentScript("downloadCSS");
});

document.getElementById("downloadJSButton").addEventListener("click", () => {
    sendMessageToContentScript("downloadJS");
});

document.getElementById("downloadImagesButton").addEventListener("click", () => {
    sendMessageToContentScript("downloadImages");
});

function sendMessageToContentScript(action) {
    const extensionAPI = typeof browser !== "undefined" ? browser : chrome;

    extensionAPI.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (extensionAPI.runtime.lastError) {
            reportError(extensionAPI.runtime.lastError.message);
            return;
        }

        if (!tabs[0]?.id) {
            reportError("No active page is available.");
            return;
        }

        extensionAPI.tabs.sendMessage(tabs[0].id, { action }, (response) => {
            if (extensionAPI.runtime.lastError) {
                reportError("Could not read this page. Try a regular webpage.");
                console.error(extensionAPI.runtime.lastError.message);
                return;
            }

            if (!response) {
                reportError("The page did not return any content.");
                return;
            }

            switch(action){
                case "downloadHTML":
                    if (typeof response.content !== "string") {
                        reportError("The page snapshot could not be created.");
                        return;
                    }
                    downloadFile(response.content, "page-snapshot.html", "text/html");
                    setStatus("Page snapshot downloaded.");
                    break;
            
                case "downloadCSS":
                    const cssBlob = new Blob([response.content], { type: "text/css" });
                    const cssUrl = URL.createObjectURL(cssBlob);
                    const cssAnchor = document.createElement("a");
                    cssAnchor.href = cssUrl;
                    cssAnchor.download = `${action}.css`;
                    document.body.appendChild(cssAnchor);
                    cssAnchor.click();
                    document.body.removeChild(cssAnchor);
                    URL.revokeObjectURL(cssUrl);
                    break;
            
                case "downloadJS":
                    const jsBlob = new Blob([response.content], { type: "application/javascript" });
                    const jsUrl = URL.createObjectURL(jsBlob);
                    const jsAnchor = document.createElement("a");
                    jsAnchor.href = jsUrl;
                    jsAnchor.download = `${action}.js`;
                    document.body.appendChild(jsAnchor);
                    jsAnchor.click();
                    document.body.removeChild(jsAnchor);
                    URL.revokeObjectURL(jsUrl);
                    break;

                case ('downloadImages'):
                    response.images.forEach((img) => {
                        fetch(img.url)
                            .then((res) => res.blob())
                            .then((blob) => {
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = img.name;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                            })
                            .catch((err) =>
                                console.error(`Error downloading image ${img.url}:`, err)
                            );
                    });
                    break;
                    
                default:
                    console.error('Invalid action');
                    break;
            }
        });
    });
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setStatus(message) {
    document.getElementById("status").textContent = message;
}

function reportError(message) {
    setStatus(message);
    console.error(message);
}
