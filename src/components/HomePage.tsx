import React, { useState } from "react";
import styled from "styled-components";
import MergeHoverableIcon from "./atoms/MergeHoverableIcon";
import SqueezeHoverableIcon from "./atoms/SqueezeHoverableIcon";
import PageEditHoverableIcon from "./atoms/PageEditHoverableIcon";
import ExtractHoverableIcon from "./atoms/ExtractHoverableIcon";
import LockHoverableIcon from "./atoms/LockHoverableIcon";

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  height: 100%;
`;

const Title = styled.h1`
  font-family: var(--font-heading);
  font-size: 6rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg,
    #2196F3 0%,
    #2196F3 30%,
    #4CAF50 70%,
    #4CAF50 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 20px rgba(33, 150, 243, 0.15);
  letter-spacing: -1px;
  
  @media (max-width: 768px) {
    font-size: 4.5rem;
    margin-bottom: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 3.5rem;
    margin-bottom: 0.75rem;
  }
`;

const WelcomeSection = styled.div`
  text-align: center;
  padding: 0.2rem;

  h1 {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }

    .highlight {
      color: #2196F3;
      font-weight: 700;
    }
  }

  h2.free-text {
    color: #4CAF50;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    text-shadow: 0 1px 2px rgba(76, 175, 80, 0.1);

    @media (max-width: 768px) {
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
  }

  p {
    font-size: 1.2rem;
    color: #555;
    margin-bottom: 2rem;
    padding: 0.5rem 1rem;
    display: inline-block;
    border-radius: 4px;
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.05), rgba(76, 175, 80, 0.05));
    border: 1px solid rgba(33, 150, 243, 0.1);

    @media (max-width: 768px) {
      font-size: 0.9rem;
      margin-bottom: 1rem;
      padding: 0.4rem 0.8rem;
    }
  }
`;

const ToolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
  margin-top: 0.5rem;
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  overflow-y: auto;
  @media (max-width: 768px) {
    gap: 1rem;
    margin-top: 1rem;
    grid-template-columns: repeat(2, 1fr);
    padding: 0 0.5rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0;
  }
`;

const ToolCard = styled.button<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  margin: 1rem;
  background: linear-gradient(135deg, 
    rgba(33, 150, 243, 0.03) 0%, 
    rgba(76, 175, 80, 0.03) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.active ?
    '0 10px 20px -3px rgba(33, 150, 243, 0.15), 0 4px 8px -2px rgba(0, 0, 0, 0.08)' :
    '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
  };
  backdrop-filter: blur(10px);
  transform: ${props => props.active ? "translateY(-4px)" : "none"};
  border-color: ${props => props.active ? "#2196F3" : "rgba(255, 255, 255, 0.1)"};

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    margin: 0.5rem;
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    padding: 1.25rem 0.75rem;
    margin: 1rem 3.25rem;
    gap: 0.5rem;
  }

  &:hover, .active {
    border-color: #2196F3;
    transform: translateY(-4px);
    box-shadow: 0 12px 25px -5px rgba(33, 150, 243, 0.2), 0 6px 10px -5px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, 
      rgba(33, 150, 243, 0.05) 0%, 
      rgba(76, 175, 80, 0.05) 100%
    );

    svg {
      transform: scale(1.1);
      color: #2196F3;
    }
  }

  svg {
    width: 10rem;
    height: 10rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: var(--text-secondary);
    
    @media (max-width: 768px) {
      width: 6rem;
      height: 6rem;
    }
    
    @media (max-width: 480px) {
      width: 5rem;
      height: 5rem;
    }
  }

  .tool-name {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2196F3;
    margin-top: 0.5rem;
    transition: all 0.3s ease;
    text-align: center;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
      margin-top: 0.25rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1rem;
      margin-top: 0;
    }
  }

  .tool-description {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--text-secondary);
    opacity: 0.6;
    text-align: center;
    max-width: 85%;
    transition: all 0.3s ease;
    
    @media (max-width: 768px) {
      font-size: 0.8rem;
      line-height: 1.4;
      max-width: 90%;
    }
    
    @media (max-width: 480px) {
      font-size: 0.75rem;
      line-height: 1.3;
      max-width: 95%;
    }
  }
  
  &:hover .tool-name {
    color: #1976D2;
  }
`;

type ToolType = "merge" | "compress" | "remove" | "extract" | "lock";

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
          The <span className="highlight">#1</span> fastest and most secure app for
          editing pdfs, <span className="highlight">ZERO</span> data collection.
        </h1>
        <h2 className="free-text">Everything is done offline & completely free</h2>      </WelcomeSection>

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

        <ToolCard onClick={() => handleToolSelect("extract")} active={activeTool == "extract"}>
          <ExtractHoverableIcon size="10rem" />
          <span className="tool-name">Extract Pages</span>
          <span className="tool-description">
            Extract selected pages into a new PDF document
          </span>
        </ToolCard>

        <ToolCard onClick={() => handleToolSelect("lock")} active={activeTool == "lock"}>
          <LockHoverableIcon size="10rem" />
          <span className="tool-name">Lock PDF</span>
          <span className="tool-description">
            Protect your PDF with password encryption (Coming Soon)
          </span>
        </ToolCard>
      </ToolsGrid>
    </HomeContainer>
  );
};

export default HomePage;
