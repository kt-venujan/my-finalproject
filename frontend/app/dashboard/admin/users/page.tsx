"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { toast } from "react-toastify";
import { Role } from "@/types/auth";
import { FiTrash2, FiUsers } from "react-icons/fi";

type AdminUser = {
  _id: string;
  username: string;
  email: string;
  role: Role;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
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
    if (!confirm("Delete this user permanently?")) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || user.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  return (
    <section className="adm-section">
      <div className="adm-page-head">
        <h1 className="adm-title">
          <FiUsers className="adm-title-icon" />
          User Management
        </h1>
        <p>Manage registered users and role access.</p>
      </div>

      <div className="adm-control-row">
        <input
          type="text"
          placeholder="Search by username or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="adm-input"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
          className="adm-select"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="dietician">Dietician</option>
          <option value="kitchen">Kitchen Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="adm-empty">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="adm-empty">No users found.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-user-avatar">
                        {user.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      <span>{user.username}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleUpdateRole(user._id, e.target.value as Role)
                      }
                      className="adm-select"
                    >
                      <option value="user">User</option>
                      <option value="dietician">Dietician</option>
                      <option value="kitchen">Kitchen Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="adm-btn danger"
                      title="Delete user"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
