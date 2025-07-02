"use client"
import React from 'react'
import { useParams } from 'next/navigation';

const Device = () => {
    const params = useParams();
    return (
      <div>
        {params.deviceId}
      </div>
    );
};

export default Device;