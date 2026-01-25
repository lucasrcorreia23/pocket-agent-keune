'use client';

import { Conversation } from '../components/conversation';
import { AuthGuard } from '../components/auth-guard';

function AgentPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <header className="fixed top-0 left-0 right-0 z-20 px-6 py-5">
        <h1 className="text-xl font-semibold text-black tracking-tight text-center font-raleway">
          Perfecting
        </h1>
      </header>

      <div className="min-h-screen flex items-center justify-center px-6">
        <Conversation />
      </div>
    </main>
  );
}

export default function AppPage() {
  return (
    <AuthGuard>
      <AgentPage />
    </AuthGuard>
  );
}
