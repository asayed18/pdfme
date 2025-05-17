import React from "react";
import styled, { keyframes } from "styled-components";

interface ContainerProps {
  size?: string;
}

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
const Container = styled.div.attrs<ContainerProps>((props) => ({
  style: {
    width: props.size || "200px",
    height: props.size || "200px"
  }
}))<ContainerProps>`
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
  fill: var(--accent-color);
  opacity: 0.7;
  transform-origin: center;
`;

const DarkenedFile = styled.rect`
  fill: var(--text-secondary);
  opacity: 0.4;
  transform-origin: center;
`;

const CompressionLine = styled.rect`
  fill: var(--text-secondary);
  opacity: 0.3;
  transform-origin: center;
`;

const AnimatedMergeFiles = ({ size }) => {
  return (
    <Container size={size}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        {/* Tilted Files */}
        <g id="tilted-files">
          <DarkenedFile x="60" y="50" width="80" height="100" rx="10" style={{ transform: "rotate(-10deg) translateX(-10px)" }} />
          <DarkenedFile x="60" y="50" width="80" height="100" rx="10" style={{ transform: "rotate(-5deg) translateX(-5px)" }} />
        </g>
        {/* Main File */}
        <g id="main-file">
          <File x="60" y="50" width="80" height="100" rx="10" />
          {/* Compression Lines */}
          <CompressionLine x="70" y="70" width="60" height="5" rx="2.5" />
          <CompressionLine x="70" y="85" width="60" height="5" rx="2.5" />
          <CompressionLine x="70" y="100" width="60" height="5" rx="2.5" />
        </g>
      </svg>
    </Container>
  );
};

export default AnimatedMergeFiles;