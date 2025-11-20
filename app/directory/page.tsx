"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { UserDialog } from "../components/user-dialog";
import { UserEditDialog } from "../components/user-edit-dialog";
import { DeleteConfirmationDialog } from "../components/delete-confirmation-dialog";
import { User } from '@/app/actions/schemas';

function fetchUsers(query = "", page = 1, pageSize = 10) {
  return fetch(`/api/people?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`)
    .then((res) => res.json());
}

export default function DirectoryPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchUsers(query, page, pageSize).then((data) => {
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setLoading(false);
    });
  }, [query, page, pageSize]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  };


  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/people/${id}`, { method: "DELETE" });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      // Only do optimistic update after successful deletion
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      setTotal(prevTotal => prevTotal - 1);
    } catch (error) {
      console.error('Delete failed:', error);
      // Show error to user - you could add a toast notification here
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleUserAdded = (newUser: User) => {
    // Optimistic update - add user immediately
    setUsers(prevUsers => [newUser, ...prevUsers]);
    setTotal(prevTotal => prevTotal + 1);
  };

  const handleUserUpdated = (updatedUser: User) => {
    // Optimistic update - update user immediately
    setUsers(prevUsers => prevUsers.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Directory</h1>
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={query}
          onChange={handleSearch}
          className="w-1/3 px-4 py-2 rounded bg-muted text-foreground"
        />
        <UserDialog onUserAdded={handleUserAdded} />
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="min-w-full divide-y divide-muted">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Full Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone Number</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8">No users found.</td></tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.id} className="border-b border-muted">
                    <td className="px-4 py-2">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="px-4 py-2 font-semibold">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.phoneNumber || ""}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <UserEditDialog
                        user={user}
                        onUserUpdated={handleUserUpdated}
                        trigger={
                          <Button variant="ghost" size="icon" aria-label="Edit">
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                        }
                      />
                      <DeleteConfirmationDialog
                        user={user}
                        onConfirm={() => handleDelete(user.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between mt-4">
        <div>
          Show
          <select
            className="mx-2 px-2 py-1 rounded bg-muted text-foreground"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          entries
        </div>
        <div>
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="bg-muted"
          >
            &lt;
          </Button>
          <span className="mx-2">Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= Math.ceil(total / pageSize)}
            onClick={() => setPage(page + 1)}
            className="bg-muted"
          >
            &gt;
          </Button>
        </div>
      </div>
    </div>
  );
}
