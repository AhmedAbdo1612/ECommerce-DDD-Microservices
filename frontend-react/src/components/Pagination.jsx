import React from 'react';
import { useTheme } from '../hooks/useTheme';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  pageSize, 
  totalCount, 
  onPageChange, 
  onPageSizeChange 
}) => {
  const { theme } = useTheme();

  if (totalCount === 0 || totalPages <= 1) return null;

  const startRange = Math.min((currentPage - 1) * pageSize + 1, totalCount);
  const endRange = Math.min(currentPage * pageSize, totalCount);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const containerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem',
    padding: '1rem',
    background: theme.backgroundCard,
    borderRadius: '12px',
    border: `1px solid ${theme.border}`
  };

  const infoStyle = {
    color: theme.textSecondary,
    fontSize: '0.9rem'
  };

  const controlsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const btnStyle = (active, disabled) => ({
    padding: '0.5rem 0.8rem',
    background: active ? theme.primary : theme.backgroundAlt,
    color: active ? '#fff' : (disabled ? theme.textSecondary : theme.textPrimary),
    border: `1px solid ${active ? theme.primary : theme.border}`,
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s'
  });

  const selectStyle = {
    padding: '0.5rem',
    borderRadius: '6px',
    border: `1px solid ${theme.border}`,
    background: theme.backgroundAlt,
    color: theme.textPrimary,
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <div style={infoStyle}>
        Showing {startRange} to {endRange} of {totalCount} products
      </div>

      <div style={controlsStyle}>
        <span style={infoStyle}>Show:</span>
        <select 
          style={selectStyle} 
          value={pageSize} 
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div style={controlsStyle}>
        <button 
          style={btnStyle(false, currentPage === 1)}
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            style={page === '...' ? { ...btnStyle(false, true), border: 'none', background: 'transparent' } : btnStyle(page === currentPage, false)}
            onClick={() => page !== '...' && onPageChange(page)}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}

        <button 
          style={btnStyle(false, currentPage === totalPages)}
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
