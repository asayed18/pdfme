import React, { useState } from "react";
import styled from "styled-components";
import MergeHoverableIcon from "./atoms/MergeHoverableIcon";
import SqueezeHoverableIcon from "./atoms/SqueezeHoverableIcon";
import PageEditHoverableIcon from "./atoms/PageEditHoverableIcon";

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
`;

const Title = styled.h1`
  font-family: var(--font-heading);
  font-size: 6rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(180deg,
    var(--accent-color) 0%,
    var(--accent-color) 40%,
    rgba(var(--accent-color-rgb), 0.7) 70%,
    rgba(var(--accent-color-rgb), 0.3) 85%,
    rgba(var(--accent-color-rgb), 0.1) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const WelcomeSection = styled.div`
    text-align: center;
  h1 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      font-size: 2rem;
    }

    .highlight {
      color: var(--accent-color);
    }
  }

  h2.free-text {
    color: var(--accent-color);
    font-size: 1.5rem;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }

  p {
    font-size: 1.2rem;
    color: var(--text-secondary);
    margin-bottom: 2rem;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-top: 2rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ToolCard = styled.button<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  transform: ${props => props.active ? "translateY(-4px)" : "none"};
    border-color: ${props => props.active ? "var(--accent-color)" : "rgba(255, 255, 255, 0.1)"};
    box-shadow: ${props => props.active ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" : "inherit"};

  &:hover, .active {
    border-color: var(--accent-color);
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

    svg {
      transform: scale(1.1);
      color: var(--accent-color);
    }
  }

  svg {
    width: 10rem;
    height: 10rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--text-secondary);
  }

  .tool-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 0.5rem;
  }

  .tool-description {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--text-secondary);
    text-align: center;
    max-width: 85%;
  }
`;

type ToolType = "merge" | "compress" | "remove";

interface HomePageProps {
  onToolSelect: (tool: ToolType) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onToolSelect }) => {
    const [activeTool, setActive] = useState<string>("");
    const handleToolSelect = (tool: ToolType) => {
        setActive(tool);
        onToolSelect(tool);
    }

  return (
    <HomeContainer>
      <Title onClick={() => setActive("")}>PDFMe</Title>
      <WelcomeSection>
        <h1>
          The <span className="highlight">#1</span> most secure/fast app for
          editing your pdf, zero API calls zero data collection.
        </h1>
        <h2 className="free-text">it's completely free</h2>
        <p>Choose a tool below to get started</p>
      </WelcomeSection>

      <ToolsGrid>
        <ToolCard onClick={() => handleToolSelect("merge")} active={activeTool == "merge"}>
          <MergeHoverableIcon size="10rem" />
          <span className="tool-name">Merge PDFs</span>
          <span className="tool-description">
            Combine multiple PDFs into one document
          </span>
        </ToolCard>

        <ToolCard onClick={() => handleToolSelect("compress")} active={activeTool == "compress"}>
          <SqueezeHoverableIcon size="10rem" />
          <span className="tool-name">Compress PDF</span>
          <span className="tool-description">
            Reduce PDF file size while maintaining quality
          </span>
        </ToolCard>

        <ToolCard onClick={() => handleToolSelect("remove")} active={activeTool == "remove"}>
          <PageEditHoverableIcon size="10rem" />
          <span className="tool-name">Remove Pages</span>
          <span className="tool-description">
            Delete unwanted pages from your PDF
          </span>
        </ToolCard>
      </ToolsGrid>
    </HomeContainer>
  );
};

export default HomePage;
