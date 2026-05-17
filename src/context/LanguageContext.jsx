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
    "dashboard.nav.today": "Today",
    "dashboard.nav.workouts": "Workouts",
    "dashboard.nav.progress": "Progress",
    "dashboard.nav.calendar": "Calendar",
    "dashboard.nav.measurements": "Measurements",
    "dashboard.nav.rankings": "Rankings",
    "dashboard.nav.feed": "Feed",
    "dashboard.nav.social": "Social",
    "dashboard.nav.challenges": "Challenges",
    "dashboard.nav.achievements": "Achievements",
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
    "auth.backHome": "Voltar ao início",
    "auth.loginSubtitle": "Entre na sua conta",
    "auth.signupSubtitle": "Crie sua conta",
    "auth.login": "Entrar",
    "auth.createAccount": "Criar conta",
    "auth.createAccountShort": "Criar conta",
    "auth.alreadyHaveAccount": "Já possui conta?",
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
    "dashboard.nav.today": "Hoje",
    "dashboard.nav.workouts": "Treinos",
    "dashboard.nav.progress": "Progresso",
    "dashboard.nav.calendar": "Calendário",
    "dashboard.nav.measurements": "Medidas",
    "dashboard.nav.rankings": "Rankings",
    "dashboard.nav.feed": "Feed",
    "dashboard.nav.social": "Social",
    "dashboard.nav.challenges": "Desafios",
    "dashboard.nav.achievements": "Conquistas",
    "dashboard.nav.settings": "Configurações",
    "dashboard.logout": "Sair",
    "dashboard.stats.streak": "Sequência",
    "dashboard.stats.currentStreak": "Sequência atual",
    "dashboard.stats.xp": "XP",
    "dashboard.stats.totalXp": "XP total",
    "dashboard.stats.workout": "Treino",
    "dashboard.stats.currentWorkout": "Treino atual",
    "dashboard.workout.start": "Começar",
    "dashboard.workout.empty": "Vazio",
    "dashboard.workout.addExercises": "Adicionar exercícios",
    "home.login": "Entrar",
    "home.badge": "Rede social fitness",
    "home.start": "Começar grátis",
    "home.heroTitle": "Treine. Compartilhe. Evolua.",
    "home.heroCopy":
      "GymFocus transforma sua jornada fitness em uma experiência social. Complete treinos, ganhe XP e mantenha consistência com sua comunidade.",
    "home.cta": "Entrar no GymFocus",
    "home.footer": "GymFocus - Fitness, gamificação e comunidade.",
    "language.english": "Inglês",
    "language.portuguese": "Português",
    "language.switchTo": "Trocar idioma",
    "theme.light": "Mudar para tema claro",
    "theme.dark": "Mudar para tema escuro",
    "workout.title": "Treinos",
    "workout.doneToday": "Concluído hoje: {{workout}}.",
    "workout.continueWith": "Continue com {{workout}}.",
    "workout.createFirst": "Crie seu primeiro plano de treino.",
    "workout.templates": "Modelos",
    "workout.closeTemplates": "Fechar modelos",
    "workout.newWorkout": "Novo treino",
    "workout.createPlan": "Criar plano de treino",
    "workout.planName": "Nome do treino",
    "workout.planDescription": "Descrição",
    "workout.plansTitle": "Seus planos de treino",
    "workout.plansDescription":
      "Planos ativos são para treinar hoje. Planos arquivados ficam aqui como referência.",
    "workout.noArchivedPlans": "Nenhum plano arquivado ainda.",
    "workout.noActivePlans": "Nenhum plano ativo ainda.",
    "workout.editPlan": "Editar plano de treino",
    "workout.restorePlan": "Restaurar plano de treino",
    "workout.archivePlan": "Arquivar plano de treino",
    "analytics.title": "Análise de progresso",
    "analytics.subtitle":
      "Acompanhe XP, duração dos treinos, evolução por exercício, recordes e progressão.",
    "profile.settings": "Configurações do perfil",
    "challenges.title": "Desafios fitness",
    "feed.forYou": "Para você",
    "feed.following": "Seguindo",
  },
};

const uiPhrases = [
  ["Back to Home", "Voltar ao início"],
  ["Back", "Voltar"],
  ["Login", "Entrar"],
  ["Create Account", "Criar conta"],
  ["Create account", "Criar conta"],
  ["Already have an account?", "Já possui conta?"],
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
  ["Lower body and Abs", "Inferiores e Abdômen"],
  ["Chest, Shoulders and Triceps", "Peito, Ombros e Tríceps"],
  ["Chest, Shoulders and Triceps", "Peito, Ombros e Tríceps"],
  ["Back and Biceps", "Costas e Bíceps"],
  ["Back and Biceps", "Costas e Bíceps"],
  ["Legs and Abs", "Pernas e Abdômen"],
  ["Legs and Abs", "Pernas e Abdômen"],
  ["Chest and Triceps", "Peito e Tríceps"],
  ["Chest and Triceps", "Peito e Tríceps"],
  ["Back, Traps and Biceps", "Costas, Trapézio e Bíceps"],
  ["Back, Traps and Biceps", "Costas, Trapézio e Bíceps"],
  ["Full legs", "Pernas completas"],
  ["Chest", "Peito"],
  ["Back", "Costas"],
  ["Legs", "Pernas"],
  ["Shoulders", "Ombros"],
  ["Shoulders and Abs", "Ombros e Abdômen"],
  ["Shoulders and Abs", "Ombros e Abdômen"],
  ["Shoulders and Arms", "Ombros e Braços"],
  ["Shoulders and Arms", "Ombros e Braços"],
  ["Arms and Abs", "Braços e Abdômen"],
  ["Arms and Abs", "Braços e Abdômen"],
  ["Full body", "Corpo inteiro"],
  ["Full body and conditioning", "Corpo inteiro e condicionamento"],
  ["Heavy Push", "Push pesado"],
  ["Heavy Pull", "Pull pesado"],
  ["Heavy Legs", "Legs pesado"],
  ["General strength", "Força geral"],
  ["General strength", "Força geral"],
  ["Conditioning", "Condicionamento"],
  ["Legs and Core", "Pernas e Core"],
  ["Push - Chest, Shoulders and Triceps", "Push - Peito, Ombros e Tríceps"],
  ["Push - Chest, Shoulders and Triceps", "Push - Peito, Ombros e Tríceps"],
  ["Pull - Back and Biceps", "Pull - Costas e Bíceps"],
  ["Pull - Back and Biceps", "Pull - Costas e Bíceps"],
  ["Legs - Legs", "Legs - Pernas"],
  ["Beginner AB", "AB Iniciante"],
  ["Beginner ABC", "ABC Iniciante"],
  ["ABC Hypertrophy", "ABC Hipertrofia"],
  ["Advanced ABC", "ABC Avançado"],
  ["Advanced ABC", "ABC Avançado"],
  ["Standard ABCD", "ABCD Normal"],
  ["Advanced ABCD", "ABCD Avançado"],
  ["Advanced ABCD", "ABCD Avançado"],
  ["Advanced ABCDE", "ABCDE Avançado"],
  ["Advanced ABCDE", "ABCDE Avançado"],
  ["Beginner Full Body", "Full Body Iniciante"],
  ["Intermediate Full Body", "Full Body Intermediário"],
  ["Intermediate Full Body", "Full Body Intermediário"],
  ["Advanced PPL", "PPL Avançado"],
  ["Advanced PPL", "PPL Avançado"],
  ["Weight Loss and Conditioning", "Emagrecimento e Condicionamento"],
  ["Simple AB workout for beginners.", "Treino AB simples para quem esta comecando."],
  ["Simple AB workout for beginners.", "Treino AB simples para quem está começando."],
  ["ABC workout with moderate volume for beginners.", "Treino ABC com volume moderado para iniciantes."],
  ["ABC workout focused on muscle hypertrophy.", "Treino ABC focado em hipertrofia muscular."],
  ["ABC workout with higher intensity and volume.", "Treino ABC com maior intensidade e volume."],
  ["Balanced ABCD split for muscle progression.", "Divisão ABCD equilibrada para evolução muscular."],
  ["Balanced ABCD split for muscle progression.", "Divisão ABCD equilibrada para evolução muscular."],
  ["ABCD split with higher volume and intensity.", "Divisão ABCD com maior volume e intensidade."],
  ["ABCD split with higher volume and intensity.", "Divisão ABCD com maior volume e intensidade."],
  ["ABCDE workout with specific focus by muscle group.", "Treino ABCDE com foco especifico por grupo muscular."],
  ["ABCDE workout with specific focus by muscle group.", "Treino ABCDE com foco específico por grupo muscular."],
  ["Full-body workout ideal for beginners.", "Treino de corpo inteiro ideal para iniciantes."],
  ["Full-body workout with moderate volume.", "Treino de corpo inteiro com volume moderado."],
  ["Push, Pull and Legs split.", "Divisão Push, Pull e Legs."],
  ["Push, Pull and Legs split.", "Divisão Push, Pull e Legs."],
  ["Push Pull Legs with higher volume for advanced lifters.", "Push Pull Legs com maior volume para praticantes avancados."],
  ["Push Pull Legs with higher volume for advanced lifters.", "Push Pull Legs com maior volume para praticantes avançados."],
  ["Strength training with metabolic exercises.", "Treino com musculação e exercícios metabólicos."],
  ["Strength training with metabolic exercises.", "Treino com musculação e exercícios metabólicos."],
  ["Machine bench press", "Supino máquina"],
  ["Machine bench press", "Supino máquina"],
  ["Lat pulldown", "Puxada alta"],
  ["Shoulder press", "Desenvolvimento de ombros"],
  ["Biceps curl", "Rosca direta"],
  ["Triceps pushdown", "Tríceps pulley"],
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
  ["Machine crunch", "Abdominal máquina"],
  ["Machine crunch", "Abdominal máquina"],
  ["Flat bench press", "Supino reto"],
  ["Incline bench press", "Supino inclinado"],
  ["Fly", "Crucifixo"],
  ["Rope triceps pushdown", "Tríceps corda"],
  ["Rope triceps pushdown", "Tríceps corda"],
  ["Skull crusher", "Tríceps testa"],
  ["Skull crusher", "Tríceps testa"],
  ["Single-arm row", "Remada unilateral"],
  ["Hammer curl", "Rosca martelo"],
  ["Free squat", "Agachamento livre"],
  ["Plank crunch", "Abdominal prancha"],
  ["Military press", "Desenvolvimento militar"],
  ["Lateral raise", "Elevação lateral"],
  ["Lateral raise", "Elevação lateral"],
  ["French triceps extension", "Tríceps francês"],
  ["French triceps extension", "Tríceps francês"],
  ["Pull-up or lat pulldown", "Barra fixa ou puxada alta"],
  ["Bent-over row", "Remada curvada"],
  ["T-bar row", "Remada cavalinho"],
  ["Shrug", "Encolhimento"],
  ["Barbell curl", "Rosca direta barra"],
  ["Alternating curl", "Rosca alternada"],
  ["Stiff-leg deadlift", "Stiff"],
  ["Standing calf raise", "Panturrilha em pé"],
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
  ["Last 7 days", "Últimos 7 dias"],
  [
    "XP is logged from completed workouts and claimed challenge rewards.",
    "XP é registrado por treinos concluídos e recompensas de desafios resgatadas.",
  ],
  ["Progress", "Progresso"],
  ["Rankings", "Rankings"],
  ["Feed", "Feed"],
  ["Challenges", "Desafios"],
  ["Settings", "Configurações"],
  ["Logout", "Sair"],
  ["Welcome back", "Bem-vindo de volta"],
  ["Search users", "Buscar usuários"],
  ["More options", "Mais opções"],
  ["More", "Mais"],
  ["Home", "Início"],
  ["Current Streak", "Sequência atual"],
  ["Total XP", "XP total"],
  ["Current Workout", "Treino atual"],
  ["Streak", "Sequência"],
  ["Start", "Começar"],
  ["Empty", "Vazio"],
  ["Add exercises", "Adicionar exercícios"],
  ["Fitness social network", "Rede social fitness"],
  ["Start free", "Começar grátis"],
  ["Get Started", "Começar"],
  ["See features", "Ver recursos"],
  ["Gamified progress", "Progresso gamificado"],
  ["Unlock achievements", "Desbloqueie conquistas"],
  ["Connect with athletes", "Conecte-se com atletas"],
  ["Create workout plan", "Criar plano de treino"],
  ["Workout name", "Nome do treino"],
  ["Description", "Descrição"],
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
  ["Rest day", "Descanso"],
  ["Today's checklist", "Checklist de hoje"],
  ["Loading workout...", "Carregando treino..."],
  ["Create a workout plan to start tracking.", "Crie um plano de treino para comecar a acompanhar."],
  ["No active workout plan yet.", "Nenhum plano de treino ativo ainda."],
  ["Completed today", "Concluído hoje"],
  ["exercises", "exercícios"],
  ["You already completed today's workout.", "Você já concluiu o treino de hoje."],
  ["Continue your current workout sequence.", "Continue sua sequência atual de treino."],
  ["This workout was completed today.", "Este treino foi concluído hoje."],
  ["Current workout based on the real sequence.", "Treino atual baseado na sequência real."],
  ["Today", "Hoje"],
  ["Today's workout", "Treino de hoje"],
  ["Start workout", "Iniciar treino"],
  ["Timer running", "Timer rodando"],
  ["Workout timer", "Timer do treino"],
  ["Today's progress", "Progresso de hoje"],
  ["You already finished today's workout.", "Você já concluiu o treino de hoje."],
  ["No workout yet", "Nenhum treino ainda"],
  ["Do this workout now", "Faça este treino agora"],
  ["After current workout", "Depois do treino atual"],
  ["Last completed", "Último concluído"],
  ["Start your sequence", "Comece sua sequência"],
  ["Current", "Atual"],
  ["Next", "Próximo"],
  ["Finish", "Finalizar"],
  ["Complete Today", "Concluir hoje"],
  ["Done Today", "Concluído hoje"],
  ["Workout completed today", "Treino concluído hoje"],
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
  ["Set", "Série"],
  ["Exercise", "Exercicio"],
  ["Add exercise", "Adicionar exercício"],
  ["Edit exercise", "Editar exercício"],
  ["Delete exercise", "Excluir exercício"],
  ["No exercises yet", "Nenhum exercício ainda"],
  ["Monthly Workouts", "Treinos mensais"],
  ["Loading calendar...", "Carregando calendário..."],
  ["Previous month", "Mês anterior"],
  ["Next month", "Próximo mês"],
  ["Skipped", "Pulado"],
  ["Rest / Missed", "Descanso / perdido"],
  ["Rest", "Descanso"],
  [
    "Complete your daily workout to mark the day as completed. Skipped workouts appear separately and do not count as completed days. Dates follow the local timezone of the device using the app.",
    "Complete seu treino diário para marcar o dia como concluído. Treinos pulados aparecem separados e não contam como dias concluídos. As datas seguem o fuso horário local do dispositivo.",
  ],
  ["Progress Analytics", "Análise de progresso"],
  ["Avg Workout Time", "Tempo médio de treino"],
  ["Workout time", "Tempo de treino"],
  ["Duration tracked from start workout to completion.", "Duração acompanhada do início até a conclusão do treino."],
  ["Average", "Media"],
  ["Fastest", "Mais rápido"],
  ["Longest", "Mais longo"],
  ["Duration", "Duração"],
  ["Exercise evolution", "Evolução por exercício"],
  [
    "Load and volume history from your logged sets.",
    "Histórico de carga e volume das séries registradas.",
  ],
  [
    "Start and complete a timed workout to unlock duration analytics.",
    "Inicie e conclua um treino cronometrado para desbloquear análises de duração.",
  ],
  [
    "Log load and reps in Workouts to unlock exercise evolution charts.",
    "Registre carga e repetições em Treinos para desbloquear gráficos de evolução.",
  ],
  ["Next progression", "Próxima progressão"],
  ["Start with control", "Comece com controle"],
  [
    "Log your first session. After that, GymFocus will suggest the next progression.",
    "Registre sua primeira sessão. Depois disso, o GymFocus vai sugerir a próxima progressão.",
  ],
  ["Hold the load", "Mantenha a carga"],
  [
    "You logged a failure set. Repeat this load and aim for cleaner reps before increasing.",
    "Você registrou uma série até a falha. Repita essa carga e busque repetições mais limpas antes de aumentar.",
  ],
  ["Keep this load and add reps", "Mantenha a carga e adicione repetições"],
  [
    "Your total volume improved. Keep the load and try to add 1 rep in one or two sets.",
    "Seu volume total melhorou. Mantenha a carga e tente adicionar 1 repetição em uma ou duas séries.",
  ],
  ["Repeat or reduce slightly", "Repita ou reduza um pouco"],
  [
    "Volume dropped from the previous session. Repeat the same load, or reduce a little if form felt heavy.",
    "O volume caiu em relação à sessão anterior. Repita a mesma carga ou reduza um pouco se a execução ficou pesada.",
  ],
  ["Build one more solid session", "Construa mais uma sessão sólida"],
  [
    "Keep the same load and try to reach the planned reps with consistent form.",
    "Mantenha a mesma carga e tente atingir as repetições planejadas com execução consistente.",
  ],
  ["Best Load", "Melhor carga"],
  ["Best Volume", "Melhor volume"],
  ["Sessions", "Sessões"],
  ["No exercises logged yet", "Nenhum exercício registrado ainda"],
  ["Max load", "Carga máxima"],
  ["Volume", "Volume"],
  ["Max", "Max"],
  ["Set", "Série"],
  ["Best load, reps and volume by exercise.", "Melhor carga, repetições e volume por exercício."],
  ["No records yet. Log set performance in Workouts first.", "Sem recordes ainda. Registre desempenho em Treinos primeiro."],
  ["Meus recordes", "Meus recordes"],
  ["Carga max", "Carga max"],
  ["Reps max", "Reps max"],
  ["Volume max", "Volume max"],
  ["Fitness Challenges", "Desafios fitness"],
  ["Complete challenges and earn rewards.", "Complete desafios e ganhe recompensas."],
  ["Reward", "Recompensa"],
  ["No challenges available yet.", "Nenhum desafio disponível ainda."],
  ["Challenge joined!", "Desafio iniciado!"],
  ["Join this challenge first.", "Entre neste desafio primeiro."],
  ["Reward already claimed.", "Recompensa já resgatada."],
  ["Challenge not completed yet.", "Desafio ainda não concluído."],
  ["Error joining challenge.", "Erro ao entrar no desafio."],
  ["Error updating XP.", "Erro ao atualizar XP."],
  ["Error claiming challenge.", "Erro ao resgatar desafio."],
  ["Progress", "Progresso"],
  ["Claim", "Resgatar"],
  ["In Progress", "Em progresso"],
  ["Join", "Entrar"],
  ["Completed", "Concluído"],
  ["Profile Settings", "Configurações do perfil"],
  ["For you", "Para você"],
  ["For You", "Para você"],
  ["Following", "Seguindo"],
  ["Share your progress", "Compartilhe seu progresso"],
  ["Inspire other athletes today", "Inspire outros atletas hoje"],
  ["Completed Push Day today 🔥", "Completei o treino de push hoje 🔥"],
  ["Add image to your post", "Adicionar imagem ao post"],
  ["Publishing...", "Publicando..."],
  ["Publish Post", "Publicar post"],
  ["Write something before publishing.", "Escreva algo antes de publicar."],
  ["Profile not loaded yet.", "Perfil ainda não carregado."],
  ["Please select a valid image.", "Selecione uma imagem válida."],
  ["Image is too large. Maximum size is 5MB.", "A imagem é muito grande. O tamanho máximo é 5MB."],
  ["Error uploading image.", "Erro ao enviar imagem."],
  ["Error publishing post.", "Erro ao publicar post."],
  ["Error processing image.", "Erro ao processar imagem."],
  ["Processing image...", "Processando imagem..."],
  ["Click or drag an image here", "Clique ou arraste uma imagem aqui"],
  ["JPG, PNG or WEBP up to", "JPG, PNG ou WEBP até"],
  ["Preview", "Prévia"],
  ["Preview ready", "Prévia pronta"],
  ["Post published!", "Post publicado!"],
  ["Upload complete", "Upload concluído"],
  ["Uploading...", "Enviando..."],
  ["Comment", "Comentário"],
  ["Comments", "Comentários"],
  ["Write a comment first.", "Escreva um comentário primeiro."],
  ["User profile not loaded.", "Perfil do usuário ainda não carregado."],
  ["Write a comment...", "Escreva um comentário..."],
  ["No comments yet. Be the first to comment.", "Nenhum comentário ainda. Seja o primeiro a comentar."],
  ["Comment deleted.", "Comentário excluído."],
  ["Post deleted!", "Post excluído!"],
  ["Post cannot be empty.", "O post não pode ficar vazio."],
  ["Post updated!", "Post atualizado!"],
  ["Profile link copied!", "Link do perfil copiado!"],
  ["Inbox", "Caixa de entrada"],
  ["Your conversations", "Suas conversas"],
  ["Start a conversation", "Inicie uma conversa"],
  ["Sent an image", "Enviou uma imagem"],
  ["You: ", "Você: "],
  ["Search", "Buscar"],
  ["Profile", "Perfil"],
  ["Achievements", "Conquistas"],
  ["Recent achievements", "Conquistas recentes"],
  [
    "Badges unlocked through your fitness journey",
    "Insígnias desbloqueadas na sua jornada fitness",
  ],
  ["No achievements yet", "Nenhuma conquista ainda"],
  ["Badges", "Insígnias"],
  ["No badges yet", "Nenhuma insígnia ainda"],
  [
    "Complete workouts, join challenges and earn XP to unlock your first badge.",
    "Complete treinos, entre em desafios e ganhe XP para desbloquear sua primeira insígnia.",
  ],
  [
    "Complete workouts and challenges to unlock badges.",
    "Complete treinos e desafios para desbloquear insígnias.",
  ],
  ["Unlocked", "Desbloqueado"],
  ["unlocked", "desbloqueadas"],
  ["Achievement", "Conquista"],
  ["First Post", "Primeiro post"],
  ["First Workout", "Primeiro treino"],
  ["7 Day Streak", "Sequência de 7 dias"],
  ["1000 XP", "1000 XP"],
  ["10K XP", "10K XP"],
  ["Workout Warrior", "Guerreiro dos treinos"],
  ["Workout Streak", "Sequência de treinos"],
  ["Level Up", "Subiu de nível"],
  ["Consistency Master", "Mestre da consistência"],
  [
    "Achievements are unlocked automatically when you reach important milestones.",
    "Conquistas são desbloqueadas automaticamente quando você atinge marcos importantes.",
  ],
  ["Global Ranking", "Ranking global"],
  ["Weekly Ranking", "Ranking semanal"],
  ["Top athletes by total XP", "Top atletas por XP total"],
  ["XP earned in the last 7 days", "XP ganho nos últimos 7 dias"],
  ["No athletes ranked yet.", "Nenhum atleta ranqueado ainda."],
  [
    "No weekly XP yet. Complete workouts or challenges to appear here.",
    "Sem XP semanal ainda. Complete treinos ou desafios para aparecer aqui.",
  ],
  [
    "Earn XP by completing workouts, finishing challenges and staying consistent.",
    "Ganhe XP completando treinos, finalizando desafios e mantendo consistência.",
  ],
  [
    "Weekly XP is calculated from workouts and completed challenges in the last 7 days.",
    "O XP semanal é calculado a partir de treinos e desafios concluídos nos últimos 7 dias.",
  ],
  ["Workout profile", "Perfil de treino"],
  ["Athlete Info", "Info do atleta"],
  ["Fitness profile", "Perfil fitness"],
  ["Follow", "Seguir"],
  ["Followers", "Seguidores"],
  ["Posts", "Posts"],
  ["Level", "Nível"],
  ["Bronze", "Bronze"],
  ["Silver", "Prata"],
  ["Gold", "Ouro"],
  ["Diamond", "Diamante"],
  ["days", "dias"],
  ["Workout templates", "Modelos de treino"],
  ["Choose a ready-made plan and customize it later.", "Escolha um plano pronto e personalize depois."],
  ["exercises included", "exercícios incluídos"],
  ["Use template", "Usar modelo"],
  ["Enter a workout name.", "Digite um nome para o treino."],
  ["Workout created!", "Treino criado!"],
  ["Workout plan updated!", "Plano de treino atualizado!"],
  ["Workout focuses saved!", "Focos do treino salvos!"],
  ["Workout plan archived.", "Plano de treino arquivado."],
  ["Workout plan restored.", "Plano de treino restaurado."],
  ["Create or select a workout first.", "Crie ou selecione um treino primeiro."],
  ["Enter an exercise name.", "Digite o nome do exercício."],
  ["Exercise added!", "Exercício adicionado!"],
  ["Exercise updated!", "Exercício atualizado!"],
  ["Exercise deleted.", "Exercício excluído."],
  ["Today's workout is already completed.", "O treino de hoje já está concluído."],
  ["Today's workout already has a record.", "O treino de hoje já possui um registro."],
  ["Open the set logger first.", "Abra o registro de séries primeiro."],
  ["Enter at least one load or reps value.", "Informe ao menos uma carga ou repetição."],
  ["Use valid positive numbers for load and reps.", "Use números positivos válidos para carga e repetições."],
  ["Exercise performance saved!", "Desempenho do exercício salvo!"],
  ["Customize your public fitness profile.", "Personalize seu perfil fitness público."],
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
  ["Bio must have at most 240 characters.", "A bio deve ter no máximo 240 caracteres."],
  ["Error uploading avatar.", "Erro ao enviar avatar."],
  ["Error updating avatar.", "Erro ao atualizar avatar."],
  ["Error uploading banner.", "Erro ao enviar banner."],
  ["Error updating banner.", "Erro ao atualizar banner."],
  ["Error updating bio.", "Erro ao atualizar bio."],
  ["Create", "Criar"],
];

const textCorrections = new Map([
  ["Tr\u00c3\u00adceps", "Tr\u00edceps"],
  ["B\u00c3\u00adceps", "B\u00edceps"],
  ["Abd\u00c3\u00b4men", "Abd\u00f4men"],
  ["m\u00c3\u00a1quina", "m\u00e1quina"],
  ["Avan\u00c3\u00a7ado", "Avan\u00e7ado"],
  ["Intermedi\u00c3\u00a1rio", "Intermedi\u00e1rio"],
  ["Divis\u00c3\u00a3o", "Divis\u00e3o"],
  ["Eleva\u00c3\u00a7\u00c3\u00a3o", "Eleva\u00e7\u00e3o"],
  ["For\u00c3\u00a7a", "For\u00e7a"],
  ["Bra\u00c3\u00a7os", "Bra\u00e7os"],
  ["Panturrilha em p\u00c3\u00a9", "Panturrilha em p\u00e9"],
  ["Peito e Triceps", "Peito e Tr\u00edceps"],
  ["Peito, Ombros e Triceps", "Peito, Ombros e Tr\u00edceps"],
  ["Costas e Biceps", "Costas e B\u00edceps"],
  ["Pernas e Abdomen", "Pernas e Abd\u00f4men"],
  ["Ombros e Abdomen", "Ombros e Abd\u00f4men"],
  ["Bracos e Abdomen", "Bra\u00e7os e Abd\u00f4men"],
  ["Ombros e Bracos", "Ombros e Bra\u00e7os"],
  ["Triceps pulley", "Tr\u00edceps pulley"],
  ["Triceps corda", "Tr\u00edceps corda"],
  ["Triceps testa", "Tr\u00edceps testa"],
  ["Triceps frances", "Tr\u00edceps franc\u00eas"],
  ["\u00f0\u0178\u2019\u00aa", "\ud83d\udcaa"],
  ["\u00f0\u0178\u2019a", "\ud83d\udcaa"],
  ["\u00f0\u0178\u201d\u00a5", "\ud83d\udd25"],
  ["\u00f0\u0178\u008f\u2020", "\ud83c\udfc6"],
  ["\u00f0\u0178\u2018\u2018", "\ud83d\udc51"],
  ["\u00f0\u0178\u201c\u00b8", "\ud83d\udcf8"],
  ["\u00e2\u20ac\u00a2", "-"],
  ["Avancado", "Avan\u00e7ado"],
  ["Intermediario", "Intermedi\u00e1rio"],
  ["Sequencia", "Sequ\u00eancia"],
  ["insignia", "ins\u00edgnia"],
  ["Insignias", "Ins\u00edgnias"],
]);

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

function applyTextCorrections(value) {
  return Array.from(textCorrections.entries()).reduce(
    (text, [from, to]) => text.replaceAll(from, to),
    value,
  );
}

function translateText(value, phraseMap) {
  const trimmed = value.trim();
  const translated = phraseMap.get(trimmed);

  if (translated && translated !== trimmed) {
    return value.replace(trimmed, translated);
  }

  const correctedValue = applyTextCorrections(value);
  const correctedTrimmed = correctedValue.trim();
  const correctedTranslated = phraseMap.get(correctedTrimmed);

  if (correctedTranslated && correctedTranslated !== correctedTrimmed) {
    return correctedValue.replace(correctedTrimmed, correctedTranslated);
  }

  if (!correctedTranslated || correctedTranslated === correctedTrimmed) {
    if (correctedTrimmed.includes(" - ")) {
      const translatedParts = correctedTrimmed.split(" - ").map((part) => {
        const partTranslation = translateText(part, phraseMap);

        return partTranslation.trim();
      });

      const combined = translatedParts.join(" - ");

      if (combined !== correctedTrimmed) {
        return correctedValue.replace(correctedTrimmed, combined);
      }
    }

    const prefixed = correctedTrimmed.match(/^(\S+\s+)(.+)$/);

    if (prefixed) {
      const [, prefix, rest] = prefixed;
      const translatedRest = phraseMap.get(rest);

      if (translatedRest && translatedRest !== rest) {
        return correctedValue.replace(correctedTrimmed, `${prefix}${translatedRest}`);
      }
    }

    return correctedValue;
  }

  return correctedValue.replace(correctedTrimmed, correctedTranslated);
}

function normalizeNodeLanguage(root, phraseMap) {
  if (!root) return;

  if (root.nodeType === Node.TEXT_NODE) {
    const parent = root.parentElement;

    if (
      parent &&
      !["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName) &&
      !parent.isContentEditable
    ) {
      root.nodeValue = translateText(root.nodeValue || "", phraseMap);
    }

    return;
  }

  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) {
    return;
  }

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
    let frameId = 0;
    const pendingNodes = new Set();

    function normalizeDocument() {
      normalizeNodeLanguage(document.body, phraseMap);
    }

    function scheduleNormalize(node) {
      if (node) {
        pendingNodes.add(node);
      }

      if (frameId) return;

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;

        pendingNodes.forEach((pendingNode) => {
          normalizeNodeLanguage(pendingNode, phraseMap);
        });

        pendingNodes.clear();
      });
    }

    normalizeDocument();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => scheduleNormalize(node));
          return;
        }

        scheduleNormalize(mutation.target);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });

    return () => {
      observer.disconnect();

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
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
