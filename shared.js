function parseCSSGradient(cssGradient) {
  const colorStopRegex =
    /(\w+(?:\s*\(\s*[\d.]+%?(?:\s*,\s*[\d.]+%?){2,3}\s*\))?|\#[0-9a-fA-F]{3,6})\s*([\d.]+%?)/g;
  let match;
  const stops = [];

  while ((match = colorStopRegex.exec(cssGradient)) !== null) {
    const color = parseColor(match[1]);
    const position = parseFloat(match[2]) / 100;
    stops.push({ position, color });
  }

  if (stops[0].position !== 0) {
    stops.unshift({ position: 0, color: stops[0].color });
  }
  if (stops[stops.length - 1].position !== 1) {
    stops.push({ position: 1, color: stops[stops.length - 1].color });
  }

  return stops;
}

function parseColor(color) {
  if (color.startsWith("rgb")) {
    let values = color.match(/[\d.]+/g).map(Number);
    if (values.length === 3) {
      values.push(1);
    }
    return values.map((v, i) => (i < 3 ? Math.round(v) : v));
  }

  if (color.startsWith("#")) {
    if (color.length === 4) {
      return [
        parseInt(color[1] + color[1], 16),
        parseInt(color[2] + color[2], 16),
        parseInt(color[3] + color[3], 16),
        1,
      ];
    }
    if (color.length === 7) {
      return [
        parseInt(color.slice(1, 3), 16),
        parseInt(color.slice(3, 5), 16),
        parseInt(color.slice(5, 7), 16),
        1,
      ];
    }
  }

  const colorKeywords = {
    red: [255, 0, 0, 1],
    yellow: [255, 255, 0, 1],
    lime: [0, 255, 0, 1],
    cyan: [0, 255, 255, 1],
    blue: [0, 0, 255, 1],
  };

  if (color.toLowerCase() in colorKeywords) {
    return colorKeywords[color.toLowerCase()];
  }

  console.warn("Unrecognized color format:", color);
  return [0, 0, 0, 1];
}

function gradientToCSS(stops) {
  return `linear-gradient(to right, ${stops
    .map(
      (stop) =>
        `rgba(${stop.color[0]},${stop.color[1]},${stop.color[2]},${
          stop.color[3]
        }) ${(stop.position * 100).toFixed(2)}%`
    )
    .join(", ")})`;
}

function roundedGradientToCSS(stops) {
  return `linear-gradient(to right, ${stops
    .map(
      (stop) =>
        `rgba(${roundToSignificantDigits(
          stop.color[0],
          3
        )},${roundToSignificantDigits(
          stop.color[1],
          3
        )},${roundToSignificantDigits(
          stop.color[2],
          3
        )},${roundToSignificantDigits(
          stop.color[3],
          3
        )}) ${roundToSignificantDigits(stop.position * 100, 3)}%`
    )
    .join(", ")})`;
}

function roundToSignificantDigits(num, digits) {
  if (num === 0) return 0;
  const rounded = Number(num.toPrecision(digits));
  return rounded === Math.floor(rounded)
    ? rounded
    : rounded.toFixed(digits - 1 - Math.floor(Math.log10(Math.abs(rounded))));
}
