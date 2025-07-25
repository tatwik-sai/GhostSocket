import React from 'react'

const Loading = () => {
  return (
    <div className='w-full h-full flex items-center justify-center'>
      {/* Loading dots animation */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-purple-1 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-1 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
        <div className="w-2 h-2 bg-purple-1 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
      </div>
    </div>
  )
}

export default Loading