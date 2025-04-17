import { Button } from "../../components/ui/button";

export const columns = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.getValue("image");
      return (
        <div className="h-20 w-20">
          <img
            src={image || "/placeholder-image.jpg"}
            alt={row.getValue("title")}
            className="h-full w-full object-cover rounded-md"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "brand",
    header: "Brand",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price");
      const salePrice = row.getValue("salePrice");
      return (
        <div className="flex flex-col">
          {salePrice > 0 && (
            <span className="text-sm text-gray-500 line-through">${price}</span>
          )}
          <span className={salePrice > 0 ? "text-red-500" : ""}>
            ${salePrice > 0 ? salePrice : price}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalStock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.getValue("totalStock");
      return (
        <span className={stock < 10 ? "text-red-500" : "text-green-500"}>
          {stock}
        </span>
      );
    },
  },
  {
    accessorKey: "reviews",
    header: "Reviews",
    cell: ({ row }) => {
      const reviews = row.getValue("reviews") || [];
      return (
        <div className="flex items-center gap-1">
          <span>{reviews.length}</span>
          <span className="text-gray-500">reviews</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const product = row.original;
      
      const handleEdit = () => {
        const event = new CustomEvent("editProduct", {
          detail: { product },
          bubbles: true,
          composed: true
        });
        window.dispatchEvent(event);
      };

      const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this product?")) {
          const event = new CustomEvent("deleteProduct", {
            detail: { id: product._id },
            bubbles: true,
            composed: true
          });
          window.dispatchEvent(event);
        }
      };

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
]; 