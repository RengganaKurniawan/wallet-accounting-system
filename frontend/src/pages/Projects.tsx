import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import api from '../api';
import { 
    Plus, 
    Search, 
    Filter, 
    Folder, 
    Calendar 
} from 'lucide-react'

interface Project {
  id: number;
  name: string;
  client_name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  allocated_budget: number;
  total_spent: number;
  created_at: string;
}

const Projects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async() => {
        try {
            const response = await api.get('/projects/');
            setProjects(response.data);
        } catch(error){
            console.error("Failed to load projects", error);
        } finally {
            setLoading(false);
        }
    };

    // FILTER LOGIC
    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.client_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
        return matchesSearch && matchesStatus
    })

    const formatIDR = (num: number) => 
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
            case 'CANCELLED': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">

            {/* --- HEADER ---  */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
                    <p className="text-gray-500 mt-1">Manage your contracts and monitor realization.</p>
                </div>
                <Link
                    to="/projects/new"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus size={20} /> New Project
                </Link>
            </div>

            {/* --- FILTERS --- */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search projects or clients..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-gray-600"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* --- PROJECT GRID --- */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading projects...</div>
            ) : filteredProjects.length === 0 ? (
                <div>
                    <Folder size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                    <p className="text-gray-500">Try adjusting your filters or create a new project.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => {
                        const percent = project.allocated_budget > 0
                            ? (project.total_spent / project.allocated_budget)
                            : 0;
                        
                            return (
                                <Link
                                    key={project.id} 
                                    to={`/projects/${project.id}`}
                                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow group flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Folder size={24} />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                                            {project.status}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{project.name}</h3>

                                    <div className="flex flex-col gap-1 mb-6">
                                        <p className="text-sm font-medium text-gray-700">{project.client_name}</p>
                                    
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <Calendar size={14} />
                                            <span>{new Date(project.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Realization</span>
                                                <span className="font-medium text-gray-900">{percent.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-2 overdlow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${percent > 100 ? 'bg-red-500' : 'bg-blue-600'}`} 
                                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                                />       
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-400">Budget (RAB)</p>
                                                <p className="text-sm font-semibold text-gray-900">{formatIDR(project.allocated_budget)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">Spent</p>
                                                <p className="text-sm font-semibold text-gray-900">{formatIDR(project.total_spent)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                    })}
                </div>
            )}
        </div>
    );
};

export default Projects
