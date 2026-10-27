def classify_wind(wind_speed):
    if wind_speed < 25:
        return "Low"
    elif wind_speed < 35:
        return "Moderate"
    elif wind_speed < 45:
        return "High"
    elif wind_speed < 55:
        return "Severe"
    else:
        return "No Travel"

def classify_rain(rain):
    if rain < 0.10:
        return "Low"
    elif rain < 0.25:
        return "Moderate"
    elif rain < 0.50:
        return "High"
    elif rain <= 1.00:
        return "Severe"
    else:
        return "No Travel"
    
def classify_snow(snow):
    if snow < 1.27:
        return "Low"
    elif snow < 2.54:
        return "Moderate"
    elif snow < 5.08:
        return "High"
    elif snow <= 7.62:
        return "Severe"
    else:
        return "No Travel"
    
def apply_load_rules(wind_speed, load_weight, weather_risk):
    if wind_speed >= 55:
        return "No Travel"

    elif wind_speed >= 45 and load_weight > 30000:
        return "No Travel"

    elif wind_speed >= 35 and load_weight > 40000:
        return "Severe"

    return weather_risk

def calculate_checkpoint_risk(wind_speed, rain, snow, load_weight):
    wind_risk = classify_wind(wind_speed)
    rain_risk = classify_rain(rain)
    snow_risk = classify_snow(snow)
    wind_risk = apply_load_rules(wind_speed, load_weight, wind_risk)
    risk_order = {"Low": 1,"Moderate": 2,"High": 3,"Severe": 4,"No Travel": 5}
    risks = [wind_risk, rain_risk, snow_risk]
    highest_risk = "Low"
    for risk in risks:
        if risk_order[risk] > risk_order[highest_risk]:
            highest_risk = risk
    return highest_risk