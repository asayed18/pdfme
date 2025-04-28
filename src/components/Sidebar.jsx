import React from 'react';
import SqueezeHoverableIcon from './atoms/SqueezeHoverableIcon';
import MergeHoverableIcon from './atoms/MergeHoverableIcon';
import PageEditHoverableIcon from './atoms/PageEditHoverableIcon';
const Sidebar = ({ currentPage, navigateToPage }) => {
  const [animation, setAnimation] = React.useState(false);
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li>
            <a 
              onClick={() => navigateToPage('merge')} 
              className={currentPage === 'merge' ? 'active' : ''}
              title="Merge PDFs"
            >
              <SqueezeHoverableIcon size={30}/>
            </a>
          </li>
          <li>
            <a 
              onClick={() => navigateToPage('compress')} 
              className={currentPage === 'compress' ? 'active' : ''}
              title="Compress PDF"
            >
              {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z"></path>
                <line x1="7" y1="7" x2="17" y2="7"></line>
                <line x1="7" y1="10" x2="17" y2="10"></line>
                <line x1="7" y1="13" x2="17" y2="13"></line>
                <line x1="7" y1="16" x2="17" y2="16"></line>
                <path d="M2 9c1 0 1.5-1 1.5-2s.5-2 1.5-2"></path>
                <path d="M22 9c-1 0-1.5-1-1.5-2s-.5-2-1.5-2"></path>
                <path d="M2 15c1 0 1.5 1 1.5 2s.5 2 1.5 2"></path>
                <path d="M22 15c-1 0-1.5 1-1.5 2s-.5 2-1.5 2"></path>
              </svg> */}
              {/* <svg onMouseEnter={ () => setAnimation(true)} onMouseLeave={ () => setAnimation(false)} className="hoverable-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="30" height="24">
                <rect style={{ animation: animation? 'moveFile1 1s infinite alternate': 'none' }} id="file1" x="20" y="20" width="50" height="60" fill="currentcolor" stroke="#4caf50" strokeWidth="2" rx="5" ry="5" />
                <rect style={{ animation: animation? 'moveFile2 1s infinite alternate': 'none' }} id="file2" x="140" y="20" width="50" height="60" fill="currentcolor" stroke="#2196f3" strokeWidth="2" rx="5" ry="5" />
                <rect style={{ animation: animation? 'moveFile3 1s infinite alternate': 'none' }} id="file3" x="80" y="80" width="50" height="60" fill="currentcolor" stroke="#ff9800" strokeWidth="2" rx="5" ry="5" />
                <rect style={{ animation: animation? 'fadeIn 1s infinite alternate': 'none' }} id="mergedFile" x="90" y="50" width="50" height="60" fill="currentcolor" stroke="#9c27b0" strokeWidth="2" rx="5" ry="5" opacity="0" />
              </svg> */}
              <MergeHoverableIcon size={30}/>
            </a>
          </li>
          <li>
            <a 
              onClick={() => navigateToPage('remove')} 
              className={currentPage === 'remove' ? 'active' : ''}
              title="Remove Pages"
            >
             <PageEditHoverableIcon size={30}/>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;