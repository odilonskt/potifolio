// app/dashboard/page.tsx
import { getSession, logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllContacts, getContactsStats } from "@/lib/firebase-contacts";
import {
  ChevronRight,
  Filter,
  LogOut,
  Mail,
  MailOpen,
  MailWarning,
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

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Painel de Controle
            </h1>
            <p className="text-gray-400 mt-2">
              Monitoramento dos contatos recebidos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center text-white bg-gray-900 px-5 py-2.5 rounded-xl border border-gray-800">
              <div className="p-1.5 rounded-lg bg-blue-500/20 mr-3">
                <User className="h-4 w-4 text-blue-400" />
              </div>
              <span className="font-semibold">Administrador</span>
            </div>
            <form action={logoutAction}>
              <Button
                variant="outline"
                type="submit"
                className="gap-2 rounded-xl border-gray-800 text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 bg-transparent"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </form>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Users className="h-7 w-7 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Lidos</p>
                <p className="text-3xl font-bold text-green-400">
                  {stats.read}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <MailOpen className="h-7 w-7 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Não Lidos</p>
                <p className="text-3xl font-bold text-amber-400">
                  {stats.unread}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10">
                <MailWarning className="h-7 w-7 text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-5 rounded-2xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Taxa</p>
                <p
                  className={`text-3xl font-bold ${
                    stats.percentageChange > 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {stats.percentageChange > 0 ? "+" : ""}
                  {stats.percentageChange}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <TrendingUp className="h-7 w-7 text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-800 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800 pb-4">
              <CardTitle className="text-2xl font-bold text-white">
                Atividade Recente
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-lg border-gray-800 text-white hover:bg-gray-800 bg-transparent"
                >
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-lg border-gray-800 text-white hover:bg-gray-800 bg-transparent"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DashboardClient contacts={contacts} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card className="bg-gray-900 border-gray-800 rounded-2xl">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-xl font-bold text-white">
                Visão Geral
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Taxa de Leitura</span>
                  <span className="font-bold text-lg text-white">
                    {stats.total > 0
                      ? Math.round((stats.read / stats.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                    style={{
                      width: `${
                        stats.total > 0 ? (stats.read / stats.total) * 100 : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <span className="text-sm text-gray-400">Média Diária</span>
                  <span className="font-bold text-lg text-white">
                    {Math.round(stats.total / 30)} contatos
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Contacts */}
          <Card className="bg-gray-900 border-gray-800 rounded-2xl">
            <CardHeader className="border-b border-gray-800">
              <CardTitle className="text-xl font-bold text-white">
                Contatos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-800 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          contact.read
                            ? "bg-green-500/10 text-green-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {contact.read ? (
                          <MailOpen className="h-4 w-4" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-white">
                          {contact.nome}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[160px]">
                          {contact.subject}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
