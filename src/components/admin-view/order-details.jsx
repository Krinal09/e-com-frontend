import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

function AdminOrderDetailsView({ orderDetails }) {
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Pending";
    }
  };

  return (
    <DialogContent className="max-w-[600px] max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle>Order Details</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-[calc(90vh-8rem)]">
        <div className="space-y-6 pr-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium">Order ID</p>
              <Label>{orderDetails?._id}</Label>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">Order Date</p>
              <Label>{formatDate(orderDetails?.createdAt)}</Label>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">Order Price</p>
              <Label>₹{orderDetails?.totalAmount}</Label>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">Payment Method</p>
              <Label>
                <Badge variant="outline">
                  {orderDetails?.paymentMethod?.toUpperCase() || "ONLINE"}
                </Badge>
              </Label>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">Payment Status</p>
              <Label>
                <Badge
                  className={`${
                    orderDetails?.paymentStatus === "completed"
                      ? "bg-green-500"
                      : orderDetails?.paymentStatus === "failed"
                      ? "bg-red-600"
                      : "bg-yellow-500"
                  }`}
                >
                  {orderDetails?.paymentStatus || "pending"}
                </Badge>
              </Label>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-medium">Order Status</p>
              <Label>
                <Badge
                  className={`py-1 px-3 ${
                    orderDetails?.orderStatus === "delivered"
                      ? "bg-green-500"
                      : orderDetails?.orderStatus === "cancelled"
                      ? "bg-red-600"
                      : orderDetails?.orderStatus === "processing"
                      ? "bg-blue-500"
                      : orderDetails?.orderStatus === "shipped"
                      ? "bg-yellow-500"
                      : "bg-black"
                  }`}
                >
                  {orderDetails?.orderStatus}
                </Badge>
              </Label>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="font-medium">Order Details</div>
              <ul className="space-y-3">
                {orderDetails?.cartItems && orderDetails?.cartItems.length > 0
                  ? orderDetails?.cartItems.map((item, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>Title: {item.productId?.title}</span>
                        <span>Quantity: {item.quantity}</span>
                        <span>Price: ₹{item.price}</span>
                      </li>
                    ))
                  : null}
              </ul>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="font-medium">Shipping Info</div>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Customer:</span>
                <span className="font-medium">
                  {orderDetails?.customerName}
                </span>
              </div>
              <span className="block">{orderDetails?.addressInfo?.address}</span>
              <span className="block">{orderDetails?.addressInfo?.city}</span>
              <span className="block">{orderDetails?.addressInfo?.pincode}</span>
              <span className="block">{orderDetails?.addressInfo?.phone}</span>
              {orderDetails?.addressInfo?.notes && (
                <span className="block">{orderDetails?.addressInfo?.notes}</span>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
