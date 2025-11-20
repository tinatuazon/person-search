import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Twitter } from 'lucide-react'

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

function SocialLinks() {
  return (
    <div className="flex flex-wrap gap-4">
      <Button asChild>
        <Link href="https://www.linkedin.com/in/callumbir/" target="_blank" rel="noopener noreferrer">
          <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="https://github.com/gocallum" target="_blank" rel="noopener noreferrer">
          <Github className="mr-2 h-4 w-4" /> GitHub
        </Link>
      </Button>
      <Button asChild variant="secondary">
        <Link href="https://x.com/callumbir">
          <Twitter className="mr-2 h-4 w-4" /> Contact Me
        </Link>
      </Button>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">About Person Search</h1>
        <ProjectOverview />
        <Button asChild variant="link" className="mt-4">
          <Link href="/">
            Back to Home
          </Link>
        </Button>
      </main>
    </div>
  )
}

