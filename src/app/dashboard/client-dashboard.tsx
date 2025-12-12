// app/dashboard/client-dashboard.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Contact } from "@/lib/firebase-contacts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Eye,
  Mail,
  MailOpen,
  MoreVertical,
  Search,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardClientProps {
  contacts: Contact[];
}

export function DashboardClient({ contacts }: DashboardClientProps) {
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Estatísticas
  const stats = {
    total: contacts.length,
    read: contacts.filter((c) => c.read).length,
    unread: contacts.filter((c) => !c.read).length,
  };

  // Filtrar contatos
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.nome.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.subject.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "read" && contact.read) ||
      (filter === "unread" && !contact.read);

    return matchesSearch && matchesFilter;
  });

  // Funções de ação
  const handleAction = async (
    url: string,
    method: string,
    body?: unknown,
    successMessage?: string
  ) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (response.ok) {
        setNotification({
          message: successMessage || "Ação realizada!",
          type: "success",
        });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error("Erro na requisição");
      }
    } catch (error) {
      setNotification({ message: "Erro ao realizar ação", type: "error" });
    }
  };

  const handleMarkAsRead = (contactId: string) => {
    handleAction(
      "/api/contacts/mark-read",
      "POST",
      { contactId },
      "Contato marcado como lido!"
    );
  };

  const handleMarkAsUnread = (contactId: string) => {
    handleAction(
      "/api/contacts/mark-unread",
      "POST",
      { contactId },
      "Contato marcado como não lido!"
    );
  };

  const handleDelete = (contactId: string) => {
    if (!confirm("Tem certeza que deseja excluir este contato?")) return;
    handleAction(
      "/api/contacts/delete",
      "DELETE",
      { contactId },
      "Contato excluído!"
    );
  };

  // Limpar notificação
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      {/* Header com neon */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tighter">
          <span className="text-white">PAINEL</span>
          <span className="ml-3 text-blue-400 neon-text-glow">CONTATOS</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Gerenciamento inteligente de mensagens
        </p>
      </div>

      {/* Estatísticas em cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 aspect-square md:aspect-auto">
        <Card className="bg-gray-900/50 border-gray-800 hover:border-blue-500/30 transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="text-5xl font-bold text-white">{stats.total}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                Total de Contatos
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 hover:border-green-500/30 transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="text-5xl font-bold text-green-400 neon-text-glow">
                {stats.read}
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                Mensagens Lidas
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 hover:border-amber-500/30 transition-all duration-300 hover:scale-[1.02]">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="text-5xl font-bold text-amber-400 neon-text-glow">
                {stats.unread}
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                Pendentes
              </div>
              <div className="w-16 h-1 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de controle */}
      <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
            <Input
              placeholder="Pesquisar contatos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 
                       focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-12 text-lg rounded-xl"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <Button
              onClick={() => setFilter("all")}
              className={`rounded-xl px-6 h-12 ${
                filter === "all"
                  ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-500"
                  : "bg-gray-900/50 text-gray-400 hover:text-white border-gray-700"
              }`}
            >
              Todos
            </Button>
            <Button
              onClick={() => setFilter("unread")}
              className={`rounded-xl px-6 h-12 ${
                filter === "unread"
                  ? "bg-amber-600 text-white hover:bg-amber-700 border-amber-500"
                  : "bg-gray-900/50 text-gray-400 hover:text-white border-gray-700"
              }`}
            >
              <Mail className="mr-2 h-4 w-4" />
              Pendentes
            </Button>
            <Button
              onClick={() => setFilter("read")}
              className={`rounded-xl px-6 h-12 ${
                filter === "read"
                  ? "bg-green-600 text-white hover:bg-green-700 border-green-500"
                  : "bg-gray-900/50 text-gray-400 hover:text-white border-gray-700"
              }`}
            >
              <MailOpen className="mr-2 h-4 w-4" />
              Lidos
            </Button>
          </div>
        </div>
      </div>

      {/* Notificação */}
      {notification && (
        <div
          className={`mb-4 p-4 rounded-xl border backdrop-blur-sm animate-in slide-in-from-top ${
            notification.type === "success"
              ? "bg-green-900/20 text-green-400 border-green-800"
              : "bg-red-900/20 text-red-400 border-red-800"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-900/50">
                <TableHead className="text-blue-400 font-bold text-lg py-4">
                  NOME
                </TableHead>
                <TableHead className="text-blue-400 font-bold text-lg py-4">
                  EMAIL
                </TableHead>
                <TableHead className="text-blue-400 font-bold text-lg py-4">
                  ASSUNTO
                </TableHead>
                <TableHead className="text-blue-400 font-bold text-lg py-4">
                  STATUS
                </TableHead>
                <TableHead className="text-blue-400 font-bold text-lg py-4">
                  DATA
                </TableHead>
                <TableHead className="text-blue-400 font-bold text-lg py-4 text-right">
                  AÇÕES
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="border-gray-800 hover:bg-gray-900/50 transition-colors group"
                >
                  <TableCell className="py-4">
                    <div className="font-medium text-white group-hover:text-blue-300 transition-colors">
                      {contact.nome}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 text-gray-300">
                    {contact.email}
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-gray-300 truncate max-w-[200px]">
                      {contact.subject}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      className={`font-semibold px-3 py-1 rounded-full ${
                        contact.read
                          ? "bg-green-900/30 text-green-400 border border-green-700 neon-text-glow-green"
                          : "bg-amber-900/30 text-amber-400 border border-amber-700 neon-text-glow-amber"
                      }`}
                    >
                      {contact.read ? "✓ LIDO" : "● PENDENTE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-gray-400">
                    {formatDistanceToNow(new Date(contact.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 bg-gray-900/50 hover:bg-gray-800 border border-gray-700"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-gray-900 border-gray-800 backdrop-blur-sm"
                      >
                        <DropdownMenuItem
                          onClick={() => setSelectedContact(contact)}
                          className="text-white hover:bg-gray-800 focus:text-blue-400"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        {contact.read ? (
                          <DropdownMenuItem
                            onClick={() => handleMarkAsUnread(contact.id)}
                            className="text-white hover:bg-gray-800 focus:text-amber-400"
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Marcar como pendente
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleMarkAsRead(contact.id)}
                            className="text-white hover:bg-gray-800 focus:text-green-400"
                          >
                            <MailOpen className="mr-2 h-4 w-4" />
                            Marcar como lido
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-400 hover:bg-red-900/20 focus:text-red-300"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-2xl bg-gray-900/50 border border-gray-800 mb-6">
              <Mail className="h-20 w-20 text-gray-700 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-400 mb-3">
              Nenhum contato encontrado
            </h3>
            <p className="text-gray-600">Tente ajustar sua busca ou filtro</p>
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      <Dialog
        open={!!selectedContact}
        onOpenChange={() => setSelectedContact(null)}
      >
        <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-blue-400">DETALHES DO CONTATO</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Informações completas da mensagem
            </DialogDescription>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-6 py-4">
              {/* Informações principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Nome
                    </h4>
                    <p className="text-lg font-medium text-white bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                      {selectedContact.nome}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Email
                    </h4>
                    <p className="text-lg font-medium text-white bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                      {selectedContact.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedContact.telefone && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                        Telefone
                      </h4>
                      <p className="text-lg font-medium text-white bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        {selectedContact.telefone}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
                      Data
                    </h4>
                    <p className="text-lg font-medium text-white bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                      {formatDistanceToNow(
                        new Date(selectedContact.createdAt),
                        {
                          addSuffix: true,
                          locale: ptBR,
                        }
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assunto e Mensagem */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Assunto
                </h4>
                <p className="text-xl font-bold text-white bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                  {selectedContact.subject}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                  Mensagem
                </h4>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800 max-h-60 overflow-y-auto">
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <Button
                  onClick={() => setSelectedContact(null)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl h-12"
                >
                  Fechar
                </Button>
                {selectedContact.read ? (
                  <Button
                    onClick={() => {
                      handleMarkAsUnread(selectedContact.id);
                      setSelectedContact(null);
                    }}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-12"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Marcar como pendente
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleMarkAsRead(selectedContact.id);
                      setSelectedContact(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl h-12"
                  >
                    <MailOpen className="mr-2 h-4 w-4" />
                    Marcar como lido
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Estilos inline para neon */}
      <style jsx global>{`
        .neon-text-glow {
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.8),
            0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4);
          animation: neon-pulse 2s ease-in-out infinite alternate;
        }

        .neon-text-glow-green {
          text-shadow: 0 0 10px rgba(34, 197, 94, 0.8),
            0 0 20px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.4);
          animation: neon-pulse-green 2s ease-in-out infinite alternate;
        }

        .neon-text-glow-amber {
          text-shadow: 0 0 10px rgba(245, 158, 11, 0.8),
            0 0 20px rgba(245, 158, 11, 0.6), 0 0 30px rgba(245, 158, 11, 0.4);
          animation: neon-pulse-amber 2s ease-in-out infinite alternate;
        }

        @keyframes neon-pulse {
          from {
            text-shadow: 0 0 5px rgba(59, 130, 246, 0.8),
              0 0 10px rgba(59, 130, 246, 0.6), 0 0 15px rgba(59, 130, 246, 0.4);
          }
          to {
            text-shadow: 0 0 10px rgba(59, 130, 246, 0.8),
              0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4),
              0 0 40px rgba(59, 130, 246, 0.2);
          }
        }

        @keyframes neon-pulse-green {
          from {
            text-shadow: 0 0 5px rgba(34, 197, 94, 0.8),
              0 0 10px rgba(34, 197, 94, 0.6), 0 0 15px rgba(34, 197, 94, 0.4);
          }
          to {
            text-shadow: 0 0 10px rgba(34, 197, 94, 0.8),
              0 0 20px rgba(34, 197, 94, 0.6), 0 0 30px rgba(34, 197, 94, 0.4),
              0 0 40px rgba(34, 197, 94, 0.2);
          }
        }

        @keyframes neon-pulse-amber {
          from {
            text-shadow: 0 0 5px rgba(245, 158, 11, 0.8),
              0 0 10px rgba(245, 158, 11, 0.6), 0 0 15px rgba(245, 158, 11, 0.4);
          }
          to {
            text-shadow: 0 0 10px rgba(245, 158, 11, 0.8),
              0 0 20px rgba(245, 158, 11, 0.6), 0 0 30px rgba(245, 158, 11, 0.4),
              0 0 40px rgba(245, 158, 11, 0.2);
          }
        }

        /* Scrollbar personalizada */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.8);
        }
      `}</style>
    </div>
  );
}
