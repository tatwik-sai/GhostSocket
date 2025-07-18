(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/components/RotatingText.jsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
const RotatingText = /*#__PURE__*/ _s((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c = _s((props, ref)=>{
    _s();
    const { texts, transition = {
        type: "spring",
        damping: 25,
        stiffness: 300
    }, initial = {
        y: "100%",
        opacity: 0
    }, animate = {
        y: 0,
        opacity: 1
    }, exit = {
        y: "-120%",
        opacity: 0
    }, animatePresenceMode = "wait", animatePresenceInitial = false, rotationInterval = 2000, staggerDuration = 0, staggerFrom = "first", loop = true, auto = true, splitBy = "characters", onNext, mainClassName, splitLevelClassName, elementLevelClassName, ...rest } = props;
    const [currentTextIndex, setCurrentTextIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const splitIntoCharacters = (text)=>{
        if (typeof Intl !== "undefined" && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter("en", {
                granularity: "grapheme"
            });
            return Array.from(segmenter.segment(text), (segment)=>segment.segment);
        }
        return Array.from(text);
    };
    const elements = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "RotatingText.useMemo[elements]": ()=>{
            const currentText = texts[currentTextIndex];
            if (splitBy === "characters") {
                const words = currentText.split(" ");
                return words.map({
                    "RotatingText.useMemo[elements]": (word, i)=>({
                            characters: splitIntoCharacters(word),
                            needsSpace: i !== words.length - 1
                        })
                }["RotatingText.useMemo[elements]"]);
            }
            if (splitBy === "words") {
                return currentText.split(" ").map({
                    "RotatingText.useMemo[elements]": (word, i, arr)=>({
                            characters: [
                                word
                            ],
                            needsSpace: i !== arr.length - 1
                        })
                }["RotatingText.useMemo[elements]"]);
            }
            if (splitBy === "lines") {
                return currentText.split("\n").map({
                    "RotatingText.useMemo[elements]": (line, i, arr)=>({
                            characters: [
                                line
                            ],
                            needsSpace: i !== arr.length - 1
                        })
                }["RotatingText.useMemo[elements]"]);
            }
            return currentText.split(splitBy).map({
                "RotatingText.useMemo[elements]": (part, i, arr)=>({
                        characters: [
                            part
                        ],
                        needsSpace: i !== arr.length - 1
                    })
            }["RotatingText.useMemo[elements]"]);
        }
    }["RotatingText.useMemo[elements]"], [
        texts,
        currentTextIndex,
        splitBy
    ]);
    const getStaggerDelay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RotatingText.useCallback[getStaggerDelay]": (index, totalChars)=>{
            const total = totalChars;
            if (staggerFrom === "first") return index * staggerDuration;
            if (staggerFrom === "last") return (total - 1 - index) * staggerDuration;
            if (staggerFrom === "center") {
                const center = Math.floor(total / 2);
                return Math.abs(center - index) * staggerDuration;
            }
            if (staggerFrom === "random") {
                const randomIndex = Math.floor(Math.random() * total);
                return Math.abs(randomIndex - index) * staggerDuration;
            }
            return Math.abs(staggerFrom - index) * staggerDuration;
        }
    }["RotatingText.useCallback[getStaggerDelay]"], [
        staggerFrom,
        staggerDuration
    ]);
    const handleIndexChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RotatingText.useCallback[handleIndexChange]": (newIndex)=>{
            setCurrentTextIndex(newIndex);
            if (onNext) onNext(newIndex);
        }
    }["RotatingText.useCallback[handleIndexChange]"], [
        onNext
    ]);
    const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RotatingText.useCallback[next]": ()=>{
            const nextIndex = currentTextIndex === texts.length - 1 ? loop ? 0 : currentTextIndex : currentTextIndex + 1;
            if (nextIndex !== currentTextIndex) {
                handleIndexChange(nextIndex);
            }
        }
    }["RotatingText.useCallback[next]"], [
        currentTextIndex,
        texts.length,
        loop,
        handleIndexChange
    ]);
    const previous = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RotatingText.useCallback[previous]": ()=>{
            const prevIndex = currentTextIndex === 0 ? loop ? texts.length - 1 : currentTextIndex : currentTextIndex - 1;
            if (prevIndex !== currentTextIndex) {
                handleIndexChange(prevIndex);
            }
        }
    }["RotatingText.useCallback[previous]"], [
        currentTextIndex,
        texts.length,
        loop,
        handleIndexChange
    ]);
    const jumpTo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RotatingText.useCallback[jumpTo]": (index)=>{
            const validIndex = Math.max(0, Math.min(index, texts.length - 1));
            if (validIndex !== currentTextIndex) {
                handleIndexChange(validIndex);
            }
        }
    }["RotatingText.useCallback[jumpTo]"], [
        texts.length,
        currentTextIndex,
        handleIndexChange
    ]);
    const reset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RotatingText.useCallback[reset]": ()=>{
            if (currentTextIndex !== 0) {
                handleIndexChange(0);
            }
        }
    }["RotatingText.useCallback[reset]"], [
        currentTextIndex,
        handleIndexChange
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useImperativeHandle"])(ref, {
        "RotatingText.useImperativeHandle": ()=>({
                next,
                previous,
                jumpTo,
                reset
            })
    }["RotatingText.useImperativeHandle"], [
        next,
        previous,
        jumpTo,
        reset
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RotatingText.useEffect": ()=>{
            if (!auto) return;
            const intervalId = setInterval(next, rotationInterval);
            return ({
                "RotatingText.useEffect": ()=>clearInterval(intervalId)
            })["RotatingText.useEffect"];
        }
    }["RotatingText.useEffect"], [
        next,
        rotationInterval,
        auto
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
        className: cn("flex flex-wrap whitespace-pre-wrap relative", mainClassName),
        ...rest,
        layout: true,
        transition: transition,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "sr-only",
                children: texts[currentTextIndex]
            }, void 0, false, {
                fileName: "[project]/src/components/RotatingText.jsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                mode: animatePresenceMode,
                initial: animatePresenceInitial,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    className: cn(splitBy === "lines" ? "flex flex-col w-full" : "flex flex-wrap whitespace-pre-wrap relative"),
                    layout: true,
                    "aria-hidden": "true",
                    children: elements.map((wordObj, wordIndex, array)=>{
                        const previousCharsCount = array.slice(0, wordIndex).reduce((sum, word)=>sum + word.characters.length, 0);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: cn("inline-flex", splitLevelClassName),
                            children: [
                                wordObj.characters.map((char, charIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].span, {
                                        initial: initial,
                                        animate: animate,
                                        exit: exit,
                                        transition: {
                                            ...transition,
                                            delay: getStaggerDelay(previousCharsCount + charIndex, array.reduce((sum, word)=>sum + word.characters.length, 0))
                                        },
                                        className: cn("inline-block", elementLevelClassName),
                                        children: char
                                    }, charIndex, false, {
                                        fileName: "[project]/src/components/RotatingText.jsx",
                                        lineNumber: 189,
                                        columnNumber: 19
                                    }, this)),
                                wordObj.needsSpace && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "whitespace-pre",
                                    children: " "
                                }, void 0, false, {
                                    fileName: "[project]/src/components/RotatingText.jsx",
                                    lineNumber: 206,
                                    columnNumber: 40
                                }, this)
                            ]
                        }, wordIndex, true, {
                            fileName: "[project]/src/components/RotatingText.jsx",
                            lineNumber: 187,
                            columnNumber: 15
                        }, this);
                    })
                }, currentTextIndex, false, {
                    fileName: "[project]/src/components/RotatingText.jsx",
                    lineNumber: 172,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/RotatingText.jsx",
                lineNumber: 171,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/RotatingText.jsx",
        lineNumber: 161,
        columnNumber: 5
    }, this);
}, "igc7VDShIH5ExhXYZmXUH3baqwE=")), "igc7VDShIH5ExhXYZmXUH3baqwE=");
_c1 = RotatingText;
RotatingText.displayName = "RotatingText";
const __TURBOPACK__default__export__ = RotatingText;
var _c, _c1;
__turbopack_context__.k.register(_c, "RotatingText$forwardRef");
__turbopack_context__.k.register(_c1, "RotatingText");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/lib/utils.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "cn": (()=>cn)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/ui/button.jsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "Button": (()=>Button),
    "buttonVariants": (()=>buttonVariants)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.js [app-client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
            destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
            secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-9 px-4 py-2 has-[>svg]:px-3",
            sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
            lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
            icon: "size-9"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/button.jsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/DownloadAppButton.jsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>DownloadButton)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-icons/fa/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.jsx [app-client] (ecmascript)");
'use client';
;
;
;
function DownloadButton() {
    const handleDownload = ()=>{
        const link = document.createElement('a');
        link.href = '/application/ghost-setup.exe';
        link.download = 'ghost-setup.exe';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
        className: "purple-primary-button text-white px-4 py-5 shadow-md text-lg w-2/7",
        onClick: handleDownload,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaWindows"], {
                className: "w-[15px] h-[15px]"
            }, void 0, false, {
                fileName: "[project]/src/components/DownloadAppButton.jsx",
                lineNumber: 18,
                columnNumber: 9
            }, this),
            "Download"
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/DownloadAppButton.jsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
_c = DownloadButton;
var _c;
__turbopack_context__.k.register(_c, "DownloadButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_25ea6e17._.js.map