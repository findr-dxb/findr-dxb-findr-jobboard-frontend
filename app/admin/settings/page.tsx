"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function AdminSettingsPage() {
  const [maintenance, setMaintenance] = useState(false)
  const [supportEmail, setSupportEmail] = useState("support@findr.example")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Platform</CardTitle>
          <CardDescription>Global configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Maintenance Mode</div>
              <div className="text-sm text-gray-600">Temporarily disable user access</div>
            </div>
            <Switch checked={maintenance} onCheckedChange={setMaintenance} />
          </div>
          <div>
            <div className="font-medium mb-1">Support Email</div>
            <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


