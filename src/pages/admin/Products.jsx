import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllProducts as fetchProducts,
  addNewProduct as addProduct,
  editProduct as updateProduct,
  deleteProduct,
} from "../../store/admin/products-slice";
import { DataTable } from "../../components/admin-view/data-table";
import { columns as productColumns } from "../../components/admin-view/product-columns";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../components/ui/sheet";
import ProductImageUpload from "../../components/admin-view/image-upload";
import Form from "../../components/common/form";
import { addProductFormElements } from "../../config/form-elements";
import AdminProductTile from "../../components/admin-view/product-tile";

const initialFormData = {
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  image: "",
};

const POLLING_INTERVAL = 30000; // 30 seconds

export function AdminProducts() {
  const dispatch = useDispatch();
  const { productList: products = [], isLoading: loading } = useSelector((state) => state.adminProducts);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageUrl, setImageUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);

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

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Handle edit product event
  useEffect(() => {
    const handleEditProduct = (event) => {
      const { product } = event.detail;
      setFormData(product);
      setImageUrl(product.image);
      setIsOpen(true);
    };

    window.addEventListener("editProduct", handleEditProduct);
    return () => window.removeEventListener("editProduct", handleEditProduct);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      ...formData,
      image: imageUrl || formData.image,
    };

    try {
      if (formData._id) {
        await dispatch(updateProduct({ id: formData._id, data: productData }));
      } else {
        await dispatch(addProduct(productData));
      }
      // Fetch fresh data after submission
      dispatch(fetchProducts());
      setFormData(initialFormData);
      setImageUrl("");
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProduct(id));
        // Fetch fresh data after deletion
        dispatch(fetchProducts());
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const isFormValid = () => {
    return (
      formData.title &&
      formData.description &&
      formData.category &&
      formData.brand &&
      formData.price &&
      formData.totalStock &&
      (imageUrl || formData.image)
    );
  };

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
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button>Add Product</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>{formData._id ? "Edit Product" : "Add Product"}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <ProductImageUpload
                  imageUrl={imageUrl}
                  setImageUrl={setImageUrl}
                  existingImage={formData.image}
                />
                <Form
                  formControls={addProductFormElements}
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={onSubmit}
                  buttonText={formData._id ? "Update Product" : "Add Product"}
                  isBtnDisabled={!isFormValid()}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {loading && <div className="text-gray-500 mb-4">Loading products...</div>}
      <DataTable
        columns={productColumns}
        data={filteredProducts}
        isLoading={loading}
      />

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products && products.length > 0
          ? products.map((productItem) => (
              <AdminProductTile
                key={productItem._id}
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
    </div>
  );
} 