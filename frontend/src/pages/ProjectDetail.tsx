import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { 
  ArrowLeft, 
  Plus, 
  Receipt, 
  PieChart, 
  AlertTriangle,
} from 'lucide-react';

interface RABItem {
    id: number;
    category: string;
    sub_category: string | null;
    name: string;
    description: string;
    qty_amount: number;
    qty_unit: string;
    volume_amount: number;
    volume_unit: string;
    period_amount: number;
    period_unit: string;
    unit_price: string; 
    total_price: number; 
    realized_spend: number; 
    margin: number;
}

interface ProjectDetail {
  id: number;
  name: string;
  client_name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  allocated_budget: number;
  total_spent: number;
  remaining_budget: number;
  items: RABItem[];
  created_at: string;
}

const ProjectDetail = () => {
    const { id } = useParams();
    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjectDetails();
    }, [id]);

    const fetchProjectDetails = async() => {
        try{
            const response = await api.get(`/projects/${id}/`);
            setProject(response.data);
        } catch(error) {
            console.error("Failed to load project", error);
        } finally {
            setLoading(false);
        }
    };

    const formatIDR = (num: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency', 
            currency: 'IDR', 
            minimumFractionDigits: 0
        }).format(num);
        
    if (loading) return <div className="p-10 text-center text-gray-500">Loading Project Details...</div>;
    if (!project) return <div className="p-10 text-center text-red-500">Project not found</div>;

    // percent calculations
    const percentUsed = project.allocated_budget > 0
        ? (project.total_spent / project.allocated_budget) * 100
        : 0;
    
    // group items by category
    const groupedItems : { [key: string]: RABItem[] } = {};
    project.items.forEach(item => {
        const cat = item.category || 'Uncategorized';
        if (!groupedItems[cat]) groupedItems[cat] = [];
        groupedItems[cat].push(item);
    });
    
    return (
        <div className="space-y-8 animate-fade-in">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Link
                        to="/projects"
                        className="mt-1 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} className="text-gray-600"/>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold text-gray-900">{project.name}</h2>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full border
                                ${project.status === 'ACTIVE' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <span className="font-medium">{project.client_name}</span> • Created on {new Date(project.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div>
                    <Link
                        to={`/projects/${id}/add-item`}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
                    >
                        <Plus size={18}/> Add RAB Item
                    </Link>
                </div>
            </div>

            {/* --- FINANCIAL STATS --- */}
            <div className="bg-white p-6 rounded=2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Project Budget Usage</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <h3 className="text-3xl font-bold text-gray-900">{formatIDR(project.total_spent)}</h3>
                            <span className="text-gray-400 font-medium">of {formatIDR(project.allocated_budget)}</span>
                        </div>        
                    </div>
                    <div className="text-right">
                        <p className={`text-xl font-bold ${project.remaining_budget < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {project.remaining_budget < 0 ? '-' : '+'}{formatIDR(Math.abs(project.remaining_budget))}
                        </p>
                        <p className="text-xs text-gray-400 uppercase">Remaining</p>
                    </div>
                </div>

                {/* --- PROGRESS BAR --- */}
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                            percentUsed > 100 ? 'bg-red-500' : 
                            percentUsed > 90 ? 'bg-orange-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                </div>
                <p className="text-right text-xs font-medium text-gray-500 mt-2">{percentUsed.toFixed(1)}% Realized</p>
            </div>

            {/* === RAB DETAILED TABLE --- */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Receipt size={18} className="text-gray-400" />
                        Detail Anggaran
                    </h3>
                    <span className="text-xs text-gray-500 italic">Grouped by Category</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-gray-700 font-semibold uppercase text-xs">
                            <tr>
                               <th className="px-6 py-3 w-1/3">Item Description</th> 
                               <th className="px-6 py-3 text-center">Qty / Vol</th> 
                               <th className="px-6 py-3 text-right">Plan (Budget)</th> 
                               <th className="px-6 py-3 text-right">Real (Actual)</th> 
                               <th className="px-6 py-3 text-right">Margin</th> 
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Object.keys(groupedItems).length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <PieChart size={32} className="text-gray-200" />
                                            <p>No items in RAB yet.</p>
                                            <Link to={`/projects/${id}/add-item`} className="text-blue-600 hover:underline">
                                                Add your first item
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                Object.keys(groupedItems).map(category => (
                                    <>
                                        {/* --- CATEGORY HEADER --- */}
                                        <tr key={category} className="bg-gray-50/50">
                                            <td colSpan={5} className="px-6 py-2 font-bold text-gray-800 uppercase tracking-wider text-xs border-y border-gray-200/50">
                                                {category}
                                            </td>
                                        </tr>

                                        {/* --- ITEMS --- */}
                                        {groupedItems[category].map(item => {
                                            const isProfit = item.margin >= 0;
                                            return (
                                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900">
                                                            {item.name}
                                                        </div>
                                                        {item.sub_category && (
                                                            <div className="text-xs text-blue-500 bg-blue-50 inline-block px-1.5 rounded mt-1">
                                                                {item.sub_category}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-xs">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="whitespace-nowrap">
                                                                {item.qty_amount} {item.qty_unit}
                                                                <span className="text-gray-400"> × </span> {item.volume_amount} {item.volume_unit}
                                                                <span className="text-gray-400"> × </span> {item.period_amount} {item.period_unit}
                                                            </span>
                                                            <span className="font-medium text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded w-fit">
                                                                @ {formatIDR(parseFloat(item.unit_price))}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium">
                                                        {formatIDR(item.total_price)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                        {item.realized_spend > 0 ? formatIDR(item.realized_spend) : '0'}
                                                    </td>
                                                    <td className={`px-6 py-4 text-right font-bold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        {formatIDR(item.margin)}
                                                        {item.margin < 0 && <AlertTriangle size={12} className="inline ml-1 mb-0.5" />}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetail;