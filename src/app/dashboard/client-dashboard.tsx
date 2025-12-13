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
  ChevronDown,
  ChevronUp,
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
import { useEffect, useState } from "react";

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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // Verificar se estamos em mobile
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleExpandRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

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
        setExpandedRows((prev) => {
          const newSet = new Set(prev);
          newSet.delete(contactToDelete);
          return newSet;
        });
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

  // Mobile Card View
  const MobileContactCard = ({ contact }: { contact: Contact }) => {
    const isExpanded = expandedRows.has(contact.id);

    return (
      <Card className="border-gray-800 bg-gray-900/50 mb-3">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Badge
                variant={contact.read ? "outline" : "default"}
                className={`
                  ${
                    contact.read
                      ? "bg-green-500/10 text-green-400 border-green-500/30"
                      : "bg-amber-500 text-white"
                  }
                `}
              >
                {contact.read ? (
                  <MailOpen className="h-3.5 w-3.5" />
                ) : (
                  <Mail className="h-3.5 w-3.5" />
                )}
              </Badge>
              <div>
                <p className="font-semibold text-white text-sm">
                  {contact.nome}
                </p>
                <p className="text-xs text-gray-400">{contact.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => toggleExpandRow(contact.id)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Subject and Date */}
          <div className="mb-3">
            <p className="text-white font-medium text-sm mb-1">
              {contact.subject}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {formatRelativeDate(contact.createdAt)}
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
              {/* Message Preview */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Mensagem:</span>
                </div>
                <p className="text-gray-300 text-sm line-clamp-3">
                  {contact.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant={contact.read ? "outline" : "default"}
                  className={`
                    flex-1 text-xs
                    ${
                      contact.read
                        ? "border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }
                  `}
                  onClick={() => handleMarkAsRead(contact.id, contact.read)}
                  disabled={loading === contact.id}
                >
                  {contact.read ? (
                    <EyeOff className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  )}
                  {contact.read ? "Não lido" : "Lido"}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Ver
                    </Button>
                  </DialogTrigger>
                </Dialog>

                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => handleDelete(contact.id)}
                  disabled={loading === contact.id}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      {/* Mobile View */}
      <div className="md:hidden">
        {contacts.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-gray-800/50">
                <Mail className="h-10 w-10 text-gray-500" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-gray-300 font-medium text-base">
                  Nenhum contato encontrado
                </p>
                <p className="text-gray-500 text-sm">
                  Os contatos aparecerão aqui automaticamente
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-lg font-bold text-white">
                Contatos ({contacts.length})
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-gray-800 text-gray-300 text-xs"
              >
                {contacts.length}{" "}
                {contacts.length === 1 ? "contato" : "contatos"}
              </Badge>
            </div>
            {contacts.map((contact) => (
              <MobileContactCard key={contact.id} contact={contact} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="border-b border-gray-800 py-4 px-4 md:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-lg md:text-xl font-bold text-white">
                Contatos Recebidos
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-gray-800 text-gray-300 text-sm"
              >
                {contacts.length}{" "}
                {contacts.length === 1 ? "contato" : "contatos"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] md:h-[500px] lg:h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10">
                  <TableRow className="border-b border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-300 font-semibold py-3 px-3 md:px-4 w-[100px]">
                      Status
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold py-3 px-3 md:px-4">
                      Contato
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold py-3 px-3 md:px-4">
                      Assunto
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold py-3 px-3 md:px-4 w-[140px] lg:w-[180px]">
                      Data
                    </TableHead>
                    <TableHead className="text-gray-300 font-semibold py-3 px-3 md:px-4 text-right w-[180px] lg:w-[200px]">
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
                      `}
                    >
                      <TableCell className="px-3 md:px-4 py-3">
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
                                  <span className="text-xs md:text-sm">
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
                      <TableCell className="px-3 md:px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-blue-500/10">
                              <User className="h-3.5 w-3.5 text-blue-400" />
                            </div>
                            <p className="font-semibold text-white text-sm truncate max-w-[120px] lg:max-w-[150px]">
                              {contact.nome}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 truncate max-w-[120px] lg:max-w-[150px]">
                            {contact.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 md:px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3.5 w-3.5 text-gray-500" />
                          <p className="text-white font-medium text-sm truncate max-w-[150px] lg:max-w-[200px]">
                            {contact.subject}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 md:px-4 py-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-2 text-gray-300">
                                <Clock className="h-3.5 w-3.5 text-gray-500" />
                                <span className="text-xs md:text-sm">
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
                      <TableCell className="px-3 md:px-4 py-3">
                        <div className="flex justify-end gap-1 md:gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant={contact.read ? "outline" : "default"}
                                  className={`
                                    h-7 md:h-8 px-2 md:px-3 gap-1 md:gap-2 transition-all duration-200 text-xs md:text-sm
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
                                    <EyeOff className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                  )}
                                  <span className="hidden lg:inline">
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
                                  className="h-7 md:h-8 px-2 md:px-3 gap-1 md:gap-2 text-xs md:text-sm border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 transition-all duration-200"
                                  onClick={() => handleDelete(contact.id)}
                                  disabled={loading === contact.id}
                                >
                                  <Trash2 className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                  <span className="hidden lg:inline">
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
                                      className="h-7 md:h-8 px-2 md:px-3 gap-1 md:gap-2 text-xs md:text-sm border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 hover:border-purple-500/50 transition-all duration-200"
                                      onClick={() =>
                                        setSelectedContact(contact)
                                      }
                                    >
                                      <Eye className="h-3 w-3 md:h-3.5 md:w-3.5" />
                                      <span className="hidden lg:inline">
                                        Ver
                                      </span>
                                    </Button>
                                  </DialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver detalhes da mensagem</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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
                            <Mail className="h-10 w-10 md:h-12 md:w-12 text-gray-500" />
                          </div>
                          <div className="space-y-2 text-center">
                            <p className="text-gray-300 font-medium text-base md:text-lg">
                              Nenhum contato encontrado
                            </p>
                            <p className="text-gray-500 text-sm md:text-base">
                              Os contatos recebidos aparecerão aqui
                              automaticamente
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
        </Card>
      </div>

      {/* Contact Detail Dialog */}
      <Dialog
        open={!!selectedContact}
        onOpenChange={(open) => !open && setSelectedContact(null)}
      >
        {selectedContact && (
          <DialogContent className="bg-gray-900 border-gray-800 max-w-[95vw] md:max-w-2xl lg:max-w-3xl max-h-[90vh] md:max-h-[80vh]">
            <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6">
              <DialogTitle className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                Mensagem de {selectedContact.nome}
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-sm md:text-base">
                Enviada em {formatDate(selectedContact.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <Separator className="bg-gray-800" />

            <ScrollArea className="px-4 md:px-6 py-4">
              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-400" />
                      <span className="font-medium text-gray-300">
                        Remetente:
                      </span>
                    </div>
                    <p className="text-white font-medium text-sm md:text-base">
                      {selectedContact.nome}
                    </p>
                    <p className="text-gray-400 text-xs md:text-sm">
                      {selectedContact.email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-400" />
                      <span className="font-medium text-gray-300">Status:</span>
                    </div>
                    <Badge
                      variant={selectedContact.read ? "outline" : "default"}
                      className={`
                        ${
                          selectedContact.read
                            ? "bg-green-500/10 text-green-400 border-green-500/30"
                            : "bg-amber-500 text-white"
                        }
                      `}
                    >
                      {selectedContact.read ? "Lido" : "Não lido"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-400" />
                    <span className="font-medium text-gray-300">Assunto:</span>
                  </div>
                  <p className="text-white text-base md:text-lg font-medium">
                    {selectedContact.subject}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-400" />
                    <span className="font-medium text-gray-300">Mensagem:</span>
                  </div>
                  <ScrollArea className="h-[200px] md:h-[300px] rounded-lg border border-gray-800 p-3 md:p-4 bg-gray-900/50">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                      {selectedContact.message}
                    </p>
                  </ScrollArea>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 px-4 md:px-6 pb-4 md:pb-6">
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-initial gap-2 text-xs md:text-sm border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  onClick={() =>
                    handleMarkAsRead(selectedContact.id, selectedContact.read)
                  }
                  disabled={loading === selectedContact.id}
                >
                  {selectedContact.read ? (
                    <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  )}
                  {selectedContact.read ? "Marcar não lido" : "Marcar lido"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-initial gap-2 text-xs md:text-sm border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    setSelectedContact(null);
                    handleDelete(selectedContact.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Deletar
                </Button>
              </div>
              <Button
                onClick={() => setSelectedContact(null)}
                className="w-full sm:w-auto text-xs md:text-sm bg-blue-500 hover:bg-blue-600"
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-[95vw] md:max-w-md">
          <DialogHeader className="px-4 md:px-6 pt-4 md:pt-6">
            <DialogTitle className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-400" />
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm md:text-base">
              Tem certeza que deseja deletar este contato? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 px-4 md:px-6 pb-4 md:pb-6">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="w-full sm:w-auto text-xs md:text-sm border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={loading !== null}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              {loading ? "Deletando..." : "Sim, deletar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
