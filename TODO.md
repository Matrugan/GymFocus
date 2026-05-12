# TODO - Login não funciona (diagnóstico)

- [ ] Confirmar onde o fluxo trava no AuthContext (getSession / onAuthStateChange / signIn / signUp)
- [ ] Ajustar AuthContext para não depender de update em `profiles` para liberar login (best-effort)
- [ ] Adicionar logs detalhados no AuthContext (erro de setUserOnlineStatus e estados loading/user)
- [ ] Revalidar o ProtectedRoute para não redirecionar por corrida de estado (se necessário)
- [ ] Testar login e registrar console/Network para validar correção

