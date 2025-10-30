import { useState, useEffect } from "react";

export default function Student() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    student_id: "",
    name: "",
    address: "",
    batch: "",
    admission_session: "",
    contact: "",
    father_contact: "",
    mother_contact: ""
  });

  // Fetch students
  const fetchStudents = () => {
    fetch("http://localhost/student_api/get_students.php")
      .then(res => res.json())
      .then(data => setStudents(data));
  };

  useEffect(() => { fetchStudents(); }, []);

  // Handle input
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Add student
  const handleAdd = (e) => {
    e.preventDefault();
    fetch("http://localhost/student_api/add_student.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        fetchStudents();
      });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Management</h2>

      <form onSubmit={handleAdd} style={{ display: "grid", gap: "5px", maxWidth: "400px" }}>
        {Object.keys(form).map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key.replace("_", " ")}
            value={form[key]}
            onChange={handleChange}
            required
          />
        ))}
        <button type="submit">Add Student</button>
      </form>

      <h3>All Students</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            {Object.keys(form).map(k => <th key={k}>{k.replace("_"," ")}</th>)}
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.student_id}>
              {Object.keys(form).map(k => <td key={k}>{s[k]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
