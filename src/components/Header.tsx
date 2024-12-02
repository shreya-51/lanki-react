import { X, Minimize2 } from 'lucide-react';

interface HeaderProps {
    onMinimize: () => void;
}

export function Header({ onMinimize }: HeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <h1 className="font-semibold text-gray-800">Lanki</h1>
            </div>
            <div className="flex items-center space-x-2">
                <button
                    onClick={onMinimize}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <Minimize2 className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-gray-600" />
                </button>
            </div>
        </div>
    );
}