import React from "react";
import UsersTable from "../../components/admin-view/users-table";

const AdminUsers = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Users Management</h1>
      </div>
      <div className="space-y-4">
        <UsersTable />
      </div>
    </div>
  );
};

export default AdminUsers;