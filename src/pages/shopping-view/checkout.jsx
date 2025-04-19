import Address from "@/components/shopping-view/address";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder } from "@/store/shop/order-slice/index";
import { Navigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { clearCart } from "@/store/shop/cart-slice/index";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Debug log to verify checkout data
  console.log("ShoppingCheckout - User:", user?.id, "CartItems:", cartItems, "SelectedAddress:", currentSelectedAddress);

  // Clear cart if user is not logged in
  useEffect(() => {
    if (!user?.id) {
      console.log("ShoppingCheckout - No user logged in, clearing cart");
      dispatch(clearCart());
    }
  }, [user?.id, dispatch]);

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  async function handleInitiatePayment() {
    try {
      // Validate user
      if (!user?.id) {
        console.log("handleInitiatePayment - No user ID, redirecting to login");
        toast({
          title: "Please log in to proceed with payment",
          variant: "destructive",
        });
        return;
      }

      // Validate cart
      if (!cartItems?.items?.length) {
        console.log("handleInitiatePayment - Empty cart");
        toast({
          title: "Your cart is empty. Please add items to proceed",
          variant: "destructive",
        });
        return;
      }

      // Validate address
      if (!currentSelectedAddress?.address || !currentSelectedAddress?.phone) {
        console.log("handleInitiatePayment - Invalid address");
        toast({
          title: "Please select a complete address with phone number",
          variant: "destructive",
        });
        return;
      }

      setIsPaymentStart(true);

      // Prepare cart items
      const cartItemsData = cartItems.items.map((item) => {
        const productId = item?.productId?._id || item?.productId;
        if (!productId) {
          throw new Error("Invalid product ID in cart");
        }

        const quantity = parseInt(item?.quantity);
        if (isNaN(quantity) || quantity <= 0) {
          throw new Error("Invalid quantity for product");
        }

        const price = parseFloat(
          item?.salePrice > 0 ? item?.salePrice : item?.price || 0
        ).toFixed(2);

        return {
          productId,
          quantity,
          price: parseFloat(price),
        };
      });

      // Prepare order data
      const orderData = {
        userId: user?.id || user?._id,
        cartId: cartItems?._id || null,
        cartItems: cartItemsData,
        addressInfo: {
          address: currentSelectedAddress.address?.trim(),
          city: currentSelectedAddress.city?.trim(),
          pincode: currentSelectedAddress.pincode?.toString()?.trim(),
          phone: currentSelectedAddress.phone?.toString()?.trim(),
          notes: currentSelectedAddress.notes?.trim() || "",
        },
        paymentMethod: paymentMethod.toLowerCase(),
        totalAmount: parseFloat(totalCartAmount.toFixed(2)),
      };

      // Additional validation
      if (!orderData.userId) {
        throw new Error("User ID is required");
      }
      if (!orderData.cartItems || !orderData.cartItems.length) {
        throw new Error("Cart items are required");
      }
      if (
        !orderData.addressInfo.address ||
        !orderData.addressInfo.city ||
        !orderData.addressInfo.pincode ||
        !orderData.addressInfo.phone
      ) {
        throw new Error("Complete shipping address is required");
      }

      console.log("handleInitiatePayment - Sending order data:", JSON.stringify(orderData, null, 2));

      const result = await dispatch(createNewOrder(orderData)).unwrap();
      console.log("handleInitiatePayment - Order creation result:", result);

      if (result.success) {
        if (paymentMethod === "cod") {
          // For COD, redirect to success page
          console.log("handleInitiatePayment - COD order placed, redirecting to success");
          window.location.href = "/shop/payment-success";
        } else if (paymentMethod === "razorpay") {
          // For Razorpay, initialize payment
          const { razorpayOrder } = result.data;

          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "Your Store Name",
            description: "Order Payment",
            order_id: razorpayOrder.id,
            handler: async function (response) {
              try {
                console.log("handleInitiatePayment - Razorpay payment success:", response);
                // Handle successful payment
                window.location.href = "/shop/payment-success";
              } catch (error) {
                console.error("handleInitiatePayment - Payment verification error:", error);
                window.location.href = "/shop/payment-failure";
              }
            },
            prefill: {
              name: user?.name || "",
              email: user?.email || "",
              contact: orderData.addressInfo.phone,
            },
            theme: {
              color: "#3399cc",
            },
          };

          console.log("handleInitiatePayment - Opening Razorpay checkout");
          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();
        }
      } else {
        throw new Error(result.message || "Failed to create order");
      }
    } catch (error) {
      console.error("handleInitiatePayment - Order creation error:", error);
      setIsPaymentStart(false);
      toast({
        title: error?.response?.data?.message || error.message || "Failed to process order",
        variant: "destructive",
      });
    }
  }

  // Redirect to approval URL for Razorpay
  if (approvalURL && paymentMethod === "razorpay") {
    console.log("ShoppingCheckout - Redirecting to approval URL:", approvalURL);
    window.location.href = approvalURL;
  }

  // Redirect to login if user is not authenticated
  if (!user?.id) {
    console.log("ShoppingCheckout - No user authenticated, redirecting to login");
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src="/account.jpg"
          className="h-full w-full object-cover object-center"
          alt="banner"
          onError={(e) => {
            e.target.src = "/placeholder.jpg";
          }}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
        <Address
          selectedId={currentSelectedAddress}
          setCurrentSelectedAddress={setCurrentSelectedAddress}
        />
        <div className="flex flex-col gap-4">
          {cartItems && cartItems.items && cartItems.items.length > 0 ? (
            cartItems.items.map((item) => (
              <UserCartItemsContent key={item.productId} cartItem={item} />
            ))
          ) : (
            <p>Your cart is empty.</p>
          )}
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">${totalCartAmount.toFixed(2)}</span>
            </div>

            <div className="mt-4">
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="razorpay"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="razorpay" className="text-sm font-medium">
                    Pay with Razorpay
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="cod" className="text-sm font-medium">
                    Cash on Delivery (COD)
                  </label>
                </div>
              </div>

              <Button
                onClick={handleInitiatePayment}
                className="w-full"
                disabled={
                  isPaymentStart ||
                  !cartItems?.items?.length ||
                  !user?.id ||
                  !currentSelectedAddress
                }
              >
                {isPaymentStart
                  ? `Processing ${paymentMethod === "razorpay" ? "Razorpay" : "COD"} Payment...`
                  : `Pay with ${paymentMethod === "razorpay" ? "Razorpay" : "Cash on Delivery"}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCheckout;
