// app/dashboard/page.tsx
import { getSession, logoutAction } from "@/app/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAllContacts, getContactsStats } from "@/lib/firebase-contacts";
import {
  Activity,
  BarChart3,
  Calendar,
  ChevronRight,
  Clock,
  Filter,
  LogOut,
  Mail,
  MailOpen,
  MailWarning,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { DashboardClient } from "./client-dashboard";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session.authenticated) {
    redirect("/login");
  }

  const [allContactsResponse, statsResponse] = await Promise.all([
    getAllContacts(),
    getContactsStats(),
  ]);

  const contacts = allContactsResponse.success
    ? allContactsResponse.data || []
    : [];
  const stats = statsResponse.success
    ? statsResponse.data || {
        total: 0,
        read: 0,
        unread: 0,
        percentageChange: 0,
      }
    : {
        total: 0,
        read: 0,
        unread: 0,
        percentageChange: 0,
      };

  const recentContacts = contacts.slice(0, 5);
  const readRate =
    stats.total > 0 ? Math.round((stats.read / stats.total) * 100) : 0;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 p-4 md:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20">
                  <Activity className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                    Painel de Controle
                  </h1>
                  <p className="text-gray-400 mt-1 flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Monitoramento em tempo real dos contatos
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-blue-500/20">
                      <AvatarFallback className="bg-blue-500/10 text-blue-400">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Administrador
                      </p>
                      <p className="text-xs text-gray-500">Sessão ativa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <form action={logoutAction}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      type="submit"
                      size="icon"
                      className="h-10 w-10 border-gray-800 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 bg-gray-900/50"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Sair da conta</p>
                  </TooltipContent>
                </Tooltip>
              </form>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 font-medium">
                      Total de Contatos
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {stats.total}
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-400 border-blue-500/30"
                    >
                      +{stats.percentageChange}%
                    </Badge>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20">
                    <Users className="h-7 w-7 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-green-500/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 font-medium">Lidos</p>
                    <p className="text-3xl font-bold text-green-400">
                      {stats.read}
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-400 border-green-500/30"
                    >
                      {readRate}% do total
                    </Badge>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20">
                    <MailOpen className="h-7 w-7 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 font-medium">
                      Não Lidos
                    </p>
                    <p className="text-3xl font-bold text-amber-400">
                      {stats.unread}
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-amber-500/10 text-amber-400 border-amber-500/30"
                    >
                      Requer atenção
                    </Badge>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20">
                    <MailWarning className="h-7 w-7 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-purple-500/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 font-medium">
                      Taxa de Crescimento
                    </p>
                    <p
                      className={`text-3xl font-bold ${
                        stats.percentageChange >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {stats.percentageChange >= 0 ? "+" : ""}
                      {stats.percentageChange}%
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        stats.percentageChange >= 0
                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                          : "bg-red-500/10 text-red-400 border-red-500/30"
                      }
                    >
                      {stats.percentageChange >= 0 ? "Positivo" : "Negativo"}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20">
                    <TrendingUp className="h-7 w-7 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        {/* Main Content */}
        <Tabs defaultValue="activity" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList className="bg-gray-900/50 border border-gray-800">
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-gray-800"
              >
                <Activity className="h-4 w-4 mr-2" />
                Atividade
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-gray-800"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Análises
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white bg-gray-900/50"
                  >
                    <Filter className="h-4 w-4" />
                    Filtrar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filtrar contatos</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white bg-gray-900/50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Atualizar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Atualizar dados</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Table */}
              <div className="lg:col-span-2">
                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                        <Mail className="h-5 w-5 text-blue-400" />
                        Todos os Contatos
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-gray-800 text-gray-300"
                      >
                        {contacts.length} itens
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-400">
                      Gerencie e visualize todos os contatos recebidos
                    </CardDescription>
                  </CardHeader>
                  <Separator className="bg-gray-800" />
                  <CardContent className="p-0">
                    <DashboardClient contacts={contacts} />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Stats Card */}
                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-400" />
                      Visão Geral
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Métricas e estatísticas
                    </CardDescription>
                  </CardHeader>
                  <Separator className="bg-gray-800" />
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 font-medium">
                          Taxa de Leitura
                        </span>
                        <span className="font-bold text-lg text-white">
                          {readRate}%
                        </span>
                      </div>
                      <Progress
                        value={readRate}
                        className="h-2 bg-gray-800"
                        style={
                          {
                            "--progress-background":
                              "linear-gradient(to right, rgb(59, 130, 246), rgb(168, 85, 247))",
                          } as React.CSSProperties
                        }
                      />
                    </div>

                    <Separator className="bg-gray-800" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-400">
                            Média Diária
                          </span>
                        </div>
                        <span className="font-bold text-lg text-white">
                          {Math.round(stats.total / 30)} contatos
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MailOpen className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-400">
                            Tempo Médio de Resposta
                          </span>
                        </div>
                        <span className="font-bold text-lg text-white">
                          24h
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Contacts */}
                <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-400" />
                      Contatos Recentes
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Últimas 5 mensagens recebidas
                    </CardDescription>
                  </CardHeader>
                  <Separator className="bg-gray-800" />
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {recentContacts.map((contact, index) => (
                        <div
                          key={contact.id}
                          className="group p-3 rounded-lg border border-gray-800 hover:border-blue-500/30 hover:bg-gray-800/30 transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg ${
                                  contact.read
                                    ? "bg-green-500/10"
                                    : "bg-amber-500/10"
                                }`}
                              >
                                {contact.read ? (
                                  <MailOpen className="h-4 w-4 text-green-400" />
                                ) : (
                                  <Mail className="h-4 w-4 text-amber-400" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-white group-hover:text-blue-400 transition-colors">
                                    {contact.nome}
                                  </p>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      contact.read
                                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                    }`}
                                  >
                                    {contact.read ? "Lido" : "Novo"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-400 truncate max-w-[180px]">
                                  {contact.subject}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {new Date(
                                    contact.createdAt
                                  ).toLocaleDateString("pt-BR")}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                          </div>
                        </div>
                      ))}

                      {recentContacts.length === 0 && (
                        <div className="text-center py-6 space-y-2">
                          <MessageSquare className="h-8 w-8 text-gray-500 mx-auto" />
                          <p className="text-gray-400">
                            Nenhum contato recente
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">
                  Análises Detalhadas
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Estatísticas avançadas e insights
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12 space-y-4">
                  <BarChart3 className="h-16 w-16 text-gray-500 mx-auto" />
                  <h3 className="text-xl font-medium text-gray-300">
                    Análises em Desenvolvimento
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Estamos trabalhando em análises mais detalhadas e gráficos
                    interativos. Em breve você terá acesso a insights avançados
                    sobre seus contatos.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Sistema operacional</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{contacts.length} contatos processados</span>
              <span>•</span>
              <span>
                Última atualização: {new Date().toLocaleTimeString("pt-BR")}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
