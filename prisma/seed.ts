import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── Product Categories ─────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.productCategory.upsert({
      where: { slug: "payments" },
      update: {},
      create: {
        name: "Payments",
        slug: "payments",
        description: "Payment processing, billing, and financial transaction APIs",
        sortOrder: 1,
      },
    }),
    prisma.productCategory.upsert({
      where: { slug: "messaging" },
      update: {},
      create: {
        name: "Messaging",
        slug: "messaging",
        description: "SMS, email, push notifications, and real-time messaging APIs",
        sortOrder: 2,
      },
    }),
    prisma.productCategory.upsert({
      where: { slug: "identity" },
      update: {},
      create: {
        name: "Identity",
        slug: "identity",
        description: "Authentication, identity verification, and KYC APIs",
        sortOrder: 3,
      },
    }),
    prisma.productCategory.upsert({
      where: { slug: "data-analytics" },
      update: {},
      create: {
        name: "Data & Analytics",
        slug: "data-analytics",
        description: "Data enrichment, analytics, and reporting APIs",
        sortOrder: 4,
      },
    }),
  ]);

  const [payments, messaging, identity, dataAnalytics] = categories;

  // ─── Products ───────────────────────────────────────────────────────────────
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: "payment-gateway" },
      update: {},
      create: {
        slug: "payment-gateway",
        name: "Payment Gateway",
        description: "Accept payments online with support for cards, wallets, and bank transfers.",
        categoryId: payments.id,
        status: "GA",
        visibility: "PUBLIC",
        interactionTypes: ["api", "sdk"],
        currentVersion: "v3.2.0",
        sortOrder: 1,
      },
    }),
    prisma.product.upsert({
      where: { slug: "recurring-billing" },
      update: {},
      create: {
        slug: "recurring-billing",
        name: "Recurring Billing",
        description: "Manage subscriptions, invoices, and recurring payment schedules.",
        categoryId: payments.id,
        status: "GA",
        visibility: "PUBLIC",
        interactionTypes: ["api", "webhook"],
        currentVersion: "v2.1.0",
        sortOrder: 2,
      },
    }),
    prisma.product.upsert({
      where: { slug: "payouts" },
      update: {},
      create: {
        slug: "payouts",
        name: "Payouts",
        description: "Send money to bank accounts, wallets, and cards globally.",
        categoryId: payments.id,
        status: "BETA",
        visibility: "PARTNER",
        interactionTypes: ["api"],
        currentVersion: "v0.9.0",
        sortOrder: 3,
      },
    }),
    prisma.product.upsert({
      where: { slug: "sms-api" },
      update: {},
      create: {
        slug: "sms-api",
        name: "SMS API",
        description: "Send and receive SMS messages globally with delivery tracking.",
        categoryId: messaging.id,
        status: "GA",
        visibility: "PUBLIC",
        interactionTypes: ["api", "webhook"],
        currentVersion: "v4.0.1",
        sortOrder: 1,
      },
    }),
    prisma.product.upsert({
      where: { slug: "email-delivery" },
      update: {},
      create: {
        slug: "email-delivery",
        name: "Email Delivery",
        description: "Transactional and marketing email delivery with analytics.",
        categoryId: messaging.id,
        status: "GA",
        visibility: "PUBLIC",
        interactionTypes: ["api", "sdk"],
        currentVersion: "v2.5.0",
        sortOrder: 2,
      },
    }),
    prisma.product.upsert({
      where: { slug: "push-notifications" },
      update: {},
      create: {
        slug: "push-notifications",
        name: "Push Notifications",
        description: "Send targeted push notifications to mobile and web clients.",
        categoryId: messaging.id,
        status: "COMING_SOON",
        visibility: "INTERNAL",
        interactionTypes: ["api", "sdk"],
        sortOrder: 3,
      },
    }),
    prisma.product.upsert({
      where: { slug: "identity-verification" },
      update: {},
      create: {
        slug: "identity-verification",
        name: "Identity Verification",
        description: "Verify user identities with document checks, biometrics, and liveness detection.",
        categoryId: identity.id,
        status: "GA",
        visibility: "PUBLIC",
        interactionTypes: ["api", "sdk"],
        currentVersion: "v1.8.0",
        sortOrder: 1,
      },
    }),
    prisma.product.upsert({
      where: { slug: "auth-connect" },
      update: {},
      create: {
        slug: "auth-connect",
        name: "Auth Connect",
        description: "Drop-in authentication with SSO, MFA, and social login support.",
        categoryId: identity.id,
        status: "BETA",
        visibility: "PUBLIC",
        interactionTypes: ["sdk", "api"],
        currentVersion: "v0.5.0",
        sortOrder: 2,
      },
    }),
    prisma.product.upsert({
      where: { slug: "data-enrichment" },
      update: {},
      create: {
        slug: "data-enrichment",
        name: "Data Enrichment",
        description: "Enrich user and company profiles with real-time data from multiple sources.",
        categoryId: dataAnalytics.id,
        status: "GA",
        visibility: "PARTNER",
        interactionTypes: ["api"],
        currentVersion: "v1.2.0",
        sortOrder: 1,
      },
    }),
    prisma.product.upsert({
      where: { slug: "usage-analytics" },
      update: {},
      create: {
        slug: "usage-analytics",
        name: "Usage Analytics",
        description: "Track and analyze API usage patterns, errors, and performance metrics.",
        categoryId: dataAnalytics.id,
        status: "DEPRECATED",
        visibility: "INTERNAL",
        interactionTypes: ["api", "cli"],
        currentVersion: "v3.0.0",
        sortOrder: 2,
      },
    }),
  ]);

  // ─── Organizations ──────────────────────────────────────────────────────────
  const partnerOrg = await prisma.organization.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "Acme Corp",
      slug: "acme-corp",
      type: "PARTNER",
      website: "https://acme-corp.example.com",
    },
  });

  const internalOrg = await prisma.organization.upsert({
    where: { slug: "internal-engineering" },
    update: {},
    create: {
      name: "Internal Engineering",
      slug: "internal-engineering",
      type: "INTERNAL",
    },
  });

  // ─── Users ──────────────────────────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "external@example.com" },
      update: {},
      create: {
        email: "external@example.com",
        name: "Alex External",
        role: "EXTERNAL",
        authProvider: "github",
      },
    }),
    prisma.user.upsert({
      where: { email: "partner@acme-corp.example.com" },
      update: {},
      create: {
        email: "partner@acme-corp.example.com",
        name: "Pat Partner",
        role: "PARTNER",
        orgId: partnerOrg.id,
        authProvider: "credentials",
      },
    }),
    prisma.user.upsert({
      where: { email: "internal@company.example.com" },
      update: {},
      create: {
        email: "internal@company.example.com",
        name: "Ines Internal",
        role: "INTERNAL",
        orgId: internalOrg.id,
        authProvider: "sso",
      },
    }),
    prisma.user.upsert({
      where: { email: "rm@company.example.com" },
      update: {},
      create: {
        email: "rm@company.example.com",
        name: "Riley Manager",
        role: "RELATIONSHIP_MANAGER",
        orgId: internalOrg.id,
        authProvider: "sso",
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@company.example.com" },
      update: {},
      create: {
        email: "admin@company.example.com",
        name: "Ada Admin",
        role: "ADMIN",
        orgId: internalOrg.id,
        authProvider: "sso",
      },
    }),
  ]);

  const [, , , rmUser, adminUser] = users;

  // ─── Partner Assignments ────────────────────────────────────────────────────
  await Promise.all([
    prisma.partnerAssignment.upsert({
      where: { managerId_partnerOrgId: { managerId: rmUser.id, partnerOrgId: partnerOrg.id } },
      update: {},
      create: {
        managerId: rmUser.id,
        partnerOrgId: partnerOrg.id,
        status: "ACTIVE",
        notes: "Primary relationship manager for Acme Corp.",
      },
    }),
    prisma.partnerAssignment.upsert({
      where: { managerId_partnerOrgId: { managerId: adminUser.id, partnerOrgId: partnerOrg.id } },
      update: {},
      create: {
        managerId: adminUser.id,
        partnerOrgId: partnerOrg.id,
        status: "ACTIVE",
        notes: "Secondary admin oversight for Acme Corp partnership.",
      },
    }),
  ]);

  // ─── Partner Product Access ─────────────────────────────────────────────────
  const [paymentGateway, recurringBilling, payouts] = products;

  await Promise.all([
    prisma.partnerProductAccess.upsert({
      where: { partnerOrgId_productId: { partnerOrgId: partnerOrg.id, productId: paymentGateway.id } },
      update: {},
      create: {
        partnerOrgId: partnerOrg.id,
        productId: paymentGateway.id,
        grantedBy: rmUser.id,
        accessLevel: "FULL_PRODUCTION",
      },
    }),
    prisma.partnerProductAccess.upsert({
      where: { partnerOrgId_productId: { partnerOrgId: partnerOrg.id, productId: recurringBilling.id } },
      update: {},
      create: {
        partnerOrgId: partnerOrg.id,
        productId: recurringBilling.id,
        grantedBy: rmUser.id,
        accessLevel: "TEST_SANDBOX",
      },
    }),
    prisma.partnerProductAccess.upsert({
      where: { partnerOrgId_productId: { partnerOrgId: partnerOrg.id, productId: payouts.id } },
      update: {},
      create: {
        partnerOrgId: partnerOrg.id,
        productId: payouts.id,
        grantedBy: rmUser.id,
        accessLevel: "READ_DOCS",
      },
    }),
  ]);

  // ─── Changelogs ─────────────────────────────────────────────────────────────
  const smsApi = products[3];
  const identityVerification = products[6];

  await Promise.all([
    prisma.changelog.upsert({
      where: { id: "cl-seed-1" },
      update: {},
      create: {
        id: "cl-seed-1",
        productId: paymentGateway.id,
        version: "v3.2.0",
        title: "Apple Pay and Google Pay support",
        content: "Added native support for Apple Pay and Google Pay as payment methods. Merchants can now accept wallet payments with a single API call.",
        tags: ["feature"],
        publishedAt: new Date("2026-03-15"),
        authorId: rmUser.id,
      },
    }),
    prisma.changelog.upsert({
      where: { id: "cl-seed-2" },
      update: {},
      create: {
        id: "cl-seed-2",
        productId: paymentGateway.id,
        version: "v3.1.0",
        title: "Idempotency key improvements",
        content: "Idempotency keys are now enforced across all write endpoints. Duplicate requests within the TTL window return the original response without side effects.",
        tags: ["bugfix", "breaking"],
        publishedAt: new Date("2026-02-20"),
        authorId: rmUser.id,
      },
    }),
    prisma.changelog.upsert({
      where: { id: "cl-seed-3" },
      update: {},
      create: {
        id: "cl-seed-3",
        productId: smsApi.id,
        version: "v4.0.1",
        title: "Fixed delivery receipt delays",
        content: "Resolved an issue where delivery receipts for certain carriers were delayed by up to 60 seconds. Receipts now arrive within the documented 5-second SLA.",
        tags: ["bugfix"],
        publishedAt: new Date("2026-03-10"),
        authorId: rmUser.id,
      },
    }),
    prisma.changelog.upsert({
      where: { id: "cl-seed-4" },
      update: {},
      create: {
        id: "cl-seed-4",
        productId: identityVerification.id,
        version: "v1.8.0",
        title: "Biometric liveness detection",
        content: "Introduced passive liveness detection for selfie verification. Reduces fraud by detecting photo-of-photo and deepfake attempts without extra user friction.",
        tags: ["feature", "security"],
        publishedAt: new Date("2026-03-01"),
        authorId: rmUser.id,
      },
    }),
    prisma.changelog.upsert({
      where: { id: "cl-seed-5" },
      update: {},
      create: {
        id: "cl-seed-5",
        productId: recurringBilling.id,
        version: "v2.1.0",
        title: "Proration support for plan changes",
        content: "Subscription upgrades and downgrades now automatically calculate prorated amounts. The `proration_behavior` field controls whether to charge immediately or on the next billing cycle.",
        tags: ["feature"],
        publishedAt: new Date("2026-02-28"),
        authorId: rmUser.id,
      },
    }),
  ]);

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
