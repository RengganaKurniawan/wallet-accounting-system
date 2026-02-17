import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import {
    ArrowLeft,
    Save,
    Calculator,
    AlertCircle,
} from 'lucide-react'

const ProjectItemCreate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // form
    const [formData, setFormData] = useState({
        category: '',
        sub_category: '',
        name: '',
        description: '',

        qty_amount: 1,
        qty_unit: 'pax',

        volume_amount: 1,
        volume_unit: 'set',

        period_amount: 1,
        period_unit: 'event',

        unit_price: 0
    });

    const totalCost =
        formData.qty_amount * formData.volume_amount * formData.period_amount * formData.unit_price;

    const formatIDR = (num: number) => 
        new Intl.NumberFormat('id-ID',
            {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }
        ).format(num)
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true)
        setError(null);

        try {
            await api.post('/project-items/', {
                ...formData,
                project: id
            });

            navigate(`/projects/${id}`);
        } catch(err: any) {
            console.error("Failed to add item:", err);
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (Array.isArray(data)) setError(data[0]);
                else if (data.non_field_errors) setError(data.non_field_errors[0]);
                else setError("Failed to save item. Please check your inputs.");
            } else {
                setError("Network error.");
            }
        } finally {
            setLoading(false)
        }
    };
    
    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            
            {/* --- HEADER --- */}
            <div className="flex items-center gap-4">
                <Link
                    to={`/projects/${id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600"/>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Add RAB Item</h2>
                    <p className="text-gray-500 text-sm">Plan a new expense item for this project.</p>
                </div>
            </div>

            {/* ---ERROR MESSAGE --- */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                    <AlertCircle size={20} className="mt-0.5 flex-shring-0" />
                    <div>
                        <h4 className="font-bold text-sm">Cannot Save Item</h4>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* left col */}
                <div className="md:col-span-2 space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">

                    {/* section 1 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                                type="text" required
                                placeholder="e.g. Hall A"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
                            <input
                                type="text"
                                placeholder="e.g. Floor A"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.sub_category}
                                onChange={e => setFormData({...formData, sub_category: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* section 2 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input
                            type="text" required
                            placeholder="e.g lighting"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    {/* section 3 */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cost Calculator</h4>

                        {/* row 1 : Qty */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                            <label className="text-sm font-medium text-gray-600">Quantity</label>
                            <input 
                                type="number" min="1" required
                                className="px-3 py-1.5 border border-gray-300 rounded-md"
                                value={formData.qty_amount}
                                onChange={e => setFormData({...formData, qty_amount: parseFloat(e.target.value) || 0})}
                            />
                            <input 
                                type="text" placeholder="Unit (e.g. Sack)"
                                className="px-3 py-1.5 border border-gray-300 rounded-md"
                                value={formData.qty_unit}
                                onChange={e => setFormData({...formData, qty_unit: e.target.value})}
                            />
                        </div>

                        {/* row 2 : Volume */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                            <label className="text-sm font-medium text-gray-600">Volume</label>
                            <input 
                                type="number" min="1" required
                                className="px-3 py-1.5 border border-gray-300 rounded-md"
                                value={formData.volume_amount}
                                onChange={e => setFormData({...formData, volume_amount: parseFloat(e.target.value) || 0})}
                            />
                            <input 
                                type="text" placeholder="Unit (e.g. m3)"
                                className="px-3 py-1.5 border border-gray-300 rounded-md"
                                value={formData.volume_unit}
                                onChange={e => setFormData({...formData, volume_unit: e.target.value})}
                            />
                        </div>

                        {/* row 3 : Period */}
                        <div className="grid grid-cols-3 gap-2 items-center">
                            <label className="text-sm font-medium text-gray-600">Period</label>
                            <input 
                                type="number" min="1" required
                                className="px-3 py-1.5 border border-gray-300 rounded-md"
                                value={formData.period_amount}
                                onChange={e => setFormData({...formData, period_amount: parseFloat(e.target.value) || 0})}
                            />
                            <input 
                                type="text" placeholder="Unit (e.g. Days)"
                                className="px-3 py-1.5 border border-gray-300 rounded-md"
                                value={formData.period_unit}
                                onChange={e => setFormData({...formData, period_unit: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* section 4 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (IDR)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                            <input 
                                type="number" min="0" required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                value={formData.unit_price}
                                onChange={e => setFormData({...formData, unit_price: parseFloat(e.target.value) || 0})}
                            />
                        </div>
                    </div>
                </div>

                {/* right col */}
                <div className="space-y-6">
                    <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg sticky top-6">
                        <div className="flex items-center gap-2 mb-4 opacity-90">
                            <Calculator size={20} />
                            <span className="font-semibold text-sm uppercase tracking-wider">Total Estimation</span>
                        </div>

                        <div className="space-y-1 text-blue-100 text-sm mb-6">
                            <div className="flex justify-between">
                                <span>Qty:</span>
                                <span>{formData.qty_amount} {formData.qty_unit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Vol:</span>
                                <span>{formData.volume_amount} {formData.volume_unit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Period:</span>
                                <span>{formData.period_amount} {formData.period_unit}</span>
                            </div>
                            <div className="border-t border-blue-400 my-2 pt-2 flex justify-between font-medium text-white">
                                <span>Multiplier:</span>
                                <span>× {formData.qty_amount * formData.volume_amount * formData.period_amount}</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm opacity-80 mb-1">Total Planned Cost</p>
                            <h3 className="text-3xl font-bold">{formatIDR(totalCost)}</h3>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full mt-6 bg-white text-blue-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Saving...' : (
                                <>
                                    <Save size={18} /> Add to RAB
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default ProjectItemCreate;