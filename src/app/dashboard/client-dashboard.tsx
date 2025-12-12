// app/dashboard/client-dashboard.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  Mail,
  MailOpen,
  MessageSquare,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

interface Contact {
  id: string;
  nome: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface DashboardClientProps {
  contacts: Contact[];
}

export function DashboardClient({
  contacts: initialContacts,
}: DashboardClientProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setContactToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!contactToDelete) return;

    setLoading(contactToDelete);
    try {
      const response = await fetch(`/api/contact?id=${contactToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setContacts((prev) =>
          prev.filter((contact) => contact.id !== contactToDelete)
        );
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error("Erro ao deletar contato:", error);
    } finally {
      setLoading(null);
      setDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    setLoading(id);
    try {
      const action = isRead ? "mark-unread" : "mark-read";
      const response = await fetch(`/api/contact?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === id ? { ...contact, read: !isRead } : contact
          )
        );
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    } finally {
      setLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return "Data inválida";
    }
  };

  const formatRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

      if (diffInHours < 24) {
        return format(date, "'Hoje às' HH:mm", { locale: ptBR });
      } else if (diffInHours < 48) {
        return format(date, "'Ontem às' HH:mm", { locale: ptBR });
      } else {
        return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      }
    } catch {
      return "Data inválida";
    }
  };

  return (
    <Card className="border-gray-800 bg-gray-900">
      <CardHeader className="border-b border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-white">
            Contatos Recebidos
          </CardTitle>
          <Badge variant="secondary" className="bg-gray-800 text-gray-300">
            {contacts.length} {contacts.length === 1 ? "contato" : "contatos"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
              <TableRow className="border-b border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-300 font-semibold py-4 w-[100px]">
                  Status
                </TableHead>
                <TableHead className="text-gray-300 font-semibold py-4">
                  Contato
                </TableHead>
                <TableHead className="text-gray-300 font-semibold py-4">
                  Assunto
                </TableHead>
                <TableHead className="text-gray-300 font-semibold py-4 w-[180px]">
                  Data
                </TableHead>
                <TableHead className="text-gray-300 font-semibold py-4 text-right w-[200px]">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className={`
                    border-b border-gray-800 transition-all duration-200
                    ${contact.read ? "bg-gray-900/30" : "bg-gray-900/60"}
                    hover:bg-gray-800/50
                    ${
                      expandedRow === contact.id
                        ? "border-l-4 border-l-blue-500"
                        : ""
                    }
                  `}
                >
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant={contact.read ? "outline" : "default"}
                            className={`
                              ${
                                contact.read
                                  ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                                  : "bg-amber-500 text-white hover:bg-amber-600"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2">
                              {contact.read ? (
                                <MailOpen className="h-3.5 w-3.5" />
                              ) : (
                                <Mail className="h-3.5 w-3.5" />
                              )}
                              <span className="hidden sm:inline">
                                {contact.read ? "Lido" : "Não lido"}
                              </span>
                            </div>
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {contact.read
                              ? "Mensagem lida"
                              : "Mensagem não lida"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-blue-500/10">
                          <User className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                        <p className="font-semibold text-white truncate max-w-[150px]">
                          {contact.nome}
                        </p>
                      </div>
                      <p className="text-sm text-gray-400 truncate max-w-[150px]">
                        {contact.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-gray-500" />
                      <p className="text-white font-medium truncate max-w-[200px]">
                        {contact.subject}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">
                              {formatRelativeDate(contact.createdAt)}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{formatDate(contact.createdAt)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant={contact.read ? "outline" : "default"}
                              className={`
                                h-8 px-3 gap-2 transition-all duration-200
                                ${
                                  contact.read
                                    ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 bg-transparent"
                                    : "bg-green-500 hover:bg-green-600 text-white"
                                }
                              `}
                              onClick={() =>
                                handleMarkAsRead(contact.id, contact.read)
                              }
                              disabled={loading === contact.id}
                            >
                              {contact.read ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5" />
                              )}
                              <span className="hidden sm:inline">
                                {loading === contact.id
                                  ? "..."
                                  : contact.read
                                  ? "Não lido"
                                  : "Lido"}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {contact.read
                                ? "Marcar como não lido"
                                : "Marcar como lido"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 transition-all duration-200"
                              onClick={() => handleDelete(contact.id)}
                              disabled={loading === contact.id}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">
                                {loading === contact.id ? "..." : "Deletar"}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Deletar contato</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Dialog>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3 gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/50 transition-all duration-200"
                                  onClick={() => setSelectedContact(contact)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Ver</span>
                                </Button>
                              </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver detalhes da mensagem</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {selectedContact?.id === contact.id && (
                          <DialogContent className="bg-gray-900 border-gray-800 max-w-3xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-400" />
                                Mensagem de {contact.nome}
                              </DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Enviada em {formatDate(contact.createdAt)}
                              </DialogDescription>
                            </DialogHeader>

                            <Separator className="bg-gray-800" />

                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-blue-400" />
                                    <span className="font-medium text-gray-300">
                                      Remetente:
                                    </span>
                                  </div>
                                  <p className="text-white font-medium">
                                    {contact.nome}
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    {contact.email}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Info className="h-4 w-4 text-purple-400" />
                                    <span className="font-medium text-gray-300">
                                      Status:
                                    </span>
                                  </div>
                                  <Badge
                                    variant={
                                      contact.read ? "outline" : "default"
                                    }
                                    className={`
                                      ${
                                        contact.read
                                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                                          : "bg-amber-500 text-white"
                                      }
                                    `}
                                  >
                                    {contact.read ? "Lido" : "Não lido"}
                                  </Badge>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <ExternalLink className="h-4 w-4 text-amber-400" />
                                  <span className="font-medium text-gray-300">
                                    Assunto:
                                  </span>
                                </div>
                                <p className="text-white text-lg font-medium">
                                  {contact.subject}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <MessageSquare className="h-4 w-4 text-green-400" />
                                  <span className="font-medium text-gray-300">
                                    Mensagem:
                                  </span>
                                </div>
                                <ScrollArea className="h-[300px] rounded-lg border border-gray-800 p-4 bg-gray-900/50">
                                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {contact.message}
                                  </p>
                                </ScrollArea>
                              </div>
                            </div>

                            <DialogFooter className="flex justify-between">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                                  onClick={() =>
                                    handleMarkAsRead(contact.id, contact.read)
                                  }
                                  disabled={loading === contact.id}
                                >
                                  {contact.read ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                  {contact.read
                                    ? "Marcar não lido"
                                    : "Marcar lido"}
                                </Button>
                                <Button
                                  variant="outline"
                                  className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                  onClick={() => {
                                    setSelectedContact(null);
                                    handleDelete(contact.id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Deletar
                                </Button>
                              </div>
                              <Button
                                onClick={() => setSelectedContact(null)}
                                className="bg-blue-500 hover:bg-blue-600"
                              >
                                Fechar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        )}
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {contacts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="p-4 rounded-full bg-gray-800/50">
                        <Mail className="h-12 w-12 text-gray-500" />
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-gray-300 font-medium text-lg">
                          Nenhum contato encontrado
                        </p>
                        <p className="text-gray-500 text-sm">
                          Os contatos recebidos aparecerão aqui automaticamente
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja deletar este contato? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading !== null}
            >
              {loading ? "Deletando..." : "Sim, deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
