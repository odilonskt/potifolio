import { LoadingScreen } from "@/components/status/loading-screen";

// Dentro do layout do painel: o cabeçalho continua visível durante o carregamento
export default function Loading() {
  return <LoadingScreen fullScreen={false} />;
}
