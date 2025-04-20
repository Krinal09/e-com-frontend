import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";
import { Edit, Trash2 } from "lucide-react";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  return (
    <Card
      onClick={
        setCurrentSelectedAddress
          ? () => setCurrentSelectedAddress(addressInfo)
          : null
      }
      className={`cursor-pointer border-red-700 ${
        selectedId?._id === addressInfo?._id
          ? "border-red-900 border-[4px]"
          : "border-black"
      }`}
    >
      <CardContent className="grid p-4 gap-4">
        <Label>Address: {addressInfo?.address}</Label>
        <Label>City: {addressInfo?.city}</Label>
        <Label>pincode: {addressInfo?.pincode}</Label>
        <Label>Phone: {addressInfo?.phone}</Label>
        <Label>Notes: {addressInfo?.notes}</Label>
      </CardContent>
      <CardFooter className="p-3 flex justify-between">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleEditAddress(addressInfo);
          }}
          className="bg-green-600 hover:bg-green-700 text-white h-8"
          size="sm"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteAddress(addressInfo);
          }}
          className="bg-red-600 hover:bg-red-700 text-white h-8"
          size="sm"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddressCard;
