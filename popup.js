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

            if (action === "downloadImages") {
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
            } else {
                const blob = new Blob([response.content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${action}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        });
    });
}
