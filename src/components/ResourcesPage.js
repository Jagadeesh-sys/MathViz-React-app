import React from 'react';
import '../styles/ResourcesPage.css';

const ResourcesPage = () => {
  const resources = [
    {
      category: "Algebra",
      resourceCount: "184 Resources",
      icon: "📐", // You should replace these with actual icons/images
      levels: {
        "Upper Elementary (Grades 4-5)": [
          "Algebra as Patterns",
          "Division",
          "Equations",
          "Mathematical Expressions",
          "Multiplication",
          "Order of Operations"
        ],
        "Middle School (Grades 6-8)": [
          "Equations",
          "Functions",
          "Inequalities"
        ]
      }
    },
    {
      category: "Geometry",
      resourceCount: "126 Resources",
      icon: "📏",
      levels: {
        "Upper Elementary (Grades 4-5)": {
          "2D Shapes": [
            "Polygons",
            "Triangles",
            "Quadrilaterals",
            "Circles",
            "Regular vs. Irregular Shapes",
            "Symmetry"
          ],
          "Area": [
            "Rectangle Area",
            "Square Area",
            "Triangle Area",
            "Irregular Shapes",
            "Area Word Problems",
            "Area of Combined Shapes"
          ],
          "Perimeter": [
            "Rectangle Perimeter",
            "Square Perimeter",
            "Triangle Perimeter",
            "Irregular Shapes",
            "Perimeter Word Problems",
            "Circumference Introduction"
          ],
          "Angles": [
            "Types of Angles",
            "Measuring Angles",
            "Adjacent Angles",
            "Complementary Angles",
            "Supplementary Angles",
            "Angles in Shapes"
          ]
        },
        "Middle School (Grades 6-8)": {
          "Transformations": [
            "Translations",
            "Reflections",
            "Rotations",
            "Dilations",
            "Congruence",
            "Similarity",
            "Coordinate Plane Transformations"
          ],
          "Pythagorean Theorem": [
            "Understanding the Theorem",
            "Finding Missing Sides",
            "Real-World Applications",
            "Distance Formula",
            "Pythagorean Triples",
            "Word Problems"
          ],
          "Volume": [
            "Rectangular Prisms",
            "Cubes",
            "Cylinders",
            "Cones",
            "Spheres",
            "Composite Figures"
          ],
          "3D Geometry": [
            "3D Shapes",
            "Surface Area",
            "Cross Sections",
            "Nets of 3D Figures",
            "Edge, Face, Vertex"
          ],
          "Circle Geometry": [
            "Circle Parts",
            "Circumference",
            "Area of Circles",
            "Arc Length",
            "Sector Area",
            "Circle Theorems"
          ],
          "Geometric Reasoning": [
            "Parallel Lines",
            "Perpendicular Lines",
            "Angle Relationships",
            "Triangle Properties",
            "Quadrilateral Properties",
            "Geometric Proofs"
          ]
        }
      }
    },
    {
      category: "Measurement",
      resourceCount: "125 Resources",
      icon: "📏",
      levels: {
        "Upper Elementary (Grades 4-5)": {
          "Length": [
            "Metric Units",
            "Customary Units",
            "Unit Conversion",
            "Measuring Tools",
            "Estimation",
            "Word Problems"
          ],
          "Mass and Weight": [
            "Grams and Kilograms",
            "Pounds and Ounces",
            "Unit Conversion",
            "Real-World Problems",
            "Estimation",
            "Comparison"
          ],
          "Time": [
            "Telling Time",
            "Elapsed Time",
            "Time Zones",
            "Schedules",
            "Calendar",
            "Time Word Problems"
          ],
          "Temperature": [
            "Celsius",
            "Fahrenheit",
            "Unit Conversion",
            "Reading Thermometers",
            "Temperature Changes",
            "Real-World Applications"
          ]
        },
        "Middle School (Grades 6-8)": {
          "Advanced Measurement": [
            "Precision",
            "Accuracy",
            "Significant Figures",
            "Scientific Notation",
            "Complex Conversions",
            "Measurement Error"
          ],
          "Rate and Speed": [
            "Units of Rate",
            "Speed Calculations",
            "Distance-Time Graphs",
            "Average Speed",
            "Acceleration",
            "Rate Word Problems"
          ],
          "Scale and Proportion": [
            "Scale Drawings",
            "Maps and Models",
            "Similar Figures",
            "Scale Factor",
            "Proportional Relationships",
            "Real-World Applications"
          ]
        }
      }
    },
    {
      category: "Number Sense",
      resourceCount: "156 Resources",
      icon: "123",
      levels: {
        "Upper Elementary (Grades 4-5)": {
          "Place Value": [
            "Whole Numbers",
            "Decimals",
            "Reading Numbers",
            "Writing Numbers",
            "Comparing Numbers",
            "Rounding"
          ],
          "Fractions": [
            "Equivalent Fractions",
            "Comparing Fractions",
            "Mixed Numbers",
            "Improper Fractions",
            "Number Line",
            "Real-World Problems"
          ],
          "Decimals": [
            "Place Value",
            "Comparing Decimals",
            "Converting Fractions",
            "Money",
            "Measurement",
            "Word Problems"
          ]
        },
        "Middle School (Grades 6-8)": {
          "Rational Numbers": [
            "Integers",
            "Positive/Negative Numbers",
            "Absolute Value",
            "Number Line",
            "Comparing Numbers",
            "Real-World Applications"
          ],
          "Exponents": [
            "Powers",
            "Square Numbers",
            "Cube Numbers",
            "Scientific Notation",
            "Laws of Exponents",
            "Word Problems"
          ],
          "Number Theory": [
            "Factors",
            "Multiples",
            "Prime Numbers",
            "GCF and LCM",
            "Divisibility Rules",
            "Number Patterns"
          ]
        }
      }
    },
    {
      category: "Operations",
      resourceCount: "182 Resources",
      icon: "➗",
      levels: {
        "Upper Elementary (Grades 4-5)": {
          "Addition & Subtraction": [
            "Multi-Digit Addition",
            "Multi-Digit Subtraction",
            "Mental Math",
            "Estimation",
            "Word Problems",
            "Money Problems"
          ],
          "Multiplication": [
            "Basic Facts",
            "Multi-Digit",
            "Area Model",
            "Properties",
            "Mental Math",
            "Word Problems"
          ],
          "Division": [
            "Basic Facts",
            "Long Division",
            "Remainders",
            "Mental Math",
            "Estimation",
            "Word Problems"
          ]
        },
        "Middle School (Grades 6-8)": {
          "Integer Operations": [
            "Adding Integers",
            "Subtracting Integers",
            "Multiplying Integers",
            "Dividing Integers",
            "Mixed Operations",
            "Word Problems"
          ],
          "Rational Numbers": [
            "Fraction Operations",
            "Decimal Operations",
            "Mixed Numbers",
            "Converting Forms",
            "Complex Fractions",
            "Applications"
          ],
          "Properties": [
            "Commutative",
            "Associative",
            "Distributive",
            "Identity",
            "Zero Property",
            "Applications"
          ]
        }
      }
    },
    {
      category: "Probability and Statistics",
      resourceCount: "70 Resources",
      icon: "🎲",
      levels: {
        "Upper Elementary (Grades 4-5)": {
          "Data Collection": [
            "Surveys",
            "Tally Charts",
            "Frequency Tables",
            "Data Organization",
            "Sample Size",
            "Data Sources"
          ],
          "Graphs": [
            "Bar Graphs",
            "Line Plots",
            "Pictographs",
            "Circle Graphs",
            "Reading Graphs",
            "Creating Graphs"
          ],
          "Central Tendency": [
            "Mean",
            "Median",
            "Mode",
            "Range",
            "Data Analysis",
            "Word Problems"
          ]
        },
        "Middle School (Grades 6-8)": {
          "Probability": [
            "Simple Probability",
            "Compound Events",
            "Tree Diagrams",
            "Experimental Probability",
            "Theoretical Probability",
            "Games of Chance"
          ],
          "Statistics": [
            "Population vs Sample",
            "Random Sampling",
            "Bias",
            "Variability",
            "Box Plots",
            "Scatter Plots"
          ],
          "Data Analysis": [
            "Interpreting Data",
            "Making Predictions",
            "Drawing Conclusions",
            "Statistical Questions",
            "Real-World Applications",
            "Data Projects"
          ]
        }
      }
    }
  ];

  return (
    <div className="resources-page">
      <h1>All Resources</h1>
      <p className="resources-description">
        Explore the wide range of resources created by the Mathviz Content Team to support your students' learning needs
      </p>

      {/* Grid of resource cards */}
      <div className="resources-grid">
        {resources.map((resource, index) => (
          <div key={index} className="resource-card">
            <div className="resource-icon">{resource.icon}</div>
            <div className="resource-info">
              <h2>{resource.category}</h2>
              <p className="resource-count">{resource.resourceCount}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Display detailed view for all resources */}
      {resources.map((resource, index) => (
        <div key={index} className="resource-detail">
          <div className="resource-header">
            <div className="resource-icon large">{resource.icon}</div>
            <h2>{resource.category}</h2>
            <p className="resource-count">{resource.resourceCount}</p>
          </div>

          {resource.levels && Object.entries(resource.levels).map(([level, topics]) => (
            <div key={level} className="level-section">
              <h3>{level}</h3>
              {typeof topics === 'object' && !Array.isArray(topics) ? (
                // Handle nested structure (for topics with subtopics)
                Object.entries(topics).map(([topicName, subtopics]) => (
                  <div key={topicName} className="topic-section">
                    <h4>{topicName}</h4>
                    <div className="topics-grid">
                      {Array.isArray(subtopics) && subtopics.map((subtopic, idx) => (
                        <div key={idx} className="topic-card">
                          <div className="topic-icon">
                            {subtopic.includes('Area') ? '□' :
                             subtopic.includes('Volume') ? '∛' :
                             subtopic.includes('Angle') ? '∠' :
                             subtopic.includes('Circle') ? '⭕' :
                             subtopic.includes('Triangle') ? '△' :
                             subtopic.includes('Square') ? '⬛' :
                             subtopic.includes('Equation') ? '=' :
                             subtopic.includes('Line') ? '📏' : '📐'}
                          </div>
                          <span>{subtopic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Handle flat array structure
                <div className="topics-grid">
                  {Array.isArray(topics) && topics.map((topic, idx) => (
                    <div key={idx} className="topic-card">
                      <div className="topic-icon">
                        {topic.includes('Area') ? '□' :
                         topic.includes('Volume') ? '∛' :
                         topic.includes('Angle') ? '∠' :
                         topic.includes('Circle') ? '⭕' :
                         topic.includes('Triangle') ? '△' :
                         topic.includes('Square') ? '⬛' :
                         topic.includes('Equation') ? '=' :
                         topic.includes('Line') ? '📏' : '📐'}
                      </div>
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ResourcesPage; 