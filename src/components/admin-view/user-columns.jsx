import { format } from "date-fns";

export const columns = [
  {
    accessorKey: "userName",
    header: "Username",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.userName}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            role === "admin"
              ? "bg-purple-100 text-purple-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {role}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Join Date",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      console.log("Raw date:", date); // Debug log
      
      if (!date) {
        return "N/A";
      }
      
      try {
        // Handle both ISO string and timestamp formats
        const parsedDate = typeof date === 'string' ? new Date(date) : new Date(Number(date));
        if (isNaN(parsedDate.getTime())) {
          console.error("Invalid date:", date);
          return "N/A";
        }
        return format(parsedDate, "MMM dd, yyyy");
      } catch (error) {
        console.error("Error formatting date:", error, "Raw date:", date);
        return "N/A";
      }
    },
  },
]; 