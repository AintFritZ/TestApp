'use client';

import styles from '@/CSS/AdminDashboard.module.css';
import { Analytics } from "@vercel/analytics/react";
import Image from "next/image";
import Sidebar from "@/lib/Sidebar";
import { useUserTable } from "@/lib/CallUserTable";

export default function Admin() {
  const {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    sortField,
    setSortField,
    updateUserRole,
    currentUserRole,
    getAllowedRoles, // Fetch allowed roles dynamically
  } = useUserTable();

  return (
    <div className={styles.page}>
      <Sidebar />

      <div className={styles.background}>
        <Image src="/PastelBG.jpg" alt="Background" fill objectFit="cover" priority />
      </div>

      <div className={styles.container}>
        <div className={styles.controls}>
          <input
            type="text"
            placeholder={`Search by ${searchField}`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
            <option value="email">Email</option>
            <option value="name">Name</option>
            <option value="role">Role</option>
          </select>
          <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
            <option value="created_at">Sort by Created At</option>
            <option value="last_logged_in">Sort by Last Logged In</option>
          </select>
        </div>

        {filteredUsers.length > 0 ? (
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Last Logged In</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.name}</td>
                  <td>
                    {currentUserRole !== "user" && currentUserRole !== user.role ? (
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                      >
                        {getAllowedRoles(currentUserRole).map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td>{new Date(user.created_at).toLocaleString()}</td>
                  <td>{user.last_logged_in ? new Date(user.last_logged_in).toLocaleString() : "Never"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found.</p>
        )}

        <Analytics />
      </div>
    </div>
  );
}
