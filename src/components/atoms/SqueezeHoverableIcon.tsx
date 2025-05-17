import React from "react";
import styled, { keyframes } from "styled-components";


interface ContainerProps {
  size?: string;
}

// Keyframes for animations
const compress = keyframes`
  0%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.5);
  }
`;

const arrowMove = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(25px);
  }
`;

const fadeLines = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scaleY(1);
  }
  50% {
    opacity: 0.5;
    transform: scaleY(0.85);
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
  &:hover #file {
    animation: ${compress} 1.2s infinite cubic-bezier(0.7, 0, 0.3, 1);
  }
  &:hover #file-arrow {
    animation: ${arrowMove} 1.2s infinite cubic-bezier(0.7, 0, 0.3, 1);
  }
  &:hover #compression-lines rect {
    animation: ${fadeLines} 1.2s infinite cubic-bezier(0.7, 0, 0.3, 1);
  }
`;

const File = styled.rect`
  fill: var(--accent-color);
  opacity: 0.7;
  transform-origin: center;
`;

const Arrow = styled.polygon`
  fill: var(--text-secondary);
  opacity: 0.4;
`;

const CompressionLine = styled.rect`
  fill: var(--text-secondary);
  opacity: 0.3;
`;

const SqueezeHoverableIcon = ({ size ="30px" }) => {
  return (
    <Container size={size}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        {/* File Icon */}
        <g>
          <File id="file" x="60" y="50" width="80" height="100" rx="10" />
          <Arrow id="file-arrow" points="100,50 140,70 100,70" />
        </g>

        {/* Compression Effect */}
        <g id="compression-lines">
          <CompressionLine x="70" y="110" width="60" height="5" rx="2.5" />
          <CompressionLine x="70" y="120" width="60" height="5" rx="2.5" />
          <CompressionLine x="70" y="130" width="60" height="5" rx="2.5" />
        </g>
      </svg>
    </Container>
  );
};

export default SqueezeHoverableIcon;