import React from 'react';
import { X } from 'lucide-react';

interface Last10RowsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: Record<string, any>[];
    modelName: string;
}

const Last10RowsModal: React.FC<Last10RowsModalProps> = ({ isOpen, onClose, data, modelName }) => {
    if (!isOpen) return null;

    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-[80vw] max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Last 10 Rows - {modelName}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <div className="overflow-auto flex-1">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-700">
                            <tr>
                                {columns.map(column => (
                                    <th key={column} className="px-4 py-2 text-left font-medium">
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {data.map((row, idx) => (
                                <tr key={idx} className="hover:bg-gray-700">
                                    {columns.map(column => (
                                        <td key={column} className="px-4 py-2">
                                            {row[column] === '(NULL)' ? (
                                                <span className="text-gray-500">NULL</span>
                                            ) : (
                                                row[column]
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Last10RowsModal;
