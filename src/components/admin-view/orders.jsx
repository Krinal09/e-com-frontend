import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import AdminOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  resetOrderDetails,
  updateOrderStatus,
  updatePaymentStatus,
} from "@/store/admin/order-slice";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

function AdminOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { orderList, orderDetails, isLoading, error } = useSelector((state) => state.adminOrder);
  const dispatch = useDispatch();

  function handleFetchOrderDetails(getId) {
    dispatch(getOrderDetailsForAdmin(getId));
  }

  function handleStatusChange(orderId, newStatus, paymentMethod) {
    const updates = {
      id: orderId,
      orderStatus: newStatus,
      ...(paymentMethod === "cod" && newStatus === "delivered" && {
        paymentStatus: "completed"
      })
    };

    dispatch(updateOrderStatus(updates))
      .then(() => {
        dispatch(getAllOrdersForAdmin());
      });
  }

  function handlePaymentStatusChange(orderId, newStatus) {
    dispatch(updatePaymentStatus({ id: orderId, paymentStatus: newStatus }))
      .then(() => {
        dispatch(getAllOrdersForAdmin());
      });
  }

  useEffect(() => {
    dispatch(getAllOrdersForAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (orderDetails !== null) setOpenDetailsDialog(true);
  }, [orderDetails]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!orderList || orderList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-lg font-medium text-muted-foreground">No orders found</p>
        </CardContent>
      </Card>
    );
  }

  const statusOptions = [
    { id: "pending", label: "Pending" },
    { id: "processing", label: "Processing" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Order Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderList && orderList.length > 0 ? orderList.map((orderItem) => (
                <TableRow key={orderItem._id}>
                  <TableCell className="font-medium">{orderItem._id}</TableCell>
                  <TableCell>{orderItem.customerName}</TableCell>
                  <TableCell>
                    {orderItem.createdAt ? new Date(orderItem.createdAt).toLocaleDateString() : "Pending"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {orderItem.paymentMethod === "cod" ? "COD" : "Razorpay"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={orderItem.paymentStatus}
                      onValueChange={(value) => handlePaymentStatusChange(orderItem._id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue>
                          <Badge className={`${
                            orderItem.paymentStatus === "completed"
                              ? "bg-green-500"
                              : orderItem.paymentStatus === "failed"
                              ? "bg-red-600"
                              : "bg-yellow-500"
                          }`}>
                            {orderItem.paymentStatus || 'pending'}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={orderItem.orderStatus}
                      onValueChange={(value) => handleStatusChange(orderItem._id, value, orderItem.paymentMethod)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue>
                          <Badge className={`${
                            orderItem.orderStatus === "delivered"
                              ? "bg-green-500"
                              : orderItem.orderStatus === "cancelled"
                              ? "bg-red-600"
                              : orderItem.orderStatus === "processing"
                              ? "bg-blue-500"
                              : orderItem.orderStatus === "shipped"
                              ? "bg-yellow-500"
                              : "bg-black"
                          }`}>
                            {orderItem.orderStatus || 'pending'}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>₹{orderItem.totalAmount}</TableCell>
                  <TableCell>
                    <Dialog
                      open={openDetailsDialog && orderDetails?._id === orderItem._id}
                      onOpenChange={() => {
                        setOpenDetailsDialog(false);
                        dispatch(resetOrderDetails());
                      }}
                    >
                      <Button onClick={() => handleFetchOrderDetails(orderItem._id)}>
                        View Details
                      </Button>
                      {orderDetails?._id === orderItem._id && (
                        <AdminOrderDetailsView orderDetails={orderDetails} />
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              )) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminOrdersView;
