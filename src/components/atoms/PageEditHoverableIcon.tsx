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

interface ContainerProps {
  size?: string;
}

// Styled components
const Container = styled.div.attrs<ContainerProps>((props) => ({
  style: {
    width: props.size || "200px",
    height: props.size || "200px"
  }
}))<ContainerProps>`
  display: inline-block;
  position: relative;
  perspective: 1000px;
  &:hover #active-page {
    animation: ${pageFlip} 2s infinite ease-in-out;
  }
`;

const File = styled.rect`
  fill: var(--text-secondary);
  opacity: 0.4;
  transform-origin: center;
`;

const Page = styled.rect`
  fill: var(--accent-color);
  opacity: 0.7;
  stroke: var(--text-secondary);
  stroke-width: 1;
  transform-origin: left center;
`;

const TextLine = styled.rect`
  fill: var(--text-primary);
  opacity: 0.3;
  transform-origin: center;
`;

const PageEditHoverableIcon = ({ size = "30px" }) => {
  return (
    <Container size={size}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
        {/* Base File */}
        <File x="60" y="50" width="80" height="100" rx="10" />
        
        {/* Active Page */}
        <g id="active-page">
          <Page x="70" y="60" width="60" height="80" rx="5" />
          <TextLine x="80" y="75" width="40" height="3" rx="1.5" />
          <TextLine x="80" y="85" width="40" height="3" rx="1.5" />
          <TextLine x="80" y="95" width="40" height="3" rx="1.5" />
        </g>
      </svg>
    </Container>
  );
};

export default PageEditHoverableIcon;
