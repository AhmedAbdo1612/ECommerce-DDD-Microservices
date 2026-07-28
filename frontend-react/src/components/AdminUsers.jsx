import React, { useState, useEffect } from 'react';
import { api } from '../api/services';
import { useTheme } from '../hooks/useTheme';
import { Copy, Check, Shield, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [updating, setUpdating] = useState(false);

  const availableRoles = ['Admin', 'Customer', 'Manager'];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.identity.getAllUsers();
      const items = res.data?.users || res.data || [];
      setUsers(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
    setIsConfirming(false);
    setIsModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
      setSelectedRoles([]);
      setIsConfirming(false);
    }, 200);
  };

  const toggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleUpdateRoles = async () => {
    if (!selectedUser) return;
    try {
      setUpdating(true);
      const uId = selectedUser.userId || selectedUser.id;
      await api.identity.updateUserRoles(uId, selectedRoles);
      toast.success('User roles updated successfully');
      closeRoleModal();
      fetchUsers(); // Refresh the list
    } catch (err) {
      toast.error(err.response?.data?.title || err.message || 'Failed to update roles');
    } finally {
      setUpdating(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return '?';
    return `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;
  };

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return { background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)' };
      case 'customer':
        return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' };
      case 'manager':
        return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
      default:
        return { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' };
    }
  };

  // Styles
  const containerStyle = {
    width: '100%',
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  };

  const tableContainerStyle = {
    background: theme.backgroundAlt,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: theme.shadow,
    border: `1px solid ${theme.border}`
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed'
  };

  const thStyle = (width) => ({
    padding: '1rem',
    textAlign: 'left',
    background: theme.backgroundCard,
    color: theme.textSecondary,
    borderBottom: `1px solid ${theme.border}`,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    width: width || 'auto'
  });

  const tdStyle = {
    padding: '1rem',
    borderBottom: `1px solid ${theme.border}`,
    color: theme.textPrimary,
    verticalAlign: 'middle'
  };

  const avatarContainerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    color: '#ffffff',
    fontWeight: '600',
    flexShrink: 0
  };

  // Modal Styles
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    opacity: isModalOpen ? 1 : 0,
    pointerEvents: isModalOpen ? 'auto' : 'none',
    transition: 'opacity 0.2s ease'
  };

  const modalContentStyle = {
    background: theme.backgroundCard,
    border: `1px solid ${theme.border}`,
    borderRadius: '16px',
    width: '100%',
    maxWidth: '480px',
    padding: '2rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    transform: isModalOpen ? 'scale(1)' : 'scale(0.95)',
    transition: 'transform 0.2s ease'
  };

  if (loading) {
    return <div style={{ color: theme.textPrimary, padding: '2rem', textAlign: 'center' }}>Loading users...</div>;
  }

  if (error) {
    return <div style={{ color: '#ef4444', padding: '2rem', textAlign: 'center' }}>Error: {error}</div>;
  }

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const id = (user.userId || user.id || '').toLowerCase();
    return fullName.includes(query) || email.includes(query) || id.includes(query);
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{ color: theme.textPrimary, margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>User Management</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              border: `1px solid ${theme.border}`, 
              background: theme.backgroundCard, 
              color: theme.textPrimary, 
              outline: 'none', 
              width: '300px',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <div style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.875rem', fontWeight: '500', whiteSpace: 'nowrap' }}>
            Users: {filteredUsers.length}
          </div>
        </div>
      </div>

      <div style={tableContainerStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle('25%')}>User</th>
              <th style={thStyle('30%')}>User ID</th>
              <th style={thStyle('30%')}>Roles</th>
              <th style={thStyle('15%')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const hasName = user.firstName || user.lastName;
              const fullName = hasName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unnamed User';
              const uId = user.userId || user.id;

              return (
                <tr 
                  key={uId} 
                  style={{ transition: 'background 0.2s ease', cursor: 'default' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={avatarContainerStyle}>
                        {getInitials(user.firstName, user.lastName)}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                        <span style={{ fontWeight: '600', color: !hasName ? theme.textSecondary : theme.textPrimary, fontStyle: !hasName ? 'italic' : 'normal', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {fullName}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: theme.textSecondary, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {user.email || 'No email provided'}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <code style={{ padding: '0.25rem 0.5rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '4px', border: `1px solid ${theme.border}`, fontFamily: 'monospace', fontSize: '0.75rem', color: theme.textSecondary, wordBreak: 'break-all', display: 'inline-block' }}>
                        {uId ? uId : 'N/A'}
                      </code>
                      {uId && (
                        <button
                          onClick={() => handleCopyId(uId)}
                          title="Copy Full ID"
                          style={{
                            padding: '0.4rem',
                            borderRadius: '4px',
                            background: 'transparent',
                            border: 'none',
                            color: copiedId === uId ? '#4ade80' : theme.textSecondary,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            if (copiedId !== uId) {
                              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                              e.currentTarget.style.color = theme.textPrimary;
                            }
                          }}
                          onMouseOut={(e) => {
                            if (copiedId !== uId) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = theme.textSecondary;
                            }
                          }}
                        >
                          {copiedId === uId ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      )}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map(role => (
                          <span 
                            key={role} 
                            style={{
                              padding: '0.25rem 0.75rem',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              borderRadius: '9999px',
                              ...getRoleBadgeStyle(role)
                            }}
                          >
                            {role}
                          </span>
                        ))
                      ) : (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          borderRadius: '9999px',
                          background: 'rgba(107, 114, 128, 0.1)',
                          color: '#6b7280',
                          border: '1px solid rgba(107, 114, 128, 0.2)'
                        }}>
                          No Roles
                        </span>
                      )}
                    </div>
                  </td>
                  
                  <td style={tdStyle}>
                    <button
                      onClick={() => openRoleModal(user)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: '#818cf8',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                      }}
                    >
                      <Shield size={16} />
                      Manage
                    </button>
                  </td>
                </tr>
              );
            })}
            
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" style={{ ...tdStyle, padding: '3rem 1rem', textAlign: 'center', color: theme.textSecondary }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: '500' }}>No users found</span>
                    <span style={{ fontSize: '0.875rem' }}>There are currently no users registered in the system.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Role Management Modal */}
      <div style={modalOverlayStyle} onClick={closeRoleModal}>
        <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
          {selectedUser && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: theme.textPrimary, margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Manage Roles</h3>
                <button onClick={closeRoleModal} style={{ background: 'transparent', border: 'none', color: theme.textSecondary, cursor: 'pointer', padding: '0.5rem' }}>
                  <X size={20} />
                </button>
              </div>

              {!isConfirming ? (
                <>
                  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: theme.textSecondary, fontSize: '0.875rem' }}>User</p>
                    <p style={{ margin: 0, color: theme.textPrimary, fontWeight: '600' }}>{selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: theme.textPrimary, fontWeight: '600' }}>Assign Roles:</p>
                    {availableRoles.map(role => (
                      <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem', background: selectedRoles.includes(role) ? 'rgba(99, 102, 241, 0.05)' : 'transparent', border: `1px solid ${selectedRoles.includes(role) ? '#6366f1' : theme.border}`, borderRadius: '8px', transition: 'all 0.2s ease' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedRoles.includes(role)} 
                          onChange={() => toggleRole(role)}
                          style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                        />
                        <span style={{ color: theme.textPrimary, fontWeight: '500' }}>{role}</span>
                      </label>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={closeRoleModal} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textPrimary, borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => setIsConfirming(true)} style={{ padding: '0.75rem 1.5rem', background: '#6366f1', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Review Changes</button>
                  </div>
                </>
              ) : (
                <div style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '2rem',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  marginTop: '-1rem'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: '#fef3c7', color: '#d97706', marginBottom: '1rem' }}>
                      <AlertTriangle size={32} />
                    </div>
                    <h4 style={{ color: '#111827', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>Confirm Role Changes</h4>
                    <p style={{ color: '#4b5563', margin: 0, fontSize: '0.875rem' }}>Review the changes before applying them to <span style={{fontWeight: '600'}}>{selectedUser.firstName}</span>.</p>
                  </div>

                  <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                      {(() => {
                        const original = selectedUser.roles || [];
                        const added = selectedRoles.filter(r => !original.includes(r));
                        const removed = original.filter(r => !selectedRoles.includes(r));
                        const unchanged = original.filter(r => selectedRoles.includes(r));

                        const allChanges = [];
                        
                        unchanged.forEach(role => {
                          allChanges.push(
                            <span key={`u-${role}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', fontWeight: '500', borderRadius: '9999px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}>
                              {role}
                            </span>
                          );
                        });

                        added.forEach(role => {
                          allChanges.push(
                            <span key={`a-${role}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', fontWeight: '600', borderRadius: '9999px', background: '#dcfce3', color: '#166534', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>+</span> {role}
                            </span>
                          );
                        });

                        removed.forEach(role => {
                          allChanges.push(
                            <span key={`r-${role}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', fontWeight: '500', borderRadius: '9999px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', textDecoration: 'line-through', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ fontSize: '1rem', fontWeight: 'bold', textDecoration: 'none' }}>-</span> {role}
                            </span>
                          );
                        });

                        if (allChanges.length === 0) {
                          return <span style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '0.875rem' }}>No roles assigned</span>;
                        }

                        return allChanges;
                      })()}
                    </div>
                    
                    {(selectedRoles.filter(r => !(selectedUser.roles || []).includes(r)).length === 0 && (selectedUser.roles || []).filter(r => !selectedRoles.includes(r)).length === 0) && (
                       <p style={{ textAlign: 'center', margin: '1rem 0 0 0', fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>No changes detected.</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button 
                      onClick={() => setIsConfirming(false)} 
                      disabled={updating} 
                      style={{ padding: '0.625rem 1.25rem', background: '#ffffff', border: '1px solid #d1d5db', color: '#374151', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleUpdateRoles} 
                      disabled={updating || (selectedRoles.filter(r => !(selectedUser.roles || []).includes(r)).length === 0 && (selectedUser.roles || []).filter(r => !selectedRoles.includes(r)).length === 0)} 
                      style={{ padding: '0.625rem 1.25rem', background: '#4f46e5', border: 'none', color: '#ffffff', borderRadius: '6px', fontWeight: '600', cursor: (updating || (selectedRoles.filter(r => !(selectedUser.roles || []).includes(r)).length === 0 && (selectedUser.roles || []).filter(r => !selectedRoles.includes(r)).length === 0)) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', opacity: (updating || (selectedRoles.filter(r => !(selectedUser.roles || []).includes(r)).length === 0 && (selectedUser.roles || []).filter(r => !selectedRoles.includes(r)).length === 0)) ? 0.6 : 1 }}
                      onMouseOver={(e) => { if (!updating && !(selectedRoles.filter(r => !(selectedUser.roles || []).includes(r)).length === 0 && (selectedUser.roles || []).filter(r => !selectedRoles.includes(r)).length === 0)) e.currentTarget.style.background = '#4338ca' }}
                      onMouseOut={(e) => { if (!updating) e.currentTarget.style.background = '#4f46e5' }}
                    >
                      {updating ? 'Saving...' : 'Confirm & Save'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
