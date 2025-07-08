// fileIcons.js
import { FaFolder, FaFilePdf, FaFileWord, FaFileImage, FaFileAudio, FaFileVideo, FaFileArchive, FaFileAlt  } from "react-icons/fa";
import { BsFiletypeExe, BsFiletypeTxt } from "react-icons/bs";
import { SiJavascript, SiTypescript, SiPython, SiC, SiCplusplus, SiGo, SiRust, SiPhp, SiKotlin, SiSwift, SiDart, SiRuby, SiMarkdown } from "react-icons/si";
import { SiHtml5, SiCss3, SiGnubash } from "react-icons/si";
import { FaJava } from "react-icons/fa6";

export const fileIcons = {
  // Folder
  directory: FaFolder,

  // Documents
  pdf: FaFilePdf,
  doc: FaFileWord,
  docx: FaFileWord,
  txt: BsFiletypeTxt || FaFileAlt,
  md: FaFileAlt,

  // Code
  js: SiJavascript,
  jsx: SiJavascript,
  ts: SiTypescript,
  tsx: SiTypescript,
  py: SiPython,
  c: SiC,
  cpp: SiCplusplus,
  h: SiCplusplus,
  java: FaJava,
  go: SiGo,
  rs: SiRust,
  php: SiPhp,
  rb: SiRuby,
  kt: SiKotlin,
  swift: SiSwift,
  dart: SiDart,
  sh: SiGnubash,
  bash: SiGnubash,
  html: SiHtml5,
  css: SiCss3,
  md: SiMarkdown,

  // Images
  jpg: FaFileImage,
  jpeg: FaFileImage,
  png: FaFileImage,
  gif: FaFileImage,
  webp: FaFileImage,
  heic: FaFileImage,

  // Audio
  mp3: FaFileAudio,
  wav: FaFileAudio,
  m4a: FaFileAudio,

  // Video
  mp4: FaFileVideo,
  mkv: FaFileVideo,
  mov: FaFileVideo,
  webm: FaFileVideo,

  // Archives
  zip: FaFileArchive,
  rar: FaFileArchive,
  "7z": FaFileArchive,
  tar: FaFileArchive,
  gz: FaFileArchive,

  // Executables
  exe: BsFiletypeExe,
  apk: BsFiletypeExe,

  // Default fallback
  default: FaFileAlt
};
