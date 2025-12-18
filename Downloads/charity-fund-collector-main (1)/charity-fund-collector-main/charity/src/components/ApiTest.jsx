import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const ApiTest = () => {
    const [status, setStatus] = useState('Testing...');
    const [apiUrl, setApiUrl] = useState('');

    useEffect(() => {
        setApiUrl(API_BASE_URL);
        testConnection();
    }, []);

    const testConnection = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}`);
            if (response.data.ok) {
                setStatus('✅ Connected to backend successfully!');
            } else {
                setStatus('❌ Backend responded but with unexpected data');
            }
        } catch (error) {
            setStatus(`❌ Connection failed: ${error.message}`);
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            background: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999
        }}>
            <div>API URL: {apiUrl}</div>
            <div>Status: {status}</div>
        </div>
    );
};

export default ApiTest;