import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="w-full">
      <div className="relative h-screen w-full">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/backgorund.jpg')",
          }}
        ></div>

        <div className="absolute inset-0 bg-black opacity-60"></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-7xl font-extrabold text-center drop-shadow-lg"
          >
            Welcome to Project Mecha
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-lg md:text-2xl mt-4 text-center max-w-2xl"
          >
            An intelligent inventory forecasting tool for car dealerships.
          </motion.p>

          <a href="#features" className="mt-10">
            <button className="bg-white text-[#31837A] font-semibold px-6 py-2 rounded-full shadow hover:bg-gray-100 transition">
              ↓ Explore Features
            </button>
          </a>
        </div>
      </div>

      <div id="features" className="bg-white py-20 px-6 md:px-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold text-center mb-12 text-gray-800"
        >
          Features of Project Mecha
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <motion.div
            className="bg-[#f1f5f9] p-6 rounded-lg shadow hover:shadow-lg transition"
            whileHover={{ scale: 1.03 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-2 text-[#31837A]">
              Smart Restocking
            </h3>
            <p>
              Automatically calculates restocking quantities based on usage
              frequency and demand trends.
            </p>
          </motion.div>
          <motion.div
            className="bg-[#f1f5f9] p-6 rounded-lg shadow hover:shadow-lg transition"
            whileHover={{ scale: 1.03 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold mb-2 text-[#31837A]">
              Make Predictions
            </h3>
            <p>
              Forecast future spare part demand using ML models like Prophet
              with real-time data inputs.
            </p>
          </motion.div>
          <motion.div
            className="bg-[#f1f5f9] p-6 rounded-lg shadow hover:shadow-lg transition"
            whileHover={{ scale: 1.03 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold mb-2 text-[#31837A]">
              Cluster Analysis
            </h3>
            <p>
              Group and analyze parts by sales behavior to identify key trends
              using KMeans clustering.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="bg-[#f8fafc] py-16 px-6 md:px-20 text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Ready to explore your inventory?
        </h3>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">
          Check out forecasts and cluster insights to make better restocking
          decisions today.
        </p>
        <a href="/clusterAnalysis">
          <button className="bg-[#31837A] hover:bg-[#256b61] text-white font-semibold px-6 py-3 rounded-full shadow transition">
            Try Cluster Analysis
          </button>
        </a>
      </div>

      <footer className="bg-[#0F172A] text-white text-center py-4">
        <p className="text-sm">CDK Academia Project © 2025 | Team MIT ADT</p>
      </footer>
    </div>
  );
}
