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
  const year = yearSelect.value;
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
  if (type === "line") return lineOverTime(title, ["racing", "revenueUSD"]);
  if (type === "scatter") return scatterTripsVsTemp(title);
  if (type === "doughnut") return doughnutMemberVsCasual(year, title);
  if (type === "radar") return radarCompareNeighborhoods(year);
  return barByNeighborhood(year, title);
}

// Task A: BAR — compare neighborhoods for a given month
function barByNeighborhood(year, genre) {
  const rows = chartData.filter(r => r.year === year);

  const labels = rows.map(r => r.title);
  const values = rows.map(r => r[genre]);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${genre} in ${year}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Title comparison (${year})` }
      },
      scales: {
        y: { title: { display: true, text: genre } },
        x: { title: { display: true, text: "Title" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one neighborhood (2 datasets)
function lineOverTime(title, genre) {
  const rows = chartData.filter(r => r.title === title);

  const labels = rows.map(r => r.year);

  const datasets = genre.map(m => ({
    label: m,
    data: rows.map(r => r[m])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${title}` }
      },
      scales: {
        y: { title: { display: true, text: "Value" } },
        x: { title: { display: true, text: "Year" } }
      }
    }
  };
}

// SCATTER — relationship between temperature and trips
function scatterTripsVsTemp(title) {
  const rows = chartData.filter(r => r.title === title);

  const points = rows.map(r => ({ x: r.sim, y: r.racing }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `Racing vs Sim (${title})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does temperature affect trips? (${title})` }
      },
      scales: {
        x: { title: { display: true, text: "Sim" } },
        y: { title: { display: true, text: "Racing" } }
      }
    }
  };
}

// DOUGHNUT — member vs casual share for one title + month
function doughnutMemberVsCasual(year, title) {
  const row = chartData.find(r => r.year === year && r.title === title);

  const member = Math.round(row.memberShare * 100);
  const casual = 100 - member;

  return {
    type: "doughnut",
    data: {
      labels: ["Members (%)", "Casual (%)"],
      datasets: [{ label: "Rider mix", data: [member, casual] }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Rider mix: ${title} (${year})` }
      }
    }
  };
}

// RADAR — compare neighborhoods across multiple metrics for one month
function radarCompareNeighborhoods(year) {
  const rows = chartData.filter(r => r.year === year);

  const metrics = ["racing", "rpg", "sandBox", "shooter"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.title,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metric comparison (${year})` }
      }
    }
  };
}