// Import saveSvgAsPng functions
import { saveSvgAsPng, svgAsPngUri } from "save-svg-as-png";

// Function to handle SVG conversion and preview
async function handleSvgConversion(
  svgText,
  outputFileName = "output.png",
  returnBase64 = false
) {
  try {
    // Create a temporary container for the SVG
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = svgText;
    const svgElement = tempDiv.querySelector("svg");

    if (!svgElement) {
      throw new Error("No SVG element found in the provided content");
    }

    // Ensure xmlns is present
    if (!svgElement.hasAttribute("xmlns")) {
      svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    // Add the SVG to the document temporarily (hidden)
    svgElement.style.display = "none";
    document.body.appendChild(svgElement);

    // Options for saveSvgAsPng
    const options = {
      scale: window.devicePixelRatio || 1,
      encoderOptions: 1.0, // Maximum quality
    };

    if (returnBase64) {
      // Get PNG data URI
      const pngDataUri = await new Promise((resolve, reject) => {
        svgAsPngUri(svgElement, options, (uri) => {
          if (uri) resolve(uri);
          else reject(new Error("Failed to generate PNG URI"));
        });
      });

      // Display in output div
      const outputDiv = document.getElementById("base64Output");
      outputDiv.innerHTML = "";
      const link = document.createElement("a");
      link.href = pngDataUri;
      link.textContent = "Right-click to copy Base64 PNG URL";
      link.title = 'Right-click and select "Copy Link Address"';
      outputDiv.appendChild(link);

      // Show preview
      document.getElementById("preview").src = pngDataUri;

      console.log("Base64 PNG generated and displayed");
      document.body.removeChild(svgElement);
      return pngDataUri;
    } else {
      // Download PNG directly
      saveSvgAsPng(svgElement, outputFileName, options);
      console.log("PNG downloaded as:", outputFileName);
      document.body.removeChild(svgElement);
    }
  } catch (error) {
    console.error("Error converting SVG to PNG:", error);
    throw error;
  }
}

// Event listeners
document.getElementById("svgInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const svgText = e.target.result;
      window.currentSvgText = svgText; // Store SVG text for button actions
    };
    reader.readAsText(file);
  }
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  if (window.currentSvgText) {
    handleSvgConversion(
      window.currentSvgText,
      "converted-image.png",
      false
    ).catch((error) => console.error("Download failed:", error));
  } else {
    console.error("Please select an SVG file first");
  }
});

document.getElementById("base64Btn").addEventListener("click", () => {
  if (window.currentSvgText) {
    handleSvgConversion(window.currentSvgText, "converted-image.png", true)
      .then(() => console.log("Base64 URL displayed in UI"))
      .catch((error) => console.error("Base64 generation failed:", error));
  } else {
    console.error("Please select an SVG file first");
  }
});
