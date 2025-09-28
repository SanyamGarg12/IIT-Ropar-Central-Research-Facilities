import React, { useState, useEffect } from 'react';
import { FaArrowUp, FaArrowDown, FaHistory, FaFilter, FaDownload } from 'react-icons/fa';
import { API_BASED_URL } from '../config.js';
import { secureFetch } from '../utils/security';

const SupervisorTransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [supervisorInfo, setSupervisorInfo] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const itemsPerPage = 20;

  useEffect(() => {
    fetchSupervisorInfo();
    fetchTransactions();
  }, [currentPage, filterType]);

  const fetchSupervisorInfo = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await secureFetch(`${API_BASED_URL}api/supervisor/me`, {
        headers: { Authorization: token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSupervisorInfo(data);
      }
    } catch (error) {
      console.error('Error fetching supervisor info:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('userToken');
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });

      if (filterType !== 'all') {
        params.append('type', filterType);
      }

      const response = await secureFetch(`${API_BASED_URL}api/supervisor/transactions?${params}`, {
        headers: { Authorization: token }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setTotalPages(data.pagination.pages);
        setTotalTransactions(data.pagination.total);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      setError('An error occurred while fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'TOP_UP':
        return <FaArrowUp className="text-green-600" />;
      case 'BOOKING_APPROVAL':
      case 'SUPERUSER_BOOKING':
      case 'SUPERUSER_ACTIVATION':
        return <FaArrowDown className="text-red-600" />;
      case 'BOOKING_REFUND':
      case 'SUPERUSER_REFUND':
        return <FaArrowUp className="text-blue-600" />;
      default:
        return <FaHistory className="text-gray-600" />;
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'TOP_UP':
        return 'Top-up';
      case 'BOOKING_APPROVAL':
        return 'Booking Approved';
      case 'BOOKING_REFUND':
        return 'Booking Refund';
      case 'SUPERUSER_BOOKING':
        return 'Superuser Booking';
      case 'SUPERUSER_ACTIVATION':
        return 'Superuser Activation';
      case 'SUPERUSER_REFUND':
        return 'Superuser Refund';
      default:
        return type;
    }
  };

  const getAmountColor = (amount) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterType('all');
    setCurrentPage(1);
  };

  const exportTransactions = () => {
    // Create CSV content
    const headers = ['Date', 'Type', 'Amount', 'Balance After', 'Description', 'Facility', 'Student'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        formatDate(t.created_at),
        getTransactionTypeLabel(t.transaction_type),
        t.amount,
        t.balance_after,
        `"${t.description || ''}"`,
        `"${t.facility_name || ''}"`,
        `"${t.student_name || ''}"`
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supervisor-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading && !supervisorInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
        {supervisorInfo && (
          <p className="text-gray-600">
            Welcome, {supervisorInfo.name} | Current Balance: ₹{Number(supervisorInfo.wallet_balance || 0).toFixed(2)}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Transactions</option>
            <option value="TOP_UP">Top-ups</option>
            <option value="BOOKING_APPROVAL">Booking Approvals</option>
            <option value="BOOKING_REFUND">Booking Refunds</option>
            <option value="SUPERUSER_BOOKING">Superuser Bookings</option>
            <option value="SUPERUSER_ACTIVATION">Superuser Activations</option>
            <option value="SUPERUSER_REFUND">Superuser Refunds</option>
          </select>

          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>

          <button
            onClick={exportTransactions}
            className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center space-x-2"
          >
            <FaDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Transactions ({totalTransactions} total)
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500">No transactions match your current filters.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance After
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.transaction_type)}
                          <span>{getTransactionTypeLabel(transaction.transaction_type)}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getAmountColor(transaction.amount)}`}>
                        {transaction.amount > 0 ? '+' : ''}₹{Number(transaction.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{Number(transaction.balance_after).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.facility_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.student_name || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SupervisorTransactionHistory;
