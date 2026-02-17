import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Search, 
  Filter,
  Wallet
} from 'lucide-react';

interface Transaction {
    id: number;
    date: string;
    amount: string;
    transaction_type: 'IN' | 'OUT';
    description: string;
    account: number;

    wallet_name: string;
    project_name: string | null;
    project_item: number | null;
}

const Transactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async() => {
        try {
            // assume backend return from newest
            const response = await api.get('/transactions/');
            setTransactions(response.data);
        } catch (error) {
            console.error("Failed to load transactions", error);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Transactions</h2>
                    <p className="text-gray-500 mt-1">Global history of all income and expenses.</p>
                </div>
                <Link 
                    to="/transactions/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> New Transaction
                </Link>
            </div>

            {/* --- FILTER --- no work */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search description..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-gray-50">
                    <Filter size={18} /> Filter
                </button>
            </div>

            {/* --- TABLE --- */}
            <div className="bg-white- rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Wallet</th>
                            <th className="px-6 py-4">Context</th> 
                            <th className="px-6 py-4 text-center">Type</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No transactions found.</td></tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    
                                    {/* date */}
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-500">
                                        {formatDate(tx.date)}
                                    </td>

                                    {/* WALLET (NEW) */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-700 font-medium">
                                            <Wallet size={16} className="text-gray-400" />
                                            {tx.wallet_name}
                                        </div>
                                    </td>

                                    {/* CONTEXT (Project vs General) */}
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{tx.description}</div>
                                        
                                        {/* Logic: If Project exists, show it. Else show General Expenses */}
                                        {tx.project_name ? (
                                            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                                Project: {tx.project_name}
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                                General Expenses
                                            </div>
                                        )}
                                    </td>

                                    {/* type */}
                                    <td className="px-6 py-4 text-center">
                                        {tx.transaction_type === 'IN' ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                            <ArrowDownLeft size={12} /> IN
                                        </span>
                                        ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                            <ArrowUpRight size={12} /> OUT
                                        </span>
                                        )}
                                    </td>

                                    {/* amount */}
                                    <td className={`px-6 py-4 text-right font-bold font-mono ${tx.transaction_type === 'IN' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                        {tx.transaction_type === 'IN' ? '+' : '-'}{formatIDR(parseFloat(tx.amount))}
                                    </td>


                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Transactions;