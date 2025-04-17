import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers } from "@/store/admin/users-slice";
import { fetchAllOrders } from "@/store/admin/orders-slice";
import { useToast } from "@/components/ui/use-toast";

function AdminDashboard() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { userList, isLoading: usersLoading } = useSelector((state) => state.adminUsers);
  const { orderList, isLoading: ordersLoading } = useSelector((state) => state.adminOrders);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchAllUsers()),
          dispatch(fetchAllOrders())
        ]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [dispatch, toast]);

  if (usersLoading || ordersLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold">{userList.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Orders</h2>
          <p className="text-3xl font-bold">{orderList.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Pending Orders</h2>
          <p className="text-3xl font-bold">
            {orderList.filter(order => order.status === 'pending').length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Completed Orders</h2>
          <p className="text-3xl font-bold">
            {orderList.filter(order => order.status === 'completed').length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 