# tests/test_models.py
import pytest
import uuid
from django.core.exceptions import ValidationError
from core.models import Professional, Patient, Session, Activity, Description
from users.models import User
from django.utils import timezone


@pytest.mark.django_db
class TestModels:

    def test_create_user_and_professional(self):
        user = User.objects.create_user(email="pro@example.com", password="123456")
        professional = Professional.objects.create(
            user=user,
            code="PRO123",
            name="Dr. Teste",
            cpf="12345678901",
            address="Rua Teste, 123"
        )

        assert professional.user == user
        assert str(professional) == "Dr. Teste (PRO123)"
        assert professional.cpf == "12345678901"

    def test_create_patient_with_hash(self):
        user = User.objects.create_user(email="pro2@example.com", password="123456")
        professional = Professional.objects.create(
            user=user,
            code="PRO124",
            name="Dr. Patient",
        )
        patient = Patient.objects.create(
            name="Paciente Teste",
            professional=professional
        )

        # hash_patient deve ser gerado automaticamente
        assert isinstance(patient.hash_patient, uuid.UUID)
        assert str(patient) == "Paciente Teste"

    def test_create_session_and_auto_hash(self):
        user = User.objects.create_user(email="pro3@example.com", password="123456")
        professional = Professional.objects.create(
            user=user,
            code="PRO125",
            name="Dr. Session",
        )
        patient = Patient.objects.create(
            name="Paciente Sessão",
            professional=professional
        )
        session = Session.objects.create(
            patient=patient,
            session_type="Teste",
            version_app="1.0"
        )

        assert session.session_hash is not None
        assert str(session) == f"Session {session.id} - Patient {patient.name}"
        assert session.finally_session is False

    def test_create_activity_and_description(self):
        user = User.objects.create_user(email="pro4@example.com", password="123456")
        professional = Professional.objects.create(
            user=user,
            code="PRO126",
            name="Dr. Activity",
        )
        patient = Patient.objects.create(
            name="Paciente Activity",
            professional=professional
        )
        session = Session.objects.create(patient=patient)
        activity = Activity.objects.create(
            session=session,
            cod_activity="ACT001",
            duration=120,
            path_relative_image="path/to/image.png"
        )

        # hash deve ser gerado automaticamente
        assert isinstance(uuid.UUID(activity.hash), uuid.UUID)
        assert str(activity) == "Activity ACT001"

        description = Description.objects.create(
            activity=activity,
            description="Descrição da atividade."
        )

        assert description.activity == activity
        assert str(description) == f"Description for {activity.cod_activity}"

    def test_hash_model_creation(self):
        from core.models import HashModel
        hash_model = HashModel.objects.create(
            hash=str(uuid.uuid4()),
            device="iOS"
        )
        assert hash_model.device == "iOS"
        assert hash_model.request_date is not None
