from rest_framework import serializers
from core.models import Activity

# ------------------- Activities -------------------
class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'session', 'cod_activity', 'end_date_activity',
                  'image', 'duration', 'hash']