import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  app.get("/api/device-data/:userId", async (req, res) => {
    const data = await storage.getLatestDeviceData(parseInt(req.params.userId));
    res.json(data);
  });

  app.get("/api/alerts/:userId", async (req, res) => {
    const alerts = await storage.getAlerts(parseInt(req.params.userId));
    res.json(alerts);
  });

  app.post("/api/alerts", async (req, res) => {
    const alert = await storage.createAlert(req.body);
    
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "alert", data: alert }));
      }
    });
    
    res.json(alert);
  });

  app.patch("/api/device-settings/:userId", async (req, res) => {
    const updateSchema = z.object({
      stressThreshold: z.number().optional(),
      shockEnabled: z.boolean().optional()
    });

    const data = updateSchema.parse(req.body);
    const updated = await storage.updateDeviceSettings(parseInt(req.params.userId), data);
    res.json(updated);
  });

  app.post("/api/emergency-contacts/:userId", async (req, res) => {
    const contactSchema = z.object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string()
    });

    const contact = contactSchema.parse(req.body);
    const updated = await storage.addEmergencyContact(parseInt(req.params.userId), contact);
    res.json(updated);
  });

  return httpServer;
}
