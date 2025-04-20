import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { brandOptionsMap, categoryOptionsMap } from "@/config";

function ShoppingProductTile({ product, onClickDetails, onClickAddToCart }) {
  // Add default values and null checks
  const {
    _id = '',
    title = '',
    description = '',
    price = 0,
    salePrice = 0,
    image = '',
    totalStock = 0,
    category = '',
    brand = '',
  } = product || {};

  // Don't render if product is undefined
  if (!product) {
    return null;
  }

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden group hover:shadow-lg transition-shadow">
      <div onClick={onClickDetails} className="cursor-pointer">
        <CardHeader className="p-0">
          <div className="relative">
            <img
              src={image}
              alt={title}
              className="w-full h-[300px] object-cover rounded-t-lg transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.src = "/placeholder.jpg"; 
              }}
            />
            {totalStock === 0 ? (
              <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                Out Of Stock
              </Badge>
            ) : totalStock < 10 ? (
              <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                Only {totalStock} left
              </Badge>
            ) : salePrice > 0 ? (
              <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
                Sale
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2 truncate">{title}</h2>
          <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-2">
            {description}
          </p>
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="text-[14px]">
              {categoryOptionsMap[category] || category}
            </Badge>
            <Badge variant="outline" className="text-[14px]">
              {brandOptionsMap[brand] || brand}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span
              className={`text-lg font-semibold ${
                salePrice > 0 ? "line-through text-muted-foreground" : "text-primary"
              }`}
            >
              ₹{price.toLocaleString()}
            </span>
            {salePrice > 0 && (
              <span className="text-lg font-semibold text-primary">
                ₹{salePrice.toLocaleString()}
              </span>
            )}
          </div>
        </CardContent>
      </div>
      <CardFooter className="p-4">
        {totalStock === 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed" disabled>
            Out Of Stock
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => onClickAddToCart(_id)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
