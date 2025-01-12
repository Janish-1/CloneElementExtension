console.log("scrape.js is running");

// Function to download a file
function downloadFile(filename, content, type = "text/plain") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

// Function to get all CSS rules
function getAllCSS() {
    let cssContent = "";

    Array.from(document.styleSheets).forEach((stylesheet) => {
        try {
            Array.from(stylesheet.cssRules || []).forEach((rule) => {
                cssContent += `${rule.cssText}\n`;
            });
        } catch (e) {
            console.warn(
                `Could not access CSS rules for ${stylesheet.href}: ${e}`
            );
        }
    });

    return cssContent;
}

// Function to get all images and download them
function getImages() {
    return Array.from(document.querySelectorAll("img")).map((img, index) => {
        return {
            name: `image-${index + 1}.jpg`, // Set image filename
            url: img.src,
            alt: img.alt || "No alt text",
            width: img.width,
            height: img.height,
        };
    });
}

// Function to get all JavaScript URLs and inline scripts
function getJavaScript() {
    let jsContent = "";

    // Collect external scripts
    Array.from(document.querySelectorAll("script[src]")).forEach(
        (script, index) => {
            jsContent += `External Script ${index + 1}: ${script.src}\n`;
        }
    );

    // Collect inline scripts
    Array.from(document.querySelectorAll("script:not([src])")).forEach(
        (script, index) => {
            jsContent += `Inline Script ${
                index + 1
            }:\n${script.textContent.trim()}\n\n`;
        }
    );

    return jsContent;
}

// Collect HTML, CSS, Images, and JavaScript
const htmlContent = document.documentElement.outerHTML;
const cssContent = getAllCSS();
const imageContent = getImages();
const jsContent = getJavaScript();

console.log("Popup script running");
// Event listeners for button clicks
document.getElementById("downloadHTMLButton").addEventListener("click", () => {
    console.log("Downloading HTML");
    downloadFile("page.html", htmlContent, "text/html");
});

document.getElementById("downloadCSSButton").addEventListener("click", () => {
    console.log("Downloading CSS");
    const cssContent = getAllCSS();
    downloadFile("styles.css", cssContent, "text/css");
});

document.getElementById("downloadJSButton").addEventListener("click", () => {
    console.log("Downloading JS");
    const jsContent = getJavaScript();
    downloadFile("scripts.js", jsContent, "application/javascript");
});

document
    .getElementById("downloadImagesButton")
    .addEventListener("click", () => {
        console.log("Downloading Images");
        imageContent.forEach((img) => {
            fetch(img.url)
                .then((response) => response.blob())
                .then((blob) => {
                    downloadFile(img.name, blob, "image/jpeg");
                })
                .catch((err) =>
                    console.warn(`Failed to fetch image: ${img.url}`, err)
                );
        });
    });

// Trigger download for HTML, CSS, and JS files
// downloadFile("page.html", htmlContent, "text/html");
// downloadFile("styles.css", cssContent, "text/css");
// downloadFile("scripts.js", jsContent, "application/javascript");

// Download images
// imageContent.forEach((img) => {
//     fetch(img.url)
//       .then((response) => response.blob())
//       .then((blob) => {
//         downloadFile(img.name, blob, "image/jpeg");
//       })
//       .catch((err) => console.warn(`Failed to fetch image: ${img.url}`, err));
// });
