import React, { useState } from "react";
import "../styles/DistributionBar.css";

const DistributionBar = ({ onUpdate = () => {} }) => {
  const [distribution, setDistribution] = useState("Normal");
  const [parameters, setParameters] = useState({});

  const handleDistributionChange = (e) => {
    const selectedDistribution = e.target.value;
    setDistribution(selectedDistribution);

    // Reset parameters based on distribution
    setParameters(getDefaultParameters(selectedDistribution));
  };

  const handleParameterChange = (e) => {
    const { name, value } = e.target;
    setParameters((prevParams) => ({
      ...prevParams,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleUpdateClick = () => {
    onUpdate(distribution, parameters);
  };

  const getDefaultParameters = (dist) => {
    switch (dist) {
      case "Normal":
        return { mean: 0, stdDev: 1 };
      case "Student":
        return { degreesOfFreedom: 1 };
      case "Chi-Squared":
        return { degreesOfFreedom: 1 };
      case "F-Distribution":
        return { d1: 1, d2: 1 };
      case "Exponential":
        return { rate: 1 };
      case "Cauchy":
        return { x0: 0, gamma: 1 };
      case "Weibull":
        return { scale: 1, shape: 1 };
      case "Gamma":
        return { shape: 1, scale: 1 };
      case "Beta":
        return { alpha: 1, beta: 1 };
      case "Log-Normal":
        return { mean: 0, stdDev: 1 };
      case "Logistic":
        return { mean: 0, scale: 1 };
      case "Binomial":
        return { trials: 10, probability: 0.5 };
      case "Pascal":
        return { successes: 1, probability: 0.5 };
      case "Poisson":
        return { lambda: 1 };
      case "Hypergeometric":
        return { population: 100, successes: 10, draws: 10 };
      default:
        return {};
    }
  };

  const renderParameterInputs = () => {
    switch (distribution) {
      case "Normal":
      case "Log-Normal":
        return (
          <>
            <div className="parameter-field">
              <label htmlFor="mean">Mean:</label>
              <input
                type="number"
                id="mean"
                name="mean"
                value={parameters.mean || ""}
                onChange={handleParameterChange}
              />
            </div>
            <div className="parameter-field">
              <label htmlFor="stdDev">Standard Deviation:</label>
              <input
                type="number"
                id="stdDev"
                name="stdDev"
                min="0"
                value={parameters.stdDev || ""}
                onChange={handleParameterChange}
              />
            </div>
          </>
        );
      case "Student":
      case "Chi-Squared":
        return (
          <div className="parameter-field">
            <label htmlFor="degreesOfFreedom">Degrees of Freedom:</label>
            <input
              type="number"
              id="degreesOfFreedom"
              name="degreesOfFreedom"
              min="1"
              value={parameters.degreesOfFreedom || ""}
              onChange={handleParameterChange}
            />
          </div>
        );
      case "F-Distribution":
        return (
          <>
            <div className="parameter-field">
              <label htmlFor="d1">Degrees of Freedom (d1):</label>
              <input
                type="number"
                id="d1"
                name="d1"
                min="1"
                value={parameters.d1 || ""}
                onChange={handleParameterChange}
              />
            </div>
            <div className="parameter-field">
              <label htmlFor="d2">Degrees of Freedom (d2):</label>
              <input
                type="number"
                id="d2"
                name="d2"
                min="1"
                value={parameters.d2 || ""}
                onChange={handleParameterChange}
              />
            </div>
          </>
        );
      case "Exponential":
        return (
          <div className="parameter-field">
            <label htmlFor="rate">Rate (λ):</label>
            <input
              type="number"
              id="rate"
              name="rate"
              min="0"
              value={parameters.rate || ""}
              onChange={handleParameterChange}
            />
          </div>
        );
      case "Cauchy":
        return (
          <>
            <div className="parameter-field">
              <label htmlFor="x0">Location (x0):</label>
              <input
                type="number"
                id="x0"
                name="x0"
                value={parameters.x0 || ""}
                onChange={handleParameterChange}
              />
            </div>
            <div className="parameter-field">
              <label htmlFor="gamma">Scale (γ):</label>
              <input
                type="number"
                id="gamma"
                name="gamma"
                min="0"
                value={parameters.gamma || ""}
                onChange={handleParameterChange}
              />
            </div>
          </>
        );
      case "Weibull":
      case "Gamma":
        return (
          <>
            <div className="parameter-field">
              <label htmlFor="scale">Scale:</label>
              <input
                type="number"
                id="scale"
                name="scale"
                min="0"
                value={parameters.scale || ""}
                onChange={handleParameterChange}
              />
            </div>
            <div className="parameter-field">
              <label htmlFor="shape">Shape:</label>
              <input
                type="number"
                id="shape"
                name="shape"
                min="0"
                value={parameters.shape || ""}
                onChange={handleParameterChange}
              />
            </div>
          </>
        );
      case "Beta":
        return (
          <>
            <div className="parameter-field">
              <label htmlFor="alpha">Alpha:</label>
              <input
                type="number"
                id="alpha"
                name="alpha"
                min="0"
                value={parameters.alpha || ""}
                onChange={handleParameterChange}
              />
            </div>
            <div className="parameter-field">
              <label htmlFor="beta">Beta:</label>
              <input
                type="number"
                id="beta"
                name="beta"
                min="0"
                value={parameters.beta || ""}
                onChange={handleParameterChange}
              />
            </div>
          </>
        );
      case "Binomial":
      case "Pascal":
        return (
          <>
            <div className="parameter-field">
              <label htmlFor="trials">Number of Trials:</label>
              <input
                type="number"
                id="trials"
                name="trials"
                min="1"
                value={parameters.trials || ""}
                onChange={handleParameterChange}
              />
            </div>
            <div className="parameter-field">
              <label htmlFor="probability">Probability of Success:</label>
              <input
                type="number"
                id="probability"
                name="probability"
                step="0.01"
                min="0"
                max="1"
                value={parameters.probability || ""}
                onChange={handleParameterChange}
              />
            </div>
          </>
        );
      case "Hypergeometric":
        return (
          <>
            <div className="parameter-field">
              <label htmlFor="population">Population Size:</label>
              <input
                type="number"
                id="population"
                name="population"
                min="1"
                value={parameters.population || ""}
                onChange={handleParameterChange}
              />
            </div>
            <div className="parameter-field">
              <label htmlFor="successes">Number of Successes:</label>
              <input
                type="number"
                id="successes"
                name="successes"
                min="0"
                value={parameters.successes || ""}
                onChange={handleParameterChange}
              />
            </div>
            <div className="parameter-field">
              <label htmlFor="draws">Number of Draws:</label>
              <input
                type="number"
                id="draws"
                name="draws"
                min="0"
                value={parameters.draws || ""}
                onChange={handleParameterChange}
              />
            </div>
          </>
        );
      case "Poisson":
        return (
          <div className="parameter-field">
            <label htmlFor="lambda">Lambda (λ):</label>
            <input
              type="number"
              id="lambda"
              name="lambda"
              min="0"
              value={parameters.lambda || ""}
              onChange={handleParameterChange}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="distribution-bar">
      <div className="distribution-title">Distribution Settings</div>
      <div className="distribution-select">
        <label htmlFor="distributionType">Distribution Type:</label>
        <select
          id="distributionType"
          value={distribution}
          onChange={handleDistributionChange}
        >
          {[
            "Normal",
            "Student",
            "Chi-Squared",
            "F-Distribution",
            "Exponential",
            "Cauchy",
            "Weibull",
            "Gamma",
            "Beta",
            "Log-Normal",
            "Logistic",
            "Binomial",
            "Pascal",
            "Poisson",
            "Hypergeometric",
          ].map((dist) => (
            <option key={dist} value={dist}>
              {dist}
            </option>
          ))}
        </select>
      </div>
      <div className="distribution-parameters">{renderParameterInputs()}</div>
      <button className="update-button" onClick={handleUpdateClick}>
        Update
      </button>
    </div>
  );
};

export default DistributionBar;
