import aiohttp
import asyncio

async def post_data(url, payload):
    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            data = await response.json()
            return [response.status, data]

async def get_data(url, headers=None, params=None):
    async with aiohttp.ClientSession(headers=headers) as session:
        async with session.get(url, params=params) as response:
            data = await response.json()
