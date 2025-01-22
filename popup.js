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
        extensionAPI.tabs.sendMessage(tabs[0].id, { action }, (response) => {
            if (!response) {
                console.error("No response from content script.");
                return;
            }

            switch(action){
                case "downloadHTML":
                    const htmlBlob = new Blob([response.content], { type: "text/html" });
                    const htmlUrl = URL.createObjectURL(htmlBlob);
                    const htmlAnchor = document.createElement("a");
                    htmlAnchor.href = htmlUrl;
                    htmlAnchor.download = `${action}.html`;
                    document.body.appendChild(htmlAnchor);
                    htmlAnchor.click();
                    document.body.removeChild(htmlAnchor);
                    URL.revokeObjectURL(htmlUrl);
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
