"use client"
import React from 'react'
import { useAuth, UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/apiClient'
import axios from 'axios'
import Viewer from '@/components/Viewer'

const ConsolePage = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const handleClick = async () => {
    if(!user) return;
    const clerk_token = await getToken();

    try {
      console.log(clerk_token)
      const response = await axios.get("http://localhost:8747/protected",
        {
          headers: {
            Authorization: `Bearer ${clerk_token}`,
          },
        }
      );

      console.log("Response from backend:", response.data);
    } catch (err) {
      console.error("Error contacting backend:", err.response?.data || err);
    }
  };

  return (
    <div>
        <h1 className='text-2xl font-bold text-white'>ConsolePage</h1>
        <Button onClick={handleClick}>Send Info to Server</Button>
        <UserButton />
        <Viewer />
    </div>
  )
}

export default ConsolePage