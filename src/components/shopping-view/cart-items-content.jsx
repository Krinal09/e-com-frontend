import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "../ui/use-toast";
import { deleteCartItem, updateCartQuantity, fetchCartItems } from "@/store/shop/cart-slice/index";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems, isLoading } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    console.log("Updating quantity for user:", user?.id, "Product:", getCartItem?.productId); // Debug log
    if (!user?.id) {
      toast({
        title: "Please log in to update cart",
        variant: "destructive",
      });
      return;
    }

    const productId = getCartItem?.productId?._id || getCartItem?.productId;
    if (!productId) {
      toast({
        title: "Invalid product",
        variant: "destructive",
      });
      return;
    }

    if (typeOfAction === "plus") {
      let getCartItems = cartItems.items || [];
      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => (item.productId?._id || item.productId) === productId
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === productId
        );
        const getTotalStock = productList[getCurrentProductIndex]?.totalStock || 0;

        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getTotalStock} quantity available for this item`,
              variant: "destructive",
            });
            return;
          }
        }
      }
    }

    const newQuantity = typeOfAction === "plus" 
      ? getCartItem.quantity + 1 
      : getCartItem.quantity - 1;

    if (newQuantity < 1) {
      toast({
        title: "Quantity cannot be less than 1",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      updateCartQuantity({
        userId: user.id,
        productId: productId,
        quantity: newQuantity,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart updated successfully",
        });
        // Refresh cart items after update
        dispatch(fetchCartItems(user.id));
      } else {
        toast({
          title: data?.payload?.message || "Failed to update cart",
          variant: "destructive",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    console.log("Deleting item for user:", user?.id, "Product:", getCartItem?.productId); // Debug log
    if (!user?.id) {
      toast({
        title: "Please log in to delete cart item",
        variant: "destructive",
      });
      return;
    }

    const productId = getCartItem?.productId?._id || getCartItem?.productId;
    if (!productId) {
      toast({
        title: "Invalid product",
        variant: "destructive",
      });
      return;
    }

    dispatch(
      deleteCartItem({ 
        userId: user.id, 
        productId: productId 
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item deleted successfully",
        });
        // Refresh cart items after deletion
        dispatch(fetchCartItems(user.id));
      } else {
        toast({
          title: data?.payload?.message || "Failed to delete cart item",
          variant: "destructive",
        });
      }
    }).catch((error) => {
      toast({
        title: error.message || "Failed to delete cart item",
        variant: "destructive",
      });
    });
  }

  return (
    <div className="flex items-center space-x-4">
      <img
        src={cartItem?.productId?.image || cartItem?.image}
        alt={cartItem?.productId?.title || cartItem?.title}
        className="w-20 h-20 rounded object-cover"
      />
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem?.productId?.title || cartItem?.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={cartItem?.quantity === 1 || isLoading}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={isLoading}
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Increase</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          $
          {(
            (cartItem?.productId?.salePrice > 0 
              ? cartItem?.productId?.salePrice 
              : cartItem?.productId?.price || cartItem?.salePrice > 0 
              ? cartItem?.salePrice 
              : cartItem?.price) * cartItem?.quantity
          ).toFixed(2)}
        </p>
        <Trash
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer mt-1"
          size={20}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;
