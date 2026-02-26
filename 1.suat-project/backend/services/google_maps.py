import requests
import os

MAPS_API_KEY = "AIzaSyB0lSn7NZb3ro3dbeZcULGvPmxbJuoarUc"

def search_suppliers(query: str):
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": MAPS_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.id,places.location,places.nationalPhoneNumber"
    }
    payload = {
        "textQuery": query,
        "maxResultCount": 10
    }
    
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json().get("places", [])
