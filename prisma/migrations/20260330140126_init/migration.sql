-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('EXTERNAL', 'PARTNER', 'INTERNAL', 'RELATIONSHIP_MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('PARTNER', 'INTERNAL');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('GA', 'BETA', 'COMING_SOON', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PARTNER', 'INTERNAL');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('READ_DOCS', 'TEST_SANDBOX', 'FULL_PRODUCTION');

-- CreateEnum
CREATE TYPE "ApiKeyEnvironment" AS ENUM ('TEST', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EXTERNAL',
    "orgId" TEXT,
    "authProvider" TEXT NOT NULL DEFAULT 'credentials',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'GA',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "iconUrl" TEXT,
    "interactionTypes" TEXT[],
    "openapiSpecPath" TEXT,
    "currentVersion" TEXT,
    "metadata" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_assignments" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "partnerOrgId" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_product_access" (
    "id" TEXT NOT NULL,
    "partnerOrgId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "grantedBy" TEXT NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'READ_DOCS',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "partner_product_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" VARCHAR(8) NOT NULL,
    "environment" "ApiKeyEnvironment" NOT NULL DEFAULT 'TEST',
    "status" "ApiKeyStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key_scopes" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "api_key_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage_logs" (
    "id" BIGSERIAL NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" VARCHAR(10) NOT NULL,
    "statusCode" SMALLINT NOT NULL,
    "responseTimeMs" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_daily_rollup" (
    "id" BIGSERIAL NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "requestCount" INTEGER NOT NULL,
    "errorCount" INTEGER NOT NULL,
    "avgResponseMs" DECIMAL(65,30) NOT NULL,
    "p95ResponseMs" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "usage_daily_rollup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doc_feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "pagePath" TEXT NOT NULL,
    "productId" TEXT,
    "helpful" BOOLEAN NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doc_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changelogs" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "changelogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_slug_idx" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE INDEX "products_visibility_idx" ON "products"("visibility");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_slug_key" ON "product_categories"("slug");

-- CreateIndex
CREATE INDEX "partner_assignments_managerId_idx" ON "partner_assignments"("managerId");

-- CreateIndex
CREATE INDEX "partner_assignments_partnerOrgId_idx" ON "partner_assignments"("partnerOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "partner_assignments_managerId_partnerOrgId_key" ON "partner_assignments"("managerId", "partnerOrgId");

-- CreateIndex
CREATE INDEX "partner_product_access_partnerOrgId_idx" ON "partner_product_access"("partnerOrgId");

-- CreateIndex
CREATE UNIQUE INDEX "partner_product_access_partnerOrgId_productId_key" ON "partner_product_access"("partnerOrgId", "productId");

-- CreateIndex
CREATE INDEX "api_keys_userId_idx" ON "api_keys"("userId");

-- CreateIndex
CREATE INDEX "api_keys_keyHash_idx" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "api_keys_status_idx" ON "api_keys"("status");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_scopes_apiKeyId_productId_key" ON "api_key_scopes"("apiKeyId", "productId");

-- CreateIndex
CREATE INDEX "api_usage_logs_apiKeyId_timestamp_idx" ON "api_usage_logs"("apiKeyId", "timestamp");

-- CreateIndex
CREATE INDEX "usage_daily_rollup_apiKeyId_productId_date_idx" ON "usage_daily_rollup"("apiKeyId", "productId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "usage_daily_rollup_apiKeyId_productId_date_key" ON "usage_daily_rollup"("apiKeyId", "productId", "date");

-- CreateIndex
CREATE INDEX "doc_feedback_pagePath_idx" ON "doc_feedback"("pagePath");

-- CreateIndex
CREATE INDEX "doc_feedback_productId_idx" ON "doc_feedback"("productId");

-- CreateIndex
CREATE INDEX "changelogs_productId_publishedAt_idx" ON "changelogs"("productId", "publishedAt" DESC);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_assignments" ADD CONSTRAINT "partner_assignments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_assignments" ADD CONSTRAINT "partner_assignments_partnerOrgId_fkey" FOREIGN KEY ("partnerOrgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_product_access" ADD CONSTRAINT "partner_product_access_partnerOrgId_fkey" FOREIGN KEY ("partnerOrgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_product_access" ADD CONSTRAINT "partner_product_access_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_product_access" ADD CONSTRAINT "partner_product_access_grantedBy_fkey" FOREIGN KEY ("grantedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key_scopes" ADD CONSTRAINT "api_key_scopes_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key_scopes" ADD CONSTRAINT "api_key_scopes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage_logs" ADD CONSTRAINT "api_usage_logs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_daily_rollup" ADD CONSTRAINT "usage_daily_rollup_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_daily_rollup" ADD CONSTRAINT "usage_daily_rollup_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doc_feedback" ADD CONSTRAINT "doc_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doc_feedback" ADD CONSTRAINT "doc_feedback_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changelogs" ADD CONSTRAINT "changelogs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changelogs" ADD CONSTRAINT "changelogs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
