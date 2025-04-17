export const addProductFormElements = [
  {
    name: "title",
    placeholder: "Enter product title",
    type: "text",
    label: "Title",
  },
  {
    name: "description",
    placeholder: "Enter product description",
    type: "textarea",
    label: "Description",
  },
  {
    name: "category",
    placeholder: "Select category",
    type: "select",
    label: "Category",
    options: [
      { id: "electronics", label: "Electronics" },
      { id: "fashion", label: "Fashion" },
      { id: "home", label: "Home & Living" },
      { id: "books", label: "Books" },
      { id: "sports", label: "Sports & Outdoors" },
    ],
  },
  {
    name: "brand",
    placeholder: "Enter brand name",
    type: "text",
    label: "Brand",
  },
  {
    name: "price",
    placeholder: "Enter price",
    type: "number",
    label: "Price",
  },
  {
    name: "salePrice",
    placeholder: "Enter sale price (optional)",
    type: "number",
    label: "Sale Price",
  },
  {
    name: "totalStock",
    placeholder: "Enter total stock",
    type: "number",
    label: "Total Stock",
  },
]; 