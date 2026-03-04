// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const yearSelect = document.getElementById("yearSelect");
const titleSelect = document.getElementById("titleSelect");
const genreSelect = document.getElementById("genreSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const years = [...new Set(chartData.map(r => r.year))];
const titles = [...new Set(chartData.map(r => r.title))];

years.forEach(m => yearSelect.add(new Option(m, m)));
titles.forEach(h => titleSelect.add(new Option(h, h)));

yearSelect.value = years[0];
titleSelect.value = titles[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const year = Number(yearSelect.value);
  const title = titleSelect.value;
  const genre = genreSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { year, title, genre });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, title, genre }) {
  if (type === "bar") return barByNeighborhood(year, genre);
  if (type === "line") return lineOverTime(title);
  if (type === "scatter") return scatterTripsVsTemp(title);
  if (type === "doughnut") return doughnutMemberVsCasual(year, title);
  if (type === "radar") return radarCompareNeighborhoods(year);
  return barByNeighborhood(year, title);
}

// Task A: BAR — compare neighborhoods for a given month
function barByNeighborhood(year, genre) {
  const rows = chartData.filter(r => r.year === year);

  const labels = rows.map(r => r.title);
  const values = rows.map(r => r.unitsM);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${genre} sales (Millions) in ${year}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Title comparison (${year})` }
      },
      scales: {
        y: { title: { display: true, text: "Units Sold (Millions)" } },
        x: { title: { display: true, text: "Game Title" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one game title (units vs revenue)
function lineOverTime(title) {
  const rows = chartData.filter(r => r.title === title).sort((a, b) => a.year - b.year);

  const labels = rows.map(r => r.year);

  const datasets = [
    {
      label: "Units Sold (Millions)",
      data: rows.map(r => r.unitsM),
      yAxisID: "y"
    },
    {
      label: "Revenue (USD Millions)",
      data: rows.map(r => r.revenueUSD),
      yAxisID: "y1"
    }
  ];

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Sales Trend Over Time: ${title}` }
      },
      scales: {
        y: { 
          type: "linear",
          display: true,
          position: "left",
          title: { display: true, text: "Units (Millions)" }
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: { display: true, text: "Revenue (USD Millions)" },
          beginAtZero: true
        },
        x: { title: { display: true, text: "Year" } }
      }
    }
  };
}

// SCATTER — relationship between units sold and revenue for a title
function scatterTripsVsTemp(title) {
  const rows = chartData.filter(r => r.title === title);

  const points = rows.map(r => ({ x: r.unitsM, y: r.revenueUSD }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `${title} Analysis`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Units vs Revenue: ${title}` }
      },
      scales: {
        x: { title: { display: true, text: "Units Sold (Millions)" } },
        y: { title: { display: true, text: "Revenue (USD Millions)" } }
      }
    }
  };
}

// DOUGHNUT — platform distribution for one title and year
function doughnutMemberVsCasual(year, title) {
  const rows = chartData.filter(r => r.year === year && r.title === title);

  const platforms = [...new Set(rows.map(r => r.platform))];
  const data = platforms.map(p => {
    const total = rows.filter(r => r.platform === p).reduce((sum, r) => sum + r.unitsM, 0);
    return total;
  });

  return {
    type: "doughnut",
    data: {
      labels: platforms.map(p => `${p}`),
      datasets: [{ label: "Units by Platform (Millions)", data: data }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Platform Distribution: ${title} (${year})` }
      }
    }
  };
}

// RADAR — compare game titles across key metrics for one year
function radarCompareNeighborhoods(year) {
  const rows = chartData.filter(r => r.year === year);
  const uniqueTitles = [...new Set(rows.map(r => r.title))];

  const metrics = ["unitsM", "revenueUSD", "reviewScore", "priceUSD"];
  const metricLabels = ["Units (M)", "Revenue (M)", "Review Score", "Price ($)"];

  const datasets = uniqueTitles.map(title => {
    const titleRows = rows.filter(r => r.title === title);
    const avgData = metrics.map(m => {
      const values = titleRows.map(r => r[m]);
      return values.reduce((a, b) => a + b, 0) / values.length;
    });
    return {
      label: title,
      data: avgData
    };
  });

  return {
    type: "radar",
    data: { labels: metricLabels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Game Titles Comparison (${year})` }
      }
    }
  };
}