const worker = new Worker('worker.js');

document.getElementById("simplify").addEventListener("click", function () {
  const inputGradient = document.getElementById("input-gradient").value;
  const maxStops = parseInt(document.getElementById("max-stops").value);
  const maxIterations = parseInt(
    document.getElementById("max-iterations").value
  );

  const originalStops = parseCSSGradient(inputGradient);

  document.getElementById("progress-bar").style.display = "block";
  document.getElementById("progress-bar-fill").style.width = "0%";
  document.getElementById("simplified-error").textContent = "Processing...";
  document.getElementById("rounded-error").textContent = "Processing...";

  const originalCSS = gradientToCSS(originalStops);
  document.getElementById("original-gradient").style.background = originalCSS;

  worker.postMessage({ originalStops, maxStops, maxIterations });
});

worker.onmessage = function (e) {
  const { progress, error, roundedError, stops } = e.data;
  document.getElementById("progress-bar-fill").style.width = `${
    progress * 100
  }%`;

  const simplifiedCSS = gradientToCSS(stops);
  document.getElementById("simplified-gradient").style.background =
    simplifiedCSS;
  document.getElementById("simplified-css").textContent = simplifiedCSS;
  document.getElementById(
    "simplified-error"
  ).textContent = `Error: ${error.toPrecision(3)}`;

  const roundedSimplifiedCSS = roundedGradientToCSS(stops);
  document.getElementById("rounded-simplified-gradient").style.background =
    roundedSimplifiedCSS;
  document.getElementById("rounded-simplified-css").textContent =
    roundedSimplifiedCSS;
  document.getElementById(
    "rounded-error"
  ).textContent = `Error: ${roundedError.toPrecision(3)}`;
};
