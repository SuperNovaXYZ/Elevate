import { useState } from "react";
import { Chart as ChartJS } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import { LineData } from "../data";
const WeeklyWaterChart = () => {
  const [lineChartData, setLineData] = useState({
    labels: LineData.map((data) => data.day),
    datasets: [
      {
        label: "Weekly Water Report (oz)",
        backgroundColor: [
          "#b87a44",
          "#eeb111",
          "#8cc63f",
          "#569bbe",
          "#247ba0",
          "#34b233",
          "#dc4cdc",
        ],
        data: LineData.map((data) => data.oz),
      },
    ],
  });
  return (
    <>
      <Line data={lineChartData} />
    </>
  );
};

export default WeeklyWaterChart;
