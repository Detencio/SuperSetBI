import { randomUUID } from "crypto";
import {
  type Company,
  type InsertCompany,
  type CompanyInvitation,
  type InsertCompanyInvitation,
  type User,
  type InsertUser,
} from "@shared/schema";

// Multi-tenant company management service
export class CompanyService {
  private companies = new Map<string, Company>();
  private companiesBySlug = new Map<string, Company>();
  private invitations = new Map<string, CompanyInvitation>();
  private usersByCompany = new Map<string, User[]>();

  // Company Management
  async createCompany(companyData: InsertCompany): Promise<Company> {
    const id = randomUUID();
    const now = new Date();
    
    const company: Company = {
      id,
      ...companyData,
      createdAt: now,
      updatedAt: now,
    };

    this.companies.set(id, company);
    this.companiesBySlug.set(company.slug, company);
    this.usersByCompany.set(id, []);

    return company;
  }

  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompanyBySlug(slug: string): Promise<Company | undefined> {
    return this.companiesBySlug.get(slug);
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;

    const updated: Company = {
      ...company,
      ...updates,
      updatedAt: new Date(),
    };

    this.companies.set(id, updated);
    
    // Update slug mapping if changed
    if (updates.slug && updates.slug !== company.slug) {
      this.companiesBySlug.delete(company.slug);
      this.companiesBySlug.set(updates.slug, updated);
    }

    return updated;
  }

  async getCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async deactivateCompany(id: string): Promise<void> {
    const company = this.companies.get(id);
    if (company) {
      await this.updateCompany(id, { isActive: false });
    }
  }

  // Company Invitations
  async createInvitation(invitationData: InsertCompanyInvitation): Promise<CompanyInvitation> {
    const id = randomUUID();
    const token = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation: CompanyInvitation = {
      id,
      ...invitationData,
      token,
      expiresAt,
      acceptedAt: null,
      createdAt: now,
    };

    this.invitations.set(token, invitation);
    return invitation;
  }

  async getInvitation(token: string): Promise<CompanyInvitation | undefined> {
    const invitation = this.invitations.get(token);
    if (!invitation) return undefined;

    // Check if expired
    if (invitation.expiresAt < new Date()) {
      return undefined;
    }

    return invitation;
  }

  async acceptInvitation(token: string): Promise<CompanyInvitation | undefined> {
    const invitation = this.invitations.get(token);
    if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
      return undefined;
    }

    const accepted: CompanyInvitation = {
      ...invitation,
      acceptedAt: new Date(),
    };

    this.invitations.set(token, accepted);
    return accepted;
  }

  async getCompanyInvitations(companyId: string): Promise<CompanyInvitation[]> {
    return Array.from(this.invitations.values())
      .filter(inv => inv.companyId === companyId);
  }

  // User Management within Companies
  async addUserToCompany(companyId: string, user: User): Promise<void> {
    const users = this.usersByCompany.get(companyId) || [];
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    this.usersByCompany.set(companyId, users);
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    return this.usersByCompany.get(companyId) || [];
  }

  async removeUserFromCompany(companyId: string, userId: string): Promise<void> {
    const users = this.usersByCompany.get(companyId) || [];
    const filtered = users.filter(u => u.id !== userId);
    this.usersByCompany.set(companyId, filtered);
  }

  // Utility methods
  async validateCompanyAccess(userId: string, companyId: string): Promise<boolean> {
    const users = await this.getUsersByCompany(companyId);
    return users.some(u => u.id === userId && u.isActive);
  }

  async getCompanyStats(companyId: string): Promise<{
    userCount: number;
    isActive: boolean;
    subscription: string;
    maxUsers: number;
    currentStorage: number;
    maxStorage: number;
  }> {
    const company = await this.getCompany(companyId);
    const users = await this.getUsersByCompany(companyId);

    if (!company) {
      throw new Error('Company not found');
    }

    return {
      userCount: users.length,
      isActive: company.isActive,
      subscription: company.subscription,
      maxUsers: company.maxUsers,
      currentStorage: 0, // To be calculated based on actual data
      maxStorage: company.maxStorage,
    };
  }

  // Company Setup Helpers
  async createDefaultCompany(): Promise<Company> {
    return this.createCompany({
      name: "Demo Company",
      slug: "demo-company",
      email: "admin@democompany.com",
      industry: "Technology",
      size: "small",
      subscription: "trial",
      maxUsers: 5,
      maxStorage: 1000,
      isActive: true,
      settings: JSON.stringify({
        timezone: "America/New_York",
        currency: "USD",
        dateFormat: "MM/DD/YYYY",
        features: {
          inventory: true,
          sales: true,
          collections: true,
          analytics: true,
        }
      }),
    });
  }

  async generateSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await this.getCompanyBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}

// Singleton instance
export const companyService = new CompanyService();