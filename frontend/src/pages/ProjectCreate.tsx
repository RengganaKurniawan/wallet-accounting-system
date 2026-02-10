import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { 
    ArrowLeft, 
    Save, 
    AlertCircle 
} from 'lucide-react';

const ProjectCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        client_name: '',
        allocated_budget: '',
        description: '',
        status: 'ACTIVE'
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/projects/', formData);
            navigate('/projects');
        } catch(err: any) {
            console.error("Failed to create project:", err);

            if (err.response && err.response.data) {
                const data = err.response.data;

                if (Array.isArray(data)){
                    setError(data[0]);
                } else {
                    const serverError = data.non_field_errors ||
                                    data.allocated_budget ||
                                    data.detail ||
                                    "An unexpected error occured.";
                    setError(Array.isArray(serverError) ? serverError[0] : serverError);    
                }
            } else {
                setError("Network error. Please try again.")
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

            {/* --- HEADER --- */}
            <div className="flex items-center gap-4">
                <Link
                    to="/projects"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600"/>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">New Project Proposal</h2>
                    <p className="text-gray-500 text-sm">Create a new RAB. Funds will be lock immediately.</p>
                </div>
            </div>

            {/* --- ERROR ALERT --- */}
            {error && (
                <div className="bg-red-50 border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-sm">Cannot Create Project</h4>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* --- FORM --- */}
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">

                {/* project name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        placeholder="e.g. Renovation of Hall A"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                {/* client Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        placeholder="e.g. PT. Maju Mundur"
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                    />
                </div>

                {/* budget (RAB) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Budget (RAB)</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                        <input 
                        type="number" 
                        required
                        min="0"
                        className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow font-mono"
                        placeholder="0"
                        value={formData.allocated_budget}
                        onChange={(e) => setFormData({...formData, allocated_budget: e.target.value})}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        * This amount will be validated against current company assets.
                    </p>
                </div>

                {/* description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea 
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow resize-none"
                        placeholder="Scope of work, timeline notes, etc..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-4 flex justify-end gap-3">
                    <Link 
                        to="/projects"
                        className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Cancel
                    </Link>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Validating...' : (
                        <>
                            <Save size={18} /> Create Project
                        </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    )
}

export default ProjectCreate;
