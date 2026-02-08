import { useEffect, useState } from 'react';
import api from '../api';
import { Wallet, Lock, Unlock, ArrowRight } from 'lucide-react'

interface BankAccount {
    id: number;
    bank_name: string;
    account_number: string;
    balance: string
}

interface Project {
    id: number;
    name: string;
    client_name: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    allocated_budget: string;
}

const Dashboard = () => {
    const [banks, setBanks] = useState<BankAccount[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async() => {
            try {
                const [banksRes, projectRes] = await Promise.all([
                    api.get('/bank-accounts'),
                    api.get('/projects')  
                ]);
                setBanks(banksRes.data);
                setProjects(projectRes.data)
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
    const lockedFunds = activeProjects.reduce((sum, proj) => sum + parseFloat(proj.allocated_budget), 0);

    const freeCash = totalAssets - lockedFunds;

    const formatIDR = (num: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(num);
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Data....</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-gray-800">Overview</h2>
                <p className="text-gray-500">Real-time tracking of company solvency.</p>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* CARD 1 : TOTAL ASSETS */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Company Assets</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatIDR(totalAssets)}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Wallet size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Across {banks.length} bank accounts</p>
                </div>

                {/* CARD 2 : LOCKED FUNDS */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Locked Funds (Active RAB)</p>
                            <h3 className="text-2xl font-bold text-orange-600 mt-2">{formatIDR(lockedFunds)}</h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                            <Lock size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Reserved for {activeProjects.length} active projects</p>
                </div>

                {/* CARD 3 : FREE CASH */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Available Free Cash</p>
                            <h3 className={`text-2xl font-bold mt-2 ${freeCash < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatIDR(freeCash)}
                            </h3>
                        </div>
                        <div className={`p-3 rounded-lg ${freeCash < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            <Unlock size={24}/>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                        {freeCash < 0 ? "WARNING: OVER BUDGET" : "Safe to allocate for new projects"}
                    </p>
                </div>                
            </div>

            {/* --- ACTIVE PROJECTS TABLE --- */}

        </div>
    );
};

export default Dashboard;