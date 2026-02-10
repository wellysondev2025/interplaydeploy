from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from core.models import Patient, Professional



class PatientCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get("name")
        date_nasc = request.data.get("date_nasc")
        code = request.data.get("code")

        if not all([name, date_nasc, code]):
            return Response({"success": False, "data": {}, "message": "Dados incompletos"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            professional = Professional.objects.get(code=code)
        except Professional.DoesNotExist:
            return Response({"success": False, "data": {}, "message": "Código do profissional inválido"}, status=status.HTTP_404_NOT_FOUND)

        patient, created = Patient.objects.get_or_create(name=name, date_nasc=date_nasc, professional=professional)

        return Response({
            "success": True,
            "data": {"hash_patient": str(patient.hash_patient), "name": patient.name},
            "message": "Paciente criado com sucesso" if created else "Paciente já existente"
        }, status=status.HTTP_201_CREATED)


class PatientGetByHashView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        hash_patient = request.data.get("hash")
        if not hash_patient:
            return Response({"success": False, "error": "hash não enviado"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            patient = Patient.objects.get(hash_patient=hash_patient)
            return Response({"success": True, "patient": {"name": patient.name, "date_nasc": str(patient.date_nasc)}})
        except Patient.DoesNotExist:
            return Response({"success": False, "error": "Paciente não encontrado"}, status=status.HTTP_404_NOT_FOUND)


class ProfessionalValidateView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        code = request.data.get("code")
        if not code:
            return Response({"success": False, "error": "Code is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            professional = Professional.objects.get(code=code)
            return Response({"success": True, "professional": {"id": professional.id, "name": professional.name}})
        except Professional.DoesNotExist:
            return Response({"success": False}, status=status.HTTP_404_NOT_FOUND)
