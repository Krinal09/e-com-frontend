import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";
import ProfileManagement from "@/components/shopping-view/profile-management";
import { useSearchParams } from "react-router-dom";

function ShoppingAccount() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";

  return (
    <div className="flex flex-col">
      {/* <br />
      <h1 className="text-2xl font-bold text-center">Account</h1> */}
      {/* <div className="relative h-[300px] w-full overflow-hidden">
        <img
          src={accImg}
          className="h-full w-full object-cover object-center"
        />
      </div> */}
      <div className="container mx-auto grid grid-cols-1 gap-8 py-8">
        
        <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
        <h1 className="text-4xl font-bold pb-4">Account</h1>
          <Tabs defaultValue={defaultTab}>
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <ProfileManagement />
            </TabsContent>
            <TabsContent value="orders">
              <ShoppingOrders />
            </TabsContent>
            <TabsContent value="address">
              <Address />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
