'use client';
// Admin-only page displaying captured application errors in a comprehensive dashboard

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  fetchErrorLogs, 
  fetchErrorStats, 
  updateErrorLogRecord,
  ErrorLogRecord, 
  ErrorLogFilters,
  ErrorStats,
  ErrorLogUpdate
} from '../../../services/errorMonitoringService';
import { getToken, isTokenExpired, isAdmin } from '../../../services/authUtils';
import { showError, showSuccess } from '../../../components/ToastProvider';

export default function ErrorMonitoringPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ErrorLogRecord[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedError, setSelectedError] = useState<ErrorLogRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<ErrorLogFilters>({
    limit: 50,
    offset: 0
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorType, setErrorType] = useState('');
  const [severity, setSeverity] = useState('');
  const [resolved, setResolved] = useState('');
  const [route, setRoute] = useState('');

  // Load data on mount and when filters change
  useEffect(() => {
    const token = getToken();
    if (!token || isTokenExpired(token) || !isAdmin()) {
      localStorage.removeItem('token');
      showError('Session expired. Please login again.');
      router.push('/login');
      return;
    }
    
    loadData();
  }, [router, filters]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Apply date filters
      const currentFilters = { ...filters };
      if (startDate) currentFilters.start_date = startDate;
      if (endDate) currentFilters.end_date = endDate;
      if (errorType) currentFilters.error_type = errorType;
      if (severity) currentFilters.severity = severity;
      if (resolved) currentFilters.resolved = resolved;
      if (route) currentFilters.route = route;

      const [logsData, statsData] = await Promise.all([
        fetchErrorLogs(currentFilters),
        fetchErrorStats(7)
      ]);
      
      setLogs(logsData);
      setStats(statsData);
    } catch (err) {
      setError('Unable to fetch error logs');
      showError('Failed to load errors');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateError = async (errorId: string, updateData: ErrorLogUpdate) => {
    setUpdating(true);
    try {
      const updatedError = await updateErrorLogRecord(errorId, updateData);
      setLogs(logs.map(log => log.id === errorId ? updatedError : log));
      if (selectedError?.id === errorId) {
        setSelectedError(updatedError);
      }
      showSuccess('Error log updated successfully');
    } catch (err) {
      showError('Failed to update error log');
    } finally {
      setUpdating(false);
    }
  };

  const handleFilterChange = () => {
    setFilters(prev => ({
      ...prev,
      offset: 0 // Reset pagination when filters change
    }));
  };

  const handleViewDetails = (error: ErrorLogRecord) => {
    setSelectedError(error);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedError(null);
  };

  // Helper functions
  const fmt = (iso: string) => new Date(iso).toLocaleString();
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-800';
      case 'error': return 'bg-red-600';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      case 'debug': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getResolvedColor = (resolved: string) => {
    switch (resolved) {
      case 'resolved': return 'bg-green-500';
      case 'investigating': return 'bg-blue-500';
      case 'ignored': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'ValidationError': return 'bg-yellow-500';
      case 'AuthenticationError': return 'bg-orange-500';
      case 'PermissionError': return 'bg-red-500';
      case 'TimeoutError': return 'bg-purple-500';
      case 'Exception': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 space-y-6">
      {/* Navigation */}
      <Link href="/admin" className="self-start text-blue-600 underline">
        ← Back to Admin Dashboard
      </Link>

      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Error Monitoring Dashboard</h1>
        <button 
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Errors (7d)</h3>
            <p className="text-3xl font-bold text-red-600">{stats.total_errors}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Unresolved</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.unresolved_errors}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Critical</h3>
            <p className="text-3xl font-bold text-red-800">{stats.severities.critical || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">{stats.resolutions.resolved || 0}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Error Type</label>
            <select
              value={errorType}
              onChange={(e) => setErrorType(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="ValidationError">Validation Error</option>
              <option value="AuthenticationError">Authentication Error</option>
              <option value="PermissionError">Permission Error</option>
              <option value="TimeoutError">Timeout Error</option>
              <option value="Exception">Exception</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={resolved}
              onChange={(e) => setResolved(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="ignored">Ignored</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Route</label>
            <input
              type="text"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="Filter by route..."
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleFilterChange}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setErrorType('');
              setSeverity('');
              setResolved('');
              setRoute('');
              setFilters({ limit: 50, offset: 0 });
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Error Logs ({logs.length})</h3>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        )}
        
        {error && (
          <div className="px-6 py-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {!loading && !error && logs.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            <p>No errors found matching the current filters.</p>
          </div>
        )}
        
        {!loading && !error && logs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fmt(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-white text-xs ${getErrorTypeColor(log.error_type)}`}>
                        {log.error_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-white text-xs ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.route || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-white text-xs ${getResolvedColor(log.resolved)}`}>
                        {log.resolved}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(log)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        View
                      </button>
                      {log.resolved === 'pending' && (
                        <button
                          onClick={() => handleUpdateError(log.id, { resolved: 'investigating' })}
                          disabled={updating}
                          className="text-orange-600 hover:text-orange-900 mr-2"
                        >
                          Investigate
                        </button>
                      )}
                      {log.resolved === 'investigating' && (
                        <button
                          onClick={() => handleUpdateError(log.id, { resolved: 'resolved' })}
                          disabled={updating}
                          className="text-green-600 hover:text-green-900"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Error Details Modal */}
      {showDetails && selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Error Details</h2>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Error Type</dt>
                      <dd className="text-sm text-gray-900">{selectedError.error_type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Message</dt>
                      <dd className="text-sm text-gray-900">{selectedError.message}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Severity</dt>
                      <dd className="text-sm text-gray-900">{selectedError.severity}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm text-gray-900">{selectedError.resolved}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="text-sm text-gray-900">{fmt(selectedError.created_at)}</dd>
                    </div>
                    {selectedError.resolved_at && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Resolved</dt>
                        <dd className="text-sm text-gray-900">{fmt(selectedError.resolved_at)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Request Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Route</dt>
                      <dd className="text-sm text-gray-900">{selectedError.route || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Method</dt>
                      <dd className="text-sm text-gray-900">{selectedError.method || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Request ID</dt>
                      <dd className="text-sm text-gray-900">{selectedError.request_id || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">User ID</dt>
                      <dd className="text-sm text-gray-900">{selectedError.user_id || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                      <dd className="text-sm text-gray-900">{selectedError.ip_address || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">User Agent</dt>
                      <dd className="text-sm text-gray-900 truncate">{selectedError.user_agent || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {selectedError.stack_trace && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Stack Trace</h3>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                    {selectedError.stack_trace}
                  </pre>
                </div>
              )}
              
              {selectedError.request_data && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Request Data</h3>
                  <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedError.request_data, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Admin Notes</h3>
                <textarea
                  value={selectedError.admin_notes || ''}
                  onChange={(e) => {
                    setSelectedError({
                      ...selectedError,
                      admin_notes: e.target.value
                    });
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={3}
                  placeholder="Add admin notes..."
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleUpdateError(selectedError.id, { admin_notes: selectedError.admin_notes })}
                    disabled={updating}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Save Notes
                  </button>
                  <select
                    value={selectedError.resolved}
                    onChange={(e) => {
                      setSelectedError({
                        ...selectedError,
                        resolved: e.target.value
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="ignored">Ignored</option>
                  </select>
                  <button
                    onClick={() => handleUpdateError(selectedError.id, { resolved: selectedError.resolved })}
                    disabled={updating}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
