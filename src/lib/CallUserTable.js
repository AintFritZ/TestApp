import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Fetch all users from Supabase
export const fetchUsers = async (sortField = "created_at") => {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, role, created_at, last_logged_in")
    .order(sortField, { ascending: false });

  if (error) {
    console.error("Error fetching users:", error.message);
    return [];
  }
  
  return data;
};

// Fetch the current logged-in user's role
export const fetchCurrentUserRole = async () => {
  const { data: user, error } = await supabase.auth.getUser();
  if (error || !user) return "user"; // Default to "user" if not found

  const { data, error: roleError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return roleError || !data ? "user" : data.role;
};

// Check if a "Super Admin" already exists
export const checkSuperAdminExists = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("role", "super admin")
    .limit(1);

  if (error) {
    console.error("Error checking Super Admin:", error.message);
    return false;
  }

  return data.length > 0;
};

// Function to determine allowed role changes based on current user role
export const getAllowedRoles = (currentUserRole) => {
  if (currentUserRole === "super admin") return ["super admin", "admin", "user"];
  if (currentUserRole === "admin") return ["admin", "user"];
  return [];
};

// Update user role in Supabase
export const updateUserRole = async (userId, newRole, currentUserRole) => {
  const allowedRoles = getAllowedRoles(currentUserRole);
  if (!allowedRoles.includes(newRole)) {
    alert("You do not have permission to assign this role.");
    return false;
  }

  if (newRole === "super admin") {
    const superAdminExists = await checkSuperAdminExists();
    if (superAdminExists) {
      alert("There can only be one Super Admin.");
      return false;
    }
  }

  const { error } = await supabase
    .from("users")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user role:", error.message);
    return false;
  }

  return true;
};

// Custom hook for managing user data and role changes
export const useUserTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("email");
  const [sortField, setSortField] = useState("created_at");
  const [currentUserRole, setCurrentUserRole] = useState("user");

  useEffect(() => {
    const getUsers = async () => {
      const userData = await fetchUsers(sortField);
      setUsers(userData);
      setFilteredUsers(userData);
    };

    const getCurrentRole = async () => {
      const role = await fetchCurrentUserRole();
      setCurrentUserRole(role);
    };

    getUsers();
    getCurrentRole();
  }, [sortField]);

  useEffect(() => {
    let filtered = users.filter((user) =>
      user[searchField]?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, searchField, users]);

  // Wrapper function for updating user roles
  const handleUpdateUserRole = async (userId, newRole) => {
    const success = await updateUserRole(userId, newRole, currentUserRole);
    if (success) {
      const updatedUsers = await fetchUsers(sortField);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    }
  };

  return {
    filteredUsers,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    sortField,
    setSortField,
    updateUserRole: handleUpdateUserRole,
    currentUserRole,
    getAllowedRoles, // Expose this function for role dropdown handling
  };
};
