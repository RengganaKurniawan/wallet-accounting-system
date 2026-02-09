import { useEffect, useState } from 'react';
import api from '../api';
import { 
    Wallet, 
    Lock, 
    Unlock, 
    ArrowUpRight,
    ArrowDownLeft,
    Activity 
} from 'lucide-react'

interface BankAccount {
    id: number;
    bank_name: string;
    balance: string
}

interface Project {
    id: number;
    name: string;
    client_name: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    allocated_budget: number;
    total_spent: number;
    remaining_budget: number;
}

interface Transaction {
    id: number;
    description: string;
    amount: string;
    transaction_type: 'IN' | 'OUT';
    date: string;
    account: number;
}

const Dashboard = () => {
    const [banks, setBanks] = useState<BankAccount[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async() => {
            try {
                const [banksRes, projectRes, txRes] = await Promise.all([
                    api.get('/bank-accounts'),
                    api.get('/projects'),
                    api.get('/transactions')
                ]);
                
                setBanks(banksRes.data);
                setProjects(projectRes.data)
                
                const recentTx = txRes.data.reverse().slice(0, 5);
                setTransactions(recentTx);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const totalAssets = banks.reduce((sum, bank) => sum + parseFloat(bank.balance), 0);

    const activeProjects = projects.filter(p => p.status === 'ACTIVE');
    const lockedFunds = activeProjects.reduce((sum, proj) => sum + Number(proj.allocated_budget), 0);

    const freeCash = totalAssets - lockedFunds;

    const formatIDR = (num: number) => 
        Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(num);
    

    if (loading) return (
        <div className="p-10 text-center text-gray-500">
            <Activity className="animate-spin mr-2"/>Loading Data....
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">

            {/* --- HEADER --- */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Overview</h2>
                <p className="text-gray-500 mt-1">Real-time stats & project tracking.</p>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* CARD 1: TOTAL ASSETS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Company Assets</p>
                        <h3 className="text-3xl font-bold text-blue-600 mt-2">{formatIDR(totalAssets)}</h3>
                        <p className="text-xs text-gray-400 mt-2">Across {banks.length} bank accounts</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                        <Wallet size={28} />
                    </div>
                </div>

                {/* CARD 2 : LOCKED FUNDS */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Locked Funds (Active Project)</p>
                        <h3 className="text-3xl font-bold text-orange-600 mt-2">{formatIDR(lockedFunds)}</h3>
                        <p className="text-xs text-gray-400 mt-2">Reserved for {activeProjects.length} running projects</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl text-orange-600 group-hover:scale-110 transition-transform">
                        <Lock size={28} />
                    </div>
                </div>

                {/* CARD 3 : FREE CASH */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-shadow">                    
                    <div>
                        <p className="text-sm font-medium text-gray-500">Available Cash</p>
                        <h3 className={`text-3xl font-bold mt-2 ${freeCash < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatIDR(freeCash)}
                        </h3>
                        <p className="text-xs text-gray-400 mt-2">
                            {freeCash < 0 ? "⚠️ SOLVENCY WARNING" : "Safe for new allocation"}
                        </p>
                    </div>
                    <div className={`p-4 rounded-xl group-hover:scale-110 transition-transform ${freeCash < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <Unlock size={28} />
                    </div>
                </div>                
            </div>

            {/* --- MAIN --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* --- LEFT : ACTIVE PROJECT TABLE  */}
                <div className="xl:col-span-2 bg-white-rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-semibold text-gray-800">Project Realization</h3>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {activeProjects.length} Active
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4">Project</th>
                                    <th className="px-6 py-4 text-right">Plan (RAB)</th>
                                    <th className="px-6 py-4 text-right">Real (Used)</th>
                                    <th className="px-6 py-4 w-1/4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {activeProjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                                            No active projects.
                                        </td>
                                    </tr>
                                ) : (
                                    activeProjects.map((p) => {
                                        const rab = Number(p.allocated_budget);
                                        const spent = Number(p.total_spent);
                                        const percent = rab > 0 ? (spent/rab) * 100 : 0;

                                        let colorClass = "bg-emerald-500";
                                        if (percent > 90) colorClass = "bg-yellow-500";
                                        if (percent > 100) colorClass = "bg-red-500";

                                        return (
                                            <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{p.name}</div>
                                                    <div className="text-xs text-gray-400">{p.client_name}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium">
                                                    {formatIDR(rab)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                    {formatIDR(spent)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className={percent > 100 ? "text-red-600 font-bold" : "text-gray-500"}>
                                                                {percent.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                                                                style={{ width: `${Math.min(percent, 100)}%`}}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- RIGHT : RECENT TRANSACTIONS */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-fit">
                    <div className="px-6 py-5 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">Recent Activity</h3>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {transactions.length == 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                No recent transactions found.
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-full ${
                                            tx.transaction_type === 'IN' 
                                                ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-red-100 text-red-600'
                                        }`}>
                                            {tx.transaction_type === 'IN'
                                                ? <ArrowDownLeft size={18}/>
                                                : <ArrowUpRight size={18}/>
                                            }
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{tx.description}</p>
                                            <p className="text-xs text-gray-400">{tx.date}</p>
                                        </div>
                                        <span className={`text-sm font-bold whitespace-nowrap ${
                                            tx.transaction_type === 'IN' ? 'text-emerald-600' : 'text-red-600'
                                        }`}>
                                            {tx.transaction_type === 'IN' ? '+' : '-'} {formatIDR(parseFloat(tx.amount))}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {transactions.length > 0 && (
                        <div className="p-4 border-t border-gray-100">
                            <button className="w-full py-2 text-sm text-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                View All Transactions
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;