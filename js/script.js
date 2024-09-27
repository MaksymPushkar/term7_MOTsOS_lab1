function f(x, n) {
  return Math.pow(x, n) * Math.exp(-Math.pow(x, 2) / n);
}

function calculateFourierCoefficients(n, numTerms) {
  const a0 = (1 / (2 * Math.PI)) * integrate((x) => f(x, n), -Math.PI, Math.PI);
  const a = [];
  const b = [];

  for (let k = 1; k <= numTerms; k++) {
    a[k] =
      (1 / Math.PI) *
      integrate((x) => f(x, n) * Math.cos(k * x), -Math.PI, Math.PI);
    b[k] =
      (1 / Math.PI) *
      integrate((x) => f(x, n) * Math.sin(k * x), -Math.PI, Math.PI);
  }

  return { a0, a, b };
}

function integrate(func, a, b, numSteps = 1000) {
  const step = (b - a) / numSteps;
  let sum = 0;
  for (let i = 0; i < numSteps; i++) {
    const x = a + i * step;
    sum += func(x) * step;
  }
  return sum;
}

function fourierApproximation(x, n, numTerms, coefficients) {
  let { a0, a, b } = coefficients;
  let result = a0;

  for (let k = 1; k <= numTerms; k++) {
    result += a[k] * Math.cos(k * x) + b[k] * Math.sin(k * x);
  }

  return result;
}

function plotGraphs(n, numTerms) {
  const xValues = [];
  const originalValues = [];
  const approxValues = [];

  const coefficients = calculateFourierCoefficients(n, numTerms);

  for (let x = -Math.PI; x <= Math.PI; x += 0.1) {
    xValues.push(x);
    originalValues.push(f(x, n));
    approxValues.push(fourierApproximation(x, n, numTerms, coefficients));
  }

  // Plot both original function and Fourier approximation on the same chart
  new Chart(document.getElementById("combinedChart"), {
    type: "line",
    data: {
      labels: xValues,
      datasets: [
        {
          label: "Original Function",
          data: originalValues,
          borderColor: "blue",
          fill: false,
        },
        {
          label: `Fourier Approximation (N=${numTerms})`,
          data: approxValues,
          borderColor: "red",
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        x: { title: { display: true, text: "x" } },
        y: { title: { display: true, text: "f(x) / Approximation" } },
      },
    },
  });
}

function calculateError(n, numTerms) {
  const coefficients = calculateFourierCoefficients(n, numTerms);
  const error = integrate(
    (x) =>
      Math.pow(f(x, n) - fourierApproximation(x, n, numTerms, coefficients), 2),
    -Math.PI,
    Math.PI
  );
  return Math.sqrt(error / (2 * Math.PI)); // RMS error
}

function saveResults(
  n,
  numTerms,
  coefficients,
  error,
  originalFunctionData,
  approximationData
) {
  const data = {
    N: numTerms,
    coefficients: {
      a0: coefficients.a0,
      a: coefficients.a,
      b: coefficients.b,
    },
    error: error,
    originalFunctionData: originalFunctionData,
    approximationData: approximationData,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fourier_results.json";
  a.click();
  URL.revokeObjectURL(url);
}

function main() {
  const n = 18;
  const numTerms = 100;

  const coefficients = calculateFourierCoefficients(n, numTerms);
  const error = calculateError(n, numTerms);

  const xValues = [];
  const originalValues = [];
  const approxValues = [];

  for (let x = -Math.PI; x <= Math.PI; x += 0.1) {
    xValues.push(x);
    originalValues.push(f(x, n));
    approxValues.push(fourierApproximation(x, n, numTerms, coefficients));
  }

  plotGraphs(n, numTerms);
  saveResults(n, numTerms, coefficients, error, originalValues, approxValues);
}

// Call the main function
main();
