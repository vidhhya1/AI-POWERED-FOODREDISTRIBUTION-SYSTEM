import os
import pandas as pd
import joblib
from prophet import Prophet
from pathlib import Path

# ✅ Directory to store model files
MODEL_DIR = Path(__file__).resolve().parent / "model_store"
MODEL_DIR.mkdir(exist_ok=True)

# ✅ Get training data from both fulfilled requests AND user-submitted data
def get_training_data():
    from foodredistribution.models import FoodRequest  # lazy import
    from demand.models import DemandDataPoint  # ✅ custom user submissions
    from django.utils import timezone
    from datetime import timedelta

    # --- Source 1: Fulfilled FoodRequests ---
    request_qs = FoodRequest.objects.select_related('location').filter(
        status='fulfilled',
        location_city_isnull=False,
        request_date__gte=timezone.now() - timedelta(days=30)
    ).values('location__city', 'request_date', 'quantity')

    request_df = pd.DataFrame(request_qs)
    if not request_df.empty:
        request_df['source'] = 'foodrequest'
        request_df['city'] = request_df['location__city']
        request_df['date'] = pd.to_datetime(request_df['request_date']).dt.date
        request_df['quantity'] = request_df['quantity']
        request_df = request_df[['city', 'date', 'quantity', 'source']]

    # --- Source 2: DemandDataPoint (manual) ---
    custom_qs = DemandDataPoint.objects.all().values('city', 'date', 'request_volume')
    custom_df = pd.DataFrame(custom_qs)
    if not custom_df.empty:
        custom_df['source'] = 'manual'
        custom_df['quantity'] = custom_df['request_volume']
        custom_df = custom_df[['city', 'date', 'quantity', 'source']]

    # --- Merge both sources ---
    if not request_df.empty and not custom_df.empty:
        combined_df = pd.concat([request_df, custom_df])
    elif not request_df.empty:
        combined_df = request_df
    elif not custom_df.empty:
        combined_df = custom_df
    else:
        return pd.DataFrame()

    return combined_df

# ✅ Train & save models for each city
def train_and_save_models():
    df = get_training_data()

    if df.empty:
        print("❌ No data to train on!")
        return

    print("✅ Training data loaded:")
    print(df.head())

    unique_cities = df['city'].dropna().unique()
    print("📍 Found cities:", unique_cities)

    for city in unique_cities:
        print(f"\n🚀 Training model for: {city}")
        city_df = df[df['city'] == city].copy()
        grouped = city_df.groupby('date')['quantity'].sum().reset_index()
        grouped.columns = ['ds', 'y']

        print(f"🧪 {len(grouped)} rows in grouped data:")
        print(grouped.head())

        if len(grouped) >= 2:
            model = Prophet()
            model.fit(grouped)
            filename = f"{city.replace(' ', '_')}.pkl"
            model_path = MODEL_DIR / filename
            joblib.dump(model, model_path)
            print(f"✅ Model saved at: {model_path}")
        else:
            print(f"⚠ Not enough data for {city} (need ≥ 2 days, got {len(grouped)})")

# ✅ Load model for prediction
def load_model(city):
    path = MODEL_DIR / f"{city}.pkl"
    if os.path.exists(path):
        return joblib.load(path)
    return None

# ✅ Forecast demand
def forecast_demand(city, days=7):
    model = load_model(city)
    if not model:
        return []
    future = model.make_future_dataframe(periods=days)
    forecast = model.predict(future)
    return forecast[['ds', 'yhat']].tail(days)