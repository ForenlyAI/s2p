import requests
import os

MAPS_API_KEY = "AIzaSyB0lSn7NZb3ro3dbeZcULGvPmxbJuoarUc"

def test_search():
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": MAPS_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.id,places.location,places.nationalPhoneNumber"
    }
    payload = {
        "textQuery": "Global Paper Cup Manufacturers",
        "maxResultCount": 5
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        print(f"Status: {response.status_code}")
        print(response.json())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_search()
