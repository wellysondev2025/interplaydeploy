from django.urls import path

from core.views.game.patients import (
    PatientCreateView,
    PatientGetByHashView,
    ProfessionalValidateView,
)

from core.views.game.sessions import (
    SessionCreateView,
    SessionFinalizeView,
)

from core.views.game.activities import (
    ActivityCreateView
)

from core.views.painel.patients import (
    PatientListView
)

from core.views.painel.dashboardview import (
    DashboardView
)

from core.views.painel.description import (
    DescriptionUpdateView
)

from core.views.painel.professionals import (
    ProfessionalListCreateView,
    ProfessionalRetrieveUpdateDestroyView,
)


urlpatterns = [
    # 🎮 GAME
    path("game/patient/create/", PatientCreateView.as_view()),
    path("game/patient/get/", PatientGetByHashView.as_view()),
    path("game/session/create/", SessionCreateView.as_view()),
    path("game/session/finalize/", SessionFinalizeView.as_view()),
    path("game/activity/create/", ActivityCreateView.as_view()),
    path("game/professional/validate/", ProfessionalValidateView.as_view()),

    # 🧠 PAINEL
    path("painel/professionals/", ProfessionalListCreateView.as_view()),
    path("painel/professionals/<int:pk>/", ProfessionalRetrieveUpdateDestroyView.as_view()),
    path("painel/patients/", PatientListView.as_view()),
    path("painel/description/update/", DescriptionUpdateView.as_view()),
    path("painel/dashboard/", DashboardView.as_view()),
]
