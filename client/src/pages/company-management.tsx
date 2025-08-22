import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, 
  Users, 
  Plus, 
  Settings, 
  Mail, 
  Crown, 
  Shield, 
  Eye,
  Edit,
  Trash,
  UserPlus,
  BarChart3,
  Package,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Company {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  industry?: string;
  size: string;
  logo?: string;
  subscription: string;
  subscriptionExpiresAt?: string;
  maxUsers: number;
  maxStorage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CompanyStats {
  userCount: number;
  isActive: boolean;
  subscription: string;
  maxUsers: number;
  currentStorage: number;
  maxStorage: number;
}

interface CompanyInvitation {
  id: string;
  companyId: string;
  email: string;
  role: string;
  invitedBy: string;
  token: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export default function CompanyManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    industry: "",
    size: "small",
    website: "",
    phone: "",
    address: "",
  });
  const [newInvitation, setNewInvitation] = useState({
    email: "",
    role: "user",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Fetch companies
  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ["/api/companies"],
  });

  // Fetch selected company stats
  const { data: companyStats } = useQuery({
    queryKey: ["/api/companies", selectedCompany?.id, "stats"],
    enabled: !!selectedCompany,
  });

  // Fetch company users
  const { data: companyUsers = [] } = useQuery({
    queryKey: ["/api/companies", selectedCompany?.id, "users"],
    enabled: !!selectedCompany,
  });

  // Fetch company invitations
  const { data: companyInvitations = [] } = useQuery({
    queryKey: ["/api/companies", selectedCompany?.id, "invitations"],
    enabled: !!selectedCompany,
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/companies", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setShowCreateDialog(false);
      setNewCompany({
        name: "",
        email: "",
        industry: "",
        size: "small",
        website: "",
        phone: "",
        address: "",
      });
      toast({
        title: "Company created",
        description: "New company has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating company",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `/api/companies/${selectedCompany?.id}/invitations`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies", selectedCompany?.id, "invitations"] });
      setShowInviteDialog(false);
      setNewInvitation({
        email: "",
        role: "user",
      });
      toast({
        title: "Invitation sent",
        description: "User invitation has been sent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error sending invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create demo company mutation
  const createDemoMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/companies/demo"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Demo company created",
        description: "A demo company has been created with sample data",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating demo company",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateCompany = () => {
    createCompanyMutation.mutate(newCompany);
  };

  const handleInviteUser = () => {
    createInvitationMutation.mutate(newInvitation);
  };

  const getSubscriptionBadge = (subscription: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      trial: "outline",
      basic: "secondary",
      pro: "default",
      enterprise: "destructive",
    };
    return (
      <Badge variant={variants[subscription] || "outline"} className="capitalize">
        {subscription}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const icons = {
      super_admin: Crown,
      company_admin: Shield,
      manager: Settings,
      user: Users,
      viewer: Eye,
    };
    const Icon = icons[role as keyof typeof icons] || Users;
    
    return (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="capitalize">{role.replace('_', ' ')}</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Gestión de Empresas" 
          subtitle="Administra empresas y usuarios del sistema"
          onMenuClick={handleMenuClick}
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Company Management</h1>
            <p className="text-muted-foreground">
              Manage companies, users, and multi-tenant access
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => createDemoMutation.mutate()}
            variant="outline"
            disabled={createDemoMutation.isPending}
            data-testid="button-create-demo"
          >
            <Building2 className="h-4 w-4 mr-2" />
            {createDemoMutation.isPending ? "Creating..." : "Create Demo"}
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            data-testid="button-create-company"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Company
          </Button>
        </div>
      </div>

      {/* Companies Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Companies ({companies.length})
              </CardTitle>
              <CardDescription>
                Select a company to manage its settings and users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {loadingCompanies ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading companies...
                    </div>
                  ) : companies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No companies found. Create your first company to get started.
                    </div>
                  ) : (
                    companies.map((company: Company) => (
                      <Card
                        key={company.id}
                        className={`cursor-pointer transition-colors hover:bg-accent ${
                          selectedCompany?.id === company.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedCompany(company)}
                        data-testid={`company-card-${company.slug}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{company.name}</h3>
                              <p className="text-sm text-muted-foreground">{company.slug}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {getSubscriptionBadge(company.subscription)}
                                {!company.isActive && (
                                  <Badge variant="destructive">Inactive</Badge>
                                )}
                              </div>
                            </div>
                            {company.logo && (
                              <img
                                src={company.logo}
                                alt={company.name}
                                className="h-10 w-10 rounded object-cover"
                              />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Company Details */}
        <div className="lg:col-span-2">
          {selectedCompany ? (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="invitations">Invitations</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedCompany.name}</span>
                      <div className="flex gap-2">
                        {getSubscriptionBadge(selectedCompany.subscription)}
                        <Badge variant={selectedCompany.isActive ? "default" : "destructive"}>
                          {selectedCompany.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Company overview and statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {companyStats?.userCount || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {companyStats?.maxUsers || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Max Users</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {Math.round((companyStats?.currentStorage || 0) / 1024 * 100) / 100} GB
                        </div>
                        <div className="text-sm text-muted-foreground">Used Storage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {Math.round((companyStats?.maxStorage || 0) / 1024 * 100) / 100} GB
                        </div>
                        <div className="text-sm text-muted-foreground">Max Storage</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-semibold">Contact Information</Label>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {selectedCompany.email}
                          </div>
                          {selectedCompany.phone && (
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 text-center">📞</span>
                              {selectedCompany.phone}
                            </div>
                          )}
                          {selectedCompany.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {selectedCompany.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold">Company Details</Label>
                        <div className="text-sm space-y-1">
                          <div>Industry: {selectedCompany.industry || "Not specified"}</div>
                          <div>Size: {selectedCompany.size}</div>
                          <div>Created: {new Date(selectedCompany.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Company Users</span>
                      <Button onClick={() => setShowInviteDialog(true)} size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite User
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Last Login</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companyUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No users found. Invite users to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          companyUsers.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.fullName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{getRoleBadge(user.role)}</TableCell>
                              <TableCell>
                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="invitations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Invitations</CardTitle>
                    <CardDescription>
                      Manage user invitations to this company
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Invited By</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companyInvitations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No pending invitations
                            </TableCell>
                          </TableRow>
                        ) : (
                          companyInvitations.map((invitation: CompanyInvitation) => (
                            <TableRow key={invitation.id}>
                              <TableCell className="font-medium">{invitation.email}</TableCell>
                              <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                              <TableCell>
                                {invitation.acceptedAt ? (
                                  <Badge variant="default">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Accepted
                                  </Badge>
                                ) : new Date(invitation.expiresAt) < new Date() ? (
                                  <Badge variant="destructive">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Expired
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>{invitation.invitedBy}</TableCell>
                              <TableCell>{new Date(invitation.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Settings</CardTitle>
                    <CardDescription>
                      Configure company preferences and limits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Under Development</AlertTitle>
                      <AlertDescription>
                        Company settings management is being implemented. This will include subscription management, feature toggles, and administrative controls.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a Company</h3>
                  <p className="text-muted-foreground">
                    Choose a company from the list to view its details and manage users
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Company Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Company</DialogTitle>
            <DialogDescription>
              Add a new company to the multi-tenant system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                placeholder="Enter company name"
                data-testid="input-company-name"
              />
            </div>
            <div>
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                value={newCompany.email}
                onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                placeholder="Enter company email"
                data-testid="input-company-email"
              />
            </div>
            <div>
              <Label htmlFor="company-industry">Industry</Label>
              <Input
                id="company-industry"
                value={newCompany.industry}
                onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                placeholder="Enter industry"
                data-testid="input-company-industry"
              />
            </div>
            <div>
              <Label htmlFor="company-size">Company Size</Label>
              <Select
                value={newCompany.size}
                onValueChange={(value) => setNewCompany({ ...newCompany, size: value })}
              >
                <SelectTrigger data-testid="select-company-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (1-50 employees)</SelectItem>
                  <SelectItem value="medium">Medium (51-250 employees)</SelectItem>
                  <SelectItem value="large">Large (251-1000 employees)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (1000+ employees)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              data-testid="button-cancel-create"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCompany}
              disabled={createCompanyMutation.isPending || !newCompany.name || !newCompany.email}
              data-testid="button-confirm-create"
            >
              {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to join {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={newInvitation.email}
                onChange={(e) => setNewInvitation({ ...newInvitation, email: e.target.value })}
                placeholder="Enter user email"
                data-testid="input-invite-email"
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={newInvitation.role}
                onValueChange={(value) => setNewInvitation({ ...newInvitation, role: value })}
              >
                <SelectTrigger data-testid="select-invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="company_admin">Company Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
              data-testid="button-cancel-invite"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteUser}
              disabled={createInvitationMutation.isPending || !newInvitation.email}
              data-testid="button-send-invite"
            >
              {createInvitationMutation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}