import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PredictionChart() {
  const [searchParams] = useSearchParams();
  const { store } = useParams();

  const [forecastData, setForecastData] = useState(null);
  const [selectedInterval, setSelectedInterval] = useState("weekly");
  const [showPredicted, setShowPredicted] = useState(true);
  const [showMin, setShowMin] = useState(true);
  const [showMax, setShowMax] = useState(true);

  const product = searchParams.get("product") || "None";
  const startDate = searchParams.get("startDate") || "Not selected";
  const endDate = searchParams.get("endDate") || "Not selected";

  useEffect(() => {
    if (!product || product === "None") return;

    async function fetchForecast() {
      try {
        const response = await fetch("http://127.0.0.1:5000/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            store_id: store,
            product_name: product,
            start_date: startDate,
            end_date: endDate,
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch forecast data");
        const result = await response.json();
        setForecastData(result);
      } catch (error) {
        console.error("Error fetching forecast:", error);
      }
    }

    fetchForecast();
  }, [store, product, startDate, endDate]);

  // Instead of filtering out data points, this function now determines which date labels to show
  const getVisibleDateIndices = (allDates, interval) => {
    if (!allDates || allDates.length === 0) return [];

    const indices = [];
    
    switch (interval) {
      case "weekly":
        // Show labels for every 7th date
        for (let i = 0; i < allDates.length; i += 7) {
          indices.push(i);
        }
        break;
      case "monthly":
        // Show labels for dates that are the 1st of the month
        allDates.forEach((date, index) => {
          if (new Date(date).getDate() === 1) {
            indices.push(index);
          }
        });
        break;
      case "quarterly":
        // Show labels for dates that are the 1st of quarters (Jan, Apr, Jul, Oct)
        allDates.forEach((date, index) => {
          const month = new Date(date).getMonth();
          if (month === 0 || month === 3 || month === 6 || month === 9) {
            indices.push(index);
          }
        });
        break;
      default:
        // Show all labels by default
        return allDates.map((_, index) => index);
    }

    return indices;
  };

  const prepareChartData = () => {
    if (!forecastData || !forecastData.predicted_sales || product === "None") return null;

    const allDates = forecastData.predicted_sales.map(item => item.date);
    // Get indices of dates that should have visible labels
    const visibleDateIndices = getVisibleDateIndices(allDates, selectedInterval);

    // Create formatted labels - show dates at specified indices, empty strings at others
    const formattedLabels = allDates.map((date, index) => 
      visibleDateIndices.includes(index) ? date : ""
    );

    // Use all data points, not filtered ones
    const predictedValues = forecastData.predicted_sales.map(item => item.predicted);
    const minRange = forecastData.predicted_sales.map(item => item.lower_bound);
    const maxRange = forecastData.predicted_sales.map(item => item.upper_bound);

    const actualSales = forecastData.predicted_sales.map(item => {
      const actualEntry = forecastData.actual_sales?.find(a => a.date === item.date);
      return actualEntry ? actualEntry.actual : null;
    });

    const datasets = [];

    datasets.push({
      label: "Actual Sales",
      data: actualSales,
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.1)",
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: "rgb(255, 99, 132)",
      fill: false,
    });

    if (showPredicted) {
      datasets.push({
        label: "Predicted Sales",
        data: predictedValues,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        tension: 0.4,
        pointRadius: 0,
        fill: true,
      });
    }

    if (showMin) {
      datasets.push({
        label: "Minimum Required Units",
        data: minRange,
        borderColor: "rgb(255, 206, 86)",
        backgroundColor: "rgba(255, 206, 86, 0.1)",
        tension: 0.4,
        pointRadius: 0,
        fill: true,
      });
    }

    if (showMax) {
      datasets.push({
        label: "Maximum Required Units",
        data: maxRange,
        borderColor: "rgb(54, 162, 235)",
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        tension: 0.4,
        pointRadius: 0,
        fill: true,
      });
    }
    
    return {
      labels: formattedLabels,
      datasets: datasets,
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Sales Forecast for ${product} in ${store}`,
        font: { size: 18 },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(tooltipItems) {
            // Get the actual date from allDates using the index
            const dataIndex = tooltipItems[0].dataIndex;
            return forecastData?.predicted_sales[dataIndex]?.date || 'Unknown Date';
          },
          label: function (tooltipItem) {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw?.toFixed(2) || 'N/A'}`;
          }
        }
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Date" },
        grid: { display: false },
        ticks: {
          autoSkip: false,
          align: 'start',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        title: { display: true, text: "Sales" },
        grid: { color: "rgba(200, 200, 200, 0.3)" },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    }
  };

  const calculateFutureUnits = () => {
    if (!forecastData || !forecastData.predicted_sales || product === "None") return null;
    const today = new Date("2024-01-01");
    if (new Date(endDate) <= today) return null;

    const futureSales = forecastData.predicted_sales.filter(item => new Date(item.date) >= today && new Date(item.date) <= new Date(endDate));
    if (futureSales.length === 0) return null;

    var minRequiredUnits = futureSales.reduce((sum, item) => sum + item.lower_bound, 0);
    var maxRequiredUnits = futureSales.reduce((sum, item) => sum + item.upper_bound, 0);    

    minRequiredUnits += minRequiredUnits * 0.1;
    maxRequiredUnits += maxRequiredUnits * 0.1;

    if (minRequiredUnits < 0) minRequiredUnits = 0;
    if (maxRequiredUnits < 0) maxRequiredUnits = 0;

    return { minRequiredUnits, maxRequiredUnits };
  };

  const futureUnits = calculateFutureUnits();

  return ( <div className="m-4 p-6 rounded-xl bg-white shadow-md border border-gray-200 flex flex-col gap-8"> <div className="flex-1 space-y-4"> <div className="flex items-center space-x-3"> <label htmlFor="interval" className="text-lg font-semibold">Interval:</label>
  <select
    id="interval"
    value={selectedInterval}
    onChange={e => setSelectedInterval(e.target.value)}
    className="p-2 border rounded-md outline-none focus:ring-2 focus:ring-[#31837A]"
  > <option value="weekly">Weekly</option> <option value="monthly">Monthly</option> <option value="quarterly">Quarterly</option> </select>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="predicted"
          checked={showPredicted}
          onChange={(e) => setShowPredicted(e.target.checked)}
        />
        <label htmlFor="predicted" className="text-sm">
          Predicted Sales
        </label>
        <input
          type="checkbox"
          id="min"
          checked={showMin}
          onChange={(e) => setShowMin(e.target.checked)}
        />
        <label htmlFor="min" className="text-sm">
          Minimum Required Units
        </label>
        <input
          type="checkbox"
          id="max"
          checked={showMax}
          onChange={(e) => setShowMax(e.target.checked)}
        />
        <label htmlFor="max" className="text-sm">
          Maximum Required Units
        </label>
      </div>
    </div>

    {product !== "None" && forecastData && prepareChartData() && (
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-6">
        <h2 className="text-2xl font-bold text-[#09243A] text-center">Forecast Summary</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800">
  <div className="space-y-2">
    <p><span className="font-semibold">Product:</span> {product}</p>
    <p><span className="font-semibold">Store Location:</span> {store}</p>
    <p><span className="font-semibold">Start Date:</span> {startDate}</p>
    <p><span className="font-semibold">End Date:</span> {endDate}</p>
  </div>
  <div className="space-y-2">
    <p><span className="font-semibold">Forecast Interval:</span> {selectedInterval}</p>
    <p><span className="font-semibold">Min Required Units:</span> {futureUnits ? Math.round(futureUnits.minRequiredUnits) : "N/A"} units</p>
    <p><span className="font-semibold">Max Required Units:</span> {futureUnits ? Math.round(futureUnits.maxRequiredUnits) : "N/A"} units</p>
  </div>
</div>
      </div>
    )}

    {forecastData && prepareChartData() && (
      <Line
        className="min-w-[1080px] max-h-[500px] animate-fadeIn"
        data={prepareChartData()}
        options={chartOptions}
      />
    )}
  </div>
</div>
  );
}