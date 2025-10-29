import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import './AdminAnalytics.css';

// Professional color palette
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#dc2626',
  info: '#3b82f6',
  chart: ['#667eea', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e', '#6366f1']
};

function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [turnoverData, setTurnoverData] = useState(null);
  const [selectedView, setSelectedView] = useState('overview');
  const [dateFilter, setDateFilter] = useState('all');
  const [partnerDetails, setPartnerDetails] = useState(null);

  useEffect(() => {
    fetchAnalytics();
    fetchTurnover();
    // eslint-disable-next-line
  }, [dateFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/analytics/overview';

      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate;

        if (dateFilter === 'today') {
          startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        } else if (dateFilter === 'week') {
          startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
        } else if (dateFilter === 'month') {
          startDate = new Date(now.setDate(now.getDate() - 30)).toISOString();
        }

        const endDate = new Date().toISOString();
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTurnover = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/analytics/turnover');
      const data = await response.json();

      if (data.success) {
        setTurnoverData(data);
      }
    } catch (err) {
      console.error('Failed to fetch turnover data', err);
    }
  };

  const fetchPartnerDetails = async (partnerId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/analytics/partner/${partnerId}`);
      const data = await response.json();

      if (data.success) {
        setPartnerDetails(data);
        setSelectedView('partner-detail');
      }
    } catch (err) {
      console.error('Failed to fetch partner details', err);
    }
  };

  const formatCurrency = (value) => {
    return `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (value) => {
    return parseInt(value).toLocaleString('en-IN');
  };

  const getDayName = (dayNum) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayNum];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('Amount')
                ? formatCurrency(entry.value)
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading || !analyticsData) {
    return (
      <div className="admin-container">
        <Navbar />
        <div className="loading-analytics">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const salesTrendData = analyticsData.salesTrend.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Sales Count': item.salesCount,
    'Revenue': parseFloat(item.revenue)
  }));

  const salesByDayData = analyticsData.salesByDay.map(item => ({
    day: getDayName(item.dayOfWeek),
    'Sales': item.salesCount,
    'Revenue': parseFloat(item.revenue)
  }));

  const partnerPerformanceData = analyticsData.partnerPerformance.slice(0, 10).map(partner => ({
    name: partner.partnerName || 'Unknown',
    'Revenue': parseFloat(partner.revenue),
    'Sales': partner.salesCount,
    'Units': partner.unitsSold
  }));

  const productPieData = analyticsData.topProducts.slice(0, 6).map(product => ({
    name: product.productName,
    value: parseFloat(product.revenue)
  }));

  const orderStatusData = turnoverData?.orderStatus.map(status => ({
    name: status.status,
    value: parseInt(status.count),
    amount: parseFloat(status.total_value)
  })) || [];

  return (
    <div className="admin-container">
      <Navbar />

      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <div className="header-left">
            <h1>📊 Analytics Dashboard</h1>
            <p className="header-subtitle">Real-time business insights and performance metrics</p>
          </div>

          <div className="analytics-filters">
            <button
              className={`filter-btn ${dateFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDateFilter('all')}
            >
              All Time
            </button>
            <button
              className={`filter-btn ${dateFilter === 'month' ? 'active' : ''}`}
              onClick={() => setDateFilter('month')}
            >
              30 Days
            </button>
            <button
              className={`filter-btn ${dateFilter === 'week' ? 'active' : ''}`}
              onClick={() => setDateFilter('week')}
            >
              7 Days
            </button>
            <button
              className={`filter-btn ${dateFilter === 'today' ? 'active' : ''}`}
              onClick={() => setDateFilter('today')}
            >
              Today
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="view-tabs">
          <button
            className={`view-tab ${selectedView === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedView('overview')}
          >
            <span className="tab-icon">🏠</span> Overview
          </button>
          <button
            className={`view-tab ${selectedView === 'partners' ? 'active' : ''}`}
            onClick={() => setSelectedView('partners')}
          >
            <span className="tab-icon">👥</span> Partners
          </button>
          <button
            className={`view-tab ${selectedView === 'products' ? 'active' : ''}`}
            onClick={() => setSelectedView('products')}
          >
            <span className="tab-icon">📦</span> Products
          </button>
          <button
            className={`view-tab ${selectedView === 'trends' ? 'active' : ''}`}
            onClick={() => setSelectedView('trends')}
          >
            <span className="tab-icon">📈</span> Trends
          </button>
          <button
            className={`view-tab ${selectedView === 'operations' ? 'active' : ''}`}
            onClick={() => setSelectedView('operations')}
          >
            <span className="tab-icon">⚙️</span> Operations
          </button>
        </div>

        {/* Overview Section */}
        {selectedView === 'overview' && (
          <div className="analytics-content">
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card gradient-green">
                <div className="kpi-header">
                  <span className="kpi-icon">💰</span>
                  <span className="kpi-trend">+12%</span>
                </div>
                <div className="kpi-body">
                  <div className="kpi-label">Total Revenue</div>
                  <div className="kpi-value">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
                </div>
              </div>

              <div className="kpi-card gradient-blue">
                <div className="kpi-header">
                  <span className="kpi-icon">🛒</span>
                  <span className="kpi-trend">+8%</span>
                </div>
                <div className="kpi-body">
                  <div className="kpi-label">Total Sales</div>
                  <div className="kpi-value">{formatNumber(analyticsData.overview.totalSales)}</div>
                </div>
              </div>

              <div className="kpi-card gradient-orange">
                <div className="kpi-header">
                  <span className="kpi-icon">📦</span>
                  <span className="kpi-trend">+15%</span>
                </div>
                <div className="kpi-body">
                  <div className="kpi-label">Units Sold</div>
                  <div className="kpi-value">{formatNumber(analyticsData.overview.totalUnits)}</div>
                </div>
              </div>

              <div className="kpi-card gradient-purple">
                <div className="kpi-header">
                  <span className="kpi-icon">👥</span>
                  <span className="kpi-trend">Active</span>
                </div>
                <div className="kpi-body">
                  <div className="kpi-label">Active Partners</div>
                  <div className="kpi-value">{formatNumber(analyticsData.overview.activePartners)}</div>
                </div>
              </div>

              <div className="kpi-card gradient-pink">
                <div className="kpi-header">
                  <span className="kpi-icon">💳</span>
                </div>
                <div className="kpi-body">
                  <div className="kpi-label">Avg Order Value</div>
                  <div className="kpi-value">{formatCurrency(analyticsData.overview.averageOrderValue)}</div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
              {/* Revenue Trend Chart */}
              <div className="chart-card wide">
                <div className="chart-header">
                  <h3>Revenue Trend (Last 30 Days)</h3>
                  <span className="chart-badge">Area Chart</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesTrendData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Revenue" stroke={COLORS.primary} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Product Distribution */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Revenue by Product</h3>
                  <span className="chart-badge">Pie Chart</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Sales by Day */}
              <div className="chart-card wide">
                <div className="chart-header">
                  <h3>Sales by Day of Week</h3>
                  <span className="chart-badge">Bar Chart</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesByDayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Sales" fill={COLORS.success} radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Revenue" fill={COLORS.info} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Partners */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Top Partners by Revenue</h3>
                  <span className="chart-badge">Rankings</span>
                </div>
                <div className="rankings-list">
                  {analyticsData.partnerPerformance.slice(0, 5).map((partner, index) => (
                    <div key={partner.partnerId} className="ranking-item">
                      <div className="ranking-left">
                        <span className="ranking-number">#{index + 1}</span>
                        <span className="ranking-name">{partner.partnerName || 'Unknown'}</span>
                      </div>
                      <div className="ranking-right">
                        <span className="ranking-value">{formatCurrency(partner.revenue)}</span>
                        <button
                          className="ranking-btn"
                          onClick={() => fetchPartnerDetails(partner.partnerId)}
                        >
                          →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Partners Section */}
        {selectedView === 'partners' && (
          <div className="analytics-content">
            <div className="chart-card wide">
              <div className="chart-header">
                <h3>Partner Performance Comparison</h3>
                <span className="chart-badge">Bar Chart</span>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={partnerPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" stroke="#6b7280" width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Revenue" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="performance-grid">
              {analyticsData.partnerPerformance.map((partner, index) => (
                <div key={partner.partnerId} className="performance-card">
                  <div className="performance-header">
                    <span className="performance-rank">#{index + 1}</span>
                    <h4>{partner.partnerName || 'Unknown'}</h4>
                  </div>
                  <div className="performance-stats">
                    <div className="stat-item">
                      <span className="stat-label">Revenue</span>
                      <span className="stat-value">{formatCurrency(partner.revenue)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Sales</span>
                      <span className="stat-value">{formatNumber(partner.salesCount)}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Units</span>
                      <span className="stat-value">{formatNumber(partner.unitsSold)}</span>
                    </div>
                  </div>
                  <button
                    className="view-partner-btn"
                    onClick={() => fetchPartnerDetails(partner.partnerId)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partner Detail View */}
        {selectedView === 'partner-detail' && partnerDetails && (
          <div className="analytics-content">
            <button
              className="back-btn"
              onClick={() => setSelectedView('partners')}
            >
              ← Back to Partners
            </button>

            <div className="partner-detail-header">
              <h2>{partnerDetails.partner.name}</h2>
              <div className="partner-meta">
                <span>Joined: {new Date(partnerDetails.partner.joinedDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="kpi-grid">
              <div className="kpi-card gradient-green">
                <div className="kpi-body">
                  <div className="kpi-label">Total Revenue</div>
                  <div className="kpi-value">{formatCurrency(partnerDetails.partner.totalRevenue)}</div>
                </div>
              </div>
              <div className="kpi-card gradient-blue">
                <div className="kpi-body">
                  <div className="kpi-label">Total Sales</div>
                  <div className="kpi-value">{formatNumber(partnerDetails.partner.totalSales)}</div>
                </div>
              </div>
              <div className="kpi-card gradient-orange">
                <div className="kpi-body">
                  <div className="kpi-label">Units Sold</div>
                  <div className="kpi-value">{formatNumber(partnerDetails.partner.totalUnits)}</div>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <h3>Best Selling Products</h3>
              </div>
              <div className="products-list">
                {partnerDetails.bestProducts.map((product, index) => (
                  <div key={index} className="product-item">
                    <div className="product-info">
                      <span className="product-name">{product.product_name}</span>
                      <span className="product-stats">
                        {formatNumber(product.units_sold)} units • {formatNumber(product.sales_count)} sales
                      </span>
                    </div>
                    <span className="product-revenue">{formatCurrency(product.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Section */}
        {selectedView === 'products' && (
          <div className="analytics-content">
            <div className="charts-grid">
              <div className="chart-card wide">
                <div className="chart-header">
                  <h3>Top Products by Revenue</h3>
                  <span className="chart-badge">Bar Chart</span>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData.topProducts.slice(0, 10).map(p => ({
                    name: p.productName,
                    Revenue: parseFloat(p.revenue),
                    Units: p.unitsSold
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Revenue" fill={COLORS.success} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Product Distribution</h3>
                  <span className="chart-badge">Donut Chart</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label
                    >
                      {productPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Trends Section */}
        {selectedView === 'trends' && (
          <div className="analytics-content">
            <div className="chart-card wide">
              <div className="chart-header">
                <h3>Sales & Revenue Trend</h3>
                <span className="chart-badge">Line Chart</span>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={salesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="Sales Count" stroke={COLORS.info} strokeWidth={3} dot={{ r: 5 }} />
                  <Line yAxisId="right" type="monotone" dataKey="Revenue" stroke={COLORS.success} strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card wide">
              <div className="chart-header">
                <h3>Weekly Performance</h3>
                <span className="chart-badge">Bar Chart</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Revenue" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Operations Section */}
        {selectedView === 'operations' && turnoverData && (
          <div className="analytics-content">
            <div className="kpi-grid">
              <div className="kpi-card gradient-blue">
                <div className="kpi-body">
                  <div className="kpi-label">Avg Delivery Time</div>
                  <div className="kpi-value">{turnoverData.avgDeliveryDays.toFixed(1)} days</div>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Order Status Distribution</h3>
                  <span className="chart-badge">Pie Chart</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3>Stock Turnover Rate</h3>
                  <span className="chart-badge">Performance</span>
                </div>
                <div className="turnover-list">
                  {turnoverData.stockTurnover.slice(0, 10).map((item, index) => (
                    <div key={index} className="turnover-item">
                      <span className="turnover-name">{item.product_name}</span>
                      <div className="turnover-bar">
                        <div
                          className="turnover-fill"
                          style={{
                            width: `${Math.min(parseFloat(item.turnover_rate) * 100, 100)}%`,
                            backgroundColor: parseFloat(item.turnover_rate) > 0.5 ? COLORS.success :
                              parseFloat(item.turnover_rate) > 0.2 ? COLORS.warning : COLORS.danger
                          }}
                        >
                          <span className="turnover-value">{(parseFloat(item.turnover_rate) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAnalytics;
