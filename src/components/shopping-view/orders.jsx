import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogTrigger } from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ShoppingOrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersByUserId,
  getOrderDetails,
  resetOrderDetails,
} from "@/store/shop/order-slice";
import { Badge } from "../ui/badge";
import { PackageOpen } from "lucide-react";

function ShoppingOrders() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orderList, orderDetails } = useSelector((state) => state.shopOrder);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(getAllOrdersByUserId(user.id));
    }
  }, [dispatch, user?.id]);

  if (!orderList || orderList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <PackageOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No orders found</p>
          <p className="text-sm text-muted-foreground">Start shopping to see your orders here</p>
        </CardContent>
      </Card>
    );
  }

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    dispatch(getOrderDetails(orderId));
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedOrderId(null);
    dispatch(resetOrderDetails());
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status) => {
    console.log("Payment Status:", status); // Debug log to inspect values
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-600';
      case 'pending':
        return 'bg-yellow-500';
      case 'refunded':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500'; // Fallback to gray for unexpected values
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderList && orderList.length > 0
              ? orderList.map((orderItem) => (
                  <TableRow key={orderItem._id}>
                    <TableCell className="font-medium">{orderItem?._id}</TableCell>
                    <TableCell>
                      {orderItem?.createdAt ? new Date(orderItem.createdAt).toLocaleDateString() : "Pending"}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(orderItem?.orderStatus)}`}>
                        {orderItem?.orderStatus || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {orderItem?.paymentMethod || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getPaymentStatusColor(orderItem?.paymentStatus)}`}>
                        {orderItem?.paymentStatus || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{orderItem?.totalAmount}</TableCell>
                    <TableCell>
                      <Dialog open={isDialogOpen && selectedOrderId === orderItem._id} onOpenChange={(open) => {
                        if (!open) handleCloseDialog();
                        else handleViewDetails(orderItem._id);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm">View Details</Button>
                        </DialogTrigger>
                        {selectedOrderId === orderItem._id && orderDetails && (
                          <ShoppingOrderDetailsView orderDetails={orderDetails} />
                        )}
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default ShoppingOrders;
