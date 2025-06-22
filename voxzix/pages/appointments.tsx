import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface Appointment {
  id?: string;
  customerName: string;
  phoneNumber: string;
  serviceType?: string;
  serviceName?: string;
  contactNumber?: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  notes?: string;
  callDuration?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CallLog {
  callSid: string;
  phoneNumber: string;
  duration: string;
  status: string;
  language?: string;
  intent: string;
  conversationSummary?: string;
  timestamp: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'calls'>('appointments');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  // Load appointments from backend
  const loadAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/appointments/json`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAppointments(result.data);
          setMessage(`Loaded ${result.data.length} appointments`);
        } else {
          setMessage('No appointments found');
          setAppointments([]);
        }
      } else {
        setMessage('Error loading appointments');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setMessage('Error connecting to server');
    }
    setLoading(false);
  };

  // Load call logs from backend
  const loadCallLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/calls/json`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCallLogs(result.data);
          setMessage(`Loaded ${result.data.length} call logs`);
        } else {
          setMessage('No call logs found');
          setCallLogs([]);
        }
      } else {
        setMessage('Error loading call logs');
        setCallLogs([]);
      }
    } catch (error) {
      console.error('Error loading call logs:', error);
      setMessage('Error connecting to server');
    }
    setLoading(false);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        if (activeTab === 'appointments') {
          const appointmentData = XLSX.utils.sheet_to_json<Appointment>(worksheet);
          setAppointments(appointmentData);
          setMessage(`Loaded ${appointmentData.length} appointments from file`);
        } else {
          const callData = XLSX.utils.sheet_to_json<CallLog>(worksheet);
          setCallLogs(callData);
          setMessage(`Loaded ${callData.length} call logs from file`);
        }
      } catch (error) {
        console.error('Error reading file:', error);
        setMessage('Error reading file. Please ensure it\'s a valid Excel/CSV file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };
  // Download from backend
  const downloadFromBackend = async (type: 'excel' | 'csv') => {
    try {
      const endpoint = activeTab === 'appointments' ? '/api/appointments/download' : '/api/calls/download';
      const response = await fetch(`${API_URL}${endpoint}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage(`${activeTab} downloaded successfully`);
      } else {
        setMessage(`No ${activeTab} file found on server`);
      }
    } catch (error) {
      console.error('Error downloading from backend:', error);
      setMessage('Error downloading file from server');
    }
  };

  useEffect(() => {
    if (activeTab === 'appointments') {
      loadAppointments();
    } else {
      loadCallLogs();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">VoxBiz - Appointment & Call Management</h1>
            <p className="text-gray-600 mt-1">View and manage appointments and call logs</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'appointments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Appointments ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('calls')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'calls'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Call Logs ({callLogs.length})
              </button>
            </nav>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  📁 Upload File
                </label>
              </div>
                <button
                onClick={() => downloadFromBackend('excel')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                📊 Download Excel
              </button>
              
              <button
                onClick={() => {
                  const data = activeTab === 'appointments' ? appointments : callLogs;
                  const worksheet = XLSX.utils.json_to_sheet(data);
                  const csv = XLSX.utils.sheet_to_csv(worksheet);
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setMessage(`${activeTab} CSV downloaded successfully`);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                📄 Download CSV
              </button>
              
              <button
                onClick={activeTab === 'appointments' ? loadAppointments : loadCallLogs}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {loading ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
            </div>
            
            {message && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">{message}</p>
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="px-6 py-4">
            {activeTab === 'appointments' ? (
              <AppointmentsTable appointments={appointments} />
            ) : (
              <CallLogsTable callLogs={callLogs} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AppointmentsTable({ appointments }: { appointments: Appointment[] }) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No appointments found. Upload a file or wait for new appointments.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.map((appointment, index) => (
            <tr key={appointment.id || index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {appointment.customerName}
              </td>              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {appointment.phoneNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {appointment.bookingDate} {appointment.bookingTime}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {appointment.serviceName || appointment.serviceType || 'Photography Service'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  appointment.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : appointment.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {appointment.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {appointment.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CallLogsTable({ callLogs }: { callLogs: CallLog[] }) {
  if (callLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No call logs found. Upload a file or wait for new calls.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call SID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intent</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">          {callLogs.map((log, index) => (
            <tr key={log.callSid + index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                {log.callSid?.substring(0, 10)}...
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {log.phoneNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {log.duration ? `${Math.floor(parseInt(log.duration) / 60)}:${(parseInt(log.duration) % 60).toString().padStart(2, '0')}` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  log.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : log.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {log.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {log.intent || '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {log.conversationSummary || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
