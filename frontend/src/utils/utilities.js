export function getReadableSize(bytes) {
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(1)}${units[i]}`;
}

export function formatTerminalOutput(output){
  return output.replace(/\r\n/g, '\r\n')
        .replace(/\n/g, '\r\n') 
        .replace(/\t/g, '    ');
}