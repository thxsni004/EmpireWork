import React from 'react';

// Temporary page for sections that are built in a later phase
function ComingSoon({ title, phase }) {
  return (
    <>
      <h1 className='staff-page-title'>{title}</h1>
      <div className='staff-panel text-muted mt-3'>
        <i className='bi bi-tools me-2'></i>
        This section will be added in Phase {phase}.
      </div>
    </>
  );
}

export default ComingSoon;
