import React from 'react'

const Loading = () => {
  return (
    <div className='w-full h-screen flex items-center justify-center bg-dark-1'>
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-1"></div> */}
        
        {/* Loading dots animation */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-purple-1 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-1 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-purple-1 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  )
}

export default Loading