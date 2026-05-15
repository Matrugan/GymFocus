import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "gymfocus-language";

const translations = {
  en: {
    "app.loading": "Loading GymFocus...",
    "brand.tagline": "Social Fitness Network",
    "auth.backHome": "Back to Home",
    "auth.loginSubtitle": "Sign in to your account",
    "auth.signupSubtitle": "Create your account",
    "auth.login": "Login",
    "auth.createAccount": "Create Account",
    "auth.createAccountShort": "Create account",
    "auth.alreadyHaveAccount": "Already have an account?",
    "common.cancel": "Cancel",
    "common.close": "Close",
    "common.create": "Create",
    "common.manage": "Manage",
    "common.save": "Save",
    "common.search": "Search",
    "common.active": "Active",
    "common.archived": "Archived",
    "common.loading": "Loading...",
    "dashboard.welcomeBack": "Welcome back",
    "dashboard.nav.dashboard": "Dashboard",
    "dashboard.nav.workouts": "Workouts",
    "dashboard.nav.progress": "Progress",
    "dashboard.nav.rankings": "Rankings",
    "dashboard.nav.feed": "Feed",
    "dashboard.nav.challenges": "Challenges",
    "dashboard.nav.settings": "Settings",
    "dashboard.logout": "Logout",
    "dashboard.stats.streak": "Streak",
    "dashboard.stats.currentStreak": "Current Streak",
    "dashboard.stats.xp": "XP",
    "dashboard.stats.totalXp": "Total XP",
    "dashboard.stats.workout": "Workout",
    "dashboard.stats.currentWorkout": "Current Workout",
    "dashboard.workout.start": "Start",
    "dashboard.workout.empty": "Empty",
    "dashboard.workout.addExercises": "Add exercises",
    "home.login": "Login",
    "home.badge": "Social fitness network",
    "home.start": "Start free",
    "home.heroTitle": "Train. Share. Level up.",
    "home.heroCopy":
      "GymFocus turns your fitness journey into a social game. Complete workouts, earn XP and stay consistent with your community.",
    "home.cta": "Enter GymFocus",
    "home.footer": "GymFocus - Fitness, gamification and community.",
    "language.english": "English",
    "language.portuguese": "Portuguese",
    "language.switchTo": "Switch language",
    "theme.light": "Switch to light mode",
    "theme.dark": "Switch to dark mode",
    "workout.title": "Workouts",
    "workout.doneToday": "Done today: {{workout}}.",
    "workout.continueWith": "Continue with {{workout}}.",
    "workout.createFirst": "Create your first workout plan.",
    "workout.templates": "Templates",
    "workout.closeTemplates": "Close templates",
    "workout.newWorkout": "New workout",
    "workout.createPlan": "Create workout plan",
    "workout.planName": "Workout name",
    "workout.planDescription": "Description",
    "workout.plansTitle": "Your workout plans",
    "workout.plansDescription":
      "Active plans are for today's workout. Archived plans stay here for reference.",
    "workout.noArchivedPlans": "No archived plans yet.",
    "workout.noActivePlans": "No active plans yet.",
    "workout.editPlan": "Edit workout plan",
    "workout.restorePlan": "Restore workout plan",
    "workout.archivePlan": "Archive workout plan",
    "analytics.title": "Progress Analytics",
    "analytics.subtitle":
      "Track XP, workout duration, exercise evolution, records and progression.",
    "profile.settings": "Profile Settings",
    "challenges.title": "Fitness Challenges",
    "feed.forYou": "For you",
    "feed.following": "Following",
  },
  pt: {
    "app.loading": "Carregando GymFocus...",
    "brand.tagline": "Rede Social Fitness",
    "auth.backHome": "Voltar ao inicio",
    "auth.loginSubtitle": "Entre na sua conta",
    "auth.signupSubtitle": "Crie sua conta",
    "auth.login": "Entrar",
    "auth.createAccount": "Criar conta",
    "auth.createAccountShort": "Criar conta",
    "auth.alreadyHaveAccount": "Ja possui conta?",
    "common.cancel": "Cancelar",
    "common.close": "Fechar",
    "common.create": "Criar",
    "common.manage": "Gerenciar",
    "common.save": "Salvar",
    "common.search": "Buscar",
    "common.active": "Ativos",
    "common.archived": "Arquivados",
    "common.loading": "Carregando...",
    "dashboard.welcomeBack": "Bem-vindo de volta",
    "dashboard.nav.dashboard": "Painel",
    "dashboard.nav.workouts": "Treinos",
    "dashboard.nav.progress": "Progresso",
    "dashboard.nav.rankings": "Rankings",
    "dashboard.nav.feed": "Feed",
    "dashboard.nav.challenges": "Desafios",
    "dashboard.nav.settings": "Configuracoes",
    "dashboard.logout": "Sair",
    "dashboard.stats.streak": "Sequencia",
    "dashboard.stats.currentStreak": "Sequencia atual",
    "dashboard.stats.xp": "XP",
    "dashboard.stats.totalXp": "XP total",
    "dashboard.stats.workout": "Treino",
    "dashboard.stats.currentWorkout": "Treino atual",
    "dashboard.workout.start": "Comecar",
    "dashboard.workout.empty": "Vazio",
    "dashboard.workout.addExercises": "Adicionar exercicios",
    "home.login": "Entrar",
    "home.badge": "Rede social fitness",
    "home.start": "Comecar gratis",
    "home.heroTitle": "Treine. Compartilhe. Evolua.",
    "home.heroCopy":
      "GymFocus transforma sua jornada fitness em uma experiencia social. Complete treinos, ganhe XP e mantenha consistencia com sua comunidade.",
    "home.cta": "Entrar no GymFocus",
    "home.footer": "GymFocus - Fitness, gamificacao e comunidade.",
    "language.english": "Ingles",
    "language.portuguese": "Portugues",
    "language.switchTo": "Trocar idioma",
    "theme.light": "Mudar para tema claro",
    "theme.dark": "Mudar para tema escuro",
    "workout.title": "Treinos",
    "workout.doneToday": "Concluido hoje: {{workout}}.",
    "workout.continueWith": "Continue com {{workout}}.",
    "workout.createFirst": "Crie seu primeiro plano de treino.",
    "workout.templates": "Modelos",
    "workout.closeTemplates": "Fechar modelos",
    "workout.newWorkout": "Novo treino",
    "workout.createPlan": "Criar plano de treino",
    "workout.planName": "Nome do treino",
    "workout.planDescription": "Descricao",
    "workout.plansTitle": "Seus planos de treino",
    "workout.plansDescription":
      "Planos ativos sao para treinar hoje. Planos arquivados ficam aqui como referencia.",
    "workout.noArchivedPlans": "Nenhum plano arquivado ainda.",
    "workout.noActivePlans": "Nenhum plano ativo ainda.",
    "workout.editPlan": "Editar plano de treino",
    "workout.restorePlan": "Restaurar plano de treino",
    "workout.archivePlan": "Arquivar plano de treino",
    "analytics.title": "Analise de progresso",
    "analytics.subtitle":
      "Acompanhe XP, duracao dos treinos, evolucao por exercicio, recordes e progressao.",
    "profile.settings": "Configuracoes do perfil",
    "challenges.title": "Desafios fitness",
    "feed.forYou": "Para voce",
    "feed.following": "Seguindo",
  },
};

const uiPhrases = [
  ["Back to Home", "Voltar ao inicio"],
  ["Back", "Voltar"],
  ["Login", "Entrar"],
  ["Create Account", "Criar conta"],
  ["Create account", "Criar conta"],
  ["Already have an account?", "Ja possui conta?"],
  ["Loading...", "Carregando..."],
  ["Dashboard", "Painel"],
  ["Workouts", "Treinos"],
  ["Workout", "Treino"],
  ["Training", "Treino"],
  ["Workout A", "Treino A"],
  ["Workout B", "Treino B"],
  ["Workout C", "Treino C"],
  ["Workout D", "Treino D"],
  ["Workout E", "Treino E"],
  ["Upper body", "Superiores"],
  ["Lower body and Abs", "Inferiores e Abdomen"],
  ["Chest, Shoulders and Triceps", "Peito, Ombros e Triceps"],
  ["Chest, Shoulders and Triceps", "Peito, Ombros e Tríceps"],
  ["Back and Biceps", "Costas e Biceps"],
  ["Back and Biceps", "Costas e Bíceps"],
  ["Legs and Abs", "Pernas e Abdomen"],
  ["Legs and Abs", "Pernas e Abdômen"],
  ["Chest and Triceps", "Peito e Triceps"],
  ["Chest and Triceps", "Peito e Tríceps"],
  ["Back, Traps and Biceps", "Costas, Trapezio e Biceps"],
  ["Back, Traps and Biceps", "Costas, Trapézio e Bíceps"],
  ["Full legs", "Pernas completas"],
  ["Chest", "Peito"],
  ["Back", "Costas"],
  ["Legs", "Pernas"],
  ["Shoulders", "Ombros"],
  ["Shoulders and Abs", "Ombros e Abdomen"],
  ["Shoulders and Abs", "Ombros e Abdômen"],
  ["Shoulders and Arms", "Ombros e Bracos"],
  ["Shoulders and Arms", "Ombros e Braços"],
  ["Arms and Abs", "Bracos e Abdomen"],
  ["Arms and Abs", "Braços e Abdômen"],
  ["Full body", "Corpo inteiro"],
  ["Full body and conditioning", "Corpo inteiro e condicionamento"],
  ["Heavy Push", "Push pesado"],
  ["Heavy Pull", "Pull pesado"],
  ["Heavy Legs", "Legs pesado"],
  ["General strength", "Forca geral"],
  ["General strength", "Força geral"],
  ["Conditioning", "Condicionamento"],
  ["Legs and Core", "Pernas e Core"],
  ["Push - Chest, Shoulders and Triceps", "Push - Peito, Ombros e Triceps"],
  ["Push - Chest, Shoulders and Triceps", "Push - Peito, Ombros e Tríceps"],
  ["Pull - Back and Biceps", "Pull - Costas e Biceps"],
  ["Pull - Back and Biceps", "Pull - Costas e Bíceps"],
  ["Legs - Legs", "Legs - Pernas"],
  ["Beginner AB", "AB Iniciante"],
  ["Beginner ABC", "ABC Iniciante"],
  ["ABC Hypertrophy", "ABC Hipertrofia"],
  ["Advanced ABC", "ABC Avancado"],
  ["Advanced ABC", "ABC Avançado"],
  ["Standard ABCD", "ABCD Normal"],
  ["Advanced ABCD", "ABCD Avancado"],
  ["Advanced ABCD", "ABCD Avançado"],
  ["Advanced ABCDE", "ABCDE Avancado"],
  ["Advanced ABCDE", "ABCDE Avançado"],
  ["Beginner Full Body", "Full Body Iniciante"],
  ["Intermediate Full Body", "Full Body Intermediario"],
  ["Intermediate Full Body", "Full Body Intermediário"],
  ["Advanced PPL", "PPL Avancado"],
  ["Advanced PPL", "PPL Avançado"],
  ["Weight Loss and Conditioning", "Emagrecimento e Condicionamento"],
  ["Simple AB workout for beginners.", "Treino AB simples para quem esta comecando."],
  ["Simple AB workout for beginners.", "Treino AB simples para quem está começando."],
  ["ABC workout with moderate volume for beginners.", "Treino ABC com volume moderado para iniciantes."],
  ["ABC workout focused on muscle hypertrophy.", "Treino ABC focado em hipertrofia muscular."],
  ["ABC workout with higher intensity and volume.", "Treino ABC com maior intensidade e volume."],
  ["Balanced ABCD split for muscle progression.", "Divisao ABCD equilibrada para evolucao muscular."],
  ["Balanced ABCD split for muscle progression.", "Divisão ABCD equilibrada para evolução muscular."],
  ["ABCD split with higher volume and intensity.", "Divisao ABCD com maior volume e intensidade."],
  ["ABCD split with higher volume and intensity.", "Divisão ABCD com maior volume e intensidade."],
  ["ABCDE workout with specific focus by muscle group.", "Treino ABCDE com foco especifico por grupo muscular."],
  ["ABCDE workout with specific focus by muscle group.", "Treino ABCDE com foco específico por grupo muscular."],
  ["Full-body workout ideal for beginners.", "Treino de corpo inteiro ideal para iniciantes."],
  ["Full-body workout with moderate volume.", "Treino de corpo inteiro com volume moderado."],
  ["Push, Pull and Legs split.", "Divisao Push, Pull e Legs."],
  ["Push, Pull and Legs split.", "Divisão Push, Pull e Legs."],
  ["Push Pull Legs with higher volume for advanced lifters.", "Push Pull Legs com maior volume para praticantes avancados."],
  ["Push Pull Legs with higher volume for advanced lifters.", "Push Pull Legs com maior volume para praticantes avançados."],
  ["Strength training with metabolic exercises.", "Treino com musculacao e exercicios metabolicos."],
  ["Strength training with metabolic exercises.", "Treino com musculação e exercícios metabólicos."],
  ["Machine bench press", "Supino maquina"],
  ["Machine bench press", "Supino máquina"],
  ["Lat pulldown", "Puxada alta"],
  ["Shoulder press", "Desenvolvimento de ombros"],
  ["Biceps curl", "Rosca direta"],
  ["Triceps pushdown", "Triceps pulley"],
  ["Triceps pushdown", "Tríceps pulley"],
  ["Free or guided squat", "Agachamento livre ou guiado"],
  ["Leg press", "Leg press"],
  ["Leg extension", "Cadeira extensora"],
  ["Leg curl", "Mesa flexora"],
  ["Plank", "Prancha abdominal"],
  ["Incline dumbbell bench press", "Supino inclinado com halteres"],
  ["Low row", "Remada baixa"],
  ["Pulldown", "Pulldown"],
  ["Guided squat", "Agachamento guiado"],
  ["Machine crunch", "Abdominal maquina"],
  ["Machine crunch", "Abdominal máquina"],
  ["Flat bench press", "Supino reto"],
  ["Incline bench press", "Supino inclinado"],
  ["Fly", "Crucifixo"],
  ["Rope triceps pushdown", "Triceps corda"],
  ["Rope triceps pushdown", "Tríceps corda"],
  ["Skull crusher", "Triceps testa"],
  ["Skull crusher", "Tríceps testa"],
  ["Single-arm row", "Remada unilateral"],
  ["Hammer curl", "Rosca martelo"],
  ["Free squat", "Agachamento livre"],
  ["Plank crunch", "Abdominal prancha"],
  ["Military press", "Desenvolvimento militar"],
  ["Lateral raise", "Elevacao lateral"],
  ["Lateral raise", "Elevação lateral"],
  ["French triceps extension", "Triceps frances"],
  ["French triceps extension", "Tríceps francês"],
  ["Pull-up or lat pulldown", "Barra fixa ou puxada alta"],
  ["Bent-over row", "Remada curvada"],
  ["T-bar row", "Remada cavalinho"],
  ["Shrug", "Encolhimento"],
  ["Barbell curl", "Rosca direta barra"],
  ["Alternating curl", "Rosca alternada"],
  ["Stiff-leg deadlift", "Stiff"],
  ["Standing calf raise", "Panturrilha em pe"],
  ["Standing calf raise", "Panturrilha em pé"],
  ["Seated calf raise", "Panturrilha sentado"],
  ["Dumbbell shoulder press", "Desenvolvimento com halteres"],
  ["Lower abs", "Abdominal infra"],
  ["Dips", "Paralelas"],
  ["Face pull", "Face pull"],
  ["Pull-up", "Barra fixa"],
  ["Dumbbell lunge", "Afundo com halteres"],
  ["Goblet squat", "Agachamento goblet"],
  ["Treadmill or bike", "Esteira ou bike"],
  ["Modified burpee", "Burpee adaptado"],
  ["Kettlebell swing or high row", "Kettlebell swing ou remada alta"],
  ["Bicycle crunch", "Abdominal bicicleta"],
  ["No workout", "Nenhum treino"],
  ["Weekly XP", "XP semanal"],
  ["No XP yet", "Sem XP ainda"],
  ["No timer yet", "Sem timer ainda"],
  ["Best Day", "Melhor dia"],
  ["Tracked Days", "Dias acompanhados"],
  ["7 Days", "7 dias"],
  ["Last 7 days", "Ultimos 7 dias"],
  [
    "XP is logged from completed workouts and claimed challenge rewards.",
    "XP e registrado por treinos concluidos e recompensas de desafios resgatadas.",
  ],
  ["Progress", "Progresso"],
  ["Rankings", "Rankings"],
  ["Feed", "Feed"],
  ["Challenges", "Desafios"],
  ["Settings", "Configuracoes"],
  ["Logout", "Sair"],
  ["Welcome back", "Bem-vindo de volta"],
  ["Search users", "Buscar usuarios"],
  ["More options", "Mais opcoes"],
  ["More", "Mais"],
  ["Home", "Inicio"],
  ["Current Streak", "Sequencia atual"],
  ["Total XP", "XP total"],
  ["Current Workout", "Treino atual"],
  ["Streak", "Sequencia"],
  ["Start", "Comecar"],
  ["Empty", "Vazio"],
  ["Add exercises", "Adicionar exercicios"],
  ["Fitness social network", "Rede social fitness"],
  ["Start free", "Comecar gratis"],
  ["Get Started", "Comecar"],
  ["See features", "Ver recursos"],
  ["Gamified progress", "Progresso gamificado"],
  ["Unlock achievements", "Desbloqueie conquistas"],
  ["Connect with athletes", "Conecte-se com atletas"],
  ["Create workout plan", "Criar plano de treino"],
  ["Workout name", "Nome do treino"],
  ["Description", "Descricao"],
  ["Create", "Criar"],
  ["Save", "Salvar"],
  ["Cancel", "Cancelar"],
  ["Close", "Fechar"],
  ["Manage", "Gerenciar"],
  ["All", "Todos"],
  ["Active", "Ativos"],
  ["Archived", "Arquivados"],
  ["Your workout plans", "Seus planos de treino"],
  ["No archived plans yet.", "Nenhum plano arquivado ainda."],
  ["No active plans yet.", "Nenhum plano ativo ainda."],
  ["Edit workout plan", "Editar plano de treino"],
  ["Archive workout plan", "Arquivar plano de treino"],
  ["Restore workout plan", "Restaurar plano de treino"],
  ["Templates", "Modelos"],
  ["Close templates", "Fechar modelos"],
  ["New workout", "Novo treino"],
  ["Workout focuses", "Focos do treino"],
  ["Skip workout", "Pular treino"],
  ["Today's checklist", "Checklist de hoje"],
  ["Loading workout...", "Carregando treino..."],
  ["Create a workout plan to start tracking.", "Crie um plano de treino para comecar a acompanhar."],
  ["No active workout plan yet.", "Nenhum plano de treino ativo ainda."],
  ["Completed today", "Concluido hoje"],
  ["exercises", "exercicios"],
  ["You already completed today's workout.", "Voce ja concluiu o treino de hoje."],
  ["Continue your current workout sequence.", "Continue sua sequencia atual de treino."],
  ["This workout was completed today.", "Este treino foi concluido hoje."],
  ["Current workout based on the real sequence.", "Treino atual baseado na sequencia real."],
  ["Today", "Hoje"],
  ["Today's workout", "Treino de hoje"],
  ["Start workout", "Iniciar treino"],
  ["Timer running", "Timer rodando"],
  ["Workout timer", "Timer do treino"],
  ["Today's progress", "Progresso de hoje"],
  ["You already finished today's workout.", "Voce ja concluiu o treino de hoje."],
  ["No workout yet", "Nenhum treino ainda"],
  ["Do this workout now", "Faca este treino agora"],
  ["After current workout", "Depois do treino atual"],
  ["Last completed", "Ultimo concluido"],
  ["Start your sequence", "Comece sua sequencia"],
  ["Current", "Atual"],
  ["Next", "Proximo"],
  ["Finish", "Finalizar"],
  ["Complete Today", "Concluir hoje"],
  ["Done Today", "Concluido hoje"],
  ["Workout completed today", "Treino concluido hoje"],
  ["Log performance", "Registrar desempenho"],
  ["Save performance", "Salvar desempenho"],
  ["Saved today", "Salvo hoje"],
  ["Light", "Leve"],
  ["Moderate", "Moderado"],
  ["Heavy", "Pesado"],
  ["Failure", "Falha"],
  ["Notes", "Notas"],
  ["Load", "Carga"],
  ["Reps", "Repeticoes"],
  ["Set", "Serie"],
  ["Exercise", "Exercicio"],
  ["Add exercise", "Adicionar exercicio"],
  ["Edit exercise", "Editar exercicio"],
  ["Delete exercise", "Excluir exercicio"],
  ["No exercises yet", "Nenhum exercicio ainda"],
  ["Monthly Workouts", "Treinos mensais"],
  ["Loading calendar...", "Carregando calendario..."],
  ["Previous month", "Mes anterior"],
  ["Next month", "Proximo mes"],
  ["Skipped", "Pulado"],
  ["Rest / Missed", "Descanso / perdido"],
  ["Rest", "Descanso"],
  [
    "Complete your daily workout to mark the day as completed. Skipped workouts appear separately and do not count as completed days. Dates follow the local timezone of the device using the app.",
    "Complete seu treino diario para marcar o dia como concluido. Treinos pulados aparecem separados e nao contam como dias concluidos. As datas seguem o fuso horario local do dispositivo.",
  ],
  ["Progress Analytics", "Analise de progresso"],
  ["Avg Workout Time", "Tempo medio de treino"],
  ["Workout time", "Tempo de treino"],
  ["Duration tracked from start workout to completion.", "Duracao acompanhada do inicio ate a conclusao do treino."],
  ["Average", "Media"],
  ["Fastest", "Mais rapido"],
  ["Longest", "Mais longo"],
  ["Duration", "Duracao"],
  ["Exercise evolution", "Evolucao por exercicio"],
  [
    "Load and volume history from your logged sets.",
    "Historico de carga e volume das series registradas.",
  ],
  [
    "Start and complete a timed workout to unlock duration analytics.",
    "Inicie e conclua um treino cronometrado para desbloquear analises de duracao.",
  ],
  [
    "Log load and reps in Workouts to unlock exercise evolution charts.",
    "Registre carga e repeticoes em Treinos para desbloquear graficos de evolucao.",
  ],
  ["Next progression", "Proxima progressao"],
  ["Start with control", "Comece com controle"],
  [
    "Log your first session. After that, GymFocus will suggest the next progression.",
    "Registre sua primeira sessao. Depois disso, o GymFocus vai sugerir a proxima progressao.",
  ],
  ["Hold the load", "Mantenha a carga"],
  [
    "You logged a failure set. Repeat this load and aim for cleaner reps before increasing.",
    "Voce registrou uma serie ate a falha. Repita essa carga e busque repeticoes mais limpas antes de aumentar.",
  ],
  ["Keep this load and add reps", "Mantenha a carga e adicione repeticoes"],
  [
    "Your total volume improved. Keep the load and try to add 1 rep in one or two sets.",
    "Seu volume total melhorou. Mantenha a carga e tente adicionar 1 repeticao em uma ou duas series.",
  ],
  ["Repeat or reduce slightly", "Repita ou reduza um pouco"],
  [
    "Volume dropped from the previous session. Repeat the same load, or reduce a little if form felt heavy.",
    "O volume caiu em relacao a sessao anterior. Repita a mesma carga ou reduza um pouco se a execucao ficou pesada.",
  ],
  ["Build one more solid session", "Construa mais uma sessao solida"],
  [
    "Keep the same load and try to reach the planned reps with consistent form.",
    "Mantenha a mesma carga e tente atingir as repeticoes planejadas com execucao consistente.",
  ],
  ["Best Load", "Melhor carga"],
  ["Best Volume", "Melhor volume"],
  ["Sessions", "Sessoes"],
  ["No exercises logged yet", "Nenhum exercicio registrado ainda"],
  ["Max load", "Carga maxima"],
  ["Volume", "Volume"],
  ["Max", "Max"],
  ["Set", "Serie"],
  ["Best load, reps and volume by exercise.", "Melhor carga, repeticoes e volume por exercicio."],
  ["No records yet. Log set performance in Workouts first.", "Sem recordes ainda. Registre desempenho em Treinos primeiro."],
  ["Meus recordes", "Meus recordes"],
  ["Carga max", "Carga max"],
  ["Reps max", "Reps max"],
  ["Volume max", "Volume max"],
  ["Fitness Challenges", "Desafios fitness"],
  ["Complete challenges and earn rewards.", "Complete desafios e ganhe recompensas."],
  ["Reward", "Recompensa"],
  ["No challenges available yet.", "Nenhum desafio disponivel ainda."],
  ["Challenge joined!", "Desafio iniciado!"],
  ["Join this challenge first.", "Entre neste desafio primeiro."],
  ["Reward already claimed.", "Recompensa ja resgatada."],
  ["Challenge not completed yet.", "Desafio ainda nao concluido."],
  ["Error joining challenge.", "Erro ao entrar no desafio."],
  ["Error updating XP.", "Erro ao atualizar XP."],
  ["Error claiming challenge.", "Erro ao resgatar desafio."],
  ["Progress", "Progresso"],
  ["Claim", "Resgatar"],
  ["In Progress", "Em progresso"],
  ["Join", "Entrar"],
  ["Completed", "Concluido"],
  ["Profile Settings", "Configuracoes do perfil"],
  ["For you", "Para voce"],
  ["For You", "Para voce"],
  ["Following", "Seguindo"],
  ["Share your progress", "Compartilhe seu progresso"],
  ["Inspire other athletes today", "Inspire outros atletas hoje"],
  ["Completed Push Day today 🔥", "Completei o treino de push hoje 🔥"],
  ["Add image to your post", "Adicionar imagem ao post"],
  ["Publishing...", "Publicando..."],
  ["Publish Post", "Publicar post"],
  ["Write something before publishing.", "Escreva algo antes de publicar."],
  ["Profile not loaded yet.", "Perfil ainda nao carregado."],
  ["Please select a valid image.", "Selecione uma imagem valida."],
  ["Image is too large. Maximum size is 5MB.", "A imagem e muito grande. O tamanho maximo e 5MB."],
  ["Error uploading image.", "Erro ao enviar imagem."],
  ["Error publishing post.", "Erro ao publicar post."],
  ["Error processing image.", "Erro ao processar imagem."],
  ["Processing image...", "Processando imagem..."],
  ["Click or drag an image here", "Clique ou arraste uma imagem aqui"],
  ["JPG, PNG or WEBP up to", "JPG, PNG ou WEBP ate"],
  ["Preview", "Previa"],
  ["Preview ready", "Previa pronta"],
  ["Post published!", "Post publicado!"],
  ["Upload complete", "Upload concluido"],
  ["Uploading...", "Enviando..."],
  ["Comment", "Comentario"],
  ["Comments", "Comentarios"],
  ["Write a comment first.", "Escreva um comentario primeiro."],
  ["User profile not loaded.", "Perfil do usuario ainda nao carregado."],
  ["Write a comment...", "Escreva um comentario..."],
  ["No comments yet. Be the first to comment.", "Nenhum comentario ainda. Seja o primeiro a comentar."],
  ["Comment deleted.", "Comentario excluido."],
  ["Post deleted!", "Post excluido!"],
  ["Post cannot be empty.", "O post nao pode ficar vazio."],
  ["Post updated!", "Post atualizado!"],
  ["Profile link copied!", "Link do perfil copiado!"],
  ["Inbox", "Caixa de entrada"],
  ["Your conversations", "Suas conversas"],
  ["Start a conversation", "Inicie uma conversa"],
  ["Sent an image", "Enviou uma imagem"],
  ["You: ", "Voce: "],
  ["Search", "Buscar"],
  ["Profile", "Perfil"],
  ["Achievements", "Conquistas"],
  ["Recent achievements", "Conquistas recentes"],
  [
    "Badges unlocked through your fitness journey",
    "Insignias desbloqueadas na sua jornada fitness",
  ],
  ["No achievements yet", "Nenhuma conquista ainda"],
  ["Badges", "Insignias"],
  ["No badges yet", "Nenhuma insignia ainda"],
  [
    "Complete workouts, join challenges and earn XP to unlock your first badge.",
    "Complete treinos, entre em desafios e ganhe XP para desbloquear sua primeira insignia.",
  ],
  [
    "Complete workouts and challenges to unlock badges.",
    "Complete treinos e desafios para desbloquear insignias.",
  ],
  ["Unlocked", "Desbloqueado"],
  ["unlocked", "desbloqueadas"],
  ["Achievement", "Conquista"],
  ["First Post", "Primeiro post"],
  ["First Workout", "Primeiro treino"],
  ["7 Day Streak", "Sequencia de 7 dias"],
  ["1000 XP", "1000 XP"],
  ["10K XP", "10K XP"],
  ["Workout Warrior", "Guerreiro dos treinos"],
  ["Workout Streak", "Sequencia de treinos"],
  ["Level Up", "Subiu de nivel"],
  ["Consistency Master", "Mestre da consistencia"],
  [
    "Achievements are unlocked automatically when you reach important milestones.",
    "Conquistas sao desbloqueadas automaticamente quando voce atinge marcos importantes.",
  ],
  ["Global Ranking", "Ranking global"],
  ["Weekly Ranking", "Ranking semanal"],
  ["Top athletes by total XP", "Top atletas por XP total"],
  ["XP earned in the last 7 days", "XP ganho nos ultimos 7 dias"],
  ["No athletes ranked yet.", "Nenhum atleta ranqueado ainda."],
  [
    "No weekly XP yet. Complete workouts or challenges to appear here.",
    "Sem XP semanal ainda. Complete treinos ou desafios para aparecer aqui.",
  ],
  [
    "Earn XP by completing workouts, finishing challenges and staying consistent.",
    "Ganhe XP completando treinos, finalizando desafios e mantendo consistencia.",
  ],
  [
    "Weekly XP is calculated from workouts and completed challenges in the last 7 days.",
    "O XP semanal e calculado a partir de treinos e desafios concluidos nos ultimos 7 dias.",
  ],
  ["Workout profile", "Perfil de treino"],
  ["Athlete Info", "Info do atleta"],
  ["Fitness profile", "Perfil fitness"],
  ["Follow", "Seguir"],
  ["Followers", "Seguidores"],
  ["Posts", "Posts"],
  ["Level", "Nivel"],
  ["Bronze", "Bronze"],
  ["Silver", "Prata"],
  ["Gold", "Ouro"],
  ["Diamond", "Diamante"],
  ["days", "dias"],
  ["Workout templates", "Modelos de treino"],
  ["Choose a ready-made plan and customize it later.", "Escolha um plano pronto e personalize depois."],
  ["exercises included", "exercicios incluidos"],
  ["Use template", "Usar modelo"],
  ["Enter a workout name.", "Digite um nome para o treino."],
  ["Workout created!", "Treino criado!"],
  ["Workout plan updated!", "Plano de treino atualizado!"],
  ["Workout focuses saved!", "Focos do treino salvos!"],
  ["Workout plan archived.", "Plano de treino arquivado."],
  ["Workout plan restored.", "Plano de treino restaurado."],
  ["Create or select a workout first.", "Crie ou selecione um treino primeiro."],
  ["Enter an exercise name.", "Digite o nome do exercicio."],
  ["Exercise added!", "Exercicio adicionado!"],
  ["Exercise updated!", "Exercicio atualizado!"],
  ["Exercise deleted.", "Exercicio excluido."],
  ["Today's workout is already completed.", "O treino de hoje ja esta concluido."],
  ["Today's workout already has a record.", "O treino de hoje ja possui um registro."],
  ["Open the set logger first.", "Abra o registro de series primeiro."],
  ["Enter at least one load or reps value.", "Informe ao menos uma carga ou repeticao."],
  ["Use valid positive numbers for load and reps.", "Use numeros positivos validos para carga e repeticoes."],
  ["Exercise performance saved!", "Desempenho do exercicio salvo!"],
  ["Customize your public fitness profile.", "Personalize seu perfil fitness publico."],
  ["Profile Banner", "Banner do perfil"],
  ["This image appears at the top of your profile.", "Esta imagem aparece no topo do seu perfil."],
  ["Change Banner", "Alterar banner"],
  ["No banner selected", "Nenhum banner selecionado"],
  ["Profile Picture", "Foto do perfil"],
  ["Recommended: square image, at least 300x300px.", "Recomendado: imagem quadrada, pelo menos 300x300px."],
  ["Change Avatar", "Alterar avatar"],
  ["Bio", "Bio"],
  ["Tell other athletes about your goals and training style.", "Conte para outros atletas sobre seus objetivos e estilo de treino."],
  ["Write your bio...", "Escreva sua bio..."],
  ["characters", "caracteres"],
  ["Saving...", "Salvando..."],
  ["Save Profile", "Salvar perfil"],
  ["Avatar updated!", "Avatar atualizado!"],
  ["Banner updated!", "Banner atualizado!"],
  ["Profile updated!", "Perfil atualizado!"],
  ["Bio must have at most 240 characters.", "A bio deve ter no maximo 240 caracteres."],
  ["Error uploading avatar.", "Erro ao enviar avatar."],
  ["Error updating avatar.", "Erro ao atualizar avatar."],
  ["Error uploading banner.", "Erro ao enviar banner."],
  ["Error updating banner.", "Erro ao atualizar banner."],
  ["Error updating bio.", "Erro ao atualizar bio."],
  ["Create", "Criar"],
];

const LanguageContext = createContext(null);

function interpolate(value, params = {}) {
  return Object.entries(params).reduce(
    (text, [key, replacement]) =>
      text.replaceAll(`{{${key}}}`, String(replacement)),
    value,
  );
}

function getPhraseMap(language) {
  const map = new Map();

  uiPhrases.forEach(([en, pt]) => {
    map.set(en, language === "pt" ? pt : en);
    map.set(pt, language === "pt" ? pt : en);
  });

  return map;
}

function translateText(value, phraseMap) {
  const trimmed = value.trim();
  const translated = phraseMap.get(trimmed);

  if (!translated || translated === trimmed) {
    if (trimmed.includes(" - ")) {
      const translatedParts = trimmed.split(" - ").map((part) => {
        const partTranslation = translateText(part, phraseMap);

        return partTranslation.trim();
      });

      const combined = translatedParts.join(" - ");

      if (combined !== trimmed) {
        return value.replace(trimmed, combined);
      }
    }

    const prefixed = trimmed.match(/^(\S+\s+)(.+)$/);

    if (prefixed) {
      const [, prefix, rest] = prefixed;
      const translatedRest = phraseMap.get(rest);

      if (translatedRest && translatedRest !== rest) {
        return value.replace(trimmed, `${prefix}${translatedRest}`);
      }
    }

    return value;
  }

  return value.replace(trimmed, translated);
}

function normalizeNodeLanguage(root, phraseMap) {
  if (!root) return;

  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (treeWalker.nextNode()) {
    textNodes.push(treeWalker.currentNode);
  }

  textNodes.forEach((node) => {
    const parent = node.parentElement;

    if (
      !parent ||
      ["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName) ||
      parent.isContentEditable
    ) {
      return;
    }

    node.nodeValue = translateText(node.nodeValue || "", phraseMap);
  });

  root.querySelectorAll?.("[placeholder], [title], [aria-label]").forEach(
    (element) => {
      ["placeholder", "title", "aria-label"].forEach((attribute) => {
        const value = element.getAttribute(attribute);

        if (value) {
          element.setAttribute(attribute, translateText(value, phraseMap));
        }
      });
    },
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === "en" || stored === "pt") {
      return stored;
    }

    return navigator.language?.toLowerCase().startsWith("pt") ? "pt" : "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === "pt" ? "pt-BR" : "en";
  }, [language]);

  useEffect(() => {
    const phraseMap = getPhraseMap(language);
    let normalizing = false;

    function normalize() {
      if (normalizing) return;

      normalizing = true;
      normalizeNodeLanguage(document.body, phraseMap);
      normalizing = false;
    }

    normalize();

    const observer = new MutationObserver(() => {
      window.requestAnimationFrame(normalize);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => {
    function t(key, params) {
      const phrase = translations[language]?.[key] || translations.en[key] || key;

      return interpolate(phrase, params);
    }

    function translate(value) {
      return translateText(String(value ?? ""), getPhraseMap(language));
    }

    return {
      language,
      setLanguage,
      t,
      translate,
      toggleLanguage: () =>
        setLanguage((current) => (current === "en" ? "pt" : "en")),
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    return {
      language: "en",
      setLanguage: () => {},
      t: (key, params) => interpolate(translations.en[key] || key, params),
      translate: (value) => String(value ?? ""),
      toggleLanguage: () => {},
    };
  }

  return context;
}
