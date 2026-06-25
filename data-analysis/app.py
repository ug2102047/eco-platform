from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app)

@app.route('/api/analytics/predict-climate', methods=['POST'])
def predict_climate():
    try:
        data = request.json
        print(f'Received data: {data}')
        
        # Expect historical data in format: [{year: 2020, avgTemp: 25.5}, ...]
        historical_data = data.get('historicalData', [])
        
        if not historical_data or len(historical_data) < 2:
            print(f'Insufficient data: {len(historical_data) if historical_data else 0} items')
            return jsonify({
                'success': False,
                'message': 'Insufficient historical data for prediction'
            }), 400
        
        # Extract years and temperatures for linear regression
        years = np.array([item['year'] for item in historical_data]).reshape(-1, 1)
        temps = np.array([item['avgTemp'] for item in historical_data])
        
        print(f'Years: {years.flatten()}')
        print(f'Temps: {temps}')
        
        # Perform linear regression using scikit-learn
        model = LinearRegression()
        model.fit(years, temps)
        
        # Get slope and intercept
        slope = model.coef_[0]
        intercept = model.intercept_
        
        print(f'Slope: {slope}, Intercept: {intercept}')
        
        # Calculate statistics
        n = len(historical_data)
        average_temperature = float(np.mean(temps))
        trend_direction = 'Rising' if slope > 0 else 'Falling'
        yearly_change = float(slope * 10)  # per decade change
        
        # Predict for 2050
        prediction_2050 = float(model.predict([[2050]])[0])
        baseline_temp = float(temps[0])
        warming_by_2050 = prediction_2050 - baseline_temp
        
        print(f'Prediction 2050: {prediction_2050}, Baseline: {baseline_temp}, Warming: {warming_by_2050}')
        
        # Generate prediction data from 2026 to 2050
        prediction_data = []
        for year in range(2026, 2051):
            predicted_temp = float(model.predict([[year]])[0])
            prediction_data.append({
                'year': year,
                'avgTemp': round(predicted_temp, 2),
                'isPrediction': True
            })
        
        # Return response in the exact format the frontend expects
        response = {
            'success': True,
            'predictionData': prediction_data,
            'statistics': {
                'averageTemperature': round(average_temperature, 2),
                'trendDirection': trend_direction,
                'yearlyChange': round(yearly_change, 2),
                'prediction2050': round(prediction_2050, 2),
                'warmingBy2050': round(warming_by_2050, 2)
            }
        }
        
        print(f'Returning response: {response}')
        return jsonify(response)
        
    except Exception as e:
        print(f'Error in climate prediction: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Failed to generate climate predictions: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'climate-prediction'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)