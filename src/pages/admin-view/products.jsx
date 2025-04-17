import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllProducts as fetchProducts,
  addNewProduct as addProduct,
  editProduct as updateProduct,
  deleteProduct,
} from "@/store/admin/products-slice";
import { DataTable } from "@/components/admin-view/data-table";
import { columns as productColumns } from "@/components/admin-view/product-columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import ProductImageUpload from "@/components/admin-view/image-upload";
import Form from "@/components/common/form";
import { addProductFormElements } from "@/config";
import { useToast } from "@/components/ui/use-toast";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
};

const POLLING_INTERVAL = 30000; // 30 seconds

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { productList: products = [], isLoading: loading } = useSelector((state) => state.adminProducts);
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Initial data fetch
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Set up polling for real-time updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(fetchProducts());
      setLastUpdate(new Date());
    }, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Handle edit and delete events
  useEffect(() => {
    const handleEditProduct = (event) => {
      const { product } = event.detail;
      setFormData(product);
      setUploadedImageUrl(product.image);
      setCurrentEditedId(product._id);
      setOpenCreateProductsDialog(true);
    };

    const handleDeleteProduct = (event) => {
      const { id } = event.detail;
      handleDelete(id);
    };

    window.addEventListener("editProduct", handleEditProduct);
    window.addEventListener("deleteProduct", handleDeleteProduct);

    return () => {
      window.removeEventListener("editProduct", handleEditProduct);
      window.removeEventListener("deleteProduct", handleDeleteProduct);
    };
  }, []);

  function onSubmit(event) {
    event.preventDefault();

    if (currentEditedId !== null) {
      dispatch(
        updateProduct({
          id: currentEditedId,
          formData: {
            ...formData,
            image: uploadedImageUrl,
          },
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchProducts());
          setFormData(initialFormData);
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setUploadedImageUrl("");
          toast({
            title: "Product updated successfully",
          });
        }
      });
    } else {
      dispatch(
        addProduct({
          ...formData,
          image: uploadedImageUrl,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchProducts());
          setOpenCreateProductsDialog(false);
          setImageFile(null);
          setFormData(initialFormData);
          setUploadedImageUrl("");
          toast({
            title: "Product added successfully",
          });
        }
      });
    }
  }

  function handleDelete(getCurrentProductId) {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(deleteProduct(getCurrentProductId)).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchProducts());
          toast({
            title: "Product deleted successfully",
          });
        }
      });
    }
  }

  function isFormValid() {
    return Object.keys(formData)
      .filter((currentKey) => currentKey !== "averageReview")
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  const filteredProducts = (products || []).filter((product) => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesBrand = selectedBrand === "all" || product.brand === selectedBrand;
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const categories = [...new Set((products || []).map((product) => product.category))];
  const brands = [...new Set((products || []).map((product) => product.brand))];

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button onClick={() => setOpenCreateProductsDialog(true)}>
            Add New Product
          </Button>
        </div>
      </div>

      {loading && <div className="text-gray-500 mb-4">Loading products...</div>}
      <DataTable
        columns={productColumns}
        data={filteredProducts}
        isLoading={loading}
      />

      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
          setUploadedImageUrl("");
          setImageFile(null);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            <Form
              formControls={addProductFormElements}
              formData={formData}
              setFormData={setFormData}
              onSubmit={onSubmit}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
