import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fetchAllOrders } from "@/store/admin/orders-slice";
import { fetchAllUsers } from "@/store/admin/users-slice";
import { fetchAllProducts } from "@/store/admin/products-slice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/admin-view/data-table";
import { columns as orderColumns } from "@/components/admin-view/order-columns";
import { columns as userColumns } from "@/components/admin-view/user-columns";
import { columns as productColumns } from "@/components/admin-view/product-columns";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShoppingCart, Package, Users } from "lucide-react";

const POLLING_INTERVAL = 30000; // 30 seconds

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { user } = useSelector((state) => state.auth);

  // Add default empty arrays to prevent undefined errors
  const { orderList = [], loading: ordersLoading } = useSelector(
    (state) => state.adminOrders || {},
    (prev, next) => prev.orderList === next.orderList && prev.loading === next.loading
  );
  const { userList = [], loading: usersLoading } = useSelector(
    (state) => state.adminUsers || {},
    (prev, next) => prev.userList === next.userList && prev.loading === next.loading
  );
  const { productList = [], loading: productsLoading } = useSelector(
    (state) => state.adminProducts || {},
    (prev, next) => prev.productList === next.productList && prev.loading === next.loading
  );

  // Calculate dashboard metrics
  const totalOrders = orderList.length;
  const totalUsers = userList.length;
  const totalProducts = productList.length;
  const totalRevenue = orderList.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );

  // Calculate user statistics
  const adminUsers = userList.filter((user) => user.role === "admin").length;
  const regularUsers = userList.filter((user) => user.role === "user").length;
  const newUsers = userList.filter(
    (user) =>
      new Date(user.createdAt).getTime() >
      new Date().getTime() - 7 * 24 * 60 * 60 * 1000
  ).length;

  // Prepare data for charts
  const revenueData = orderList.reduce((acc, order) => {
    if (!order.createdAt || !order.totalAmount) return acc;
    const date = new Date(order.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + order.totalAmount;
    return acc;
  }, {});

  const revenueChartData = Object.entries(revenueData).map(
    ([date, amount]) => ({
      date,
      amount,
    })
  );

  const categoryData = productList.reduce((acc, product) => {
    if (!product.category) return acc;
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(
    ([category, count]) => ({
      category,
      count,
    })
  );

  useEffect(() => {
    if (user?.role === "admin") {
      dispatch(fetchAllOrders());
      dispatch(fetchAllUsers());
      dispatch(fetchAllProducts());
    }
  }, [dispatch, user?.role]);

  // Set up polling for real-time updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchAllProducts()).unwrap(),
          dispatch(fetchAllOrders()).unwrap(),
          dispatch(fetchAllUsers()).unwrap(),
        ]);
        setLastUpdate(new Date());
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: error?.message || "Failed to fetch dashboard data",
          variant: "destructive",
        });
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [dispatch, toast]);

  const isLoading = ordersLoading || usersLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => navigate("/admin/products")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => navigate("/admin/orders")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => navigate("/admin/users")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {adminUsers} admins / {regularUsers} users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            {orderList.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Avg. ₹{(totalRevenue / orderList.length).toFixed(2)} per order
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Latest Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {userColumns.map((column) => (
                    <TableHead key={`user-header-${column.accessorKey}`}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {userList.slice(0, 5).map((user) => (
                  <TableRow key={`user-row-${user._id}`}>
                    {userColumns.map((column) => (
                      <TableCell key={`user-cell-${user._id}-${column.accessorKey}`}>
                        {column.cell
                          ? column.cell({ row: { original: user } })
                          : user[column.accessorKey]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {userList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={userColumns.length}
                      className="text-center py-4"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {orderColumns.map((column) => (
                    <TableHead key={`order-header-${column.accessorKey}`}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderList.slice(0, 5).map((order) => (
                  <TableRow key={`order-row-${order._id}`}>
                    {orderColumns.map((column) => (
                      <TableCell key={`order-cell-${order._id}-${column.accessorKey}`}>
                        {column.cell
                          ? column.cell({ row: { original: order } })
                          : order[column.accessorKey]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {orderList.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={orderColumns.length}
                      className="text-center py-4"
                    >
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {orderList.filter(order => order.status === 'delivered').length} delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderList.filter(order => order.status === 'processing').length}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularUsers}</div>
            <p className="text-xs text-muted-foreground">{newUsers} new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {productList.filter(p => p.totalStock > 0).length} in stock
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm text-gray-500 text-right">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AdminDashboard;
