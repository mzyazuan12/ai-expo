import httpx
import asyncio
import json

OPENROUTER_API_KEY = "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"
OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"

async def test_forge(thread_text):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:3002",
        "X-Title": "AI Expo"
    }

    payload = {
        "model": "deepseek/deepseek-r1:free",
        "messages": [
            {
                "role": "user",
                "content": f"{thread_text}\n\nReturn JSON with the following structure: {{'terrain': string, 'threats': string[], 'wind_kts': number, 'laps': number}}"
            }
        ]
    }

    print("Sending request to OpenRouter...")
    print("Payload:", json.dumps(payload, indent=2))

    async with httpx.AsyncClient(timeout=90) as client:
        res = await client.post(OPENROUTER_ENDPOINT, json=payload, headers=headers)
        print("\nResponse status:", res.status_code)
        print("Response headers:", dict(res.headers))
        
        try:
            response = res.json()
            print("\nResponse body:", json.dumps(response, indent=2))
            
            # Try to parse the content as JSON
            content = response["choices"][0]["message"]["content"]
            try:
                mission_data = json.loads(content)
                print("\nParsed mission data:", json.dumps(mission_data, indent=2))
            except json.JSONDecodeError:
                print("\nRaw content:", content)
        except Exception as e:
            print("\nError parsing response:", str(e))
            print("Raw response:", res.text)

async def main():
    # Test with FPV skydiving mission
    print("\n=== Testing FPV skydiving mission ===")
    await test_forge("""Create an extreme FPV skydiving mission with the following requirements:
1. A massive skyscraper complex with multiple drop zones
2. Aerial maneuvers including:
   - Terminal velocity dives
   - Precision proximity flying
   - Split-second gap threading
   - Corkscrew spins through narrow spaces
3. Dynamic weather patterns affecting freefall
4. Multiple checkpoints requiring different approaches
5. Wind tunnels and updrafts for advanced maneuvers
6. Emergency landing zones at various altitudes""")

if __name__ == "__main__":
    asyncio.run(main()) 