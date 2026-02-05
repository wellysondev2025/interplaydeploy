from django.urls import path

from core.views.game import (
    PatientCreateView,
    PatientGetByHashView,
    SessionCreateView,
    SessionFinalizeView,
    ActivityCreateView,
    ProfessionalValidateView,
)

from core.views.painel import (
    ProfessionalListCreateView,
    ProfessionalRetrieveUpdateDestroyView,
    PatientListView,
    DescriptionUpdateView,
    DashboardView,
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
