import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { 
    ArrowLeft, 
    AlertCircle 
} from 'lucide-react';

const TransactionCreate = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [wallets, setWallets] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [projectItems, setProjectItems] = useState<any[]>([]);
    
    // form
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0], // Today YYYY-MM-DD
        description: '',
        amount: '',
        transaction_type: 'OUT', 
        account: '', 
        project: '', 
        project_item: '' 
    });

    // fetch wallet
    useEffect(() => {
        const fetchInitialData = async () => {
        try {
            const wRes = await api.get('/bank-accounts/');
            setWallets(wRes.data);
            
            const pRes = await api.get('/projects/');
            setProjects(pRes.data);
        } catch (err) {
            console.error("Init failed", err);
        }
        };
        fetchInitialData();
    }, []);
    
    // fetch project
    useEffect(() => {
        if (!formData.project) {
            setProjectItems([]);
            return;
        }
        
        const fetchItems = async () => {
            try {
                const res = await api.get(`/projects/${formData.project}/`);

                const allItems = res.data.items || [];
                const availableItems = allItems.filter((item: any) => item.realized_spend === 0)
                setProjectItems(availableItems);
            } catch (err) {
                console.error("Failed to load items", err);
            }
        };
        fetchItems();
    }, [formData.project]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            date: formData.date,
            description: formData.description,
            amount: formData.amount,
            transaction_type: formData.transaction_type,
            account: formData.account,
            project_item: formData.project_item || null 
        };

        try {
            await api.post('/transactions/', payload);
            navigate('/transactions');
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.data) {
                setError(JSON.stringify(err.response.data));
            } else {
                setError("Failed to create transaction.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-2-2xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <Link to="/transactions" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-600" />
                </Link>
                <h2 className="text-2xl font-bold text-gray-900">New Transaction</h2>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex gap-2 items-start">
                    <AlertCircle size={20} className="mt-0.5 shring-0" />
                    <div className="text-sm font-medium">{error}</div>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                
                {/* type & date  */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={formData.transaction_type}
                            onChange={e => setFormData({...formData, transaction_type: e.target.value})}
                        >
                            <option value="OUT">Expense</option>
                            <option value="IN">Income</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input 
                            type="date" required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                    </div>
                </div>

                {/* wallet & amount */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Wallet / Account
                        </label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            value={formData.account}
                            onChange={e => setFormData({...formData, account: e.target.value})}
                        >
                            <option value="">-- Select Wallet --</option>
                            {wallets.map(w => (
                                <option key={w.id} value={w.id}>{w.name} (IDR {parseFloat(w.balance).toLocaleString()})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                            <input 
                                type="number" required min="1"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
                
                {/* description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input 
                        type="text" required
                        placeholder="e.g. Buying Coffee or Paying Vendor"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                {/* link to project */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-bold text-gray-700">Project Link (Optional)</h4>
                        <span className="text-xs text-gray-400">Sync with RAB</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* select project  */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Select Project</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                value={formData.project}
                                onChange={e => setFormData({...formData, project: e.target.value, project_item: ''})}
                            >
                                <option value="">-- General Expense (no project) --</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* select item if project selected */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Select RAB Item</label>
                            <select 
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                disabled={!formData.project}
                                value={formData.project_item}
                                onChange={e => setFormData({...formData, project_item: e.target.value})}
                            >
                                <option value="">-- Select Item --</option>
                                {projectItems.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} (Budget: {parseInt(item.total_price).toLocaleString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium shadow-sm transition-colors"
                    >
                        {loading ? 'Saving...' : 'Save Transaction'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default TransactionCreate;