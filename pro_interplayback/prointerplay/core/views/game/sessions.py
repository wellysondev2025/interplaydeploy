from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.views.game.game_base import GameAPIView
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator



from core.models import Session, Patient
from core.serializers.game import SessionSerializer


@method_decorator(csrf_exempt, name='dispatch')
class SessionCreateView(GameAPIView):

    def post(self, request):
        version_app = request.data.get('version_app', '')
        session_type = request.data.get('session_type', '')
        hash_patient = request.data.get('hash_patient')

        if not hash_patient:
            return Response({'success': False, 'msg': 'hash_patient é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            patient = Patient.objects.get(hash_patient=hash_patient)
        except Patient.DoesNotExist:
            return Response({"success": False, "error": "Paciente não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        session = Session.objects.create(patient=patient, session_type=session_type, version_app=version_app)
        serializer = SessionSerializer(session)
        return Response({'success': True, 'session': serializer.data}, status=status.HTTP_201_CREATED)
    

    
    
class SessionFinalizeView(GameAPIView):

    def post(self, request):
        session_hash = request.data.get('session_hash')

        try:
            session = Session.objects.get(session_hash=session_hash)
        except Session.DoesNotExist:
            return Response({'success': False, 'msg': 'Sessão não encontrada'}, status=status.HTTP_404_NOT_FOUND)

        if not session.finally_session:
            session.end_date = timezone.now()
            session.time_session = int((session.end_date - session.start_date).total_seconds())
            session.finally_session = True
            session.save()
    
        serializer = SessionSerializer(session)
        return Response({'success': True, 'session': serializer.data})