import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Fetch all users from Supabase using promise chains
export const fetchUsers = (sortField = "created_at") => {
  return supabase
    .from("users")
    .select("id, email, name, role, created_at, last_logged_in")
    .order(sortField, { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching users:", error.message);
        return [];
      }
      return data;
    });
};

// Fetch the current logged-in user's role using promise chains
export const fetchCurrentUserRole = () => {
  return supabase.auth.getUser().then(({ data: user, error }) => {
    if (error || !user?.user?.id) return "user";

    const userId = String(user.user.id); // Ensure ID is a string

    return supabase
      .from("users")
      .select("role")
      .eq("id", userId) // Ensure correct comparison
      .single()
      .then(({ data, error: roleError }) => {
        return roleError || !data ? "user" : data.role;
      });
  });
};

// Check if a "Super Admin" already exists (optionally excluding one id) using promise chains
export const checkSuperAdminExists = (excludeId = null) => {
  let query = supabase.from("users").select("id").eq("role", "Super Admin").limit(1);
  if (excludeId) {
    query = query.neq("id", String(excludeId)); // Ensure ID is a string
  }
  return query.then(({ data, error }) => {
    if (error) {
      console.error("Error checking Super Admin:", error.message);
      return false;
    }
    return data.length > 0;
  });
};

// Function to determine allowed role changes based on current user role
export const getAllowedRoles = (currentUserRole) => {
  if (currentUserRole === "Super Admin") return ["Super Admin", "Admin", "user"];
  if (currentUserRole === "Admin") return ["Admin", "user"];
  return [];
};

// Update user role in Supabase with extra handling for Super Admin transfers using promise chains
export const updateUserRole = (userId, newRole, currentUserRole) => {
  const allowedRoles = getAllowedRoles(currentUserRole);
  if (!allowedRoles.includes(newRole)) {
    alert("You do not have permission to assign this role.");
    return Promise.resolve(false);
  }

  const updateRole = () => {
    return supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", String(userId)) // Ensure ID is a string
      .then(({ error }) => {
        if (error) {
          console.error("Error updating user role:", error.message);
          return false;
        }
        return true;
      });
  };

  if (currentUserRole === "Super Admin" && newRole === "Super Admin") {
    // Get current user info
    return supabase.auth.getUser().then(({ data: currentUser, error: currentUserError }) => {
      const currentUserId = String(currentUser?.user?.id); // Ensure ID is a string
      if (!currentUserId) {
        alert("Current user not found.");
        return false;
      }
      // If transferring Super Admin privileges to someone else
      if (currentUserId !== String(userId)) {
        const confirmTransfer = window.confirm(
          "Once done you cannot undo the Super Admin change"
        );
        if (!confirmTransfer) return false;

        return checkSuperAdminExists(currentUserId).then((superAdminExists) => {
          if (superAdminExists) {
            alert("There can only be one Super Admin at the time.");
            return false;
          }
          // Demote the current Super Admin to "Admin"
          return supabase
            .from("users")
            .update({ role: "Admin" })
            .eq("id", currentUserId)
            .then(({ error: demoteError }) => {
              if (demoteError) {
                console.error("Error demoting current Super Admin:", demoteError.message);
                return false;
              }
              return updateRole();
            });
        });
      } else {
        return updateRole();
      }
    });
  } else if (newRole === "Super Admin") {
    alert("You do not have permission to assign Super Admin role.");
    return Promise.resolve(false);
  } else {
    return updateRole();
  }
};

// Custom hook for managing user data and role changes using promise chains
export const useUserTable = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("email");
  const [sortField, setSortField] = useState("created_at");
  const [currentUserRole, setCurrentUserRole] = useState("user");

  useEffect(() => {
    fetchUsers(sortField).then((userData) => {
      setUsers(userData);
      setFilteredUsers(userData);
    });

    fetchCurrentUserRole().then((role) => {
      console.log("Current user role is:", role);
      setCurrentUserRole(role);
    });
  }, [sortField]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user[searchField]?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, searchField, users]);

  const handleUpdateUserRole = (userId, newRole) => {
    updateUserRole(userId, newRole, currentUserRole).then((success) => {
      if (success) {
        fetchUsers(sortField).then((updatedUsers) => {
          setUsers(updatedUsers);
          setFilteredUsers(updatedUsers);
        });
      }
    });
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