'use client';

import React, { useState } from 'react';
import { Users, Mail, Phone, RefreshCw, Shield, Clock, Search, Code2, MessageSquare, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  type: 'google' | 'github';
  email?: string;
  username?: string;
  phone: string;
  registeredAt: string;
}

interface ChatLead {
  id: string;
  email?: string;
  phone?: string;
  messages: { role: string; content: string }[];
  summary?: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'converted';
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<ChatLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'leads'>('leads');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersRes = await fetch('/api/users', {
        headers: { 'x-admin-key': adminKey },
      });

      if (usersRes.status === 401) {
        alert('Invalid admin key');
        setLoading(false);
        return;
      }

      const usersData = await usersRes.json();
      if (usersData.users !== undefined) {
        setUsers(usersData.users);
      }

      // Fetch leads
      const leadsRes = await fetch('/api/leads', {
        headers: { 'x-admin-key': adminKey },
      });

      const leadsData = await leadsRes.json();
      if (leadsData.leads !== undefined) {
        setLeads(leadsData.leads);
      }

      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error connecting to server');
    }
    setLoading(false);
  };

  const updateLeadStatus = async (leadId: string, status: 'new' | 'contacted' | 'converted') => {
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey,
        },
        body: JSON.stringify({ leadId, status }),
      });

      setLeads(leads.map(l => l.id === leadId ? { ...l, status } : l));
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query) ||
      user.phone.includes(query)
    );
  });

  const filteredLeads = leads.filter(lead => {
    const query = searchQuery.toLowerCase();
    return (
      lead.email?.toLowerCase().includes(query) ||
      lead.phone?.includes(query) ||
      lead.summary?.toLowerCase().includes(query)
    );
  });

  const newLeads = leads.filter(l => l.status === 'new');
  const googleUsers = users.filter(u => u.type === 'google');
  const githubUsers = users.filter(u => u.type === 'github');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-2xl p-8 w-full max-w-md border border-zinc-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Admin Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin key..."
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:opacity-90 transition"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Flowforge Dashboard</h1>
                <p className="text-xs text-zinc-500">User & Lead Management</p>
              </div>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{leads.length}</p>
                <p className="text-xs text-zinc-500">Chat Leads</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{newLeads.length}</p>
                <p className="text-xs text-zinc-500">New Leads</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{users.length}</p>
                <p className="text-xs text-zinc-500">Registered</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{googleUsers.length + githubUsers.length}</p>
                <p className="text-xs text-zinc-500">Sign-ups</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'leads'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Chat Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'users'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Registered Users ({users.length})
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'leads' ? 'Search leads...' : 'Search users...'}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Chat Leads Tab */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-zinc-900 rounded-2xl p-12 border border-zinc-800 text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-zinc-500" />
                <p className="text-zinc-500">Loading leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="bg-zinc-900 rounded-2xl p-12 border border-zinc-800 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 text-zinc-600" />
                <p className="text-zinc-500">No chat leads yet</p>
                <p className="text-zinc-600 text-sm mt-1">Leads will appear when users share contact info in chat</p>
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div key={lead.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
                  {/* Lead Header */}
                  <div
                    className="p-5 cursor-pointer hover:bg-zinc-800/50 transition"
                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          lead.status === 'new' ? 'bg-yellow-500/20' :
                          lead.status === 'contacted' ? 'bg-blue-500/20' : 'bg-green-500/20'
                        }`}>
                          <MessageSquare className={`w-5 h-5 ${
                            lead.status === 'new' ? 'text-yellow-400' :
                            lead.status === 'contacted' ? 'text-blue-400' : 'text-green-400'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {lead.email && (
                              <span className="flex items-center gap-1 text-sm">
                                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                                {lead.email}
                              </span>
                            )}
                            {lead.phone && (
                              <span className="flex items-center gap-1 text-sm">
                                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                                {lead.phone}
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-400 text-sm mt-1">{lead.summary || 'No summary available'}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              lead.status === 'new' ? 'bg-yellow-500/20 text-yellow-400' :
                              lead.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                            </span>
                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(lead.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {expandedLead === lead.id ? (
                          <ChevronUp className="w-5 h-5 text-zinc-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-zinc-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedLead === lead.id && (
                    <div className="border-t border-zinc-800">
                      {/* Status Actions */}
                      <div className="p-4 bg-zinc-800/30 flex gap-2">
                        <span className="text-xs text-zinc-500 mr-2">Mark as:</span>
                        {['new', 'contacted', 'converted'].map((status) => (
                          <button
                            key={status}
                            onClick={() => updateLeadStatus(lead.id, status as 'new' | 'contacted' | 'converted')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                              lead.status === status
                                ? status === 'new' ? 'bg-yellow-500/30 text-yellow-400' :
                                  status === 'contacted' ? 'bg-blue-500/30 text-blue-400' : 'bg-green-500/30 text-green-400'
                                : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                            }`}
                          >
                            {status === 'converted' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>

                      {/* Chat History */}
                      <div className="p-4 max-h-80 overflow-y-auto">
                        <p className="text-xs text-zinc-500 mb-3">Chat History:</p>
                        <div className="space-y-3">
                          {lead.messages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                                msg.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-zinc-800 text-zinc-200'
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">User</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Type</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Phone</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                        {searchQuery ? 'No users match your search' : 'No registered users yet'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              user.type === 'google' ? 'bg-red-500/20' : 'bg-purple-500/20'
                            }`}>
                              {user.type === 'google' ? (
                                <Mail className="w-5 h-5 text-red-400" />
                              ) : (
                                <Code2 className="w-5 h-5 text-purple-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {user.email || user.username || 'Unknown'}
                              </p>
                              <p className="text-xs text-zinc-500">ID: {user.id.slice(0, 15)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.type === 'google'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {user.type === 'google' ? 'Google' : 'GitHub'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-zinc-500" />
                            <span>{user.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {new Date(user.registeredAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
