'use client';

import { useStreamsAndConnectionStore } from '@/store/slices/ActiveConnection/StreamsAndConnectionSlice';
import { useTerminalStore } from '@/store/slices/ActiveConnection/TerminalSlice';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const ClientTerminal = () => {
  const terminalRef = useRef(null);
  const fitAddon = useRef(null);
  const xtermInstance = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const {setXtermInstance, setIsExecuting, getPrompt} = useTerminalStore();

  const inputBuffer = useRef('');

  const writeToTerminal = useCallback((text) => {
    if (xtermInstance.current) {
      xtermInstance.current.write(text);
    }
  }, []);

  const simulateBackendCommandExecution = useCallback((data) => {
    const {isExecuting} = useTerminalStore.getState();
    if (data === '\r') {
        if (isExecuting) {
          inputBuffer.current = '';
          return;
        };
        const command = inputBuffer.current.trim();
        inputBuffer.current = '';
        writeToTerminal('\r\n');

        if (!command) {
            writeToTerminal(getPrompt());
            xtermInstance.current.focus();
            return;
        }
        if (command.toLowerCase() === 'clear' || command.toLowerCase() === 'cls') {
            xtermInstance.current.clear();
            writeToTerminal(getPrompt());
            xtermInstance.current.focus();
            return;
        } else {
          const {tcpDataChannel} = useStreamsAndConnectionStore.getState();
          if (!tcpDataChannel) {
            writeToTerminal('You are not connected to the device.\r\n');
            writeToTerminal(getPrompt());
            xtermInstance.current.focus();
            return;
          }
          if (tcpDataChannel.readyState !== 'open') {
            writeToTerminal('Connection to the device is not open.\r\n');
            writeToTerminal(getPrompt());
            xtermInstance.current.focus();
            return;
          }
          tcpDataChannel.send(JSON.stringify({ type: 'execute_command', command }));
          setIsExecuting(true);
        }

    } else if (data === '\x7f') { // Backspace
        if (inputBuffer.current.length > 0) {
            inputBuffer.current = inputBuffer.current.slice(0, -1);
            xtermInstance.current.write('\b \b');
        }
    } else if (data.charCodeAt(0) >= 32 && data.charCodeAt(0) <= 126) {
       if (isExecuting) {
            return;
        }
        inputBuffer.current += data;
        xtermInstance.current.write(data);
    }
  }, [writeToTerminal, getPrompt()]);

  const safeFit = useCallback(() => {
    if (fitAddon.current && xtermInstance.current && terminalRef.current) {
      try {
        // Check if the container has dimensions
        const rect = terminalRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          fitAddon.current.fit();
        }
      } catch (error) {
        console.warn('Failed to fit terminal:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (!terminalRef.current || xtermInstance.current) return;
    
    // Wait for the element to be properly rendered
    const initTerminal = () => {
      try {
        // Check if container has dimensions
        const rect = terminalRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          // If no dimensions yet, try again in 100ms
          setTimeout(initTerminal, 100);
          return;
        }

        xtermInstance.current = new Terminal({
          cursorBlink: true,
          fontFamily: '"Fira Code", "JetBrains Mono", "Source Code Pro", monospace',
          fontSize: 16,
          cols: Math.floor(rect.width / 9) || 80, // Estimated columns based on width
          rows: Math.floor(rect.height / 17) || 24, // Estimated rows based on height
          theme: {
            background: '#101012',
            foreground: '#FFFFFF',
            cursor: '#ffffff',
            selection: '#4b5263',
            black: '#282c34',
            red: '#e06c75',
            green: '#98c379',
            yellow: '#e5c07b',
            blue: '#61afef',
            magenta: '#c678dd',
            cyan: '#56b6c2',
            white: '#abb2bf',
            brightBlack: '#5c6370',
            brightRed: '#e06c75',
            brightGreen: '#98c379',
            brightYellow: '#e5c07b',
            brightBlue: '#61afef',
            brightMagenta: '#c678dd',
            brightCyan: '#56b6c2',
            brightWhite: '#ffffff'
          }
        });
        setXtermInstance(xtermInstance.current);

        fitAddon.current = new FitAddon();
        xtermInstance.current.loadAddon(fitAddon.current);

        xtermInstance.current.open(terminalRef.current);

        // Wait for terminal to be fully opened before fitting
        safeFit();
        setIsReady(true);
        
        // Add the onData listener after everything is ready
        xtermInstance.current.onData(simulateBackendCommandExecution);
        
        xtermInstance.current.focus();
        writeToTerminal("Welcome to Ghost Socket Remote Terminal.\r\n\n");
        writeToTerminal(`This terminal provides direct access to '${"My Laptop"}' system.\r\n`);
        writeToTerminal(`All commands entered here are executed remotely and are logged for security, auditing, and debugging purposes.\r\n\n`);
        writeToTerminal("Please proceed with care and verify your commands before execution.\r\n\n");
        writeToTerminal(`- Type 'help' for assistance.\r\n`);
        writeToTerminal(`- Type 'clear' to clear the terminal.\r\n\n`);
        writeToTerminal(getPrompt());

      } catch (error) {
        console.error('Failed to initialize terminal:', error);
      }
    };

    // Start initialization after a short delay
    const timeoutId = setTimeout(initTerminal, 50);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [writeToTerminal, simulateBackendCommandExecution, getPrompt(), safeFit]);

  // Handle resize
  useEffect(() => {
    if (!isReady) return;

    const handleResize = () => {
      setTimeout(safeFit, 100); // Delay resize to ensure DOM is updated
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isReady, safeFit]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (xtermInstance.current) {
        xtermInstance.current.dispose();
        xtermInstance.current = null;
        setXtermInstance(null);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-[100vh] p-3 pb-0 pr-0">
      <div className="text-white text-3xl font-bold mb-2">
        Remote Console
      </div>
      
      <div className=" bg-[#101012]  rounded-lg overflow-hidden relative w-full h-full">
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#171717] z-10">
            <p className="text-white/60">Initializing terminal...</p>
          </div>
        )}
        <div
          ref={terminalRef}
          className="w-full h-full pl-2 pt-2 terminal-custom-scrollbar"
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  );
};

export default ClientTerminal;