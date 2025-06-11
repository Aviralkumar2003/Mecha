from flask import Flask, request, jsonify # type: ignore
import pandas as pd # type: ignore
from prophet import Prophet # type: ignore
from flask_cors import CORS # type: ignore
from sklearn.cluster import KMeans # type: ignore
from sklearn.metrics import silhouette_score # type: ignore
import numpy as np # type: ignore

app = Flask(__name__)
CORS(app) 

df = pd.read_csv("backend/data.csv")
df['Date'] = pd.to_datetime(df['Date'], format='%Y-%m-%d')
df = df.set_index('Date', drop=True)
df_inventory=df.copy()
df_inventory['Inventory Level'] = df_inventory['EWMA']*1.5

category_sales = df.groupby(['Category', 'Store ID'])['EWMA'].sum().reset_index()


label_mappings = {
    "Store ID": {
        "S001": 0, "S002": 1, "S003": 2, "S004": 3, "S005": 4
    },
    "Product Name": {
        "Air Filter": 0, "Alternator": 1, "Battery": 2, "Brake Pad": 3, "Coolant": 4,
        "Disc Rotor": 5, "Engine Oil": 6, "Fans": 7, "Fuse": 8, "LED": 9,
        "Radiator": 10, "Rearview Mirror": 11, "Resistors": 12, "Sensor": 13,
        "Sideview Mirror": 14, "Spark Plugs": 15, "Thermostat": 16, "Water Pump": 17,
        "Windshield": 18, "Wires": 19
    },
    "Category": {
        "Accessories": 0, "Breaks": 1, "Cooling System": 2, "Electrical": 3, "Engine": 4
    },
    "Region": {
        "East": 0, "North": 1, "South": 2, "West": 3
    }
}

@app.route('/forecast', methods=['POST'])
def forecast_sales():
    try:
        data = request.get_json()
        store_id = data.get("store_id")
        product_name = data.get("product_name")
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        store_id_encoded = label_mappings['Store ID'].get(store_id)
        product_name_encoded = label_mappings['Product Name'].get(product_name)

        if store_id_encoded is None or product_name_encoded is None:
            return jsonify({"error": "Invalid Store ID or Product Name"}), 400

        store_product_filter = (df["Store ID"] == store_id_encoded) & (df["Product Name"] == product_name_encoded)
        df_filtered = df[store_product_filter].copy()

        df_inventory_filtered = (df_inventory["Store ID"] == store_id_encoded) & (df_inventory["Product Name"] == product_name_encoded)
        df_inventory_filtered = df_inventory_filtered.reset_index()

        if df_filtered.empty:
            return jsonify({"error": "No data available for given store and product"}), 404

        df_prophet = df_filtered.reset_index().rename(columns={'Date': 'ds', 'EWMA': 'y'})
        df_prophet['ds'] = pd.to_datetime(df_prophet['ds'])

        model = Prophet()
        model.fit(df_prophet)

        future = model.make_future_dataframe(periods=365, freq='D')
        forecast = model.predict(future)

        forecast_filtered = forecast[(forecast["ds"] >= start_date) & (forecast["ds"] <= end_date)]
        actual_filtered = df_prophet[(df_prophet["ds"] >= start_date) & (df_prophet["ds"] <= end_date)]

        actual_sales = [
            {"date": row["ds"].strftime("%Y-%m-%d"), 
            "actual": row["y"]} 
            for _, row in actual_filtered.iterrows()
        ]

        predicted_sales = [
            {"date": row["ds"].strftime("%Y-%m-%d"), 
            "predicted": row["yhat"], 
            "lower_bound": row["yhat_lower"], 
            "upper_bound": row["yhat_upper"]}
            for _, row in forecast_filtered.iterrows()
        ]
        

        return jsonify({
            "store_id": store_id,
            "product_name": product_name,
            "actual_sales": actual_sales,
            "predicted_sales": predicted_sales
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/clustering', methods=['GET'])
def clustering():
    try:
        X = category_sales[['EWMA']].values        

        inertia = []
        for k in range(1, 6):
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(X)
            inertia.append(kmeans.inertia_)

        optimal_k = np.diff(inertia).argmin() + 2

        kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
        category_sales['Cluster'] = kmeans.fit_predict(X)

        cluster_data = []
        for _, row in category_sales.iterrows():
            cluster_data.append({
                "category": row['Category'],
                "store_id": int(row['Store ID']),
                "sales": row['EWMA'],
                "cluster": int(row['Cluster'])
            })

        return jsonify({"clusters": cluster_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
