"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Users, User, Eye } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://findr-jobboard-backend-production.up.railway.app/api/v1";

interface NetworkPerson {
  id: string;
  name: string;
  role: string;
  type: "invited" | "referred" | "searched";
  status: string;
}

const getTypeBadge = (type: "invited" | "referred" | "searched") => {
  switch (type) {
    case "invited":
      return (
        <Badge className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
          Invited
        </Badge>
      );
    case "referred":
      return (
        <Badge className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
          Referred
        </Badge>
      );
    case "searched":
      return (
        <Badge className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-800">
          Searched
        </Badge>
      );
  }
};

export default function MyNetworkPage() {
  const [people, setPeople] = useState<NetworkPerson[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const token =
          localStorage.getItem("findr_token") ||
          localStorage.getItem("authToken") ||
          localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/referrals/my-network`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data?.success) {
          const { invited, referred, searched } = response.data.data;
          setPeople([...invited, ...referred, ...searched]);
        } else {
          throw new Error(response.data?.message || "Failed to load network");
        }
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load your network";
        toast({ title: "Error", description: msg, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchNetwork();
  }, [router, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <main className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                <p className="text-gray-600">Loading your network…</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <main className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Your Network</h1>
              <p className="text-gray-600">
                Everyone connected to you through invitations, referrals, or
                profile access.
              </p>
            </div>
            <Link href="/jobseeker/referrals/history">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Referral History
              </Button>
            </Link>
          </div>

          {/* Network Table */}
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-4 h-4 mr-2 text-emerald-600" />
                Network Members
              </CardTitle>
              <CardDescription>
                Detailed view of everyone in your network and how they are
                connected to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-700">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700">
                        View Profile
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {people.map((person, idx) => (
                      <TableRow
                        key={`${person.id}-${idx}`}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        {/* Name */}
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm hover:text-emerald-600 transition-colors">
                                {person.name}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">
                                {person.role}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <div className="cursor-pointer hover:shadow-sm transition-shadow inline-block">
                            {getTypeBadge(person.type)}
                          </div>
                        </TableCell>

                        {/* View Profile */}
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() =>
                              router.push(
                                `/jobseeker/referrals/joiners/${person.id}`,
                              )
                            }
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {people.map((person, idx) => (
                  <div
                    key={`${person.id}-${idx}`}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm hover:text-emerald-600 transition-colors">
                            {person.name}
                          </p>
                          <p className="text-xs text-gray-400 capitalize">
                            {person.role}
                          </p>
                        </div>
                      </div>
                      <div className="cursor-pointer hover:shadow-sm transition-shadow">
                        {getTypeBadge(person.type)}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center gap-1"
                        onClick={() =>
                          router.push(
                            `/jobseeker/referrals/joiners/${person.id}`,
                          )
                        }
                      >
                        <Eye className="w-3 h-3" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {people.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Your network is empty
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Invite friends using your referral code or start referring
                    people to jobs to build your network.
                  </p>
                  <Link href="/jobseeker/search">
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 text-sm px-5">
                      Browse Jobs to Refer
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
