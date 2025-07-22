import aiohttp

async def post_data(url: str, payload: dict) -> list:
    """Sends a POST request to the specified URL with the given payload."""
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            data = await response.json()
            return [response.status, data]

async def get_data(url: str, headers: dict = None, params: dict = None) -> list:
    """Sends a GET request to the specified URL with optional headers and parameters."""
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(url, params=params) as response:
            data = await response.json()
            return [response.status, data]
