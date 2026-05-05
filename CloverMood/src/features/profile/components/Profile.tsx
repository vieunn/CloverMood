import { useState, useEffect, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Leaf } from "lucide-react";
import { profileService, type ProfileData } from "../services/profileService";
import "../../../styles/Profile.css";

function getStoredUserEmail(): string {
  const keys = ["userEmail", "user", "loginResponse"];
  
  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) {
      if (key === "userEmail") {
        return value;
      }
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "object" && parsed !== null) {
          if (parsed.email) return parsed.email;
          if (parsed.user?.email) return parsed.user.email;
          if (parsed.userEmail) return parsed.userEmail;
        }
      } catch (e) {
        continue;
      }
    }
  }

  // Try to extract email from JWT token
  const token = localStorage.getItem("authToken");
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payloadBase64 = parts[1];
        const payload = JSON.parse(atob(payloadBase64));
        if (payload.sub) return payload.sub;
        if (payload.email) return payload.email;
        if (payload.user_name) return payload.user_name;
      }
    } catch (e) {
      // Continue silently
    }
  }

  return "";
}

export default function Profile() {
  const navigate = useNavigate();
  
  const [userEmail, setUserEmail] = useState<string>("");
  const [profile, setProfile] = useState<ProfileData>({
    email: "",
    fullName: "",
    gender: "",
  });
  const [originalProfile, setOriginalProfile] = useState<ProfileData>({
    email: "",
    fullName: "",
    gender: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const email = getStoredUserEmail();
    setUserEmail(email);

    if (email) {
      loadProfile(email);
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async (email: string) => {
    setLoading(true);
    const result = await profileService.getProfile(email);
    
    if (result.success && result.data) {
      setProfile(result.data);
      setOriginalProfile(result.data);
    } else {
      const fallbackProfile = { ...profile, email };
      setProfile(fallbackProfile);
      setOriginalProfile(fallbackProfile);
      setError(result.message || "Failed to load profile");
    }

    // Fetch profile photo
    const photoResult = await profileService.getProfilePhoto(email);
    if (photoResult.success && photoResult.image) {
      setPhotoData(`data:image/png;base64,${photoResult.image}`);
    } else {
      setPhotoData(null);
    }

    setIsEditing(false);
    setLoading(false);
  };

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev: ProfileData) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    setError("");

    if (!profile.fullName?.trim()) {
      setError("Full name is required");
      return false;
    }

    if (!profile.gender) {
      setError("Please select a gender");
      return false;
    }

    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setError("Current password is required");
        return false;
      }

      if (!newPassword) {
        setError("New password is required");
        return false;
      }

      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters");
        return false;
      }

      if (newPassword !== confirmPassword) {
        setError("New passwords do not match");
        return false;
      }
    }

    return true;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;
    if (!userEmail) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // 1. Update profile data
      const updateResult = await profileService.updateProfile(profile);
      if (!updateResult.success) {
        setError(updateResult.message || "Failed to update profile");
        setLoading(false);
        return;
      }

      // 2. Upload photo if selected
      if (selectedPhotoFile) {
        if (!(selectedPhotoFile instanceof File)) {
          setError("Invalid file selected");
          setLoading(false);
          return;
        }
        
        const photoResult = await profileService.uploadPhoto(userEmail, selectedPhotoFile);
        if (!photoResult.success) {
          setError(photoResult.message || "Failed to upload photo");
          setLoading(false);
          return;
        }
        setSelectedPhotoFile(null);
      }

      // 3. Update password if filled
      if (currentPassword && newPassword) {
        const passwordResult = await profileService.updatePassword(
          userEmail,
          currentPassword,
          newPassword
        );
        if (!passwordResult.success) {
          setError(passwordResult.message || "Failed to update password");
          setLoading(false);
          return;
        }
      }

      // 4. Re-fetch fresh profile data from backend
      await loadProfile(userEmail);

      // After successful save
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Profile updated successfully!");
    } catch (err) {
      setError("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (file: File | null) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Only JPG and PNG files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setError("");
    setMessage("");
    setSelectedPhotoFile(file);
    setMessage("Photo selected. Click 'Save Changes' to upload.");
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <header className="profile-nav">
        <div className="nav-left">
          <Leaf style={{ width: "24px", height: "24px" }} />
          <span className="logo">CLOVERMOOD</span>
        </div>
        <nav className="nav-links">
          <Link to="/dashboard">Home</Link>
          <Link to="/history">History</Link>
          <Link to="/statistics">Statistics</Link>
          <Link to="/profile" className="active">Profile</Link>
        </nav>
      </header>

      <div className="profile-wrapper">
        <div className="profile-box">
          <h1>Account Settings</h1>
          <p className="subtitle">Update your personal information</p>

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          {loading ? (
            <div className="loading">Loading profile...</div>
          ) : !userEmail ? (
            <div className="alert error">No user session found. Please log in first on the Dashboard.</div>
          ) : (
            <>
              <div className="profile-header-section">
                <div className="profile-header-top">
                  <div className="avatar-container">
                    <div 
                      className="avatar"
                      style={
                        photoData 
                          ? {
                              backgroundImage: `url(${photoData})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              color: "transparent"
                            }
                          : {}
                      }
                    >
                      {!photoData && (profile.email?.charAt(0).toUpperCase() || "U")}
                    </div>
                    <label className="photo-upload" style={{ cursor: isEditing ? "pointer" : "default", opacity: isEditing ? 1 : 0.5 }}>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          if (e.target.files?.[0]) {
                            handlePhotoUpload(e.target.files[0]);
                          }
                        }}
                        disabled={!isEditing || loading}
                      />
                    </label>
                  </div>
                  <div className="profile-info">
                    <h2>{profile.fullName || "User Name"}</h2>
                    <p className="email-text">{profile.email}</p>
                  </div>
                  <button 
                    className="edit-profile-btn" 
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing || loading}
                  >
                    Edit Profile →
                  </button>
                </div>
              </div>

              <div className="section">
                <h3>PERSONAL DETAILS</h3>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profile.fullName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        handleProfileChange("fullName", e.target.value)
                      }
                      placeholder="User Name"
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      value={profile.gender}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        handleProfileChange("gender", e.target.value)
                      }
                      disabled={!isEditing}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={profile.email} disabled placeholder="Email" />
                </div>
              </div>

              <div className="section" style={{ display: isEditing ? "block" : "none" }}>
                <h3>Change Password</h3>

                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="button-group" style={{ display: isEditing ? "flex" : "none" }}>
                <button className="btn primary" onClick={handleSaveChanges} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  className="btn secondary"
                  onClick={() => {
                    setProfile(originalProfile);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setSelectedPhotoFile(null);
                    setIsEditing(false);
                    setMessage("");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>

              <div className="signout-section">
                <button className="signout-btn" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
