import type { Express } from "express";
import { z } from "zod";
import { companyService } from "./company-service";
import { insertCompanySchema, insertCompanyInvitationSchema } from "@shared/schema";

export function registerCompanyRoutes(app: Express) {
  // Company CRUD operations
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await companyService.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await companyService.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ error: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      
      // Generate slug if not provided
      if (!validatedData.slug) {
        validatedData.slug = await companyService.generateSlug(validatedData.name);
      }

      // Check if slug already exists
      const existingCompany = await companyService.getCompanyBySlug(validatedData.slug);
      if (existingCompany) {
        return res.status(400).json({ error: "Company slug already exists" });
      }

      const company = await companyService.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create company" });
    }
  });

  app.put("/api/companies/:id", async (req, res) => {
    try {
      const updates = req.body;
      
      // If updating slug, check for uniqueness
      if (updates.slug) {
        const existingCompany = await companyService.getCompanyBySlug(updates.slug);
        if (existingCompany && existingCompany.id !== req.params.id) {
          return res.status(400).json({ error: "Company slug already exists" });
        }
      }

      const company = await companyService.updateCompany(req.params.id, updates);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ error: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      await companyService.deactivateCompany(req.params.id);
      res.json({ message: "Company deactivated successfully" });
    } catch (error) {
      console.error("Error deactivating company:", error);
      res.status(500).json({ error: "Failed to deactivate company" });
    }
  });

  // Company statistics
  app.get("/api/companies/:id/stats", async (req, res) => {
    try {
      const stats = await companyService.getCompanyStats(req.params.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching company stats:", error);
      res.status(500).json({ error: "Failed to fetch company stats" });
    }
  });

  // Company users
  app.get("/api/companies/:id/users", async (req, res) => {
    try {
      const users = await companyService.getUsersByCompany(req.params.id);
      res.json(users);
    } catch (error) {
      console.error("Error fetching company users:", error);
      res.status(500).json({ error: "Failed to fetch company users" });
    }
  });

  // Company invitations
  app.get("/api/companies/:id/invitations", async (req, res) => {
    try {
      const invitations = await companyService.getCompanyInvitations(req.params.id);
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ error: "Failed to fetch invitations" });
    }
  });

  app.post("/api/companies/:id/invitations", async (req, res) => {
    try {
      const companyId = req.params.id;
      const invitationData = {
        ...req.body,
        companyId,
        invitedBy: req.body.invitedBy || "system", // TODO: Get from authenticated user
      };

      const validatedData = insertCompanyInvitationSchema.parse(invitationData);
      const invitation = await companyService.createInvitation(validatedData);
      
      res.status(201).json(invitation);
    } catch (error) {
      console.error("Error creating invitation:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create invitation" });
    }
  });

  // Accept invitation
  app.post("/api/invitations/:token/accept", async (req, res) => {
    try {
      const invitation = await companyService.acceptInvitation(req.params.token);
      if (!invitation) {
        return res.status(404).json({ error: "Invalid or expired invitation" });
      }
      res.json({ message: "Invitation accepted successfully", invitation });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  });

  // Get invitation details
  app.get("/api/invitations/:token", async (req, res) => {
    try {
      const invitation = await companyService.getInvitation(req.params.token);
      if (!invitation) {
        return res.status(404).json({ error: "Invalid or expired invitation" });
      }
      
      // Get company details
      const company = await companyService.getCompany(invitation.companyId);
      
      res.json({
        invitation,
        company: company ? {
          id: company.id,
          name: company.name,
          logo: company.logo,
        } : null,
      });
    } catch (error) {
      console.error("Error fetching invitation:", error);
      res.status(500).json({ error: "Failed to fetch invitation" });
    }
  });

  // Company slug validation
  app.get("/api/companies/validate-slug/:slug", async (req, res) => {
    try {
      const company = await companyService.getCompanyBySlug(req.params.slug);
      res.json({ available: !company });
    } catch (error) {
      console.error("Error validating slug:", error);
      res.status(500).json({ error: "Failed to validate slug" });
    }
  });

  // Company switching/selection
  app.post("/api/companies/:id/select", async (req, res) => {
    try {
      const companyId = req.params.id;
      const userId = req.body.userId; // TODO: Get from authenticated session
      
      const hasAccess = await companyService.validateCompanyAccess(userId, companyId);
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this company" });
      }

      const company = await companyService.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      // TODO: Set company context in user session
      res.json({ message: "Company selected successfully", company });
    } catch (error) {
      console.error("Error selecting company:", error);
      res.status(500).json({ error: "Failed to select company" });
    }
  });

  // Create demo company for development
  app.post("/api/companies/demo", async (req, res) => {
    try {
      const demoCompany = await companyService.createDefaultCompany();
      res.status(201).json(demoCompany);
    } catch (error) {
      console.error("Error creating demo company:", error);
      res.status(500).json({ error: "Failed to create demo company" });
    }
  });
}