import React from 'react';
import styled, { keyframes } from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2.5rem 2rem;
  animation: fadeIn 0.8s ease-out forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const SvgContainer = styled.div`
  width: 80%;
  max-width: 400px;
  margin-bottom: 2.5rem;
  padding: 1rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.03), rgba(76, 175, 80, 0.03));
  
  @media (max-width: 480px) {
    width: 90%;
    max-width: 300px;
    margin-bottom: 1.5rem;
    padding: 0.75rem;
  }
`;

// Define animations using keyframes
const orbitKeyframes = keyframes`
  from { transform: rotate(0deg) translateX(10px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(10px) rotate(-360deg); }
`;

const floatKeyframes = keyframes`
  0% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(-8px) translateX(5px); }
  50% { transform: translateY(-15px) translateX(8px); }
  75% { transform: translateY(-8px) translateX(-5px); }
  100% { transform: translateY(0) translateX(0); }
`;

const pulseKeyframes = keyframes`
  0% { opacity: 0.6; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0.6; transform: scale(0.9); }
`;

const rocketTrailKeyframes = keyframes`
  0% { stroke-dashoffset: 1000; }
  100% { stroke-dashoffset: 0; }
`;

const glowKeyframes = keyframes`
  0% { filter: drop-shadow(0 0 3px rgba(33, 150, 243, 0.4)); }
  50% { filter: drop-shadow(0 0 8px rgba(33, 150, 243, 0.7)); }
  100% { filter: drop-shadow(0 0 3px rgba(33, 150, 243, 0.4)); }
`;

const flickerKeyframes = keyframes`
  0% { opacity: 0.2; }
  50% { opacity: 0.8; }
  75% { opacity: 0.5; }
  100% { opacity: 0.2; }
`;

const twinkleKeyframes = keyframes`
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
`;

const flameKeyframes = keyframes`
  0% { transform: scaleY(0.8) scaleX(0.9); }
  50% { transform: scaleY(1.4) scaleX(1.1); }
  100% { transform: scaleY(0.8) scaleX(0.9); }
`;

const AnimatedSvg = styled.svg`
  width: 100%;
  height: auto;
  filter: drop-shadow(0 10px 20px rgba(33, 150, 243, 0.15)) drop-shadow(0 5px 8px rgba(0, 0, 0, 0.1));
  transition: all 0.3s ease;
  
  &:hover {
    filter: drop-shadow(0 12px 25px rgba(33, 150, 243, 0.2)) drop-shadow(0 8px 12px rgba(0, 0, 0, 0.12));
    transform: translateY(-2px);
  }
`;

// Styled animated components
const RocketGroup = styled.g`
  animation: ${floatKeyframes} 2.5s ease-in-out infinite;
  transform-origin: center;
`;

const OrbitCircle = styled.circle`
  animation: ${orbitKeyframes} 15s linear infinite;
`;

const StarCircle = styled.circle`
  animation: ${pulseKeyframes} 2s ease-in-out infinite;
`;

const StarPath = styled.path`
  animation: ${twinkleKeyframes} 3s ease-in-out infinite;
`;

const FlickerPath = styled.path`
  animation: ${flickerKeyframes} 4s ease-in-out infinite;
`;

const PathWithTrail = styled.path`
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: ${rocketTrailKeyframes} 3s ease-out forwards;
`;

const FolderBodyPath = styled.path`
  animation: ${glowKeyframes} 4s ease-in-out infinite;
`;

const FinPath = styled.path`
  animation: ${glowKeyframes} 3s ease-in-out infinite;
`;

const FlameGroup = styled.g`
  animation: ${flameKeyframes} 0.5s ease-in-out infinite;
  transform-origin: center bottom;
  filter: drop-shadow(0 2px 8px rgba(255, 87, 34, 0.8)) drop-shadow(0 4px 12px rgba(255, 193, 7, 0.5));
`;

const RocketFolderIcon: React.FC = () => {
  // Get the current theme from body data attribute
  const isDarkTheme = document.body.dataset.theme === 'dark';
  
  // Colors based on theme
  const textColor = isDarkTheme ? '#ffffff' : 'var(--text-primary)';
  const starsColor = isDarkTheme ? '#ffffff' : '#757575';
  const orbitColor = isDarkTheme ? '#555555' : '#dddddd';
  const bgColor = isDarkTheme ? 'rgba(25, 25, 40, 0.3)' : 'rgba(240, 240, 250, 0.3)';
  const accentColor = '#2196F3'; // New blue accent color to match the application theme
  
  return (
    <Container>
      <SvgContainer>
        <AnimatedSvg
          viewBox="0 0 500 500"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: textColor }}
          aria-labelledby="rocketFolderTitle rocketFolderDesc"
          role="img"
        >
          <title id="rocketFolderTitle">Rocket and File</title>
          <desc id="rocketFolderDesc">A decorative illustration of a rocket orbiting around a file</desc>
          
          {/* Background circular pattern */}
          <circle cx="250" cy="250" r="200" fill={bgColor} stroke="none" />
          <circle cx="250" cy="250" r="190" fill="none" stroke={orbitColor} strokeWidth="1" opacity="0.3" />
          <circle cx="250" cy="250" r="180" fill="none" stroke={orbitColor} strokeWidth="1" opacity="0.2" />

          {/* Stars/Dots in background */}
          <g>
            {/* Small animated stars */}
            <StarCircle cx="150" cy="120" r="4" fill={starsColor} />
            <StarCircle cx="380" cy="180" r="5" fill={starsColor} />
            <StarCircle cx="320" cy="100" r="3" fill={starsColor} />
            <StarCircle cx="420" cy="240" r="4" fill={starsColor} />
            <StarCircle cx="180" cy="350" r="5" fill={starsColor} />
            <StarCircle cx="100" cy="280" r="3" fill={starsColor} />
            <StarCircle cx="70" cy="150" r="2" fill={starsColor} />
            <StarCircle cx="410" cy="320" r="3" fill={starsColor} />
            <StarCircle cx="290" cy="430" r="2" fill={starsColor} />
            <StarCircle cx="120" cy="400" r="3" fill={starsColor} />
            
            {/* Star shapes */}
            <StarPath d="M370,320 l5,10 l10,-5 l-5,10 l10,5 l-10,5 l5,10 l-10,-5 l-5,10 l-5,-10 l-10,5 l5,-10 l-10,-5 l10,-5 l-5,-10 l10,5 Z" fill="#2196F3" />
            <StarPath d="M160,170 l3,6 l6,-3 l-3,6 l6,3 l-6,3 l3,6 l-6,-3 l-3,6 l-3,-6 l-6,3 l3,-6 l-6,-3 l6,-3 l-3,-6 l6,3 Z" fill="#2196F3" />
            <FlickerPath d="M420,120 l4,8 l8,-4 l-4,8 l8,4 l-8,4 l4,8 l-8,-4 l-4,8 l-4,-8 l-8,4 l4,-8 l-8,-4 l8,-4 l-4,-8 l8,4 Z" fill="#4CAF50" style={{ transform: 'scale(0.6)', transformOrigin: 'center' }} />
          </g>

          {/* File document with folded corner */}
          <g transform="translate(160, 170)">
            {/* Document body - more rectangular for file appearance */}
            <FolderBodyPath 
              d="M0,20 C0,8.954 8.954,0 20,0 H160 L180,30 V240 C180,251.046 171.046,260 160,260 H20 C8.954,260 0,251.046 0,240 V20Z" 
              fill={isDarkTheme ? "#2196F3" : "#42A5F5"} 
            />
            
            {/* File corner fold effect */}
            <path d="M160,0 L160,30 H180 L160,0Z" fill={isDarkTheme ? "#1976D2" : "#1E88E5"} />
            <path d="M160,0 L160,30 H180" fill="none" stroke="#ffffff" strokeWidth="2" />
            
            {/* Light reflection on file */}
            <path d="M0,20 C0,8.954 8.954,0 20,0 H160 L160,30 H20 C8.954,30 0,21.046 0,10 V20Z" fill={isDarkTheme ? "#64B5F6" : "#90CAF9"} opacity="0.6" />
            
            {/* PDF text inside the file */}
            <text x="90" y="140" 
                  fill="#ffffff" 
                  fontSize="50" 
                  fontWeight="bold" 
                  textAnchor="middle"
                  style={{ textShadow: '2px 2px 3px rgba(0, 0, 0, 0.2)' }}>
              PDF
            </text>
          </g>

          {/* Orbital path around file */}
          <ellipse cx="250" cy="240" rx="140" ry="120" stroke={isDarkTheme ? "rgba(33, 150, 243, 0.3)" : "rgba(33, 150, 243, 0.15)"} strokeWidth="2" fill="none" strokeDasharray="5,5" filter={`drop-shadow(0 0 3px ${isDarkTheme ? "rgba(33, 150, 243, 0.5)" : "rgba(33, 150, 243, 0.3)"})`} />

          {/* Rocket - positioned correctly on the orbital path */}
          <RocketGroup transform="translate(380, 200) rotate(-15) scale(1.1)">
            {/* Rocket body */}
            <path d="M0,0 C10,-20 20,-20 30,0 L30,60 L15,70 L0,60 Z" fill="#e0e0e0" />
            <path d="M0,0 C10,-20 20,-20 30,0 L30,30 L0,30 Z" fill="#f0f0f0" />
            
            {/* Rocket window */}
            <circle cx="15" cy="25" r="8" fill="#333" />
            <circle cx="15" cy="25" r="6" fill="#666" />
            <circle cx="13" cy="23" r="2" fill="#ffffff" opacity="0.6" />
            
            {/* Rocket fins */}
            <FinPath d="M0,40 L-10,55 L0,60 Z" fill="#4CAF50" />
            <FinPath d="M30,40 L40,55 L30,60 Z" fill="#4CAF50" />
            
            {/* Rocket bottom */}
            <path d="M0,60 L15,70 L30,60 L30,65 L15,75 L0,65 Z" fill="#2196F3" />
            
            {/* Rocket flames with animation - enhanced with better colors and shapes */}
            <FlameGroup>
              <path d="M8,65 L15,100 L22,65" fill="#FF5722" />
              <path d="M10,65 L15,90 L20,65" fill="#FF9800" />
              <path d="M12,65 L15,80 L18,65" fill="#FFC107" />
              <path d="M13,65 L15,70 L17,65" fill="#FFEB3B" opacity="0.9" />
              <circle cx="15" cy="68" r="4" fill="#FFFFFF" opacity="0.7" />
            </FlameGroup>
          </RocketGroup>

          {/* Trail behind the rocket */}
          <PathWithTrail 
            d="M380,200 Q320,150 270,160 Q240,170 230,210" 
            fill="none" 
            stroke="#2196F3" 
            strokeWidth="3" 
            opacity="0.5" 
            strokeLinecap="round" 
            strokeDasharray="5,5"
          />

          {/* Orbiting elements */}
          <OrbitCircle cx="125" cy="200" r="8" fill="#2196F3" />
          <OrbitCircle cx="370" cy="330" r="6" fill={isDarkTheme ? "#4CAF50" : "#66BB6A"} style={{ animationDelay: '-4s' }} />
          <OrbitCircle cx="250" cy="120" r="7" fill="#2196F3" style={{ animationDelay: '-8s' }} />
        </AnimatedSvg>
      </SvgContainer>
      <h2 style={{ 
        color: 'var(--text-primary)', 
        textAlign: 'center', 
        marginTop: 0, 
        maxWidth: '90%',
        fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
        lineHeight: '1.4',
        background: 'linear-gradient(135deg, #2196F3, #4CAF50)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: '600',
        textShadow: '0px 0px 1px rgba(0,0,0,0.05)'
      }}>
        Select a tool from the sidebar to begin working with your PDFs
      </h2>
    </Container>
  );
};

export default RocketFolderIcon;
