import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { changePassword, deleteUserAccount, updateUserProfile } from "@/store/auth-slice";

function ProfileManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) {
      setUserName(user.userName || "");
      setProfileImage(user.profileImage || "");
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    const result = await dispatch(updateUserProfile({ userName, profileImage }));
    if (updateUserProfile.fulfilled.match(result)) {
      toast({
        title: "Profile Updated",
        description: "Your profile was updated successfully.",
      });
    } else {
      toast({
        title: "Update Failed",
        description: result.payload?.message || "Could not update profile.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    const result = await dispatch(changePassword({ oldPassword, newPassword }));
    if (changePassword.fulfilled.match(result)) {
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      setOldPassword("");
      setNewPassword("");
    } else {
      toast({
        title: "Password Change Failed",
        description: result.payload?.message || "Could not change password.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your account?");
    if (!confirmed) return;

    const result = await dispatch(deleteUserAccount());
    if (deleteUserAccount.fulfilled.match(result)) {
      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully.",
      });
      navigate("/");
    } else {
      toast({
        title: "Deletion Failed",
        description: result.payload?.message || "Could not delete account.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-10">
      {/* Profile Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Update Profile</h2>
        <div>
          <Label>User Name</Label>
          <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
        </div>
        <div>
          <Label>Profile Image URL</Label>
          <Input value={profileImage} onChange={(e) => setProfileImage(e.target.value)} />
        </div>
        {profileImage && (
          <img
            src={profileImage}
            alt="Profile Preview"
            className="w-24 h-24 rounded-full object-cover"
          />
        )}
        <Button onClick={handleProfileUpdate} disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Profile"}
        </Button>
      </div>

      {/* Change Password */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Change Password</h2>
        <div>
          <Label>Old Password</Label>
          <Input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div>
          <Label>New Password</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <Button onClick={handlePasswordChange} disabled={isLoading}>
          {isLoading ? "Updating..." : "Change Password"}
        </Button>
      </div>

      {/* Delete Account */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
        <p>This will permanently delete your account and all associated data.</p>
        <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
          {isLoading ? "Deleting..." : "Delete Account"}
        </Button>
      </div>
    </div>
  );
}

export default ProfileManagement;
