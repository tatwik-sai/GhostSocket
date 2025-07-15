// "use client";
// import { useEffect, useRef } from "react";
// export function useKeyboardTracker() {
//   const isListening = useRef(false);
//   const modifiers = useRef(new Set());
//   const lastPrintableKey = useRef(null);

//   const send = (event) => {
//     console.log("SEND:", event.keys);
//   };

//   const getCurrentKeys = () => {
//     const keys = [...modifiers.current];
//     if (lastPrintableKey.current) keys.push(lastPrintableKey.current);
//     return keys;
//   };

//   const handleKeyDown = (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     const key = e.key;
//     const isModifier = ["Shift", "Control", "Alt", "Meta"].includes(key);
//     let changed = false;

//     if (isModifier && !modifiers.current.has(key)) {
//       modifiers.current.add(key);
//       changed = true;
//     } else if (!isModifier && (key.length === 1 || key === " ")) {
//       if (lastPrintableKey.current !== key) {
//         lastPrintableKey.current = key;
//         changed = true;
//       }
//     }

//     if (changed) {
//       send({ type: "keyboard", keys: getCurrentKeys() });
//     }
//   };

//   const handleKeyUp = (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     const key = e.key;
//     const isModifier = ["Shift", "Control", "Alt", "Meta"].includes(key);
//     let changed = false;

//     if (isModifier && modifiers.current.has(key)) {
//       modifiers.current.delete(key);
//       changed = true;
//     } else if (!isModifier && lastPrintableKey.current === key) {
//       lastPrintableKey.current = null;
//       changed = true;
//     }

//     if (changed) {
//       send({ type: "keyboard", keys: getCurrentKeys() });
//     }
//   };

//   const handleBlur = () => {
//     modifiers.current.clear();
//     lastPrintableKey.current = null;
//     send({ type: "keyboard", keys: [] });
//   };

//   const start = () => {
//     if (isListening.current) return;
//     isListening.current = true;

//     window.addEventListener("keydown", handleKeyDown, true);
//     window.addEventListener("keyup", handleKeyUp, true);
//     window.addEventListener("blur", handleBlur);
//   };

//   const stop = () => {
//     if (!isListening.current) return;
//     isListening.current = false;

//     window.removeEventListener("keydown", handleKeyDown, true);
//     window.removeEventListener("keyup", handleKeyUp, true);
//     window.removeEventListener("blur", handleBlur);
//   };

//   useEffect(() => {
//     return () => stop(); // Clean up on unmount
//   }, []);

//   return { start, stop };
// }

// export function useMouseTracker() {
//   const isListening = useRef(false);

//   const send = (event) => {
//     console.log("SEND:", event);
//   };

//   const handleMouseMove = (e) => {
//     send({
//       type: "mouse",
//       event: "move",
//       x: e.clientX,
//       y: e.clientY,
//     });
//   };

//   const handleMouseDown = (e) => {
//     e.preventDefault();
//     send({
//       type: "mouse",
//       event: "down",
//       button: e.button,
//       x: e.clientX,
//       y: e.clientY,
//     });
//   };

//   const handleMouseUp = (e) => {
//     e.preventDefault();
//     send({
//       type: "mouse",
//       event: "up",
//       button: e.button,
//       x: e.clientX,
//       y: e.clientY,
//     });
//   };

//   const handleWheel = (e) => {
//     e.preventDefault();
//     send({
//       type: "mouse",
//       event: "wheel",
//       deltaX: e.deltaX,
//       deltaY: e.deltaY,
//     });
//   };


//   const start = () => {
//     if (isListening.current) return;
//     isListening.current = true;

//     const opts = { passive: false };

//     document.addEventListener("mousemove", handleMouseMove, opts);
//     document.addEventListener("mousedown", handleMouseDown, opts);
//     document.addEventListener("mouseup", handleMouseUp, opts);
//     document.addEventListener("wheel", handleWheel, opts);
//   };

//   const stop = () => {
//     if (!isListening.current) return;
//     isListening.current = false;

//     document.removeEventListener("mousemove", handleMouseMove);
//     document.removeEventListener("mousedown", handleMouseDown);
//     document.removeEventListener("mouseup", handleMouseUp);
//     document.removeEventListener("wheel", handleWheel);
//     document.removeEventListener("contextmenu", handleContextMenu);
//   };

//   useEffect(() => {
//     return () => stop();
//   }, []);

//   return { start, stop };
// }




// export default function Page() {
//     const { start, stop } = useKeyboardTracker();
    
//     useEffect(() => {
//         start();
//         return () => stop();
//     }, [start, stop]);
    
//     return (<h1>Tracking mouse...</h1>);

// }




// // function useMouseTracker() {
// //   const [mouseState, setMouseState] = useState({
// //     position: { x: 0, y: 0 },
// //     buttons: [],
// //     scroll: { deltaX: 0, deltaY: 0 },
// //     lastEvent: null,
// //   });

// //   useEffect(() => {
// //     const handleMouseMove = (e) => {
// //       setMouseState((prev) => ({
// //         ...prev,
// //         position: { x: e.clientX, y: e.clientY },
// //         lastEvent: "move",
// //       }));
// //     };

// //     const handleMouseDown = (e) => {
// //       setMouseState((prev) => ({
// //         ...prev,
// //         buttons: [...new Set([...prev.buttons, e.button])],
// //         lastEvent: "down",
// //       }));
// //     };

// //     const handleMouseUp = (e) => {
// //       setMouseState((prev) => ({
// //         ...prev,
// //         buttons: prev.buttons.filter((btn) => btn !== e.button),
// //         lastEvent: "up",
// //       }));
// //     };

// //     const handleWheel = (e) => {
// //       setMouseState((prev) => ({
// //         ...prev,
// //         scroll: { deltaX: e.deltaX, deltaY: e.deltaY },
// //         lastEvent: "scroll",
// //       }));
// //     };

// //     window.addEventListener("mousemove", handleMouseMove);
// //     window.addEventListener("mousedown", handleMouseDown);
// //     window.addEventListener("mouseup", handleMouseUp);
// //     window.addEventListener("wheel", handleWheel);

// //     return () => {
// //       window.removeEventListener("mousemove", handleMouseMove);
// //       window.removeEventListener("mousedown", handleMouseDown);
// //       window.removeEventListener("mouseup", handleMouseUp);
// //       window.removeEventListener("wheel", handleWheel);
// //     };
// //   }, []);

// //   return mouseState;
// // }

// // export default function Mouse() {
// //     const {position, buttons, scroll, lastEvent} = useMouseTracker();
// //     return (
// //         <div>
// //             <h2>Mouse Tracker</h2>
// //             <p>Position: {`x: ${position.x}, y: ${position.y}`}</p>
// //             <p>Buttons: {buttons.join(", ") || "None"}</p>
// //             <p>Scroll: {`deltaX: ${scroll.deltaX}, deltaY: ${scroll.deltaY}`}</p>
// //             <p>Last Event: {lastEvent || "None"}</p>
// //         </div>
// //     )
// // }


// // import { useRef } from "react";

// // export function useInputCapture() {
// //   const listening = useRef(false);

// //   const send = (event) => {
// //     // Dummy send function — replace with actual WebSocket/DataChannel etc.
// //     console.log("Sending event:", JSON.stringify(event));
// //   };

// //   const handleKeyDown = (e) => {
// //     if (!listening.current) return;
// //     const event = {
// //       type: "keyboard",
// //       action: "keydown",
// //       keys: getPressedKeys(e),
// //     };
// //     send(event);
// //   };

// //   const handleKeyUp = (e) => {
// //     if (!listening.current) return;
// //     const event = {
// //       type: "keyboard",
// //       action: "keyup",
// //       keys: getPressedKeys(e),
// //     };
// //     send(event);
// //   };

// //   const handleMouse = (e) => {
// //     if (!listening.current) return;
// //     const { type, button, clientX: x, clientY: y } = e;
// //     const mapBtn = ["left", "middle", "right"][e.button] || "left";

// //     const event = {
// //       type: "mouse",
// //       action: type,
// //       x,
// //       y,
// //       button: mapBtn,
// //     };
// //     send(event);
// //   };

// //   const handleScroll = (e) => {
// //     if (!listening.current) return;
// //     const event = {
// //       type: "mouse",
// //       action: "scroll",
// //       dx: e.deltaX,
// //       dy: e.deltaY,
// //     };
// //     send(event);
// //   };

// //   const getPressedKeys = (e) => {
// //     const keys = [];
// //     if (e.ctrlKey) keys.push("Control");
// //     if (e.shiftKey) keys.push("Shift");
// //     if (e.altKey) keys.push("Alt");
// //     if (e.metaKey) keys.push("Meta");
// //     if (!["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
// //       keys.push(e.key.length === 1 ? e.key : e.key); // handles letters, Enter, etc.
// //     }
// //     return keys;
// //   };

// //   const startListening = () => {
// //     if (listening.current) return;
// //     listening.current = true;

// //     window.addEventListener("keydown", handleKeyDown);
// //     window.addEventListener("keyup", handleKeyUp);
// //     window.addEventListener("mousedown", handleMouse);
// //     window.addEventListener("mouseup", handleMouse);
// //     window.addEventListener("click", handleMouse);
// //     window.addEventListener("mousemove", handleMouse);
// //     window.addEventListener("wheel", handleScroll);
// //   };

// //   const stopListening = () => {
// //     if (!listening.current) return;
// //     listening.current = false;

// //     window.removeEventListener("keydown", handleKeyDown);
// //     window.removeEventListener("keyup", handleKeyUp);
// //     window.removeEventListener("mousedown", handleMouse);
// //     window.removeEventListener("mouseup", handleMouse);
// //     window.removeEventListener("click", handleMouse);
// //     window.removeEventListener("mousemove", handleMouse);
// //     window.removeEventListener("wheel", handleScroll);
// //   };

// //   return { startListening, stopListening };
// // }



export default function Page() {
  // const { start, stop } = useKeyboardTracker();
  // const { start: startMouse, stop: stopMouse } = useMouseTracker();

  // useEffect(() => {
  //   start();
  //   startMouse();
  //   return () => {
  //     stop();
  //     stopMouse();
  //   };
  // }, [start, stop, startMouse, stopMouse]);

  return (<h1>Remote Control Page</h1>);
}