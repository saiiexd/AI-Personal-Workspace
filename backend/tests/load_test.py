import asyncio
import time
import httpx

API_URL = "http://localhost:8000/api/v1"

async def simulate_user(user_id: int):
    async with httpx.AsyncClient() as client:
        start_time = time.time()
        try:
            # 1. Health check hit
            res = await client.get(f"{API_URL}/health")
            
            # 2. Mock a notes listing retrieval
            res_notes = await client.get(f"{API_URL}/notes/workspaces/00000000-0000-0000-0000-000000000000/notes")
            
            duration = time.time() - start_time
            print(f"User {user_id} completed sequence in {duration:.4f}s. Health status: {res.status_code}")
            return True
        except Exception as e:
            print(f"User {user_id} failed: {e}")
            return False

async def main():
    print("Starting concurrent API load test...")
    tasks = [simulate_user(i) for i in range(50)]
    results = await asyncio.gather(*tasks)
    success_count = sum(1 for r in results if r)
    print(f"Load test finished. Success rate: {success_count}/{len(results)}")

if __name__ == "__main__":
    asyncio.run(main())
