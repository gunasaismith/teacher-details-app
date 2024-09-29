// pages/index.js

import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ToastContainer, toast } from 'react-toastify';

export default function Home() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [formData, setFormData] = useState({
    empCode: '',
    department: '',
    designation: '',
    subjectType: 'theory',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teachers')
      .then(response => response.json())
      .then(data => {
        setTeachers(data);
        setFilteredTeachers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching teachers:', error);
        toast.error('Failed to fetch teacher data.');
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let filtered = teachers;

    if (formData.empCode) {
      filtered = filtered.filter(t => t['EMP Code'].replace(/\s+/g, '') === formData.empCode.replace(/\s+/g, ''));
    }

    if (formData.department) {
      filtered = filtered.filter(t => t['Department'] === formData.department);
    }

    if (formData.designation) {
      filtered = filtered.filter(t => t['Designation'] === formData.designation);
    }

    if (formData.subjectType) {
      if (formData.subjectType === 'lab') {
        filtered = filtered.filter(t => /lab|laboratory/i.test(t['Name of the subject']));
      } else {
        filtered = filtered.filter(t => !/lab|laboratory/i.test(t['Name of the subject']));
      }
    }

    setFilteredTeachers(filtered);
    toast.success('Search completed.');
  };

  const generatePDF = () => {
    if (filteredTeachers.length === 0) {
      toast.warn('No data to generate PDF.');
      return;
    }

    const doc = new jsPDF();

    // Add Header
    doc.setFontSize(18);
    doc.text('Guru Nanak Institutions Technical Campus', 14, 22);
    doc.setFontSize(14);
    doc.text('Result Analysis', 14, 30);

    // Define Table Columns and Rows
    const tableColumn = ["Faculty Name", "Department", "Designation", "Employee ID", "Subject Type", "% of Pass"];
    const tableRows = [];

    filteredTeachers.forEach(teacher => {
      const teacherData = [
        teacher['Name of the teacher'] || 'N/A',
        teacher['Department'] || 'N/A',
        teacher['Designation'] || 'N/A',
        teacher['EMP Code'] || 'N/A',
        teacher['Name of the subject'].toLowerCase().includes('lab') ? 'Lab' : 'Theory',
        teacher['% of Pass'] ? parseFloat(teacher['% of Pass']).toFixed(2) : 'N/A'
      ];
      tableRows.push(teacherData);
    });

    // Add Table to PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
    });

    // Add Signatures Placeholder
    doc.text('Signature of COE: ________________________', 14, doc.lastAutoTable.finalY + 10);
    doc.text('Signature of Director: ________________________', 14, doc.lastAutoTable.finalY + 20);

    doc.save('teacher_details.pdf');
    toast.success('PDF generated successfully.');
  };

  return (
    <div className="container mx-auto p-8">
      <ToastContainer />
      <header className="text-center mb-8">
        <img src="/gni_logo.png" alt="GNI Logo" className="mx-auto mb-4" style={{ width: '100px' }} />
        <h1 className="text-3xl font-bold">Guru Nanak Institutions Technical Campus</h1>
      </header>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-center mb-4">Result Analysis</h3>
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-6 rounded shadow-md">
          <div className="mb-4">
            <label htmlFor="empCode" className="block text-gray-700">Enter Employee ID:</label>
            <input
              type="text"
              id="empCode"
              name="empCode"
              value={formData.empCode}
              onChange={handleChange}
              placeholder="Employee ID"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="department" className="block text-gray-700">Select your department:</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">--Select Department--</option>
              <option value="CE">CE</option>
              <option value="ME">ME</option>
              <option value="EEE">EEE</option>
              <option value="ECE">ECE</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="AIML">AIML</option>
              <option value="AI&DS">AI&DS</option>
              <option value="CS">CS</option>
              <option value="DS">DS</option>
              <option value="IOT">IOT</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="designation" className="block text-gray-700">Select your designation:</label>
            <select
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">--Select Designation--</option>
              <option value="Professor">Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Assistant Professor">Assistant Professor</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="subjectType" className="block text-gray-700">Select Subject Type:</label>
            <select
              id="subjectType"
              name="subjectType"
              value={formData.subjectType}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="theory">Theory</option>
              <option value="lab">Lab</option>
            </select>
          </div>

          <div className="text-center">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
          </div>
        </form>
      </section>

      <section>
        <div className="flex justify-end mb-4">
          <a href="/upload" className="bg-green-500 text-white px-4 py-2 rounded">Add More</a>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : filteredTeachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border">Faculty Name</th>
                  <th className="py-2 px-4 border">Department</th>
                  <th className="py-2 px-4 border">Designation</th>
                  <th className="py-2 px-4 border">Employee ID</th>
                  <th className="py-2 px-4 border">Subject Type</th>
                  <th className="py-2 px-4 border">% of Pass</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map(teacher => (
                  <tr key={teacher.id}>
                    <td className="py-2 px-4 border">{teacher['Name of the teacher'] || 'N/A'}</td>
                    <td className="py-2 px-4 border">{teacher['Department'] || 'N/A'}</td>
                    <td className="py-2 px-4 border">{teacher['Designation'] || 'N/A'}</td>
                    <td className="py-2 px-4 border">{teacher['EMP Code'] || 'N/A'}</td>
                    <td className="py-2 px-4 border">
                      {teacher['Name of the subject'].toLowerCase().includes('lab') ? 'Lab' : 'Theory'}
                    </td>
                    <td className="py-2 px-4 border">{teacher['% of Pass'] ? parseFloat(teacher['% of Pass']).toFixed(2) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center">No results found.</p>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={generatePDF} className="bg-red-500 text-white px-4 py-2 rounded">Print to PDF</button>
        </div>
      </section>
    </div>
  );
}
