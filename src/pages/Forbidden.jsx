import React from 'react';
import { useNavigate } from 'react-router-dom';

const Forbidden = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="max-w-md w-full text-center bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Access Denied
                </h2>
                <p className="text-gray-600 mb-8">
                    Bạn không có quyền truy cập trang này.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Về trang chủ
                </button>
            </div>
        </div>
    );
};

export default Forbidden;
