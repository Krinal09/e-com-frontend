import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "../../store/admin/users-slice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { columns } from "./user-columns";
import { useToast } from "../ui/use-toast";

const UsersTable = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { userList, isLoading, error } = useSelector((state) => state.adminUsers);

  useEffect(() => {
    dispatch(fetchAllUsers())
      .unwrap()
      .catch((error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message || "Failed to fetch users",
        });
      });
  }, [dispatch, toast]);

  if (isLoading) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-4">
        Error: {error?.message || "Failed to fetch users"}
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.accessorKey}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {userList.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No users found
              </TableCell>
            </TableRow>
          ) : (
            userList.map((user) => (
              <TableRow key={user._id}>
                {columns.map((column) => (
                  <TableCell key={`${user._id}-${column.accessorKey}`}>
                    {column.cell
                      ? column.cell({ row: { original: user } })
                      : user[column.accessorKey]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable; 