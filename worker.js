importScripts("shared.js");

function simplifyGradient(originalStops, numStops, maxIterations) {
  function initializeStops(originalStops, numStops) {
    let stops = [];
    for (let i = 0; i < numStops; i++) {
      const t = i / (numStops - 1);
      const position = t;
      const color = interpolateColor(originalStops, t);
      stops.push({ position, color });
    }
    return stops;
  }

  function calculateError(originalStops, newStops) {
    let error = 0;
    const numSamples = 1000;
    for (let i = 0; i < numSamples; i++) {
      const position = i / (numSamples - 1);
      const originalColor = interpolateColor(originalStops, position);
      const newColor = interpolateColor(newStops, position);
      error += colorDistance(originalColor, newColor);
    }
    return error / numSamples;
  }

  function interpolateColor(stops, position) {
    for (let i = 0; i < stops.length - 1; i++) {
      if (stops[i].position <= position && position <= stops[i + 1].position) {
        const t =
          (position - stops[i].position) /
          (stops[i + 1].position - stops[i].position);
        return stops[i].color.map((c, j) =>
          j < 3
            ? Math.round(lerp(c, stops[i + 1].color[j], t))
            : lerp(c, stops[i + 1].color[j], t)
        );
      }
    }
    return stops[stops.length - 1].color;
  }

  function colorDistance(color1, color2) {
    const alphaWeight = 2;
    return Math.sqrt(
      Math.pow(color1[0] - color2[0], 2) +
        Math.pow(color1[1] - color2[1], 2) +
        Math.pow(color1[2] - color2[2], 2) +
        alphaWeight * Math.pow((color1[3] - color2[3]) * 255, 2)
    );
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  let stops = initializeStops(originalStops, numStops);
  let bestStops = stops;
  let bestError = calculateError(originalStops, stops);

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    let newStops = JSON.parse(JSON.stringify(stops));
    const stopIndex = Math.floor(Math.random() * numStops);

    if (stopIndex > 0 && stopIndex < numStops - 1) {
      const minPos = newStops[stopIndex - 1].position;
      const maxPos = newStops[stopIndex + 1].position;
      newStops[stopIndex].position = minPos + Math.random() * (maxPos - minPos);
    }

    for (let i = 0; i < 4; i++) {
      if (i < 3) {
        newStops[stopIndex].color[i] = Math.min(
          255,
          Math.max(0, newStops[stopIndex].color[i] + (Math.random() - 0.5) * 50)
        );
      } else {
        newStops[stopIndex].color[i] = Math.min(
          1,
          Math.max(
            0,
            newStops[stopIndex].color[i] + (Math.random() - 0.5) * 0.1
          )
        );
      }
    }

    const error = calculateError(originalStops, newStops);
    if (error < bestError) {
      bestStops = newStops;
      bestError = error;
      stops = newStops;
    }

    if (bestError === 0) break;

    if (iteration % 100 === 0) {
      const roundedStops = bestStops.map((stop) => ({
        position: roundToSignificantDigits(stop.position, 3),
        color: stop.color.map((c) => roundToSignificantDigits(c, 3)),
      }));
      console.log('roundedStops', roundedStops);
      console.log('bestStops', bestStops);
      const roundedError = calculateError(originalStops, roundedStops);
      postMessage({
        progress: iteration / maxIterations,
        error: bestError,
        roundedError: roundedError,
        stops: bestStops,
      });
    }
  }

  const finalRoundedStops = bestStops.map((stop) => ({
    position: roundToSignificantDigits(stop.position, 3),
    color: stop.color.map((c) => roundToSignificantDigits(c, 3)),
  }));
  const finalRoundedError = calculateError(originalStops, finalRoundedStops);
  postMessage({
    progress: 1,
    error: bestError,
    roundedError: finalRoundedError,
    stops: bestStops,
  });
}

onmessage = function (e) {
  const { originalStops, maxStops, maxIterations } = e.data;
  simplifyGradient(originalStops, maxStops, maxIterations);
};
