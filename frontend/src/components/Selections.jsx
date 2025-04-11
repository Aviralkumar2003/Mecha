import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Selections() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const today = new Date().toISOString().split("T")[0];

  const [product, setSelectedProduct] = useState(searchParams.get("product") || "");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || today);
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || today);

  useEffect(() => {
    const params = new URLSearchParams();
    if (product) params.set("product", product);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    navigate(`?${params.toString()}`, { replace: true });
  }, [product, startDate, endDate]);

  const handleProductChange = (e) => setSelectedProduct(e.target.value);
  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  const productOptions = [
    "Air Filter", "Alternator", "Battery", "Brake Pad", "Coolant",
    "Disc Rotor", "Engine Oil", "Fans", "Fuse", "LED", "Radiator",
    "Rearview Mirror", "Resistors", "Sensor", "Sideview Mirror",
    "Spark Plugs", "Thermostat", "Water Pump", "Windshield", "Wires"
  ];

  return (
    <div className="p-3 flex justify-between items-center shadow-lg bg-white border border-gray-200 rounded-xl">

      <div>
        <select
          value={product}
          onChange={handleProductChange}
          className="bg-gray-100 rounded px-2 py-1 cursor-pointer text-black"
        >
          <option value="">Select Spare Part</option>
          {productOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col justify-center items-center text-black">
        <label className="font-semibold">Start Date</label>
        <input type="date" value={startDate} onChange={handleStartDateChange} className="border rounded px-2 py-1" />
      </div>

      <div className="flex flex-col justify-center items-center text-black">
        <label className="font-semibold">End Date</label>
        <input type="date" value={endDate} onChange={handleEndDateChange} className="border rounded px-2 py-1" />
      </div>
    </div>
  );
}
