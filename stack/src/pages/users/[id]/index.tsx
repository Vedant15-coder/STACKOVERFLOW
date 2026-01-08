import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Edit, Plus, X } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PointsDisplay from "@/components/PointsDisplay";
import TransferPoints from "@/components/TransferPoints";
import TransactionHistory from "@/components/TransactionHistory";
import LoginHistory from "@/components/LoginHistory";
const getUserData = (id: string) => {
  const users = {
    "1": {
      id: 1,
      name: "John Doe",
      joinDate: "2019-03-15",
      about:
        "Full-stack developer with 8+ years of experience in JavaScript, React, and Node.js. Passionate about clean code and helping others learn programming. I enjoy working on open-source projects and contributing to the developer community.",
      tags: [
        "javascript",
        "react",
        "node.js",
        "typescript",
        "python",
        "mongodb",
      ],
    },
  };
  return users[id as keyof typeof users] || users["1"];
};
const index = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: users?.name || "",
    about: users?.about || "",
    tags: users?.tags || [],
  });
  const [newTag, setNewTag] = useState("");
  const [currentUserPoints, setCurrentUserPoints] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        const matcheduser = res.data.data.find((u: any) => u._id === id);
        setusers(matcheduser);
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, [id, refreshKey]);

  // Fetch current user's points for transfer validation
  useEffect(() => {
    const fetchCurrentUserPoints = async () => {
      if (user?._id) {
        try {
          const token = localStorage.getItem("token");
          const response = await axiosInstance.get("/api/rewards/my-points", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCurrentUserPoints(response.data.points || 0);
        } catch (error) {
          console.error("Error fetching current user points:", error);
        }
      }
    };
    fetchCurrentUserPoints();
  }, [user, refreshKey]);
  if (loading) {
    return (
      <Mainlayout>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </Mainlayout>
    );
  }
  if (!users || users.length === 0) {
    return <div className="text-center text-gray-500 mt-4">No user found.</div>;
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await axiosInstance.patch(`/user/update/${user?._id}`, {
        editForm,
      });
      if (res.data.data) {
        const updatedUser = {
          ...users,
          name: editForm.name,
          about: editForm.about,
          tags: editForm.tags,
        };

        setusers(updatedUser);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter((tag: any) => tag !== tagToRemove),
    });
  };

  const currentUserId = user?._id;
  const isOwnProfile = id === currentUserId;
  return (
    <Mainlayout>
      <div className="max-w-6xl">
        {/* User Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-8">
          <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
            <AvatarFallback className="text-2xl lg:text-3xl">
              {users.name
                .split(" ")
                .map((n: any) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">
                  {users.name}
                </h1>
              </div>

              {isOwnProfile && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 rounded-2xl shadow-2xl">
                    <DialogHeader className="border-b border-gray-200 pb-4">
                      <DialogTitle className="text-xl font-semibold text-gray-900">
                        Edit Profile
                      </DialogTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Update your public information
                      </p>
                    </DialogHeader>

                    <div className="space-y-8 py-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-4">
                            Basic Information
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <Label
                                htmlFor="name"
                                className="text-sm font-medium text-gray-700 mb-1.5 block"
                              >
                                Display Name
                              </Label>
                              <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Your display name"
                                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              />
                              <p className="text-xs text-gray-500 mt-1.5">
                                This is how your name will appear publicly
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* About Section */}
                      <div className="space-y-4">
                        <h3 className="text-base font-semibold text-gray-900">
                          About
                        </h3>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <Label
                              htmlFor="about"
                              className="text-sm font-medium text-gray-700"
                            >
                              About Me
                            </Label>
                            <span className="text-xs text-gray-500">
                              {editForm.about?.length || 0} / 500
                            </span>
                          </div>
                          <Textarea
                            id="about"
                            value={editForm.about}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                about: e.target.value.slice(0, 500),
                              })
                            }
                            placeholder="Full-stack developer passionate about MERN, APIs, and problem solving.&#10;Currently exploring system design and open-source."
                            className="min-h-36 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                            maxLength={500}
                          />
                          <p className="text-xs text-gray-500 mt-1.5">
                            Tell us about yourself, your experience, and interests
                          </p>
                        </div>
                      </div>

                      {/* Tags/Skills Section */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            Skills & Technologies
                          </h3>
                          <p className="text-xs text-gray-500 mb-4">
                            Add skills that represent your expertise
                          </p>
                        </div>

                        <div className="space-y-3">
                          {/* Tag Input */}
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Add a skill (e.g., React, Node.js)"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddTag();
                                }
                              }}
                              className="flex-1 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                              maxLength={30}
                            />
                            <Button
                              onClick={handleAddTag}
                              type="button"
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-lg"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>

                          {/* Tags Display */}
                          {editForm.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
                              {editForm.tags.map((tag: any) => {
                                return (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 text-sm font-medium"
                                  >
                                    {tag}
                                    <button
                                      onClick={() => handleRemoveTag(tag)}
                                      className="ml-0.5 hover:text-red-600 transition-colors"
                                      type="button"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </Badge>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 border-dashed text-center">
                              <p className="text-sm text-gray-500">
                                No skills added yet. Add your first skill above.
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            Press Enter or click Add to include a skill
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Transfer Points Button (only show when viewing another user's profile) */}
              {!isOwnProfile && (
                <TransferPoints
                  recipientId={id as string}
                  recipientName={users.name}
                  currentUserPoints={currentUserPoints}
                  onSuccess={() => setRefreshKey((prev) => prev + 1)}
                />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Member since{" "}
                {new Date(users.joinDate).toISOString().split("T")[0]}
              </div>
            </div>
            <div className="flex flex-wrap items-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="font-semibold">5</span>
                <span className="text-gray-600 ml-1">gold badges</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span className="font-semibold">23</span>
                <span className="text-gray-600 ml-1">silver badges</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-600 rounded-full mr-2"></div>
                <span className="font-semibold">45</span>
                <span className="text-gray-600 ml-1">bronze badges</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1  gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Reputation Points Card */}
            <Card>
              <CardHeader>
                <CardTitle>Reputation Points</CardTitle>
              </CardHeader>
              <CardContent>
                <PointsDisplay userId={id as string} key={refreshKey} />
              </CardContent>
            </Card>

            {/* Transaction History Card */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionHistory userId={id as string} limit={10} key={refreshKey} />
              </CardContent>
            </Card>

            {/* Login History Card - Only show for own profile */}
            {isOwnProfile && (
              <LoginHistory userId={id as string} />
            )}

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {users.about}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.tags.map((tag: string) => (
                    <div
                      key={tag}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                        >
                          {tag}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
};

export default index;
