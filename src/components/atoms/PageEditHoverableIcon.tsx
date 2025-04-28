import React from "react";
import styled, { keyframes } from "styled-components";

// Keyframes for animations
const pageFlip = keyframes`
  0% {
    transform: translateX(0) rotateY(0deg);
    opacity: 1;
  }
  25% {
    transform: translateX(10px) rotateY(45deg);
    opacity: 0.9;
  }
  50% {
    transform: translateX(20px) rotateY(90deg);
    opacity: 0.8;
  }
  75% {
    transform: translateX(10px) rotateY(45deg);
    opacity: 0.9;
  }
  100% {
    transform: translateX(0) rotateY(0deg);
    opacity: 1;
  }
`;

const pencilEdit = keyframes`
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(5px, -5px) rotate(-5deg);
  }
  50% {
    transform: translate(10px, 0px) rotate(0deg);
  }
  75% {
    transform: translate(5px, 5px) rotate(5deg);
  }
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
`;

// Styled components
const Container = styled.div`
  width: ${({ size }) => size || "200px"};
  height: ${({ size }) => size || "200px"};
  display: inline-block;
  position: relative;
  perspective: 1000px;
  &:hover #active-page {
    animation: ${pageFlip} 2s infinite ease-in-out;
  }
  &:hover #pencil {
    animation: ${pencilEdit} 2s infinite ease-in-out;
  }
`;

const File = styled.rect`
  fill: ${({ color }) => color || "#3b82f6"};
  transform-origin: center;
`;

const Page = styled.rect`
  fill: ${({ pageColor }) => pageColor || "#e6effd"};
  stroke: ${({ strokeColor }) => strokeColor || "#c6d5f5"};
  stroke-width: 1;
  transform-origin: left center;
`;

const TextLine = styled.rect`
  fill: ${({ lineColor }) => lineColor || "#6b7280"};
  transform-origin: center;
`;

const Pencil = styled.g`
  transform-origin: center;
`;

const AnimatedEditingPages = ({ size, color }) => {
  // Create lighter versions of the color for pages and strokes
  const lightenColor = (color, amount) => {
    // Convert hex to RGB
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Lighten by mixing with white
    const lighten = (value) => Math.min(255, Math.floor(value + (255 - value) * amount));
    
    const lightenedR = lighten(r);
    const lightenedG = lighten(g);
    const lightenedB = lighten(b);
    
    // Convert back to hex
    return `#${lightenedR.toString(16).padStart(2, "0")}${lightenedG.toString(16).padStart(2, "0")}${lightenedB.toString(16).padStart(2, "0")}`;
  };
  
  const baseColor = color || "#3b82f6";
  const pageColor = lightenColor(baseColor, 0.85); // Very light version
  const strokeColor = lightenColor(baseColor, 0.6); // Medium light version
  const lineColor = lightenColor(baseColor, 0.3); // Slightly darker for text

  return (
    <Container size={size}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        {/* File */}
        <File x="50" y="40" width="100" height="120" rx="10" color={baseColor} />
        
        {/* Static Pages */}
        <Page x="60" y="50" width="80" height="40" rx="2" pageColor={pageColor} strokeColor={strokeColor} />
        <Page x="60" y="95" width="80" height="40" rx="2" pageColor={pageColor} strokeColor={strokeColor} />
        
        {/* Active Page (that flips) */}
        <g id="active-page">
          <Page x="60" y="50" width="80" height="40" rx="2" pageColor={pageColor} strokeColor={strokeColor} />
          <TextLine x="70" y="60" width="60" height="3" rx="1.5" lineColor={lineColor} />
          <TextLine x="70" y="68" width="50" height="3" rx="1.5" lineColor={lineColor} />
          <TextLine x="70" y="76" width="55" height="3" rx="1.5" lineColor={lineColor} />
        </g>
        
        {/* Pencil Icon */}
        <Pencil id="pencil">
          <polygon points="120,70 125,65 135,75 130,80" fill="#f59e0b" />
          <rect x="125" y="65" width="15" height="3" rx="1.5" fill="#92400e" transform="rotate(45 125 65)" />
        </Pencil>
      </svg>
    </Container>
  );
};

export default AnimatedEditingPages;
