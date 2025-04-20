import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { changePassword, deleteUserAccount, updateUserProfile, updateProfilePicture } from "@/store/auth-slice";
import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

function ProfileManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const inputRef = useRef(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    let abortController = new AbortController();
  
    if (user) {
      setUserName(user.userName || "");
      setProfileImage(user.profileImage || "");
    }
  
    return () => {
      abortController.abort(); // Cleanup on unmount
    };
  }, [user]);

  function handleImageFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) setImageFile(selectedFile);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) setImageFile(droppedFile);
  }

  function handleRemoveImage() {
    setImageFile(null);
    setProfileImage("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function uploadImageToCloudinary() {
    const abortController = new AbortController();
    setImageLoadingState(true);
    const data = new FormData();
    data.append("my_file", imageFile);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/products/upload-image`,
        data,
        { signal: abortController.signal }
      );
      if (response?.data?.success) {
        const newProfileImage = response.data.result.url;
        setProfileImage(newProfileImage);
        setImageLoadingState(false);
        dispatch(updateProfilePicture(newProfileImage));
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Upload error:", error);
        setImageLoadingState(false);
        toast({
          title: "Upload Failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      }
    }
  }
  
  useEffect(() => {
    if (imageFile !== null) uploadImageToCloudinary();
  }, [imageFile]);

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
        <div className="w-full mt-4">
          <Label className="text-lg font-semibold mb-2 block">Profile Picture</Label>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-lg p-4"
          >
            <Input
              id="image-upload"
              type="file"
              className="hidden"
              ref={inputRef}
              onChange={handleImageFileChange}
            />
            {!imageFile && !profileImage ? (
              <Label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center h-32 cursor-pointer"
              >
                <UploadCloudIcon className="w-10 h-10 text-muted-foreground mb-2" />
                <span>Drag & drop or click to upload image</span>
              </Label>
            ) : imageLoadingState ? (
              <Skeleton className="h-10 bg-gray-100" />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {profileImage && (
                    <img
                      src={profileImage}
                      alt="Profile Preview"
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                  )}
                  <FileIcon className="w-8 text-primary mr-2 h-8" />
                  <p className="text-sm font-medium">{imageFile?.name || "Current Profile Picture"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleRemoveImage}
                >
                  <XIcon className="w-4 h-4" />
                  <span className="sr-only">Remove File</span>
                </Button>
              </div>
            )}
          </div>
        </div>
        <Button variant="success" onClick={handleProfileUpdate} disabled={isLoading}>
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
        <Button variant="success" onClick={handlePasswordChange} disabled={isLoading}>
          {isLoading ? "Updating..." : "Change Password"}
        </Button>
      </div>

      {/* Delete Account */}
      <div className="space-y-2">
        {/* <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2> */}
        <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading}>
          {isLoading ? "Deleting..." : "Delete Account"}
        </Button>
        <p>This will permanently delete your account and all associated data.</p>
      </div>
    </div>
  );
}

export default ProfileManagement;
