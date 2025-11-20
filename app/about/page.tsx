'use client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import React from 'react'

function ProjectOverview() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Project Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Person Search is a modern full-stack web application built with Next.js 15 (App Router), React, and TypeScript. The UI leverages the shadcn/ui component library and Tailwind CSS for rapid, accessible design. Authentication is handled via Google OAuth 2.1, with secure session management and protected API routes. Data is managed using Prisma ORM, connecting to a PostgreSQL database. The app is deployed on Vercel for scalable, serverless hosting.
        </p>
        <p className="mb-4">
          <strong>Technology Stack:</strong>
          <ul className="list-disc ml-6">
            <li>Next.js 15 (App Router)</li>
            <li>React 18 + TypeScript</li>
            <li>shadcn/ui & Tailwind CSS</li>
            <li>Prisma ORM</li>
            <li>PostgreSQL</li>
            <li>Google OAuth 2.1</li>
            <li>Vercel (hosting & serverless functions)</li>
          </ul>
        </p>
        <p>
          <strong>Key Features:</strong>
          <ul className="list-disc ml-6">
            <li>Secure Google authentication</li>
            <li>Person search and management UI</li>
            <li>Modern, responsive design</li>
            <li>API endpoints for MCP and people data</li>
          </ul>
        </p>
      </CardContent>
    </Card>
  )
}

function AuthSetupDoc() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Authentication Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Person Search uses Google OAuth 2.1 for secure authentication. Only Google accounts are supported; no email/password or other providers are enabled.</p>
        <ul className="list-disc ml-6 mb-4">
          <li>OAuth flow is initiated from the login page using the Google OAuth endpoint.</li>
          <li>Session management is handled via secure cookies and server-side validation.</li>
          <li>Environment variables required:
            <ul className="list-disc ml-6">
              <li><code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code></li>
              <li><code>GOOGLE_CLIENT_SECRET</code></li>
            </ul>
          </li>
          <li>Callback URL: <code>/api/auth/callback/google</code></li>
        </ul>
        <p>See <code>lib/auth.ts</code> and <code>app/api/auth</code> for implementation details.</p>
      </CardContent>
    </Card>
  )
}

function SecurityDoc() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Security Features</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc ml-6 mb-4">
          <li>All sensitive API routes (e.g., <code>/api/mcp</code>, <code>/api/people</code>) are protected by authentication middleware.</li>
          <li>Session tokens are validated on every request.</li>
          <li>Google OAuth tokens are verified server-side.</li>
          <li>Prisma ORM enforces unique constraints and type safety.</li>
          <li>Environment variables and secrets are never exposed to the client.</li>
          <li>Production deployment uses HTTPS (Vercel).</li>
        </ul>
        <p>See <code>lib/auth.ts</code> and <code>app/api</code> for protected route logic.</p>
      </CardContent>
    </Card>
  )
}

export default function AboutPage() {
  const [tab, setTab] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (pathname === '/auth-setup') return 'auth';
      if (pathname === '/security') return 'security';
    }
    return 'about';
  });

  const handleTabChange = (value: string) => {
    setTab(value);
    if (value === 'auth') {
      window.history.replaceState(null, '', '/auth-setup');
    } else if (value === 'security') {
      window.history.replaceState(null, '', '/security');
    } else {
      window.history.replaceState(null, '', '/about');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">About Person Search</h1>
        <Tabs value={tab} onValueChange={handleTabChange} className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="auth">Authentication Setup</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="about"><ProjectOverview /></TabsContent>
          <TabsContent value="auth"><AuthSetupDoc /></TabsContent>
          <TabsContent value="security"><SecurityDoc /></TabsContent>
        </Tabs>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">
            Back to Home
          </Link>
        </Button>
      </main>
    </div>
  )
}

