import os
import requests
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv
import schedule
import time

# Load environment variables
load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/eco-platform')

# API Configuration - Using Open-Meteo (free, no API key required)
USE_OPENAQ = os.getenv('USE_OPENAQ', 'false').lower() == 'true'
OPENAQ_API_URL = os.getenv('OPENAQ_API_URL', 'https://api.openaq.org/v3')
OPENAQ_API_KEY = os.getenv('OPENAQ_API_KEY', '')
OPENMETEO_API_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'

# Major cities to monitor with coordinates (for Open-Meteo)
CITIES = [
    {'city': 'Delhi', 'country': 'IN', 'lat': 28.6139, 'lon': 77.2090},
    {'city': 'Beijing', 'country': 'CN', 'lat': 39.9042, 'lon': 116.4074},
    {'city': 'London', 'country': 'GB', 'lat': 51.5074, 'lon': -0.1278},
    {'city': 'New York', 'country': 'US', 'lat': 40.7128, 'lon': -74.0060},
    {'city': 'Tokyo', 'country': 'JP', 'lat': 35.6762, 'lon': 139.6503},
    {'city': 'Paris', 'country': 'FR', 'lat': 48.8566, 'lon': 2.3522},
    {'city': 'Mumbai', 'country': 'IN', 'lat': 19.0760, 'lon': 72.8777},
    {'city': 'Los Angeles', 'country': 'US', 'lat': 34.0522, 'lon': -118.2437},
    {'city': 'Shanghai', 'country': 'CN', 'lat': 31.2304, 'lon': 121.4737},
    {'city': 'Sao Paulo', 'country': 'BR', 'lat': -23.5505, 'lon': -46.6333}
]

def calculate_aqi(pm25, pm10):
    """Calculate AQI based on PM2.5 and PM10 values"""
    if pm25 is None and pm10 is None:
        return None
    
    # Simplified AQI calculation based on PM2.5
    if pm25 is not None:
        if pm25 <= 12:
            return pm25 * 50 / 12
        elif pm25 <= 35.4:
            return 50 + (pm25 - 12) * 50 / 23.4
        elif pm25 <= 55.4:
            return 100 + (pm25 - 35.4) * 50 / 20
        elif pm25 <= 150.4:
            return 150 + (pm25 - 55.4) * 100 / 95
        elif pm25 <= 250.4:
            return 250 + (pm25 - 150.4) * 100 / 100
        else:
            return 350 + (pm25 - 250.4) * 150 / 149.6
    
    # Fallback to PM10 if PM2.5 is not available
    if pm10 is not None:
        if pm10 <= 54:
            return pm10 * 50 / 54
        elif pm10 <= 154:
            return 50 + (pm10 - 54) * 50 / 100
        elif pm10 <= 254:
            return 100 + (pm10 - 154) * 50 / 100
        elif pm10 <= 354:
            return 150 + (pm10 - 254) * 100 / 100
        elif pm10 <= 424:
            return 250 + (pm10 - 354) * 100 / 70
        else:
            return 350 + (pm10 - 424) * 150 / 126
    
    return None

def get_aqi_level(aqi):
    """Get AQI level description"""
    if aqi is None:
        return None
    if aqi <= 50:
        return 'Good'
    elif aqi <= 100:
        return 'Moderate'
    elif aqi <= 150:
        return 'Unhealthy for Sensitive Groups'
    elif aqi <= 200:
        return 'Unhealthy'
    elif aqi <= 300:
        return 'Very Unhealthy'
    else:
        return 'Hazardous'

def fetch_openmeteo_data(lat, lon):
    """Fetch air quality data from Open-Meteo API (free, no API key required)"""
    try:
        url = OPENMETEO_API_URL
        params = {
            'latitude': lat,
            'longitude': lon,
            'hourly': 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide',
            'current': 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide'
        }
        
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        return data
    except Exception as e:
        print(f"Error fetching data from Open-Meteo: {e}")
        return None

def fetch_openaq_data(city, country):
    """Fetch air quality data from OpenAQ API v3 (requires API key)"""
    try:
        if not OPENAQ_API_KEY:
            print("OpenAQ API key not provided. Set USE_OPENAQ=false to use Open-Meteo instead.")
            return None
        
        url = f"{OPENAQ_API_URL}/locations"
        params = {
            'country': country,
            'limit': 100
        }
        headers = {'X-API-Key': OPENAQ_API_KEY}
        
        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        locations = data.get('results', [])
        
        # Filter locations by city name (case-insensitive)
        matching_locations = [
            loc for loc in locations 
            if city.lower() in loc.get('name', '').lower()
        ]
        
        if not matching_locations:
            return None
        
        # Get the first matching location
        location = matching_locations[0]
        location_id = location.get('id')
        
        # Fetch latest measurements
        url = f"{OPENAQ_API_URL}/locations/{location_id}/latest"
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        return {'location': location, 'measurements': data.get('results', [])}
    except Exception as e:
        print(f"Error fetching data from OpenAQ: {e}")
        return None

def process_openmeteo_data(data):
    """Process Open-Meteo data to extract current measurements"""
    if not data or 'current' not in data:
        return None
    
    current = data['current']
    processed = {
        'pm25': current.get('pm2_5'),
        'pm10': current.get('pm10'),
        'co': current.get('carbon_monoxide'),
        'no2': current.get('nitrogen_dioxide'),
        'o3': current.get('ozone'),
        'so2': current.get('sulphur_dioxide')
    }
    
    return processed

def process_openaq_measurements(measurements):
    """Process OpenAQ measurements to get latest values for each parameter"""
    processed = {
        'pm25': None,
        'pm10': None,
        'co': None,
        'no2': None,
        'o3': None,
        'so2': None
    }
    
    for meas in measurements:
        parameter = meas.get('parameter')
        value = meas.get('value')
        
        # Map parameter names to our schema
        param_map = {
            'pm25': 'pm25',
            'pm10': 'pm10',
            'co': 'co',
            'no2': 'no2',
            'o3': 'o3',
            'so2': 'so2'
        }
        
        if parameter in param_map and processed[param_map[parameter]] is None:
            processed[param_map[parameter]] = value
    
    return processed

def save_to_mongodb(data):
    """Save air quality data to MongoDB"""
    try:
        client = MongoClient(MONGODB_URI)
        db = client['eco-platform']
        collection = db['airqualities']
        
        # Insert data
        if data:
            result = collection.insert_many(data)
            print(f"Inserted {len(result.inserted_ids)} documents to MongoDB")
        
        client.close()
    except Exception as e:
        print(f"Error saving to MongoDB: {e}")

def fetch_and_store_air_quality():
    """Main function to fetch and store air quality data"""
    print(f"Fetching air quality data at {datetime.now()}")
    
    if USE_OPENAQ:
        print("Using OpenAQ API (requires API key)")
        if not OPENAQ_API_KEY:
            print("WARNING: OpenAQ API key not provided. Please add OPENAQ_API_KEY to .env file")
            print("To get a free API key, visit: https://explore.openaq.org/register")
            print("Falling back to Open-Meteo API (free, no API key required)")
    else:
        print("Using Open-Meteo API (free, no API key required)")
    
    all_data = []
    
    for city_info in CITIES:
        city = city_info['city']
        country = city_info['country']
        lat = city_info.get('lat')
        lon = city_info.get('lon')
        
        print(f"Fetching data for {city}, {country}...")
        
        if USE_OPENAQ and OPENAQ_API_KEY:
            # Use OpenAQ API
            openaq_data = fetch_openaq_data(city, country)
            if openaq_data:
                location = openaq_data['location']
                measurements = openaq_data['measurements']
                
                if measurements:
                    processed = process_openaq_measurements(measurements)
                    aqi = calculate_aqi(processed['pm25'], processed['pm10'])
                    aqi_level = get_aqi_level(aqi)
                    
                    coords_data = location.get('coordinates', {})
                    location_coords = None
                    if coords_data:
                        location_coords = {
                            'type': 'Point',
                            'coordinates': [coords_data.get('lon', 0), coords_data.get('lat', 0)]
                        }
                    
                    doc = {
                        'city': city,
                        'country': country,
                        'location': location_coords,
                        'measurements': processed,
                        'aqi': aqi,
                        'aqiLevel': aqi_level,
                        'timestamp': datetime.now(),
                        'source': 'OpenAQ'
                    }
                    
                    all_data.append(doc)
                    print(f"  - AQI: {aqi:.1f} ({aqi_level})")
                else:
                    print(f"  - No measurements available")
            else:
                print(f"  - Failed to fetch OpenAQ data")
        else:
            # Use Open-Meteo API (free, no API key)
            if lat and lon:
                openmeteo_data = fetch_openmeteo_data(lat, lon)
                if openmeteo_data:
                    processed = process_openmeteo_data(openmeteo_data)
                    
                    if processed:
                        aqi = calculate_aqi(processed['pm25'], processed['pm10'])
                        aqi_level = get_aqi_level(aqi)
                        
                        location_coords = {
                            'type': 'Point',
                            'coordinates': [lon, lat]
                        }
                        
                        doc = {
                            'city': city,
                            'country': country,
                            'location': location_coords,
                            'measurements': processed,
                            'aqi': aqi,
                            'aqiLevel': aqi_level,
                            'timestamp': datetime.now(),
                            'source': 'Open-Meteo'
                        }
                        
                        all_data.append(doc)
                        print(f"  - AQI: {aqi:.1f} ({aqi_level})")
                    else:
                        print(f"  - No current data available")
                else:
                    print(f"  - Failed to fetch Open-Meteo data")
            else:
                print(f"  - Missing coordinates for {city}")
    
    # Save to MongoDB
    if all_data:
        save_to_mongodb(all_data)
        print(f"Successfully stored data for {len(all_data)} cities")
    else:
        print("No data to store")

if __name__ == "__main__":
    # Initial fetch
    fetch_and_store_air_quality()
    
    # Schedule to run every hour
    print("\nScheduling data fetch every hour...")
    schedule.every(1).hours.do(fetch_and_store_air_quality)
    
    # Keep the script running
    while True:
        schedule.run_pending()
        time.sleep(60)
