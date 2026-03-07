/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Bell, 
  FileText, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle,
  Download,
  Users,
  DollarSign,
  Receipt,
  History,
  FileUp,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './lib/supabase';
import type { Project, Employee, Salary, Expense, Reminder, Document as ProjectDoc } from './types';
import * as XLSX from 'xlsx';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Documents', path: '/documents', icon: FileText },
  ];

  return (
    <>
      {/* Mobile/Tablet Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shadow-sm">
        <Link to="/" className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="text-indigo-600" size={20} />
          RBS Panel
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation Drawer */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:left-0 lg:right-auto lg:border-r lg:border-l-0",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 hidden lg:block">
            <Link to="/" className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="text-indigo-600" />
              RBS Panel
            </Link>
          </div>
          
          <div className="p-6 lg:hidden border-b border-slate-100 mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Menu</h2>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-indigo-50 text-indigo-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="px-4 py-2 mb-2 text-[10px] text-slate-400 text-center">
              Managed by <a href="https://techfnm.ct.ws/" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">techfnm</a>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        onLogin();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
            <Briefcase className="text-indigo-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Sign in to manage your projects</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="admin@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
              <XCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-8 text-center text-xs text-slate-400">
          Managed by <a href="https://techfnm.ct.ws/" target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">techfnm</a>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({ active: 0, pendingAmount: 0, completed: 0 });
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: projectsData, error: pError } = await supabase.from('projects').select('*');
      if (pError) throw pError;

      const { data: remindersData, error: rError } = await supabase.from('reminders').select('*').eq('status', 'pending');
      if (rError) throw rError;
      setReminders(remindersData || []);

      const { data: salariesData } = await supabase.from('salaries').select('amount, employee_id');
      const { data: expensesData } = await supabase.from('expenses').select('amount, project_id');
      const { data: employeesData } = await supabase.from('employees').select('id, project_id');

      if (projectsData) {
        const active = projectsData.filter(p => p.status === 'active').length;
        const completed = projectsData.filter(p => p.status === 'completed').length;
        
        const enrichedProjects = projectsData.map(p => {
          const projectEmployees = employeesData?.filter((e: any) => e.project_id === p.id) || [];
          const empIds = projectEmployees.map(e => e.id);
          
          const projectSalaries = salariesData?.filter((s: any) => empIds.includes(s.employee_id)) || [];
          const projectExpenses = expensesData?.filter((e: any) => e.project_id === p.id) || [];

          const totalSpent = (projectSalaries.reduce((sum: number, s: any) => sum + s.amount, 0) || 0) + 
                             (projectExpenses.reduce((sum: number, e: any) => sum + e.amount, 0) || 0);
          const remaining = p.budget - totalSpent;
          
          return {
            ...p,
            spent: totalSpent,
            remaining: remaining,
            percentUsed: p.budget > 0 ? (totalSpent / p.budget) * 100 : 0,
            employeeCount: projectEmployees.length
          };
        });

        setProjects(enrichedProjects);
        const pendingTotal = remindersData?.reduce((sum, r) => sum + r.amount, 0) || 0;
        setStats({ active, pendingAmount: pendingTotal, completed });
      }
    } catch (error: any) {
      console.error('Dashboard Fetch Error:', error);
      alert('Dashboard Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[400px] text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back to your project overview</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Active', value: stats.active, color: 'bg-blue-500', icon: Briefcase },
          { label: 'Pending Payments', value: `${reminders.length} pending`, color: 'bg-amber-500', icon: Bell },
          { label: 'Completed', value: stats.completed, color: 'bg-emerald-500', icon: CheckCircle },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={cn("p-4 rounded-xl text-white", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">All Projects Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div key={p.id} className="bg-[#1e1e1e] text-white p-6 rounded-3xl border border-white/10 shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{p.name}</h3>
                  <p className="text-slate-400 text-sm">{p.employeeCount} employees</p>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest",
                  p.status === 'active' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                )}>
                  {p.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Total Budget:</span>
                  <span className="font-mono font-bold">Rs. {p.budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Spent:</span>
                  <span className="font-mono font-bold text-red-500">Rs. {p.spent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Remaining:</span>
                  <span className="font-mono font-bold text-emerald-500">Rs. {p.remaining.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">5% of Remaining:</span>
                  <span className="font-mono font-bold text-amber-500 text-sm">Rs. {(p.remaining * 0.05).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs">95% of Remaining:</span>
                  <span className="font-mono font-bold text-blue-400 text-sm">Rs. {(p.remaining * 0.95).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" 
                    style={{ width: `${Math.min(p.percentUsed, 100)}%` }}
                  />
                </div>
                <p className="text-center font-mono text-xs font-bold text-slate-400">
                  {p.percentUsed.toFixed(1)}% Used
                </p>
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="col-span-full text-center text-slate-500 py-12">No projects found.</p>}
        </div>
      </div>
    </div>
  );
};

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', budget: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<{ id: string, name: string, budget: number } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }
    if (data) setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('projects').insert([{ 
      name: newProject.name, 
      budget: newProject.budget, 
      status: 'active' 
    }]);
    if (error) {
      console.error('Error adding project:', error);
      alert('Error adding project: ' + error.message);
    } else {
      setIsModalOpen(false);
      setNewProject({ name: '', budget: 0 });
      fetchProjects();
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject({ id: project.id, name: project.name, budget: project.budget });
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const { error } = await supabase
      .from('projects')
      .update({ name: editingProject.name, budget: editingProject.budget })
      .eq('id', editingProject.id);

    if (error) {
      console.error('Error updating project:', error);
      alert('Error updating project: ' + error.message);
    } else {
      setIsEditModalOpen(false);
      setEditingProject(null);
      fetchProjects();
    }
  };

  const handleDeleteProject = async (id: string) => {
    console.log('handleDeleteProject called for:', id);
    try {
      const { error, data } = await supabase.from('projects').delete().eq('id', id);
      console.log('Supabase delete response:', { error, data });
      if (error) {
        console.error('Delete project error:', error);
        alert('Error deleting project: ' + error.message);
      } else {
        console.log('Project deleted successfully');
        setConfirmDeleteId(null);
        fetchProjects();
      }
    } catch (err) {
      console.error('Unexpected delete error:', err);
      alert('An unexpected error occurred during deletion.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
              <div className="flex gap-2 transition-opacity">
                <button 
                  onClick={() => handleEditClick(project)} 
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <Edit size={18} />
                </button>
                {confirmDeleteId === project.id ? (
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded hover:bg-red-700"
                    >
                      CONFIRM
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded hover:bg-slate-300"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmDeleteId(project.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Budget</span>
                <span className="font-semibold text-slate-900">PKR {project.budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  project.status === 'active' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                )}>
                  {project.status.toUpperCase()}
                </span>
              </div>
            </div>
            <Link 
              to={`/projects/${project.id}`}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              View Details
              <ChevronRight size={16} />
            </Link>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Project</h2>
            <form onSubmit={handleAddProject} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total Budget (PKR)</label>
                <input
                  type="number"
                  value={newProject.budget === 0 ? '' : newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Project</h2>
            <form onSubmit={handleUpdateProject} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Total Budget (PKR)</label>
                <input
                  type="number"
                  value={editingProject.budget}
                  onChange={(e) => setEditingProject({ ...editingProject, budget: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [docs, setDocs] = useState<ProjectDoc[]>([]);
  const [isConfirmingComplete, setIsConfirmingComplete] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    const { data: p } = await supabase.from('projects').select('*').eq('id', id).single();
    if (p) setProject(p);

    const { data: e } = await supabase.from('employees').select('*').eq('project_id', id);
    if (e) setEmployees(e);

    const { data: s } = await supabase.from('salaries').select('*, employees(name)').in('employee_id', e?.map(emp => emp.id) || []);
    if (s) setSalaries(s);

    const { data: ex } = await supabase.from('expenses').select('*').eq('project_id', id);
    if (ex) setExpenses(ex);

    const { data: r } = await supabase.from('reminders').select('*').eq('project_id', id).eq('status', 'received');
    if (r) setReminders(r);

    const { data: d } = await supabase.from('documents').select('*').eq('project_id', id);
    if (d) setDocs(d);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleMarkComplete = async () => {
    console.log('handleMarkComplete called for:', id);
    try {
      const { error, data } = await supabase.from('projects').update({ status: 'completed' }).eq('id', id);
      console.log('Supabase update response:', { error, data });
      if (error) {
        console.error('Mark complete error:', error);
        alert('Error marking complete: ' + error.message);
      } else {
        console.log('Project marked as complete successfully');
        setIsConfirmingComplete(false);
        fetchData();
      }
    } catch (err) {
      console.error('Unexpected update error:', err);
    }
  };

  const handleExport = () => {
    if (!project) return;
    const wb = XLSX.utils.book_new();
    
    // 1. Overview Sheet
    const totalSpent = (salaries.reduce((acc, curr) => acc + curr.amount, 0) || 0) + 
                       (expenses.reduce((acc, curr) => acc + curr.amount, 0) || 0);
    const remaining = project.budget - totalSpent;
    
    const overviewData = [
      ['Project Detail Report'],
      [''],
      ['Project Name', project.name],
      ['Total Budget', `PKR ${project.budget.toLocaleString()}`],
      ['Total Spent', `PKR ${totalSpent.toLocaleString()}`],
      ['Remaining Balance', `PKR ${remaining.toLocaleString()}`],
      ['Status', project.status.toUpperCase()],
      ['Total Employees', employees.length],
      ['Report Generated', new Date().toLocaleString()]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(overviewData), 'Overview');

    // 2. Employees Sheet
    const empData = employees.map(e => {
      const totalPaid = salaries.filter(s => s.employee_id === e.id).reduce((acc, curr) => acc + curr.amount, 0);
      return [e.name, totalPaid];
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Employee Name', 'Total Paid (PKR)'], ...empData]), 'Employees Summary');

    // 3. Salaries Sheet
    const salaryData = salaries.map(s => [
      (s as any).employees?.name || 'Unknown',
      s.amount,
      s.date,
      s.type.toUpperCase()
    ]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Employee Name', 'Amount (PKR)', 'Date', 'Type'], ...salaryData]), 'Salaries Detailed');

    // 4. Expenses Sheet
    const expData = expenses.map(e => [
      (e as any).expense_name || 'General',
      e.amount,
      e.date
    ]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Expense Name', 'Amount (PKR)', 'Date'], ...expData]), 'Expenses Detailed');

    // 5. Payments Received Sheet
    const receivedData = reminders.map(r => [
      r.person_name,
      r.amount,
      r.date
    ]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Received From', 'Amount (PKR)', 'Date'], ...receivedData]), 'Payments Received');

    XLSX.writeFile(wb, `${project.name}_Full_Report.xlsx`);
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          <p className="text-slate-500">Budget: PKR {project.budget.toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Download size={18} />
            Export Data
          </button>
          {project.status === 'active' && (
            isConfirmingComplete ? (
              <div className="flex gap-2">
                <button 
                  onClick={handleMarkComplete}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
                >
                  CONFIRM COMPLETE
                </button>
                <button 
                  onClick={() => setIsConfirmingComplete(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 text-slate-600 font-medium hover:bg-slate-300 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsConfirmingComplete(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium flex items-center gap-2 hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle size={18} />
                Mark Complete
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'employees', label: 'Employees', icon: Users },
          { id: 'salaries', label: 'Salaries', icon: DollarSign },
          { id: 'expenses', label: 'Expenses', icon: Receipt },
          { id: 'reminders', label: 'Payments History', icon: History },
          { id: 'documents', label: 'Documents', icon: FileUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab.id ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
        {activeTab === 'employees' && <EmployeeTab projectId={id!} employees={employees} onUpdate={fetchData} salaries={salaries} />}
        {activeTab === 'salaries' && <SalaryTab employees={employees} onUpdate={fetchData} salaries={salaries} />}
        {activeTab === 'expenses' && <ExpenseTab projectId={id!} expenses={expenses} onUpdate={fetchData} />}
        {activeTab === 'reminders' && <HistoryTab reminders={reminders} />}
        {activeTab === 'documents' && <DocumentTab projectId={id!} docs={docs} onUpdate={fetchData} />}
      </div>
    </div>
  );
};

// --- Sub-Tabs for Project Detail ---

const EmployeeTab = ({ projectId, employees, onUpdate, salaries }: { projectId: string, employees: Employee[], onUpdate: () => void, salaries: Salary[] }) => {
  const [name, setName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('employees').insert([{ project_id: projectId, name }]);
    setName('');
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    console.log('handleDelete employee called for:', id);
    try {
      const { error, data } = await supabase.from('employees').delete().eq('id', id);
      console.log('Supabase employee delete response:', { error, data });
      if (error) {
        console.error('Delete employee error:', error);
        alert('Error deleting employee: ' + error.message);
      } else {
        console.log('Employee deleted successfully');
        setConfirmDeleteId(null);
        onUpdate();
      }
    } catch (err) {
      console.error('Unexpected employee delete error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Employee Name"
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors whitespace-nowrap">
          Add Employee
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500 text-sm border-b border-slate-100">
              <th className="pb-4 font-medium">Name</th>
              <th className="pb-4 font-medium">Total Paid</th>
              <th className="pb-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {employees.map((emp) => {
              const totalPaid = salaries.filter(s => s.employee_id === emp.id).reduce((acc, curr) => acc + curr.amount, 0);
              return (
                <tr key={emp.id} className="text-slate-900">
                  <td className="py-4 font-medium">{emp.name}</td>
                  <td className="py-4">PKR {totalPaid.toLocaleString()}</td>
                  <td className="py-4 text-right">
                    {confirmDeleteId === emp.id ? (
                      <div className="flex gap-1 justify-end">
                        <button 
                          onClick={() => handleDelete(emp.id)}
                          className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded"
                        >
                          CONFIRM
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded"
                        >
                          CANCEL
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(emp.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SalaryTab = ({ employees, onUpdate, salaries }: { employees: Employee[], onUpdate: () => void, salaries: Salary[] }) => {
  const [form, setForm] = useState({ employee_id: '', amount: 0, date: new Date().toISOString().split('T')[0], type: 'daily' as 'advance' | 'daily' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('salaries').insert([form]);
    if (error) {
      alert('Error adding salary: ' + error.message);
    } else {
      setForm({ ...form, amount: 0 });
      onUpdate();
    }
  };

  const handleDelete = async (id: string) => {
    console.log('handleDelete salary called for:', id);
    try {
      const { error, data } = await supabase.from('salaries').delete().eq('id', id);
      console.log('Supabase salary delete response:', { error, data });
      if (error) {
        console.error('Delete salary error:', error);
        alert('Error deleting salary: ' + error.message);
      } else {
        console.log('Salary deleted successfully');
        setConfirmDeleteId(null);
        onUpdate();
      }
    } catch (err) {
      console.error('Unexpected salary delete error:', err);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="flex flex-col md:grid md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl">
        <select
          value={form.employee_id}
          onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        >
          <option value="">Select Employee</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <input
          type="number"
          value={form.amount === 0 ? '' : form.amount}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          placeholder="Amount"
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as 'advance' | 'daily' })}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="daily">Daily</option>
          <option value="advance">Advance</option>
        </select>
        <button type="submit" className="md:col-span-4 bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          Pay Salary
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500 text-sm border-b border-slate-100">
              <th className="pb-4 font-medium">Employee</th>
              <th className="pb-4 font-medium">Amount</th>
              <th className="pb-4 font-medium">Date</th>
              <th className="pb-4 font-medium">Type</th>
              <th className="pb-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {salaries.map((s: any) => (
              <tr key={s.id} className="text-slate-900">
                <td className="py-4 font-medium">{s.employees?.name}</td>
                <td className="py-4">PKR {s.amount.toLocaleString()}</td>
                <td className="py-4">{s.date}</td>
                <td className="py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    s.type === 'advance' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {s.type.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 text-right">
                  {confirmDeleteId === s.id ? (
                    <div className="flex gap-1 justify-end">
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded"
                      >
                        CONFIRM
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded"
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ExpenseTab = ({ projectId, expenses, onUpdate }: { projectId: string, expenses: Expense[], onUpdate: () => void }) => {
  const [form, setForm] = useState({ expense_name: '', amount: 0, date: new Date().toISOString().split('T')[0], receipt_url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      setForm({ ...form, receipt_url: publicUrl });
    } catch (error: any) {
      alert('Error uploading file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('expenses').insert([{ ...form, project_id: projectId }]);
    if (error) {
      alert('Error adding expense: ' + error.message);
    } else {
      setForm({ expense_name: '', amount: 0, date: new Date().toISOString().split('T')[0], receipt_url: '' });
      onUpdate();
    }
  };

  const handleDelete = async (id: string) => {
    console.log('handleDelete expense called for:', id);
    try {
      const { error, data } = await supabase.from('expenses').delete().eq('id', id);
      console.log('Supabase expense delete response:', { error, data });
      if (error) {
        console.error('Delete expense error:', error);
        alert('Error deleting expense: ' + error.message);
      } else {
        console.log('Expense deleted successfully');
        setConfirmDeleteId(null);
        onUpdate();
      }
    } catch (err) {
      console.error('Unexpected expense delete error:', err);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="flex flex-col md:grid md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl">
        <input
          type="text"
          value={form.expense_name}
          onChange={(e) => setForm({ ...form, expense_name: e.target.value })}
          placeholder="Expense Name"
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <input
          type="number"
          value={form.amount === 0 ? '' : form.amount}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          placeholder="Amount"
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <div className="relative">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="receipt-upload"
          />
          <label 
            htmlFor="receipt-upload"
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? 'Uploading...' : form.receipt_url ? 'File Attached ✓' : 'Attach Receipt File'}
          </label>
        </div>
        <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          Add Expense
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500 text-sm border-b border-slate-100">
              <th className="pb-4 font-medium">Expense Name</th>
              <th className="pb-4 font-medium">Amount</th>
              <th className="pb-4 font-medium">Date</th>
              <th className="pb-4 font-medium">Receipt</th>
              <th className="pb-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {expenses.map((e) => (
              <tr key={e.id} className="text-slate-900">
                <td className="py-4 font-medium">{e.expense_name}</td>
                <td className="py-4">PKR {e.amount.toLocaleString()}</td>
                <td className="py-4">{e.date}</td>
                <td className="py-4">
                  {e.receipt_url ? (
                    <a href={e.receipt_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                      <FileText size={14} /> View
                    </a>
                  ) : 'N/A'}
                </td>
                <td className="py-4 text-right">
                  {confirmDeleteId === e.id ? (
                    <div className="flex gap-1 justify-end">
                      <button 
                        onClick={() => handleDelete(e.id)}
                        className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded"
                      >
                        CONFIRM
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded"
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(e.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HistoryTab = ({ reminders }: { reminders: Reminder[] }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Payment Received History</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500 text-sm border-b border-slate-100">
              <th className="pb-4 font-medium">Person</th>
              <th className="pb-4 font-medium">Amount</th>
              <th className="pb-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {reminders.map((r) => (
              <tr key={r.id} className="text-slate-900">
                <td className="py-4 font-medium">{r.person_name}</td>
                <td className="py-4">PKR {r.amount.toLocaleString()}</td>
                <td className="py-4">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DocumentTab = ({ projectId, docs, onUpdate }: { projectId: string, docs: ProjectDoc[], onUpdate: () => void }) => {
  const [form, setForm] = useState({ name: '', url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `docs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      setForm({ ...form, name: file.name, url: publicUrl });
    } catch (error: any) {
      alert('Error uploading file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('documents').insert([{ ...form, project_id: projectId }]);
    if (error) {
      alert('Error adding document: ' + error.message);
    } else {
      setForm({ name: '', url: '' });
      onUpdate();
    }
  };

  const handleDelete = async (id: string) => {
    console.log('handleDelete document called for:', id);
    try {
      const { error, data } = await supabase.from('documents').delete().eq('id', id);
      console.log('Supabase document delete response:', { error, data });
      if (error) {
        console.error('Delete document error:', error);
        alert('Error deleting document: ' + error.message);
      } else {
        console.log('Document deleted successfully');
        setConfirmDeleteId(null);
        onUpdate();
      }
    } catch (err) {
      console.error('Unexpected document delete error:', err);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl">
        <div className="relative">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="doc-upload"
          />
          <label 
            htmlFor="doc-upload"
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors h-full",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? 'Uploading...' : form.url ? `File: ${form.name}` : 'Select File to Upload'}
          </label>
        </div>
        <button type="submit" className="bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          Attach Doc
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc) => (
          <div key={doc.id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="font-medium text-slate-900">{doc.name}</p>
                <p className="text-xs text-slate-500">{new Date(doc.created_at!).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                <Download size={18} />
              </a>
              {confirmDeleteId === doc.id ? (
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded"
                  >
                    CONFIRM
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDeleteId(doc.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState({ project_id: '', person_name: '', amount: 0, date: new Date().toISOString().split('T')[0], document_url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSendingReminders, setIsSendingReminders] = useState(false);

  const fetchData = async () => {
    const { data: r } = await supabase.from('reminders').select('*, projects(name)').order('date', { ascending: true });
    if (r) setReminders(r);
    const { data: p } = await supabase.from('projects').select('*');
    if (p) setProjects(p);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `reminders/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      setForm({ ...form, document_url: publicUrl });
    } catch (error: any) {
      alert('Error uploading file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('reminders').insert([{ 
      project_id: form.project_id,
      person_name: form.person_name,
      amount: form.amount,
      date: form.date,
      document_url: form.document_url,
      status: 'pending' 
    }]);
    if (error) {
      alert('Error adding reminder: ' + error.message);
    } else {
      setForm({ project_id: '', person_name: '', amount: 0, date: new Date().toISOString().split('T')[0], document_url: '' });
      fetchData();
    }
  };

  const handleMarkReceived = async (id: string) => {
    await supabase.from('reminders').update({ status: 'received' }).eq('id', id);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) {
        alert('Error deleting reminder: ' + error.message);
      } else {
        setConfirmDeleteId(null);
        fetchData();
      }
    } catch (err) {
      console.error('Unexpected reminder delete error:', err);
    }
  };

  const handleSendRemindersNow = async () => {
    setIsSendingReminders(true);
    try {
      const response = await fetch('/api/cron/reminders');
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (data.success) {
          alert('Success: ' + data.message);
        } else {
          alert('Error: ' + data.error);
        }
      } else {
        const text = await response.text();
        alert('Server Error: ' + text.substring(0, 100));
      }
    } catch (error: any) {
      alert('Failed to trigger reminders: ' + error.message);
    } finally {
      setIsSendingReminders(false);
    }
  };

  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const receivedReminders = reminders.filter(r => r.status === 'received');

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reminders</h1>
          <p className="text-slate-500">Manage your payment collections</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleSendRemindersNow}
            disabled={isSendingReminders}
            className="flex-1 sm:flex-none px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Bell size={16} />
            {isSendingReminders ? 'Sending...' : 'Send Reminders Now'}
          </button>
        </div>
      </header>

      <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <select
          value={form.project_id}
          onChange={(e) => setForm({ ...form, project_id: e.target.value })}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        >
          <option value="">Select Project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input
          type="text"
          value={form.person_name}
          onChange={(e) => setForm({ ...form, person_name: e.target.value })}
          placeholder="Person Name"
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <input
          type="number"
          value={form.amount === 0 ? '' : form.amount}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          placeholder="Amount"
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          required
        />
        <div className="relative md:col-span-2">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="reminder-upload"
          />
          <label 
            htmlFor="reminder-upload"
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isUploading ? 'Uploading...' : form.document_url ? 'File Attached ✓' : 'Attach Document (Optional)'}
          </label>
        </div>
        <button type="submit" className="md:col-span-3 bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          Set Reminder
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="text-amber-500" />
            Pending Collections
          </h2>
          <div className="space-y-4">
            {pendingReminders.map((r: any) => (
              <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center group">
                <div>
                  <p className="font-bold text-slate-900">{r.person_name}</p>
                  <p className="text-sm text-slate-500">{r.projects?.name} • PKR {r.amount.toLocaleString()}</p>
                  <p className="text-xs text-amber-600 font-medium mt-1">Due: {r.date}</p>
                  {(r as any).document_url && (
                    <a href={(r as any).document_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-1">
                      <FileText size={12} /> View Document
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleMarkReceived(r.id)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Mark Received"
                  >
                    <CheckCircle size={20} />
                  </button>
                  {confirmDeleteId === r.id ? (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleDelete(r.id)}
                        className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded"
                      >
                        CONFIRM
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 bg-slate-200 text-slate-600 text-[10px] font-bold rounded"
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteId(r.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {pendingReminders.length === 0 && <p className="text-slate-500 text-center py-8">No pending reminders.</p>}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="text-indigo-500" />
            Received History
          </h2>
          <div className="space-y-4">
            {receivedReminders.map((r: any) => (
              <div key={r.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-900">{r.person_name}</p>
                  <p className="text-sm text-slate-500">{r.projects?.name} • PKR {r.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-1">Received on: {r.date}</p>
                </div>
                <CheckCircle className="text-emerald-500" size={20} />
              </div>
            ))}
            {receivedReminders.length === 0 && <p className="text-slate-500 text-center py-8">No history yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Documents = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [docs, setDocs] = useState<ProjectDoc[]>([]);
  const [form, setForm] = useState({ name: '', url: '' });
  const [isUploading, setIsUploading] = useState(false);

  const fetchData = async () => {
    const { data: p } = await supabase.from('projects').select('*');
    if (p) setProjects(p);
  };

  const fetchDocs = async (pid: string) => {
    const { data: d } = await supabase.from('documents').select('*, projects(name)').eq('project_id', pid);
    if (d) setDocs(d);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProjectId) fetchDocs(selectedProjectId);
    else setDocs([]);
  }, [selectedProjectId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProjectId) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `docs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      setForm({ name: file.name, url: publicUrl });
    } catch (error: any) {
      alert('Error uploading file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('documents').insert([{ ...form, project_id: selectedProjectId }]);
    if (error) {
      alert('Error adding document: ' + error.message);
    } else {
      setForm({ name: '', url: '' });
      fetchDocs(selectedProjectId);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
        <p className="text-slate-500">Centralized project document storage</p>
      </header>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Project</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="">Choose a project...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {selectedProjectId && (
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id="main-doc-upload"
              />
              <label 
                htmlFor="main-doc-upload"
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors h-full",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isUploading ? 'Uploading...' : form.url ? `File: ${form.name}` : 'Select File to Upload'}
              </label>
            </div>
            <button type="submit" className="bg-indigo-600 text-white py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Upload Document
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((doc: any) => (
          <div key={doc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{doc.name}</h3>
                <p className="text-sm text-slate-500">{doc.projects?.name}</p>
              </div>
            </div>
            <a 
              href={doc.url} 
              target="_blank" 
              rel="noreferrer"
              className="w-full py-2 rounded-xl border border-slate-200 text-slate-600 font-medium text-center hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Download
            </a>
          </div>
        ))}
        {selectedProjectId && docs.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            No documents found for this project.
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App Component ---

import { useParams } from 'react-router-dom';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem('isLoggedIn', 'true');
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
  }, []);

  // Sync login state across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'isLoggedIn') {
        setIsAuthenticated(event.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-logout on inactivity (5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer: ReturnType<typeof setTimeout>;

    const logout = () => {
      handleLogout();
    };

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(logout, 5 * 60 * 1000); // 5 minutes
    };

    // Throttle the resetTimer function to avoid excessive calls
    let lastResetTime = 0;
    const throttledResetTimer = () => {
      const now = Date.now();
      // Only reset if at least 1 second has passed since the last reset
      if (now - lastResetTime > 1000) {
        resetTimer();
        lastResetTime = now;
      }
    };

    // Initial start
    resetTimer();

    // Event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, throttledResetTimer));

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, throttledResetTimer));
    };
  }, [isAuthenticated, handleLogout]);

  // Auto-logout at 12:00 AM (Midnight)
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check every minute if it's midnight
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        handleLogout();
      }
    };

    const intervalId = setInterval(checkMidnight, 60000); // Check every minute

    // Also set a timeout for the exact time to midnight to be more precise
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeToMidnight = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      handleLogout();
    }, timeToMidnight);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isAuthenticated, handleLogout]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 lg:pl-64 transition-all">
        <Sidebar onLogout={handleLogout} />
        <main className="p-4 md:p-8 pt-24 lg:pt-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
