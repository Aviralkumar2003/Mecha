import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [selectedStore, setSelectedStore] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const stores = [
    { label: "S001 - East", value: "S001" },
    { label: "S002 - North", value: "S002" },
    { label: "S003 - South", value: "S003" },
    { label: "S004 - West", value: "S004" },
    { label: "S005 - South", value: "S005" },
    { label: "All", value: "All" },
  ];

  const handleStoreChange = (e) => {
    const store = e.target.value;
    setSelectedStore(store);
    if (store === "All") {
      navigate("/clusterAnalysis");
    } else {
      const params = new URLSearchParams(location.search);
      navigate(`/${store}?${params.toString()}`);
    }
  };

  return (
    <nav className="bg-[#09243A] shadow-md">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo + Brand */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo navbar.png"
            alt="CDK Logo"
            className="h-8 w-auto max-w-[120px] object-contain"
          />
          <span className="text-2xl font-bold text-white tracking-wide">
            Mecha
          </span>
        </Link>

        {/* Store Dropdown */}
        <div>
          <select
            value={selectedStore}
            onChange={handleStoreChange}
            className="bg-[#123B5A] text-white border border-[#1B4D6D] rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#afafaf] shadow-sm hover:bg-[#1a425e] transition"
          >
            <option value="">Select Store</option>
            {stores.map((store) => (
              <option key={store.value} value={store.value}>
                {store.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
