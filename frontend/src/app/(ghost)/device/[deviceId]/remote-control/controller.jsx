"use client";
import { useRemoteControlStore } from "@/store/slices/ActiveConnection/RemoteControlSlice";
import { useStreamsAndConnectionStore } from "@/store/slices/ActiveConnection/StreamsAndConnectionSlice";
import { useCallback, useEffect, useRef } from "react";


export function useKeyboardTracker() {
  const isListening = useRef(false);
  const modifiers = useRef(new Set());
  const lastPrintableKey = useRef(null);

  const send = useCallback((event) => {
    const {udpDataChannel} = useStreamsAndConnectionStore.getState();
    if (udpDataChannel && udpDataChannel.readyState === "open") {
      const data = JSON.stringify(event);
      udpDataChannel.send(data);
    } else {
      console.warn("TCP Data Channel is not open");
    }
  }, []);

  const handleKey = useCallback((e, type) => {
    e.preventDefault();
    e.stopPropagation();

    const key = e.key;
    const isModifier = ["Shift", "Control", "Alt", "Meta"].includes(key);
    let changed = false;

    if (type === "keydown") {
      if (isModifier && !modifiers.current.has(key)) {
        modifiers.current.add(key);
        changed = true;
      } else if (!isModifier && (key.length === 1 || key === " ")) {
        if (lastPrintableKey.current !== key) {
          lastPrintableKey.current = key;
          changed = true;
        }
      }
    } else if (type === "keyup") {
      if (isModifier && modifiers.current.has(key)) {
        modifiers.current.delete(key);
        changed = true;
      } else if (!isModifier && lastPrintableKey.current === key) {
        lastPrintableKey.current = null;
        changed = true;
      }
    }

    if (changed || type === "keydown" || type === "keyup") {
      send({
        type: "keyboard",
        event: type,
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        repeat: e.repeat,
        timestamp: Date.now(),
      });
    }
  }, [send]);

  const handleKeyDown = useCallback((e) => handleKey(e, "keydown"), [handleKey]);
  const handleKeyUp = useCallback((e) => handleKey(e, "keyup"), [handleKey]);

  const handleBlur = useCallback(() => {
    modifiers.current.clear();
    lastPrintableKey.current = null;
    send({ type: "keyboard", event: "blur", keys: [] });
  }, [send]);

  const start = useCallback(() => {
    if (isListening.current) return;
    isListening.current = true;

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", handleBlur);
  }, [handleKeyDown, handleKeyUp, handleBlur]);

  const stop = useCallback(() => {
    if (!isListening.current) return;
    isListening.current = false;
    
    window.removeEventListener("keydown", handleKeyDown, true);
    window.removeEventListener("keyup", handleKeyUp, true);
    window.removeEventListener("blur", handleBlur);
  }, [handleKeyDown, handleKeyUp, handleBlur]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop };
}





export function useMouseTracker({ screenVideo }) {
  const isListening = useRef(false);
  const { screenDimensions } = useRemoteControlStore();

  const send = useCallback((event) => {
    const {udpDataChannel} = useStreamsAndConnectionStore.getState();
    if (udpDataChannel && udpDataChannel.readyState === "open") {
      const data = JSON.stringify(event);
      udpDataChannel.send(data);
    } else {
      console.warn("TCP Data Channel is not open");
    }
  }, []);

  const scaleAndOffset = (x, y) => {
    const { scaledScreenDimensions } = useRemoteControlStore.getState();
    const scaledWidth = scaledScreenDimensions.width;
    const scaledHeight = scaledScreenDimensions.height;
    console.log("scaledWidth:", scaledWidth, "scaledHeight:", scaledHeight, "left:", scaledScreenDimensions.left, "top:", scaledScreenDimensions.top);
    const clickX = x - scaledScreenDimensions.left;
    const clickY = y - scaledScreenDimensions.top;
    const { width: sourceWidth, height:sourceHeight } = screenDimensions;
    const scaleX = sourceWidth / scaledWidth;
    const scaleY = sourceHeight / scaledHeight;

    const clampedX = Math.max(0, Math.min(clickX, scaledWidth - 1));
    const clampedY = Math.max(0, Math.min(clickY, scaledHeight - 1));
    console.log("clampedX:", clampedX, "clampedY:", clampedY, "scaleX:", scaleX, "scaleY:", scaleY);
    return {
      x: Math.floor(clampedX * scaleX),
      y: Math.floor(clampedY * scaleY),
    };
  }

  const handleMouseMove = useCallback((e) => {
    const { x, y } = scaleAndOffset(e.clientX, e.clientY);
    send({
      type: "mouse",
      event: "move",
      x,
      y,
    });
  }, [send]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = scaleAndOffset(e.clientX, e.clientY);
    send({
      type: "mouse",
      event: "down",
      button: e.button,
      x,
      y,
    });
  }, [send]);

  const handleMouseUp = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = scaleAndOffset(e.clientX, e.clientY);
    send({
      type: "mouse",
      event: "up",
      button: e.button,
      x,
      y,
    });
  }, [send]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    send({
      type: "mouse",
      event: "wheel",
      deltaX: e.deltaX,
      deltaY: e.deltaY,
    });
  }, [send]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  const start = useCallback(() => {
    if (isListening.current) return;
    isListening.current = true;

    const opts = { passive: false };
    window.addEventListener("mousemove", handleMouseMove, opts);
    window.addEventListener("mousedown", handleMouseDown, opts);
    window.addEventListener("mouseup", handleMouseUp, opts);
    window.addEventListener("wheel", handleWheel, opts);
    window.addEventListener("contextmenu", handleContextMenu, opts);
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleWheel]);

  const stop = useCallback(() => {
    if (!isListening.current) return;
    isListening.current = false;

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("contextmenu", handleContextMenu);
  }, [handleMouseMove, handleMouseDown, handleMouseUp, handleWheel]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop };
}




