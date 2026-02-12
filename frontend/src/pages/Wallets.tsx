import { useEffect, useState } from 'react';
import api from '../api';
import { 
  Plus, 
  Wallet, 
  CreditCard, 
  Trash2, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';

interface BankAccount {
    id: number;
    name: string;
    account_number: string;
    balance: string;
}

const Wallets = () => {
    const [wallets, setWallets] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // new Wallet
    const [newWallet, setNewWallet] = useState({
        name: '',
        account_number: '',
        balance: '',
    })

    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async() => {
        try {
            const response = await api.get('/bank-accounts');
            setWallets(response.data);
        } catch (error) {
            console.error("Failed to load wallets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/bank-accounts/', newWallet);
            setShowForm(false);
            setNewWallet({ 
                name: '',
                account_number: '',
                balance: '',
            });
            fetchWallets();
        } catch(error: any) {
            console.error("Creation Error:", error);
      
            if (error.response && error.response.data) {
                alert(`Server Error: ${JSON.stringify(error.response.data)}`);
            } else {
                alert("Failed to create wallet. Please check inputs.");
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? this will delete the wallet and its history.")) return;
        try {
            await api.delete(`/bank-accounts/${id}/`);
            fetchWallets();
        } catch(error) {
            alert("Cannot delete wallet with existing transactions.");
        }
    };

    const formatIDR = (num: number) => 
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);

    const getBalance = (wallet: BankAccount) => parseFloat(wallet.balance) || 0;    
    const totalAssets =  wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);

    return (
        <div className="space-y-6 animate-fade-in">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Company Wallets</h2>
                    <p className="text-gray-500 mt-1">Manage bank accounts and cash on hand.</p>
                </div>
                <div className="text-right bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Total Liquid Assets</p>
                    <h3 className="text-2xl font-bold text-blue-700">{formatIDR(totalAssets)}</h3>
                </div>
            </div>

            {/* --- CREATE WALLET --- */}
            {showForm ? (
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="font-bold text-gray-800">Add New Wallet</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input
                            type="text" placeholder="Bank Name (e.g. BCA)" required
                            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={newWallet.name}
                            onChange={e => setNewWallet({...newWallet, name: e.target.value})}
                        />
                        <input 
                            type="text" placeholder="Account Number" required
                            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={newWallet.account_number}
                            onChange={e => setNewWallet({...newWallet, account_number: e.target.value})}
                        />
                        <input 
                            type="number" placeholder="Initial Balance" required
                            className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={newWallet.balance}
                            onChange={e => setNewWallet({...newWallet, balance: e.target.value})}
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Save Wallet
                        </button>
                    </div>
                </form>
            ) : (
                <button 
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 text-blue-600 font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors w-fit"
                >
                    <Plus size={20} /> Add New Wallet
                </button>
            )}

            {/* --- WALLETS GRID --- */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading wallets...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wallets.map(wallet => (
                        <div 
                            key={wallet.id} 
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 group hover:shadow-md transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Wallet size={120} />
                            </div>

                            <div className="flex justify-between items-start mb-6 relative">
                                <div className="p-3 bg-gray-50 rounded-xl text-gray-600">
                                <CreditCard size={24} />
                                </div>
                                <button 
                                onClick={() => handleDelete(wallet.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                title="Delete Wallet"
                                >
                                <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="relative">
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">{wallet.name}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">{formatIDR(getBalance(wallet))}</h3>
                                <p className="text-xs text-gray-400 font-mono">{wallet.account_number}</p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                                <button className="flex-1 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1">
                                    <TrendingUp size={14} /> Deposit
                                </button>
                                <button className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1">
                                    <TrendingDown size={14} /> Withdraw
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wallets;