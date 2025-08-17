import React, { useState } from 'react';
import { testCsrfEndpoint, testCsrfWithRegistration } from '../../utils/testCsrf';

const CsrfTestComponent: React.FC = () => {
    const [testResults, setTestResults] = useState<string[]>([]);
    const [isTesting, setIsTesting] = useState(false);

    const addResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const runCsrfTest = async () => {
        setIsTesting(true);
        setTestResults([]);
        
        addResult('Starting CSRF endpoint test...');
        
        try {
            const result = await testCsrfEndpoint();
            if (result) {
                addResult('✅ CSRF endpoint test PASSED');
            } else {
                addResult('❌ CSRF endpoint test FAILED');
            }
        } catch (error) {
            addResult(`❌ CSRF endpoint test ERROR: ${error}`);
        }
        
        setIsTesting(false);
    };

    const runRegistrationTest = async () => {
        setIsTesting(true);
        addResult('Starting CSRF registration test...');
        
        try {
            const result = await testCsrfWithRegistration();
            if (result) {
                addResult('✅ CSRF registration test PASSED');
            } else {
                addResult('❌ CSRF registration test FAILED');
            }
        } catch (error) {
            addResult(`❌ CSRF registration test ERROR: ${error}`);
        }
        
        setIsTesting(false);
    };

    const clearResults = () => {
        setTestResults([]);
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">CSRF Token Test Component</h2>
            
            <div className="space-y-2 mb-4">
                <button
                    onClick={runCsrfTest}
                    disabled={isTesting}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
                >
                    {isTesting ? 'Testing...' : 'Test CSRF Endpoint'}
                </button>
                
                <button
                    onClick={runRegistrationTest}
                    disabled={isTesting}
                    className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400 ml-2"
                >
                    {isTesting ? 'Testing...' : 'Test CSRF Registration'}
                </button>
                
                <button
                    onClick={clearResults}
                    className="px-4 py-2 bg-gray-500 text-white rounded ml-2"
                >
                    Clear Results
                </button>
            </div>
            
            <div className="bg-white p-4 rounded border">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                {testResults.length === 0 ? (
                    <p className="text-gray-500">No tests run yet. Click a test button above.</p>
                ) : (
                    <div className="space-y-1">
                        {testResults.map((result, index) => (
                            <div key={index} className="text-sm font-mono">
                                {result}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
                <p><strong>Note:</strong> This component is for debugging purposes only.</p>
                <p>Check the browser console for detailed logs.</p>
            </div>
        </div>
    );
};

export default CsrfTestComponent;

