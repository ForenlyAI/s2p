import os
import json
import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_exponential

GEMINI_API_KEY = "AIzaSyB0lSn7NZb3ro3dbeZcULGvPmxbJuoarUc"
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel('gemini-2.0-flash')

import sys

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def score_suppliers_batch(places: list):
    if not places:
        return []
    
    prompt = f"""
    Score the following suppliers based on Price, quality, location (0-100). 
    Data: {json.dumps(places)}
    
    Return ONLY a JSON array of objects with keys:
    - 'id' (match the Google Place ID exactly)
    - 'score' (int)
    - 'analysis' (string, max 200 chars)
    
    Example: [{{"id": "...", "score": 85, "analysis": "High quality, central location..."}}]
    """
    
    try:
        print(f"DEBUG: Sending query to Gemini for {len(places)} places...")
        sys.stdout.flush()
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        
        # Check for block/safety issues
        if response.prompt_feedback.block_reason:
            print(f"AI ERROR: Prompt was blocked. Reason: {response.prompt_feedback.block_reason}")
            sys.stdout.flush()
            return []

        if not response.candidates:
            print("AI ERROR: No candidates in response.")
            sys.stdout.flush()
            return []

        try:
            res_text = response.text
            print(f"DEBUG: Raw AI response: {res_text}")
            sys.stdout.flush()
            results = json.loads(res_text)
            return results
        except ValueError as ve:
            # This happens if response has no text (e.g. blocked candidate)
            print(f"AI ERROR: Response has no text. Parts: {response.candidates[0].content.parts}")
            print(f"Full response object: {response}")
            sys.stdout.flush()
            return []
            
    except Exception as e:
        print(f"CRITICAL AI ERROR: {type(e).__name__}: {e}")
        sys.stdout.flush()
        raise e
