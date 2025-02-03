import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/DistributionArea.css";

// Register necessary components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const DistributionArea = ({ distribution, parameters = {}, intervals = { start: 0, end: 1 } }) => {
  const generateData = () => {
    if (!intervals || intervals.start === undefined || intervals.end === undefined) {
      console.error("Invalid intervals provided:", intervals);
      return { labels: [], datasets: [] };
    }

    const dataPoints = [];
    const labels = [];
    const step = (intervals.end - intervals.start) / 100;

    for (let x = intervals.start; x <= intervals.end; x += step) {
      let y = calculateDensity(distribution, x, parameters);
      dataPoints.push(y);
      labels.push(x.toFixed(2));
    }

    return {
      labels,
      datasets: [
        {
          label: `${distribution} Distribution`,
          data: dataPoints,
          borderColor: "rgba(75, 192, 192, 1)", // Line color
          backgroundColor: "rgba(75, 192, 192, 0.7)", // Fill color
          pointRadius: 0, // Hide points
          borderWidth: 2, // Line thickness
          fill: "origin", // Fill the area under the line
        },
      ],
    };
  };

  const calculateDensity = (dist, x, params) => {
    switch (dist) {
      case "Normal": {
        const { mean = 0, stdDev = 1 } = params;
        return stdDev > 0
          ? (1 / (stdDev * Math.sqrt(2 * Math.PI))) *
              Math.exp(-0.5 * ((x - mean) / stdDev) ** 2)
          : 0;
      }
      case "Student": {
        const { degreesOfFreedom: df = 1 } = params;
        const gamma = gammaFunction((df + 1) / 2) / (Math.sqrt(df * Math.PI) * gammaFunction(df / 2));
        return gamma * Math.pow(1 + (x ** 2) / df, -(df + 1) / 2);
      }
      case "Chi-Squared": {
        const { degreesOfFreedom: df = 1 } = params;
        return x >= 0
          ? (Math.pow(x, df / 2 - 1) *
              Math.exp(-x / 2)) /
              (Math.pow(2, df / 2) * gammaFunction(df / 2))
          : 0;
      }
      case "F-Distribution": {
        const { d1 = 1, d2 = 1 } = params;
        if (x > 0) {
          const num = Math.sqrt((Math.pow(d1 * x, d1) * Math.pow(d2, d2)) / Math.pow(d1 * x + d2, d1 + d2));
          const denom = x * betaFunction(d1 / 2, d2 / 2);
          return num / denom;
        }
        return 0;
      }
      case "Exponential": {
        const { rate = 1 } = params;
        return x >= 0 ? rate * Math.exp(-rate * x) : 0;
      }
      case "Cauchy": {
        const { x0 = 0, gamma = 1 } = params;
        return gamma > 0
          ? (1 / (Math.PI * gamma)) *
              (gamma ** 2 / ((x - x0) ** 2 + gamma ** 2))
          : 0;
      }
      case "Weibull": {
        const { shape = 1, scale = 1 } = params;
        return x >= 0
          ? (shape / scale) *
              Math.pow(x / scale, shape - 1) *
              Math.exp(-Math.pow(x / scale, shape))
          : 0;
      }
      case "Gamma": {
        const { shape = 1, scale = 1 } = params;
        return x >= 0
          ? (Math.pow(x, shape - 1) *
              Math.exp(-x / scale)) /
              (Math.pow(scale, shape) * gammaFunction(shape))
          : 0;
      }
      case "Beta": {
        const { alpha = 1, beta = 1 } = params;
        return x >= 0 && x <= 1
          ? (Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1)) /
              betaFunction(alpha, beta)
          : 0;
      }
      case "Log-Normal": {
        const { mean = 0, stdDev = 1 } = params;
        return x > 0 && stdDev > 0
          ? (1 / (x * stdDev * Math.sqrt(2 * Math.PI))) *
              Math.exp(-0.5 * ((Math.log(x) - mean) / stdDev) ** 2)
          : 0;
      }
      case "Logistic": {
        const { mean = 0, scale = 1 } = params;
        const expTerm = Math.exp(-(x - mean) / scale);
        return expTerm / (scale * Math.pow(1 + expTerm, 2));
      }
      case "Binomial": {
        const { trials = 10, probability = 0.5 } = params;
        if (x % 1 === 0 && x >= 0 && x <= trials) {
          return (
            combination(trials, x) *
            Math.pow(probability, x) *
            Math.pow(1 - probability, trials - x)
          );
        }
        return 0;
      }
      case "Pascal": {
        const { successes = 10, probability = 0.5 } = params;
        if (x % 1 === 0 && x >= 0) {
          return (
            combination(x + successes - 1, x) *
            Math.pow(probability, successes) *
            Math.pow(1 - probability, x)
          );
        }
        return 0;
      }
      case "Poisson": {
        const { lambda = 1 } = params;
        return x % 1 === 0 && x >= 0
          ? (Math.pow(lambda, x) * Math.exp(-lambda)) / factorial(x)
          : 0;
      }
      case "Hypergeometric": {
        const { population = 100, successes = 10, draws = 10 } = params;
        return x % 1 === 0 &&
          x >= Math.max(0, draws + successes - population) &&
          x <= Math.min(draws, successes)
          ? (combination(successes, x) *
              combination(population - successes, draws - x)) /
              combination(population, draws)
          : 0;
      }
      default:
        return 0;
    }
  };

   // Helper functions
   const factorialCache = {};
   const factorial = (n) => {
     if (n <= 1) return 1;
     if (factorialCache[n]) return factorialCache[n];
     factorialCache[n] = n * factorial(n - 1);
     return factorialCache[n];
   };
 
   const combination = (n, r) => factorial(n) / (factorial(r) * factorial(n - r));
 
   const betaFunction = (a, b) =>
     (gammaFunction(a) * gammaFunction(b)) / gammaFunction(a + b);
 
   const gammaFunction = (z) => {
     const g = 7;
     const p = [
       0.99999999999980993,
       676.5203681218851,
       -1259.1392167224028,
       771.32342877765313,
       -176.61502916214059,
       12.507343278686905,
       -0.13857109526572012,
       9.9843695780195716e-6,
       1.5056327351493116e-7,
     ];
     if (z < 0.5) {
       return Math.PI / (Math.sin(Math.PI * z) * gammaFunction(1 - z));
     }
     z -= 1;
     let x = p[0];
     for (let i = 1; i < g + 2; i++) {
       x += p[i] / (z + i);
     }
     const t = z + g + 0.5;
     return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
   };
 
   const chartData = generateData();
 
   return (
    <div className="distribution-area">
      <h3>{distribution} Distribution</h3>
      <div className="chart">
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
              tooltip: {
                enabled: true,
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: "X-axis",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Probability Density",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

 export default DistributionArea;