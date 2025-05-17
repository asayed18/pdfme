import React from 'react';
import SqueezeHoverableIcon from './atoms/SqueezeHoverableIcon';
import MergeHoverableIcon from './atoms/MergeHoverableIcon';
import PageEditHoverableIcon from './atoms/PageEditHoverableIcon';
const Sidebar = ({ currentPage, navigateToPage }) => {
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
              <MergeHoverableIcon size={30}/>
            </a>
          </li>
          <li>
            <a 
              onClick={() => navigateToPage('compress')} 
              className={currentPage === 'compress' ? 'active' : ''}
              title="Compress PDF"
            >
              <SqueezeHoverableIcon size={30}/>
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