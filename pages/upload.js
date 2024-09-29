// pages/upload.js

import { useState } from 'react';
import XLSX from 'xlsx';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConvert = () => {
    if (!file) {
      toast.warn('Please select an Excel file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      // Validate and process data
      if (!validateData(rawData)) {
        return;
      }

      const processedData = processData(rawData);
      setJsonData(processedData);
      toast.success('Excel file converted to JSON successfully!');
    };

    reader.readAsArrayBuffer(file);
  };

  const validateData = (data) => {
    const requiredFields = ["Sl. No", "Academic Year", "B. Tech. Year", "Sem", "Section", "Name of the subject", "Name of the teacher", "EMP Code", "No of Students Appeared", "No of Students passed", "% of Pass"];
    if (!Array.isArray(data) || data.length === 0) {
      toast.error('Excel file is empty or invalid.');
      return false;
    }

    const missingFields = requiredFields.filter(field => !data[0].hasOwnProperty(field));
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }

    return true;
  };

  const processData = (rawData) => {
    let updatedData = [];

    rawData.forEach(entry => {
      const teachers = entry['Name of the teacher'] ? entry['Name of the teacher'].split('/') : [];
      const empCodes = entry['EMP Code'] ? entry['EMP Code'].split('/') : [];
      const section = entry["Section"];
      const branch = getBranchFromSection(section);

      teachers.forEach((teacher, index) => {
        const empCode = empCodes[index] ? empCodes[index].trim() : "N/A";
        const newEntry = {
          "Sl. No": entry["Sl. No"] || '',
          "Academic Year": entry["Academic Year"] || '',
          "B. Tech. Year": entry["B. Tech. Year"] || '',
          "Sem": entry["Sem"] || '',
          "Section": section || '',
          "Branch": branch,
          "Name of the subject": entry["Name of the subject"] || '',
          "Name of the teacher": teacher.trim(),
          "EMP Code": empCode,
          "No of Students Appeared": entry["No of Students Appeared"] || 0,
          "No of Students passed": entry["No of Students passed"] || 0,
          "% of Pass": entry["% of Pass"] || 0
        };
        updatedData.push(newEntry);
      });
    });

    return updatedData;
  };

  const getBranchFromSection = (section) => {
    if (!section) return "N/A";
    return section.split('-')[0].trim();
  };

  const handleSubmit = async () => {
    if (!jsonData) {
      toast.warn('No JSON data to submit.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Data appended successfully!');
        router.push('/');
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error appending data:', error);
      toast.error('An error occurred while appending data.');
    }

    setLoading(false);
  };

  const handleDownload = () => {
    if (!jsonData) {
      toast.warn('No JSON data to download.');
      return;
    }

    const jsonStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'new_teacher_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('JSON data downloaded.');
  };

  const handleCopy = () => {
    if (!jsonData) {
      toast.warn('No JSON data to copy.');
      return;
    }

    const jsonStr = JSON.stringify(jsonData, null, 2);
    navigator.clipboard.writeText(jsonStr)
      .then(() => {
        toast.success('JSON data copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy JSON data.');
      });
  };

  return (
    <div className="container mx-auto p-8">
      <ToastContainer />
      <header className="text-center mb-8">
        <img src="/gni_logo.png" alt="GNI Logo" className="mx-auto mb-4" style={{ width: '100px' }} />
        <h1 className="text-3xl font-bold">Guru Nanak Institutions Technical Campus</h1>
      </header>

      <section className="bg-white p-6 rounded shadow-md">
        <h3 className="text-2xl font-semibold text-center mb-4">Excel to JSON Converter</h3>
        <div className="flex justify-center mb-4">
          <div className="w-2/3">
            <input
              type="file"
              id="input"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="w-full py-2 px-3 border border-gray-300 rounded"
            />
          </div>
          <div className="w-1/3 flex justify-center items-center">
            <button
              onClick={handleConvert}
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Convert
            </button>
          </div>
        </div>

        {jsonData && (
          <div>
            <pre className="bg-gray-100 p-4 rounded mb-4 max-h-64 overflow-auto">
              {JSON.stringify(jsonData, null, 2)}
            </pre>

            <div className="flex justify-center mb-4">
              <button
                onClick={handleCopy}
                className="bg-green-500 text-white py-2 px-4 rounded mr-2"
              >
                Copy JSON Data
              </button>
              <button
                onClick={handleDownload}
                className="bg-green-500 text-white py-2 px-4 rounded"
              >
                Download JSON Data
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`bg-red-500 text-white py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Appending...' : 'Append Data'}
              </button>
            </div>
          </div>
        )}

        {!jsonData && (
          <p className="text-center text-gray-600">Converted JSON data will be displayed here.</p>
        )}
      </section>

      <div className="flex justify-center mt-8">
        <a href="/" className="text-blue-500 underline">Back to Home</a>
      </div>
    </div>
  );
}
