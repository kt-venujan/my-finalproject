"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import { User, Role } from "@/types/auth";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      toast.success("User role updated");
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="adm-users-page">
      <div className="adm-users-header">
        <h1>👤 User Management</h1>
        <p>Manage all registered users and their roles</p>
      </div>

      <div className="adm-users-controls">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="adm-users-search"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
          className="adm-users-filter"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="dietician">Dietician</option>
          <option value="kitchen">Kitchen Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="adm-users-loading">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="adm-users-empty">No users found</div>
      ) : (
        <div className="adm-users-table-wrap">
          <table className="adm-users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u: any) => (
                <tr key={u._id}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-user-avatar">
                        {u.username[0].toUpperCase()}
                      </div>
                      <span>{u.username}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u._id, e.target.value as Role)}
                      className={`adm-role-select ${u.role}`}
                    >
                      <option value="user">User</option>
                      <option value="dietician">Dietician</option>
                      <option value="kitchen">Kitchen Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(u._id)}
                      className="adm-delete-btn"
                      title="Delete User"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .adm-users-page {
          padding: 24px;
          background: #fff;
          border-radius: 16px;
          min-height: 100%;
        }
        .adm-users-header {
          margin-bottom: 24px;
        }
        .adm-users-header h1 {
          font-size: 24px;
          color: #1a1a2e;
          margin-bottom: 4px;
        }
        .adm-users-header p {
          color: #888;
          font-size: 14px;
        }
        .adm-users-controls {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        .adm-users-search {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }
        .adm-users-filter {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
          font-size: 14px;
        }
        .adm-users-table-wrap {
          overflow-x: auto;
          border: 1px solid #eee;
          border-radius: 12px;
        }
        .adm-users-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .adm-users-table th {
          background: #f8f9fa;
          padding: 14px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          border-bottom: 1px solid #eee;
        }
        .adm-users-table td {
          padding: 14px 16px;
          font-size: 14px;
          color: #333;
          border-bottom: 1px solid #eee;
        }
        .adm-user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .adm-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #8b0c2e;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12px;
        }
        .adm-role-select {
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
        }
        .adm-role-select.admin { background: #fee2e2; color: #dc2626; }
        .adm-role-select.dietician { background: #dcfce7; color: #16a34a; }
        .adm-role-select.user { background: #e0f2fe; color: #0284c7; }
        .adm-role-select.kitchen { background: #fef9c3; color: #ca8a04; }

        .adm-delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          opacity: 0.6;
          transition: 0.2s;
        }
        .adm-delete-btn:hover {
          opacity: 1;
          transform: scale(1.1);
        }
        .adm-users-loading, .adm-users-empty {
          text-align: center;
          padding: 40px;
          color: #888;
        }
      `}</style>
    </div>
  );
}
