import { Outlet, NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderKanban,
    Wallet,
    ArrowRightLeft,
    Settings
} from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20}/> },
        { name: 'Projects', path: '/projects', icon: <FolderKanban size={20}/>},
        { name: 'Wallets', path: '/wallets', icon: <Wallet size={20} /> },
        { name: 'Transactions', path: '/transactions', icon: <ArrowRightLeft size={20} /> },
    ];

    return (
        <aside className="w-64 h-screen bg-gray-900 text-white fixed left-0 top-0 flex flex-col">
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-blue-500">NICE</h1>
                <p className="text-xs text-gray-400 mt-1">Accounting System</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `flex items-center gap-3 px-4 py-3 rounder-lg transition-colors ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            
            <div className="p-4 border-t border-gray-800">
                <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white w-full">
                    <Settings size={20}/>
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
};

function MainLayout() {
    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* sidebar */}
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
