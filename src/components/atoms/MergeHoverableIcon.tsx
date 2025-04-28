import React from "react";
import styled, { keyframes } from "styled-components";

// Keyframes for animations
const rotateFiles = keyframes`
  0% {
    transform: rotate(-10deg) translateX(-10px);
    opacity: 1;
  }
  50% {
    transform: rotate(-5deg) translateX(-5px);
    opacity: 0.8;
  }
  100% {
    transform: rotate(0deg) translateX(0);
    opacity: 1;
  }
`;

const mergeScale = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

// Styled components
const Container = styled.div`
  width: ${({ size }) => size || "200px"};
  height: ${({ size }) => size || "200px"};
  display: inline-block;
  position: relative;
//   background-color: #f9fafb;
  &:hover #tilted-files rect {
    animation: ${rotateFiles} 1s ease-in-out forwards;
  }
  &:hover #main-file {
    animation: ${mergeScale} 1s ease-in-out forwards;
  }
`;

const File = styled.rect`
  fill: ${({ color }) => color || "#3b82f6"};
  transform-origin: center;
`;

const DarkenedFile = styled.rect`
  fill: ${({ color }) => color || "#2563eb"};
  transform-origin: center;
`;

const CompressionLine = styled.rect`
  fill: #d1d5db;
  transform-origin: center;
`;

const AnimatedMergeFiles = ({ size, color }) => {
  const darkenedColor = darkenColor(color || "#3b82f6");

  return (
    <Container size={size}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        {/* Tilted Files */}
        <g id="tilted-files">
          <DarkenedFile x="60" y="50" width="80" height="100" rx="10" color={darkenedColor} style={{ transform: "rotate(-10deg) translateX(-10px)" }} />
          <DarkenedFile x="60" y="50" width="80" height="100" rx="10" color={darkenedColor} style={{ transform: "rotate(-5deg) translateX(-5px)" }} />
        </g>
        {/* Main File */}
        <g id="main-file">
          <File x="60" y="50" width="80" height="100" rx="10" color={color} />
          {/* Compression Lines */}
          <CompressionLine x="70" y="70" width="60" height="5" rx="2.5" />
          <CompressionLine x="70" y="85" width="60" height="5" rx="2.5" />
          <CompressionLine x="70" y="100" width="60" height="5" rx="2.5" />
        </g>
      </svg>
    </Container>
  );
};

// Helper function to darken the color
const darkenColor = (color) => {
  // Convert hex color to RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Darken the color by 20%
  const darken = (value) => Math.max(0, Math.min(255, Math.floor(value * 0.8)));

  const darkenedR = darken(r);
  const darkenedG = darken(g);
  const darkenedB = darken(b);

  // Convert back to hex
  return `#${darkenedR.toString(16).padStart(2, "0")}${darkenedG.toString(16).padStart(2, "0")}${darkenedB.toString(16).padStart(2, "0")}`;
};

export default AnimatedMergeFiles;