/*
"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        full_name: "",
        cedula: "",
        initial_shift: "A"
    });

    const supabase = createClient();

    async function getEmployees() {
        setLoading(true);
        const { data, error } = await supabase
            .from("employees")
            .select("*")
            .order("full_name");

        if (data) setEmployees(data);
        if (error) console.error("Error:", error);
        setLoading(false);
    }

    useEffect(() => {
        getEmployees();
    }, []);

    const handleEdit = (emp) => {
        setFormData({
            full_name: emp.full_name,
            cedula: emp.cedula,
            initial_shift: emp.initial_shift
        });
        setEditingId(emp.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("¿Estás seguro de eliminar a este empleado?")) {
            const { error } = await supabase
                .from("employees")
                .delete()
                .eq("id", id);

            if (error) alert("Error al eliminar");
            else getEmployees();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            const { error } = await supabase
                .from("employees")
                .update({ ...formData })
                .eq("id", editingId);
            if (error) alert("Error al actualizar: " + error.message);
            setEditingId(null);
        } else {
            const { error } = await supabase
                .from("employees")
                .insert([{ ...formData, is_active: true, start_date: new Date().toISOString().split('T')[0] }]);
            if (error) alert("Error al guardar: " + error.message);
        }
        setIsModalOpen(false);
        setFormData({ full_name: "", cedula: "", initial_shift: "A" });
        getEmployees();
    };

    return (
        <AdminLayout title="Gestión de Empleados">
            <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "right", marginBottom: "20px" }}>
                    <button
                        onClick={() => { setEditingId(null); setFormData({ full_name: "", cedula: "", initial_shift: "A" }); setIsModalOpen(true); }}
                        style={{ background: "#0070f3", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                        + Añadir Empleado
                    </button>
                </div>

                {loading ? <p>Cargando...</p> : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
                                <th style={{ padding: "12px" }}>Nombre</th>
                                <th style={{ padding: "12px" }}>Cédula</th>
                                <th style={{ padding: "12px" }}>Turno</th>
                                <th style={{ padding: "12px" }}>Estado</th>
                                <th style={{ padding: "12px" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "12px" }}>{emp.full_name}</td>
                                    <td style={{ padding: "12px" }}>{emp.cedula}</td>
                                    <td style={{ padding: "12px" }}>
                                        {/* Traducción visual para que no veas letras */
/*    {emp.initial_shift === "A" ? "Apertura" :
        emp.initial_shift === "B" ? "Medio" :
            emp.initial_shift === "C" ? "Cierre" : "Sin asignar"}
</td>
<td style={{ padding: "12px" }}>{emp.is_active ? "✅ Activo" : "❌ Inactivo"}</td>
<td style={{ padding: "12px" }}>
    <button onClick={() => handleEdit(emp)} style={{ marginRight: "10px", background: "#f39c12", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>Editar</button>
    <button onClick={() => handleDelete(emp.id)} style={{ background: "#e74c3c", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>Eliminar</button>
</td>
</tr>
))}
{isModalOpen && (
<div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
<div style={{ background: "white", padding: "30px", borderRadius: "10px", width: "400px" }}>
    <h3>{editingId ? "Editar Empleado" : "Nuevo Empleado"}</h3>
    <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: "10px" }}>
            Nombre Completo:
            <input type="text" required style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
        </label>
        <label style={{ display: "block", marginBottom: "10px" }}>
            Cédula:
            <input type="text" required style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                value={formData.cedula} onChange={(e) => setFormData({ ...formData, cedula: e.target.value })} />
        </label>
        <label style={{ display: "block", marginBottom: "20px" }}>
            Grupo de Turno:
            <select
                name="initial_shift"
                value={formData.initial_shift}
                onChange={(e) => setFormData({ ...formData, initial_shift: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
                required
            >
                <option value="">Seleccionar Turno</option>
                <option value="A">Apertura (Operativo / Ing 1)</option>
                <option value="B">Medio (Operativo)</option>
                <option value="C">Cierre (Operativo / Ing 2)</option>
            </select>
        </label>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "#ccc", border: "none", padding: "10px", borderRadius: "5px" }}>Cancelar</button>
            <button type="submit" style={{ background: "#0070f3", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px" }}>Guardar</button>
        </div>
    </form>
</div>
</div>
)}
</div>
</AdminLayout>
);
}
*/
"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { createClient } from "@/lib/supabase/client";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        full_name: "",
        cedula: "",
        initial_shift: "A"
    });

    const supabase = createClient();

    async function getEmployees() {
        setLoading(true);
        const { data, error } = await supabase
            .from("employees")
            .select("*")
            .order("full_name");

        if (data) setEmployees(data);
        if (error) console.error("Error:", error);
        setLoading(false);
    }

    useEffect(() => {
        getEmployees();
    }, []);

    const handleEdit = (emp) => {
        setFormData({
            full_name: emp.full_name,
            cedula: emp.cedula,
            initial_shift: emp.initial_shift
        });
        setEditingId(emp.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("¿Estás seguro de eliminar a este empleado?")) {
            const { error } = await supabase
                .from("employees")
                .delete()
                .eq("id", id);

            if (error) alert("Error al eliminar");
            else getEmployees();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingId) {
            const { error } = await supabase
                .from("employees")
                .update({ ...formData })
                .eq("id", editingId);
            if (error) alert("Error al actualizar: " + error.message);
            setEditingId(null);
        } else {
            const { error } = await supabase
                .from("employees")
                .insert([{ ...formData, is_active: true, start_date: new Date().toISOString().split('T')[0] }]);
            if (error) alert("Error al guardar: " + error.message);
        }
        setIsModalOpen(false);
        setFormData({ full_name: "", cedula: "", initial_shift: "A" });
        getEmployees();
    };

    return (
        <AdminLayout title="Gestión de Empleados">
            <div style={{ background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "right", marginBottom: "20px" }}>
                    <button
                        onClick={() => { setEditingId(null); setFormData({ full_name: "", cedula: "", initial_shift: "A" }); setIsModalOpen(true); }}
                        style={{ background: "#0070f3", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                        + Añadir Empleado
                    </button>
                </div>

                {loading ? <p>Cargando...</p> : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
                                <th style={{ padding: "12px" }}>Nombre</th>
                                <th style={{ padding: "12px" }}>Cédula</th>
                                <th style={{ padding: "12px" }}>Turno</th>
                                <th style={{ padding: "12px" }}>Estado</th>
                                <th style={{ padding: "12px" }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "12px" }}>{emp.full_name}</td>
                                    <td style={{ padding: "12px" }}>{emp.cedula}</td>
                                    <td style={{ padding: "12px" }}>
                                        {emp.initial_shift === "A" ? "Apertura" :
                                            emp.initial_shift === "B" ? "Medio" :
                                                emp.initial_shift === "C" ? "Cierre" :
                                                    emp.initial_shift === "D" ? "Apertura (Ing)" :
                                                        emp.initial_shift === "E" ? "Cierre (Ing)" : "---"}
                                    </td>
                                    <td style={{ padding: "12px" }}>{emp.is_active ? "✅ Activo" : "❌ Inactivo"}</td>
                                    <td style={{ padding: "12px" }}>
                                        <button onClick={() => handleEdit(emp)} style={{ marginRight: "10px", background: "#f39c12", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>Editar</button>
                                        <button onClick={() => handleDelete(emp.id)} style={{ background: "#e74c3c", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {isModalOpen && (
                    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                        <div style={{ background: "white", padding: "30px", borderRadius: "10px", width: "400px" }}>
                            <h3 style={{ color: "black" }}>{editingId ? "Editar Empleado" : "Nuevo Empleado"}</h3>
                            <form onSubmit={handleSubmit}>
                                <label style={{ display: "block", marginBottom: "10px", color: "black" }}>
                                    Nombre Completo:
                                    <input type="text" required style={{ width: "100%", padding: "8px", marginTop: "5px", color: "black" }}
                                        value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
                                </label>
                                <label style={{ display: "block", marginBottom: "10px", color: "black" }}>
                                    Cédula:
                                    <input type="text" required style={{ width: "100%", padding: "8px", marginTop: "5px", color: "black" }}
                                        value={formData.cedula} onChange={(e) => setFormData({ ...formData, cedula: e.target.value })} />
                                </label>
                                <label style={{ display: "block", marginBottom: "20px", color: "black" }}>
                                    Grupo de Turno:
                                    <select
                                        name="initial_shift"
                                        value={formData.initial_shift}
                                        onChange={(e) => setFormData({ ...formData, initial_shift: e.target.value })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', color: 'black' }}
                                        required
                                    >
                                        <option value="">Seleccionar Turno</option>
                                        {/* Estas letras A, B y C son las únicas que tu base de datos deja guardar */}
                                        <option value="A">Apertura (Operativos e Ingeniero 1)</option>
                                        <option value="B">Medio (Operativos)</option>
                                        <option value="C">Cierre (Operativos e Ingeniero 2)</option>
                                    </select>
                                </label>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: "#ccc", border: "none", padding: "10px", borderRadius: "5px", color: "black" }}>Cancelar</button>
                                    <button type="submit" style={{ background: "#0070f3", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px" }}>Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}