import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "@/store/shop/cart-slice/index";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Clear the cart after successful payment
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Order Confirmed!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => navigate("/shop/account?tab=orders")}
            className="w-full"
          >
            View Orders
          </Button>
          
          <Button
            onClick={() => navigate("/shop/listing")}
            variant="outline"
            className="w-full"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
