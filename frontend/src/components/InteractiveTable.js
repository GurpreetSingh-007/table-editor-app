import React, { useState } from 'react';

function InteractiveTable({ tableData, onCreateNestedTable, onDeleteTable, onSaveTableData }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showAddOptions, setShowAddOptions] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [showTableSizeMenu, setShowTableSizeMenu] = useState(null);
  const [showContentTypeMenu, setShowContentTypeMenu] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [frozenRows, setFrozenRows] = useState(0);
  const [frozenColumns, setFrozenColumns] = useState(0);

  // Default table structure if no data provided
  const defaultData = tableData || {
    id: Date.now(),
    name: 'New Table',
    rows: Array(8).fill().map((_, rowIndex) =>
      Array(6).fill().map((_, colIndex) => ({ 
        content: `R${rowIndex + 1}C${colIndex + 1}`, 
        type: 'text' 
      }))
    )
  };

  const [data, setData] = useState(defaultData);

  // Debug logging for dropdown state
  React.useEffect(() => {
    console.log('showContentTypeMenu state:', showContentTypeMenu);
  }, [showContentTypeMenu]);

  React.useEffect(() => {
    console.log('showTableSizeMenu state:', showTableSizeMenu);
  }, [showTableSizeMenu]);

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.content-menu') && !event.target.closest('.add-content-btn')) {
        setShowContentTypeMenu(null);
        setShowTableSizeMenu(null);
        setShowContextMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRightClick = (e, rowIndex, colIndex) => {
    e.preventDefault();
    setShowContextMenu({
      row: rowIndex,
      col: colIndex,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleDeleteCell = (rowIndex, colIndex) => {
    const newData = { ...data };
    newData.rows[rowIndex][colIndex] = { content: '', type: 'text' };
    setData(newData);
    
    if (onSaveTableData) {
      onSaveTableData(data.id, newData);
    }
    setShowContextMenu(null);
  };

  const handleDuplicateCell = (rowIndex, colIndex) => {
    const cellToDuplicate = data.rows[rowIndex][colIndex];
    // Find next empty cell or ask user where to duplicate
    const newData = { ...data };
    
    // For now, duplicate to the right if possible
    if (colIndex + 1 < data.rows[rowIndex].length) {
      newData.rows[rowIndex][colIndex + 1] = { ...cellToDuplicate };
    }
    
    setData(newData);
    if (onSaveTableData) {
      onSaveTableData(data.id, newData);
    }
    setShowContextMenu(null);
  };

  const handleFreezeRow = (rowIndex) => {
    setFrozenRows(rowIndex + 1);
    setShowContextMenu(null);
  };

  const handleFreezeColumn = (colIndex) => {
    setFrozenColumns(colIndex + 1);
    setShowContextMenu(null);
  };

  const getDropdownPosition = (rowIndex, colIndex, menuType = 'content') => {
    // Calculate smart positioning to avoid menu being cut off
    const tableHeight = data.rows.length;
    const tableWidth = data.rows[0]?.length || 0;
    
    // Default to showing above for better visibility
    let top = 'auto';
    let right = '2px';
    let left = 'auto';
    let bottom = '100%'; // Show above the cell by default
    
    // Only show below if we're in the very top rows (first 2 rows)
    if (rowIndex < 2) {
      bottom = 'auto';
      top = '100%'; // Show below the cell
    }
    
    // If we're in the right half of the table, show menu on the left
    if (colIndex > tableWidth / 2) {
      left = '2px';
      right = 'auto';
    }
    
    return { top, right, left, bottom };
  };

  const handleUnfreeze = () => {
    setFrozenRows(0);
    setFrozenColumns(0);
    setShowContextMenu(null);
  };

  // Calculate sticky positions for frozen cells
  const getCellStyle = (rowIndex, colIndex) => {
    const isFrozenRow = rowIndex < frozenRows;
    const isFrozenCol = colIndex < frozenColumns;
    const isSticky = isFrozenRow || isFrozenCol;
    
    let style = {
      border: '1px solid #ddd',
      padding: '8px',
      position: isSticky ? 'sticky' : 'relative',
      minHeight: '40px',
      minWidth: '150px',
      backgroundColor: hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex ? '#f0f8ff' : 
                     isSticky ? '#f8f9fa' : 'white',
      borderTop: rowIndex === frozenRows ? '2px solid #007bff' : '1px solid #ddd',
      borderLeft: colIndex === frozenColumns ? '2px solid #007bff' : '1px solid #ddd',
      zIndex: 1
    };

    if (isFrozenRow) {
      style.top = 0;
      style.zIndex = 101;
    }
    
    if (isFrozenCol) {
      style.left = 0;
      style.zIndex = 101;
    }
    
    // Corner cell (both row and column frozen)
    if (isFrozenRow && isFrozenCol) {
      style.zIndex = 102;
    }

    return style;
  };

  const handleCellEdit = (rowIndex, colIndex, newContent) => {
    const newData = { ...data };
    newData.rows[rowIndex][colIndex].content = newContent;
    setData(newData);
    
    // Save to backend
    if (onSaveTableData) {
      onSaveTableData(data.id, newData);
    }
  };

  const handleCellTypeChange = (rowIndex, colIndex, newType) => {
    const newData = { ...data };
    newData.rows[rowIndex][colIndex].type = newType;
    if (newType === 'image') {
      newData.rows[rowIndex][colIndex].content = '';
    }
    setData(newData);
    
    if (onSaveTableData) {
      onSaveTableData(data.id, newData);
    }
  };

  const handleImageDrop = (e, rowIndex, colIndex) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newData = { ...data };
        newData.rows[rowIndex][colIndex] = {
          content: event.target.result,
          type: 'image'
        };
        setData(newData);
        
        if (onSaveTableData) {
          onSaveTableData(data.id, newData);
        }
      };
      reader.readAsDataURL(imageFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const addRow = () => {
    const newData = { ...data };
    const newRow = data.rows[0].map(() => ({ content: '', type: 'text' }));
    newData.rows.push(newRow);
    setData(newData);
    
    if (onSaveTableData) {
      onSaveTableData(data.id, newData);
    }
  };

  const addColumn = () => {
    const newData = { ...data };
    newData.rows.forEach(row => {
      row.push({ content: '', type: 'text' });
    });
    setData(newData);
    
    if (onSaveTableData) {
      onSaveTableData(data.id, newData);
    }
  };

  const deleteRow = (rowIndex) => {
    if (data.rows.length <= 1) return; // Keep at least one row
    const newData = { ...data };
    newData.rows.splice(rowIndex, 1);
    setData(newData);
    
    if (onSaveTableData) {
      onSaveTableData(data.id, newData);
    }
  };

  const deleteColumn = (colIndex) => {
    if (data.rows[0].length <= 1) return; // Keep at least one column
    const newData = { ...data };
    newData.rows.forEach(row => {
      row.splice(colIndex, 1);
    });
    setData(newData);
    
    if (onSaveTableData) {
      onSaveTableData(data.id, newData);
    }
  };

  const handleCellHover = (rowIndex, colIndex) => {
    setHoveredCell({ row: rowIndex, col: colIndex });
  };

  const handleAddNestedTable = (rowIndex, colIndex, tableSize = '3x3') => {
    const [rows, cols] = tableSize.split('x').map(Number);
    const newTableData = {
      id: Date.now(),
      name: `Table ${rows}x${cols}`,
      rows: Array(rows).fill().map(() => 
        Array(cols).fill().map(() => ({ content: '', type: 'text' }))
      )
    };
    
    const newData = { ...data };
    newData.rows[rowIndex][colIndex] = {
      content: newTableData,
      type: 'table'
    };
    setData(newData);
    
    if (onSaveTableData) {
      onSaveTableData(data.id, newData);
    }
    setShowTableSizeMenu(null);
    setShowContentTypeMenu(null); // Also close content type menu if it's open
  };

  const handleContentTypeChange = (rowIndex, colIndex, contentType, position = null) => {
    const newData = { ...data };
    
    switch (contentType) {
      case 'image':
        newData.rows[rowIndex][colIndex] = { content: '', type: 'image' };
        break;
      case 'table':
        setShowContentTypeMenu(null); // Close content type menu first
        setShowTableSizeMenu({ 
          row: rowIndex, 
          col: colIndex,
          x: position?.x || 0,
          y: position?.y || 0
        });
        return; // Don't process data change
      case 'code':
        newData.rows[rowIndex][colIndex] = { content: '// Code here', type: 'code' };
        break;
      case 'separator':
        newData.rows[rowIndex][colIndex] = { content: '---', type: 'separator' };
        break;
      case 'action-list':
        newData.rows[rowIndex][colIndex] = { content: '□ Task 1\n□ Task 2', type: 'action-list' };
        break;
      case 'drawing':
        newData.rows[rowIndex][colIndex] = { content: '', type: 'drawing' };
        break;
      case 'diagram':
        newData.rows[rowIndex][colIndex] = { content: '', type: 'diagram' };
        break;
      default:
        newData.rows[rowIndex][colIndex] = { content: '', type: 'text' };
    }
    
    setData(newData);
    if (onSaveTableData) {
      onSaveTableData(data.id, newData);
    }
    setShowContentTypeMenu(null);
  };

  const handleEdgeHover = (edge, rowIndex, colIndex) => {
    setShowAddOptions({ edge, row: rowIndex, col: colIndex });
  };

  return (
    <div style={{ position: 'relative', border: '1px solid #ccc', margin: '1rem 0' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '0.5rem',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ccc'
      }}>
        <h4>{data.name}</h4>
        <button 
          onClick={() => onDeleteTable && onDeleteTable(data.id)}
          style={{ 
            background: '#ff4444', 
            color: 'white', 
            border: 'none', 
            borderRadius: '3px',
            padding: '2px 6px',
            fontSize: '12px'
          }}
        >
          Delete
        </button>
      </div>

      {/* Scrollable table container */}
      <div style={{ 
        position: 'relative',
        border: '1px solid #ddd'
      }}>
        <div style={{ 
          maxHeight: '400px',
          maxWidth: '100%', 
          overflow: 'auto',
          position: 'relative'
        }}>
          <table style={{ 
            width: 'max-content', 
            minWidth: '100%',
            borderCollapse: 'collapse',
            position: 'relative'
          }}>
          <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td 
                  key={colIndex}
                  style={getCellStyle(rowIndex, colIndex)}
                  onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                  onMouseLeave={() => setHoveredCell(null)}
                  onDrop={(e) => handleImageDrop(e, rowIndex, colIndex)}
                  onDragOver={handleDragOver}
                  onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
                >
                  {cell.type === 'text' ? (
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={cell.content}
                        onChange={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
                        style={{ 
                          border: 'none', 
                          background: 'transparent', 
                          width: '100%',
                          outline: 'none'
                        }}
                        placeholder="Enter text or drag image..."
                      />
                    </div>
                  ) : cell.type === 'image' ? (
                    <div style={{ position: 'relative' }}>
                      {cell.content ? (
                        <img 
                          src={cell.content} 
                          alt="Cell content" 
                          style={{ maxWidth: '100%', maxHeight: '100px' }}
                        />
                      ) : (
                        <div style={{ 
                          border: '2px dashed #ccc', 
                          padding: '20px', 
                          textAlign: 'center',
                          color: '#999'
                        }}>
                          Drag image here
                        </div>
                      )}
                      <button
                        onClick={() => handleCellTypeChange(rowIndex, colIndex, 'text')}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '1px 4px',
                          fontSize: '10px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : cell.type === 'table' ? (
                    <InteractiveTable 
                      tableData={cell.content} 
                      onCreateNestedTable={onCreateNestedTable}
                      onDeleteTable={onDeleteTable}
                      onSaveTableData={onSaveTableData}
                    />
                  ) : cell.type === 'code' ? (
                    <div style={{ position: 'relative' }}>
                      <textarea
                        value={cell.content}
                        onChange={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '60px',
                          fontFamily: 'monospace',
                          background: '#f4f4f4',
                          border: '1px solid #ddd',
                          padding: '8px',
                          fontSize: '12px'
                        }}
                        placeholder="Enter code..."
                      />
                    </div>
                  ) : cell.type === 'separator' ? (
                    <div style={{ 
                      borderTop: '2px solid #ddd', 
                      margin: '10px 0',
                      textAlign: 'center',
                      color: '#666'
                    }}>
                      {cell.content}
                    </div>
                  ) : cell.type === 'action-list' ? (
                    <div style={{ position: 'relative' }}>
                      <textarea
                        value={cell.content}
                        onChange={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
                        style={{
                          width: '100%',
                          minHeight: '60px',
                          border: '1px solid #ddd',
                          padding: '8px',
                          fontSize: '12px'
                        }}
                        placeholder="□ Task 1&#10;□ Task 2"
                      />
                    </div>
                  ) : cell.type === 'drawing' ? (
                    <div style={{ 
                      border: '2px dashed #ccc', 
                      padding: '20px', 
                      textAlign: 'center',
                      color: '#999',
                      minHeight: '60px'
                    }}>
                      Drawing Board (Click to draw)
                    </div>
                  ) : cell.type === 'diagram' ? (
                    <div style={{ 
                      border: '2px dashed #ccc', 
                      padding: '20px', 
                      textAlign: 'center',
                      color: '#999',
                      minHeight: '60px'
                    }}>
                      Diagram Area
                    </div>
                  ) : (
                    cell.content
                  )}

                  {/* Hover buttons for cell actions */}
                  {hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '2px', 
                      right: '2px',
                      display: 'flex',
                      gap: '2px'
                    }}>
                      <button
                        className="add-content-btn"
                        onClick={(e) => {
                          console.log('Plus button clicked for cell:', rowIndex, colIndex);
                          const rect = e.target.getBoundingClientRect();
                          setShowContentTypeMenu({ 
                            row: rowIndex, 
                            col: colIndex,
                            x: rect.left,
                            y: rect.bottom + 2
                          });
                        }}
                        style={{
                          background: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '2px 6px',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                        title="Add content"
                      >
                        +
                      </button>
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
          </table>
        </div>
      </div>

      {/* Edge hover areas for adding new rows/columns */}
      <div 
        style={{
          position: 'absolute',
          bottom: '-10px',
          left: '0',
          right: '0',
          height: '10px',
          background: 'transparent',
          cursor: 'pointer'
        }}
        onMouseEnter={() => setShowAddOptions({ edge: 'bottom' })}
        onMouseLeave={() => setShowAddOptions(null)}
      >
        {showAddOptions?.edge === 'bottom' && (
          <button
            onClick={addRow}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              padding: '2px 8px',
              fontSize: '10px'
            }}
          >
            + Add Row
          </button>
        )}
      </div>

      {/* Table management controls */}
      <div style={{ 
        marginTop: '10px', 
        padding: '5px',
        background: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '3px',
        display: 'flex',
        gap: '5px',
        fontSize: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={addRow} style={{ padding: '2px 6px', fontSize: '10px' }}>+ Row</button>
          <button onClick={addColumn} style={{ padding: '2px 6px', fontSize: '10px' }}>+ Column</button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {(frozenRows > 0 || frozenColumns > 0) && (
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              {frozenRows > 0 && (
                <span style={{ fontSize: '10px', color: '#007bff', background: '#e3f2fd', padding: '1px 4px', borderRadius: '2px' }}>
                  🔒 {frozenRows} row{frozenRows > 1 ? 's' : ''}
                </span>
              )}
              {frozenColumns > 0 && (
                <span style={{ fontSize: '10px', color: '#007bff', background: '#e3f2fd', padding: '1px 4px', borderRadius: '2px' }}>
                  🔒 {frozenColumns} col{frozenColumns > 1 ? 's' : ''}
                </span>
              )}
              <button 
                onClick={handleUnfreeze}
                style={{ 
                  padding: '1px 4px', 
                  fontSize: '9px', 
                  background: '#ff4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '2px' 
                }}
              >
                Unfreeze
              </button>
            </div>
          )}
          
          <span style={{ margin: '0 10px', color: '#666' }}>
            {data.rows.length} rows × {data.rows[0]?.length || 0} columns
          </span>
        </div>
      </div>

      {/* Global Content Type Dropdown Menu */}
      {showContentTypeMenu && (
        <div 
          className="content-menu" 
          style={{
            position: 'fixed',
            top: showContentTypeMenu.y || 0,
            left: showContentTypeMenu.x || 0,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            minWidth: '150px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}
          onMouseDown={(e) => {
            console.log('Dropdown clicked');
            e.stopPropagation();
          }}
        >
          <div style={{ padding: '8px', fontWeight: 'bold', borderBottom: '1px solid #eee', fontSize: '12px' }}>
            Add Content
          </div>
          <div 
            onClick={() => handleContentTypeChange(showContentTypeMenu.row, showContentTypeMenu.col, 'image')}
            style={{ padding: '6px 8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            📷 Image
          </div>
          <div 
            onClick={(e) => {
              const rect = e.target.getBoundingClientRect();
              handleContentTypeChange(showContentTypeMenu.row, showContentTypeMenu.col, 'table', {
                x: rect.left,
                y: rect.bottom + 2
              });
            }}
            style={{ padding: '6px 8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            📋 Table
          </div>
          <div 
            onClick={() => handleContentTypeChange(showContentTypeMenu.row, showContentTypeMenu.col, 'code')}
            style={{ padding: '6px 8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            💻 Code block
          </div>
          <div 
            onClick={() => handleContentTypeChange(showContentTypeMenu.row, showContentTypeMenu.col, 'separator')}
            style={{ padding: '6px 8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            ➖ Separator line
          </div>
          <div 
            onClick={() => handleContentTypeChange(showContentTypeMenu.row, showContentTypeMenu.col, 'action-list')}
            style={{ padding: '6px 8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            ☑️ Action item list
          </div>
          <div 
            onClick={() => handleContentTypeChange(showContentTypeMenu.row, showContentTypeMenu.col, 'drawing')}
            style={{ padding: '6px 8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            🎨 Drawing board
          </div>
          <div 
            onClick={() => handleContentTypeChange(showContentTypeMenu.row, showContentTypeMenu.col, 'diagram')}
            style={{ padding: '6px 8px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            📊 Diagram
          </div>
        </div>
      )}

      {/* Global Table Size Dropdown Menu */}
      {showTableSizeMenu && (
        <div className="content-menu" style={{
          position: 'fixed',
          top: showTableSizeMenu.y || 0,
          left: showTableSizeMenu.x || 0,
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 10000, // Higher than content menu
          minWidth: '120px',
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '8px', fontWeight: 'bold', borderBottom: '1px solid #eee', fontSize: '12px' }}>
            Table Size
          </div>
          {['3x3', '2x1', '1x2', '5x5', '1x3', '3x1', '2x2', '4x4'].map(size => (
            <div 
              key={size}
              onClick={() => handleAddNestedTable(showTableSizeMenu.row, showTableSizeMenu.col, size)}
              style={{ 
                padding: '6px 8px', 
                cursor: 'pointer', 
                fontSize: '12px',
                borderBottom: '1px solid #f0f0f0'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              {size}
            </div>
          ))}
          {['Headed 2x2', 'Headed 3x3', 'Headed 2x1', 'Headed 5x5', 'Headed 1x2'].map(size => (
            <div 
              key={size}
              onClick={() => handleAddNestedTable(showTableSizeMenu.row, showTableSizeMenu.col, size.replace('Headed ', ''))}
              style={{ 
                padding: '6px 8px', 
                cursor: 'pointer', 
                fontSize: '12px',
                borderBottom: '1px solid #f0f0f0'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              {size}
            </div>
          ))}
        </div>
      )}

      {/* Global Context Menu */}
      {showContextMenu && (
        <div 
          className="content-menu"
          style={{
            position: 'fixed',
            top: showContextMenu.y,
            left: showContextMenu.x,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1002,
            minWidth: '160px'
          }}
        >
          <div style={{ padding: '6px 0', fontSize: '11px', color: '#666', textAlign: 'center', borderBottom: '1px solid #eee' }}>
            Cell [{showContextMenu.row + 1}, {showContextMenu.col + 1}]
          </div>
          
          <div 
            onClick={() => handleDeleteCell(showContextMenu.row, showContextMenu.col)}
            style={{ 
              padding: '8px 12px', 
              cursor: 'pointer', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            🗑️ Delete
          </div>
          
          <div 
            onClick={() => handleDuplicateCell(showContextMenu.row, showContextMenu.col)}
            style={{ 
              padding: '8px 12px', 
              cursor: 'pointer', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            📋 Duplicate
          </div>
          
          <div style={{ borderTop: '1px solid #eee', margin: '4px 0' }}></div>
          
          <div 
            onClick={() => handleFreezeRow(showContextMenu.row)}
            style={{ 
              padding: '8px 12px', 
              cursor: 'pointer', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            🔒 Freeze rows up to here
          </div>
          
          <div 
            onClick={() => handleFreezeColumn(showContextMenu.col)}
            style={{ 
              padding: '8px 12px', 
              cursor: 'pointer', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            🔒 Freeze columns up to here
          </div>
          
          {(frozenRows > 0 || frozenColumns > 0) && (
            <div 
              onClick={handleUnfreeze}
              style={{ 
                padding: '8px 12px', 
                cursor: 'pointer', 
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#007bff'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              🔓 Unfreeze all
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default InteractiveTable;